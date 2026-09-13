package co.za.funeralcover.service;

import co.za.funeralcover.dto.ChatMessageDto;
import co.za.funeralcover.dto.ChatRequest;
import co.za.funeralcover.dto.ChatResponse;
import co.za.funeralcover.entity.Plan;
import co.za.funeralcover.exception.ChatRateLimitExceededException;
import co.za.funeralcover.exception.ChatUnavailableException;
import co.za.funeralcover.repository.PlanRepository;
import com.anthropic.client.AnthropicClient;
import com.anthropic.client.okhttp.AnthropicOkHttpClient;
import com.anthropic.errors.AnthropicIoException;
import com.anthropic.errors.AnthropicServiceException;
import com.anthropic.errors.RateLimitException;
import com.anthropic.models.messages.Message;
import com.anthropic.models.messages.MessageCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Answers marketing-site visitor questions via Claude, grounded on the
 * system prompt built from live plan data and the site's own FAQ copy -
 * never on anything Claude might otherwise recall or infer - so it can't
 * invent benefits, prices, or underwriting terms this business doesn't
 * actually offer. See the marketing-site domain-correction history: this
 * product pays real cash plus real services, nothing else, and every
 * number here must match V6/V10 plan data exactly.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class ChatService {

    private static final int MAX_HISTORY_TURNS = 8;
    private static final int MAX_REQUESTS_PER_WINDOW = 15;
    private static final long WINDOW_MILLIS = 10 * 60 * 1000L;

    private final PlanRepository planRepository;

    @Value("${app.anthropic.api-key}")
    private String apiKey;

    @Value("${app.anthropic.model}")
    private String model;

    private AnthropicClient client;

    // Per-IP sliding-window limiter. This is a single-instance, in-memory
    // guard against runaway cost on an unauthenticated, unattended endpoint -
    // not a substitute for real infra rate limiting if this ever runs behind
    // a load balancer with multiple instances.
    private final Map<String, Deque<Instant>> requestLog = new ConcurrentHashMap<>();

    @PostConstruct
    void init() {
        if (apiKey != null && !apiKey.isBlank()) {
            client = AnthropicOkHttpClient.builder().apiKey(apiKey).build();
            log.info("Chat: Claude ({}) is live.", model);
        } else {
            log.warn("Chat: no ANTHROPIC_API_KEY set - running in DEMO mode (canned, keyword-matched " +
                    "answers, no real model call). Set the env var and restart to switch to real Claude replies.");
        }
    }

    public ChatResponse reply(ChatRequest request, String clientIp) {
        enforceRateLimit(clientIp);

        if (client == null) {
            return new ChatResponse(demoReply(request.message()));
        }

        MessageCreateParams.Builder builder = MessageCreateParams.builder()
                .model(model)
                .maxTokens(500L)
                .system(buildSystemPrompt());

        List<ChatMessageDto> history = request.historyOrEmpty();
        int from = Math.max(0, history.size() - MAX_HISTORY_TURNS);
        for (ChatMessageDto turn : history.subList(from, history.size())) {
            if ("assistant".equals(turn.role())) {
                builder.addAssistantMessage(turn.content());
            } else {
                builder.addUserMessage(turn.content());
            }
        }
        builder.addUserMessage(request.message());

        try {
            Message response = client.messages().create(builder.build());
            String reply = response.content().stream()
                    .flatMap(block -> block.text().stream())
                    .map(block -> block.text())
                    .reduce("", (a, b) -> a + b)
                    .trim();
            if (reply.isBlank()) {
                reply = "Sorry, I didn't quite catch that - could you try asking a different way, "
                        + "or call us on 013 000 0000?";
            }
            return new ChatResponse(reply);
        } catch (RateLimitException e) {
            log.warn("Anthropic rate limit hit while answering chat: {}", e.getMessage());
            throw new ChatUnavailableException(
                    "We're getting a lot of questions right now - please try again in a moment, "
                            + "or call us on 013 000 0000.");
        } catch (AnthropicIoException e) {
            log.error("Network error calling Anthropic for chat", e);
            throw new ChatUnavailableException(
                    "Chat is temporarily unavailable - please call or WhatsApp us instead.");
        } catch (AnthropicServiceException e) {
            log.error("Anthropic API error while answering chat", e);
            throw new ChatUnavailableException(
                    "Chat is temporarily unavailable - please call or WhatsApp us instead.");
        }
    }

    private void enforceRateLimit(String clientIp) {
        Instant now = Instant.now();
        Deque<Instant> hits = requestLog.computeIfAbsent(clientIp, k -> new ArrayDeque<>());
        synchronized (hits) {
            while (!hits.isEmpty() && hits.peekFirst().isBefore(now.minusMillis(WINDOW_MILLIS))) {
                hits.pollFirst();
            }
            if (hits.size() >= MAX_REQUESTS_PER_WINDOW) {
                throw new ChatRateLimitExceededException(
                        "Too many messages - please wait a few minutes, or call us on 013 000 0000.");
            }
            hits.addLast(now);
        }
    }

    /**
     * Keyword-matched canned answers, used only when no ANTHROPIC_API_KEY is
     * configured, so the widget is demoable before a real key/billing is set
     * up. Every fact here is pulled the same way the real system prompt
     * pulls it (live plan data, the site's own FAQ copy) - this is a
     * cheaper matcher, not a source of different or fabricated information.
     */
    private String demoReply(String message) {
        String m = message.toLowerCase();

        // Order matters: pricing intent ("how much does the Family plan cost")
        // must win over a bare topic keyword ("family") it happens to also
        // contain, so the most specific/highest-intent buckets come first.
        if (containsAny(m, "died", "passed away", "death", "emergency", "dying")) {
            return "I'm so sorry. Please call our bereavement line right now on 013 000 0000 - it's answered "
                    + "24 hours a day, every day.";
        }
        if (containsAny(m, "price", "cost", "how much", "premium", "single", "extended", "plan")) {
            StringBuilder sb = new StringBuilder("Here's what we offer: ");
            List<String> lines = planRepository.findByActiveTrue().stream()
                    .map(p -> p.getName() + " (R" + p.getMonthlyPremium() + "/month, R" + p.getCoverAmount()
                            + " cash to your family)")
                    .toList();
            sb.append(String.join(", ", lines)).append(". Every plan also includes real funeral services, not just cash.");
            return sb.toString();
        }
        if (containsAny(m, "medical", "exam", "health", "doctor")) {
            return "No. There's no medical exam, no doctor's letter and no questions about your health - "
                    + "just your ID number and your dependants' details.";
        }
        if (containsAny(m, "family", "dependant", "dependent", "spouse", "children", "kids")) {
            return "Yes - your immediate family is covered automatically on every plan, and you can add or "
                    + "remove dependants yourself any time through your digital membership book.";
        }
        if (containsAny(m, "waiting period", "six month", "6 month", "wait")) {
            return "Accidental death is covered from your very first day. Natural-causes cover begins after a "
                    + "standard six-month waiting period, which keeps premiums low for everyone.";
        }
        if (containsAny(m, "switch", "another parlor", "another parlour", "current society")) {
            return "Yes - moving your family across from another funeral parlor is simpler than people expect. "
                    + "Give us a call on 013 000 0000 and we'll walk you through it.";
        }
        if (containsAny(m, "payout", "claim", "cash")) {
            return "Once we have the death certificate and the member's ID, the cash portion is paid to your "
                    + "nominated beneficiary - usually within 48 hours, before the funeral, not after it.";
        }
        if (containsAny(m, "hour", "open", "contact", "address", "where are you", "phone", "whatsapp")) {
            return "Bereavement line: 013 000 0000, answered 24 hours a day, every day. Office hours for "
                    + "non-urgent visits are Mon-Fri 08:00-17:00 and Sat 08:00-13:00.";
        }
        if (containsAny(m, "join", "sign up", "how do i", "get started")) {
            return "Joining takes about three minutes on your phone: choose a plan, enter your details, pay by "
                    + "card or EFT, and your membership card arrives immediately.";
        }

        return "I can help with plans, pricing, how cover works, or joining. Could you rephrase that, or call "
                + "us on 013 000 0000 for anything else?";
    }

    private boolean containsAny(String haystack, String... needles) {
        for (String needle : needles) {
            if (haystack.contains(needle)) return true;
        }
        return false;
    }

    private String buildSystemPrompt() {
        StringBuilder sb = new StringBuilder();
        sb.append("You are the customer-facing chat assistant on Sondela's website - a family-run ")
                .append("funeral parlor and funeral cover provider in Nelspruit, Mpumalanga, South Africa. ")
                .append("You are answering visitors on the public marketing site, including overnight and ")
                .append("after-hours when no staff member is available.\n\n");

        sb.append("REAL PLANS (this is the only source of truth for prices/benefits - never state a figure ")
                .append("not listed here):\n");
        for (Plan plan : planRepository.findByActiveTrue()) {
            sb.append("- ").append(plan.getName())
                    .append(": R").append(plan.getMonthlyPremium()).append("/month, R")
                    .append(plan.getCoverAmount()).append(" cash paid to the family, plus: ")
                    .append(String.join("; ", plan.getBenefitsList()))
                    .append("\n");
        }

        sb.append("\nHOW COVER WORKS:\n")
                .append("- No medical exam, no doctor's letter - just an ID number and dependants' details.\n")
                .append("- Every plan covers the member's immediate family under one membership; dependants ")
                .append("are added by the member themselves after joining, through their digital membership ")
                .append("book link - not at signup and not by staff.\n")
                .append("- Accidental death is covered from day one. Natural-causes cover has a standard ")
                .append("six-month waiting period, which keeps premiums low for everyone.\n")
                .append("- Both parts of every plan are real: cash paid to the nominated beneficiary within ")
                .append("about 48 hours of the death certificate, and the funeral itself (casket, hearse, and ")
                .append("higher tiers add tent/chairs/catering) arranged and paid for by Sondela - not just a ")
                .append("number on a policy.\n")
                .append("- Joining takes about three minutes on a phone: choose a plan, enter details, pay by ")
                .append("card or EFT, and the membership card/link arrives immediately.\n")
                .append("- Switching from another funeral parlor is supported and simpler than people expect.\n\n");

        sb.append("CONTACT: Bereavement line 013 000 0000, answered 24 hours a day, every day. Office hours ")
                .append("(for non-urgent visits) Mon-Fri 08:00-17:00, Sat 08:00-13:00. This is a demonstration ")
                .append("site, so the phone number and address shown on the pages are placeholders.\n\n");

        sb.append("RULES YOU MUST FOLLOW:\n")
                .append("1. Only state facts given above. If asked something not covered here (legal, medical, ")
                .append("tax, an exact claims timeline beyond '~48 hours', or anything about a specific ")
                .append("member's account/payment), say you don't have that detail and point them to the ")
                .append("bereavement line or office hours - never guess or invent an answer.\n")
                .append("2. If someone says a family member has died, or anything suggesting an active ")
                .append("emergency, immediately and clearly tell them to call 013 000 0000 right away, before ")
                .append("anything else.\n")
                .append("3. Never claim to be a licensed financial or funeral advisor, and never give ")
                .append("personalised financial advice - you can explain what the plans include, not tell ")
                .append("someone which one they 'should' pick beyond pointing at the comparison already on ")
                .append("the site.\n")
                .append("4. If asked whether you're a bot/AI, say yes plainly.\n")
                .append("5. Keep answers short and conversational - two or three sentences, like a text ")
                .append("message, not an essay. This is a chat widget, not a document.\n")
                .append("6. Never discuss internal systems, admin features, pricing you're not sure is current, ")
                .append("or anything about how this website itself is built.\n");

        return sb.toString();
    }
}
