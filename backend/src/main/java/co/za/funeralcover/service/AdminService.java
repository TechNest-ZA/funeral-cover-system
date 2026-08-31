package co.za.funeralcover.service;

import co.za.funeralcover.dto.*;
import co.za.funeralcover.entity.BookFilter;
import co.za.funeralcover.entity.Claim;
import co.za.funeralcover.entity.Dependent;
import co.za.funeralcover.entity.Member;
import co.za.funeralcover.entity.MemberStatus;
import co.za.funeralcover.entity.Payment;
import co.za.funeralcover.entity.PaymentMethod;
import co.za.funeralcover.entity.PaymentStatus;
import co.za.funeralcover.exception.DuplicateClaimException;
import co.za.funeralcover.exception.ResourceNotFoundException;
import co.za.funeralcover.repository.ClaimRepository;
import co.za.funeralcover.repository.DependentRepository;
import co.za.funeralcover.repository.MemberRepository;
import co.za.funeralcover.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.Period;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final MemberRepository memberRepository;
    private final PaymentRepository paymentRepository;
    private final ClaimRepository claimRepository;
    private final DependentRepository dependentRepository;
    private final EmailService emailService;
    private final MemberService memberService;

    @Transactional
    public MemberDetailResponse createMember(MemberSignupRequest request) {
        MemberSignupResponse created = memberService.signup(request);
        return getMemberDetail(created.id());
    }

    @Transactional(readOnly = true)
    public PageResponse<MemberListItemResponse> searchMembers(String search, MemberStatus status, Pageable pageable) {
        Page<Member> members = memberRepository.search(search, status, pageable);

        Page<MemberListItemResponse> mapped = members.map(member -> {
            Instant lastPayment = paymentRepository.findByMemberIdOrderByCreatedAtDesc(member.getId()).stream()
                    .filter(p -> p.getStatus() == PaymentStatus.success)
                    .map(Payment::getPaidAt)
                    .findFirst()
                    .orElse(null);

            return new MemberListItemResponse(
                    member.getId(),
                    member.getFullName(),
                    member.getIdNumber(),
                    member.getPlan().getName(),
                    member.getStatus().name(),
                    lastPayment
            );
        });

        return PageResponse.from(mapped);
    }

    @Transactional(readOnly = true)
    public PageResponse<BookRowResponse> searchBook(String search, BookFilter filter, Pageable pageable) {
        ZoneId zone = ZoneId.systemDefault();
        Instant monthStart = ZonedDateTime.now(zone).withDayOfMonth(1).toLocalDate().atStartOfDay(zone).toInstant();
        Instant behindCutoff = Instant.now().atZone(zone).minusMonths(1).toInstant();
        BookFilter effectiveFilter = filter != null ? filter : BookFilter.everyone;

        Page<Member> members = memberRepository.searchBook(
                search,
                effectiveFilter == BookFilter.pending,
                effectiveFilter == BookFilter.deceased,
                effectiveFilter == BookFilter.new_this_month,
                monthStart,
                effectiveFilter == BookFilter.from_funeral,
                effectiveFilter == BookFilter.behind,
                MemberStatus.active,
                MemberStatus.pending,
                MemberStatus.deceased,
                PaymentStatus.success,
                behindCutoff,
                pageable
        );

        return PageResponse.from(members.map(member -> {
            long dependents = dependentRepository.countByMemberId(member.getId());
            String coversLabel = dependents == 0 ? "Covers themself" : "Covers " + (dependents + 1) + " people";
            StandingInfo standing = buildStanding(member, zone);

            return new BookRowResponse(
                    member.getId(),
                    member.getFullName(),
                    member.getIdNumber(),
                    member.getPlan().getName(),
                    coversLabel,
                    standing.status(),
                    standing.detail()
            );
        }));
    }

    private record StandingInfo(String status, String detail) {
    }

    private StandingInfo buildStanding(Member member, ZoneId zone) {
        if (member.getStatus() == MemberStatus.deceased) {
            String detail = claimRepository.findByMemberIdAndDependentIsNull(member.getId())
                    .map(c -> "Claim on file · " + SHORT_DATE.format(c.getDateOfDeath().atStartOfDay(zone).toInstant()))
                    .orElse("Claim on file");
            return new StandingInfo("deceased", detail);
        }

        if (member.getStatus() == MemberStatus.pending) {
            String detail = "Signed up " + SHORT_DATE.format(member.getSignupDate()) + " · awaiting first payment";
            return new StandingInfo("pending", detail);
        }

        List<Payment> successful = paymentRepository.findByMemberIdAndStatusOrderByPaidAtDesc(member.getId(), PaymentStatus.success);
        if (successful.isEmpty()) {
            return new StandingInfo(member.getStatus().name(), "No payment on file");
        }
        Instant lastPaid = successful.get(0).getPaidAt();
        Instant nextDue = lastPaid.atZone(zone).plusMonths(1).toInstant();

        if (!nextDue.isBefore(Instant.now())) {
            return new StandingInfo("active", "Paid " + SHORT_DATE.format(lastPaid));
        }

        long monthsBehind = ChronoUnit.MONTHS.between(nextDue.atZone(zone), Instant.now().atZone(zone)) + 1;
        String detail = monthsBehind + " month" + (monthsBehind == 1 ? "" : "s") + " behind · " + tenureLabel(member.getSignupDate(), zone);
        return new StandingInfo("behind", detail);
    }

    @Transactional(readOnly = true)
    public MemberDetailResponse getMemberDetail(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member " + memberId + " not found"));

        List<PaymentSummaryResponse> payments = paymentRepository.findByMemberIdOrderByCreatedAtDesc(memberId).stream()
                .map(PaymentSummaryResponse::from)
                .toList();

        List<DependentResponse> dependents = dependentRepository.findByMemberIdOrderByCreatedAtAsc(memberId).stream()
                .map(DependentResponse::from)
                .toList();

        List<ClaimResponse> claims = claimRepository.findByMemberIdOrderByCreatedAtDesc(memberId).stream()
                .map(ClaimResponse::from)
                .toList();

        return new MemberDetailResponse(
                member.getId(),
                member.getFullName(),
                member.getIdNumber(),
                member.getPhone(),
                member.getBeneficiaryName(),
                member.getBeneficiaryRelationship(),
                member.getBeneficiaryPhone(),
                member.getBeneficiaryIdNumber(),
                member.getEmail(),
                member.getPlan().getName(),
                member.getPlan().getMonthlyPremium(),
                member.getPlan().getCoverAmount(),
                member.getPlan().getBenefitsList(),
                member.getStatus().name(),
                member.getSignupDate(),
                payments,
                dependents,
                claims
        );
    }

    @Transactional
    public ClaimResponse recordClaim(Long memberId, RecordClaimRequest request, String recordedBy) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member " + memberId + " not found"));

        Claim claim = new Claim();
        claim.setMember(member);
        claim.setDateOfDeath(request.dateOfDeath());
        claim.setNotes(request.notes());
        claim.setRecordedBy(recordedBy);

        if (request.dependentId() != null) {
            Dependent dependent = dependentRepository.findByIdAndMemberId(request.dependentId(), memberId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Dependent " + request.dependentId() + " not found for this member"));
            if (claimRepository.existsByDependentId(dependent.getId())) {
                throw new DuplicateClaimException("A claim has already been recorded for this dependent");
            }
            claim.setDependent(dependent);
            // a dependent's death doesn't close the member's own cover
        } else {
            if (claimRepository.existsByMemberIdAndDependentIsNull(memberId)) {
                throw new DuplicateClaimException("A claim has already been recorded for this member");
            }
            member.setStatus(MemberStatus.deceased);
            memberRepository.save(member);
        }

        claim = claimRepository.save(claim);
        return ClaimResponse.from(claim);
    }

    @Transactional
    public RegenerateTokenResponse regenerateAccessToken(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member " + memberId + " not found"));

        String newToken = UUID.randomUUID().toString();
        member.setAccessToken(newToken);
        memberRepository.save(member);

        return new RegenerateTokenResponse(newToken);
    }

    @Transactional
    public PaymentSummaryResponse recordManualPayment(ManualPaymentRequest request) {
        Member member = memberRepository.findById(request.memberId())
                .orElseThrow(() -> new ResourceNotFoundException("Member " + request.memberId() + " not found"));

        Payment payment = new Payment();
        payment.setMember(member);
        payment.setAmount(request.amount() != null ? request.amount() : member.getPlan().getMonthlyPremium());
        payment.setMethod(PaymentMethod.cash);
        payment.setStatus(PaymentStatus.success);
        payment.setPaidAt(Instant.now());
        payment.setReference(request.reference() != null && !request.reference().isBlank()
                ? request.reference()
                : generateReference());
        payment = paymentRepository.save(payment);

        if (member.getStatus() != MemberStatus.active) {
            member.setStatus(MemberStatus.active);
            memberRepository.save(member);
            emailService.sendMembershipConfirmation(member);
        }

        return PaymentSummaryResponse.from(payment);
    }

    @Transactional(readOnly = true)
    public DashboardStatsResponse getStats() {
        long totalMembers = memberRepository.count();

        ZonedDateTime startOfMonth = ZonedDateTime.now(ZoneId.systemDefault())
                .withDayOfMonth(1).toLocalDate().atStartOfDay(ZoneId.systemDefault());
        ZonedDateTime startOfNextMonth = startOfMonth.plusMonths(1);

        long paidThisMonth = paymentRepository.countByStatusAndPaidAtBetween(
                PaymentStatus.success, startOfMonth.toInstant(), startOfNextMonth.toInstant());

        long outstandingCount = memberRepository.search(null, MemberStatus.pending, Pageable.unpaged())
                .getTotalElements();

        return new DashboardStatsResponse(totalMembers, paidThisMonth, outstandingCount);
    }

    private static final DateTimeFormatter SHORT_DATE = DateTimeFormatter.ofPattern("d MMM").withZone(ZoneId.systemDefault());

    @Transactional(readOnly = true)
    public TodayResponse getToday() {
        ZoneId zone = ZoneId.systemDefault();
        ZonedDateTime startOfMonth = ZonedDateTime.now(zone).withDayOfMonth(1).toLocalDate().atStartOfDay(zone);
        ZonedDateTime startOfNextMonth = startOfMonth.plusMonths(1);
        ZonedDateTime startOfLastMonth = startOfMonth.minusMonths(1);

        return new TodayResponse(
                LocalDate.now(zone),
                buildNeedsCall(zone),
                buildMonthStats(startOfMonth.toInstant(), startOfNextMonth.toInstant(), startOfLastMonth.toInstant()),
                buildFuneralAttribution(startOfMonth.toInstant())
        );
    }

    private List<NeedsCallItem> buildNeedsCall(ZoneId zone) {
        Instant now = Instant.now();
        List<Member> active = memberRepository.findByStatusOrderBySignupDateAsc(MemberStatus.active);

        return active.stream()
                .map(member -> {
                    List<Payment> successful = paymentRepository.findByMemberIdAndStatusOrderByPaidAtDesc(member.getId(), PaymentStatus.success);
                    if (successful.isEmpty()) return null;
                    Instant lastPaid = successful.get(0).getPaidAt();
                    Instant nextDue = lastPaid.atZone(zone).plusMonths(1).toInstant();
                    if (!nextDue.isBefore(now)) return null;

                    long monthsBehind = ChronoUnit.MONTHS.between(nextDue.atZone(zone), now.atZone(zone)) + 1;
                    String state = switch ((int) Math.min(monthsBehind, Integer.MAX_VALUE)) {
                        case 1 -> "One month behind";
                        case 2 -> "Second month behind";
                        case 3 -> "Third month behind";
                        default -> monthsBehind + " months behind";
                    };

                    return new NeedsCallItem(
                            member.getId(),
                            member.getFullName(),
                            tenureLabel(member.getSignupDate(), zone),
                            member.getPlan().getName(),
                            state,
                            "Last paid " + SHORT_DATE.format(lastPaid),
                            member.getPhone()
                    );
                })
                .filter(java.util.Objects::nonNull)
                .toList();
    }

    private String tenureLabel(Instant signupDate, ZoneId zone) {
        LocalDate signup = signupDate.atZone(zone).toLocalDate();
        LocalDate today = LocalDate.now(zone);
        Period period = Period.between(signup, today);

        if (period.getYears() >= 1) {
            int years = period.getYears();
            return "Member for " + years + " year" + (years == 1 ? "" : "s");
        }
        if (period.getMonths() >= 1) {
            int months = period.getMonths();
            return "Member for " + months + " month" + (months == 1 ? "" : "s");
        }
        long weeks = ChronoUnit.WEEKS.between(signup, today);
        if (weeks >= 1) {
            return "Joined " + weeks + " week" + (weeks == 1 ? "" : "s") + " ago";
        }
        return "Joined this week";
    }

    private MonthStats buildMonthStats(Instant from, Instant to, Instant lastMonthFrom) {
        BigDecimal premiums = paymentRepository.sumAmountByStatusAndPaidAtBetween(PaymentStatus.success, from, to);
        BigDecimal lastMonthPremiums = paymentRepository.sumAmountByStatusAndPaidAtBetween(PaymentStatus.success, lastMonthFrom, from);
        BigDecimal delta = premiums.subtract(lastMonthPremiums);
        String premiumsNote = delta.signum() == 0
                ? "Same as last month"
                : (delta.signum() > 0 ? "R" + delta.toBigInteger() + " ahead of last month"
                                       : "R" + delta.abs().toBigInteger() + " behind last month");

        long totalActive = memberRepository.countByStatus(MemberStatus.active);
        long membersPaidUp = paymentRepository.countDistinctMembersByStatusAndPaidAtBetweenAndMemberStatus(
                PaymentStatus.success, from, to, MemberStatus.active);
        long pct = totalActive == 0 ? 0 : Math.round(membersPaidUp * 100.0 / totalActive);
        String paidUpNote = pct + "% of " + totalActive + " active members";

        long newMembers = memberRepository.countBySignupDateGreaterThanEqual(from);
        long fromQr = memberRepository.countByFuneralEventIdIsNotNullAndSignupDateGreaterThanEqual(from);
        String newMembersNote = fromQr == 0 ? "None from a funeral QR code yet" : fromQr + " from funeral QR codes";

        List<Claim> claimsThisMonth = claimRepository.findByCreatedAtBetween(from, to);
        String claimsNote;
        if (claimsThisMonth.isEmpty()) {
            claimsNote = "No claims recorded this month";
        } else {
            double avgDays = claimsThisMonth.stream()
                    .mapToLong(c -> ChronoUnit.DAYS.between(c.getDateOfDeath(), c.getCreatedAt().atZone(ZoneId.systemDefault()).toLocalDate()))
                    .average().orElse(0);
            claimsNote = "Average " + Math.round(avgDays) + " day" + (Math.round(avgDays) == 1 ? "" : "s") + " to record";
        }

        return new MonthStats(premiums, premiumsNote, membersPaidUp, totalActive, paidUpNote,
                newMembers, newMembersNote, claimsThisMonth.size(), claimsNote);
    }

    private FuneralAttribution buildFuneralAttribution(Instant from) {
        List<Member> fromFunerals = memberRepository.findByFuneralEventIdIsNotNullAndSignupDateGreaterThanEqual(from);

        BigDecimal extraPremium = fromFunerals.stream()
                .map(m -> m.getPlan().getMonthlyPremium())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Long> byLabel = fromFunerals.stream()
                .collect(Collectors.groupingBy(m -> m.getFuneralEvent().getLabel(), Collectors.counting()));

        Map.Entry<String, Long> best = byLabel.entrySet().stream()
                .max(Comparator.comparingLong(Map.Entry::getValue))
                .orElse(null);

        return new FuneralAttribution(
                fromFunerals.size(),
                extraPremium,
                best != null ? best.getKey() : null,
                best != null ? best.getValue() : null
        );
    }

    @Transactional(readOnly = true)
    public String exportMembersCsv(String search, MemberStatus status) {
        StringBuilder csv = new StringBuilder("ID,Full Name,ID Number,Phone,Email,Plan,Status,Signup Date\n");
        for (Member m : memberRepository.search(search, status, Pageable.unpaged())) {
            csv.append(CsvUtil.row(
                    m.getId(),
                    m.getFullName(),
                    m.getIdNumber(),
                    m.getPhone(),
                    m.getEmail(),
                    m.getPlan().getName(),
                    m.getStatus().name(),
                    m.getSignupDate()
            ));
        }
        return csv.toString();
    }

    @Transactional(readOnly = true)
    public String exportPaymentsCsv(Instant from, Instant to) {
        StringBuilder csv = new StringBuilder("ID,Member ID,Member Name,Amount,Method,Status,Reference,Paid At,Created At\n");
        for (Payment p : paymentRepository.findForExport(from, to)) {
            csv.append(CsvUtil.row(
                    p.getId(),
                    p.getMember().getId(),
                    p.getMember().getFullName(),
                    p.getAmount(),
                    p.getMethod().name(),
                    p.getStatus().name(),
                    p.getReference(),
                    p.getPaidAt(),
                    p.getCreatedAt()
            ));
        }
        return csv.toString();
    }

    private static final List<String> MEMBER_EXPORT_HEADERS =
            List.of("Full Name", "ID Number", "Phone", "Email", "Plan", "Status", "Signup Date");

    private static final List<String> PAYMENT_EXPORT_HEADERS =
            List.of("Member Name", "Amount", "Method", "Status", "Reference", "Paid At");

    private static final DateTimeFormatter PDF_DATE_FORMAT =
            DateTimeFormatter.ofPattern("d MMM yyyy").withZone(ZoneId.systemDefault());

    @Transactional(readOnly = true)
    public byte[] exportMembersPdf(String search, MemberStatus status) {
        List<List<String>> rows = memberRepository.search(search, status, Pageable.unpaged()).stream()
                .map(m -> List.of(
                        m.getFullName(),
                        m.getIdNumber(),
                        m.getPhone(),
                        m.getEmail() == null ? "" : m.getEmail(),
                        m.getPlan().getName(),
                        m.getStatus().name(),
                        PDF_DATE_FORMAT.format(m.getSignupDate())
                ))
                .toList();

        String scope = (search == null || search.isBlank()) && status == null
                ? "All members"
                : "Filtered members" + (status != null ? " — status: " + status : "") + (search != null && !search.isBlank() ? " — search: \"" + search + "\"" : "");

        return PdfExportUtil.buildReport("Members export", scope, MEMBER_EXPORT_HEADERS, rows,
                new float[]{2.5f, 2f, 1.8f, 2.5f, 2f, 1.3f, 1.6f});
    }

    @Transactional(readOnly = true)
    public byte[] exportPaymentsPdf(Instant from, Instant to) {
        List<List<String>> rows = paymentRepository.findForExport(from, to).stream()
                .map(p -> List.of(
                        p.getMember().getFullName(),
                        p.getAmount().toString(),
                        p.getMethod().name(),
                        p.getStatus().name(),
                        p.getReference() == null ? "" : p.getReference(),
                        p.getPaidAt() == null ? "" : PDF_DATE_FORMAT.format(p.getPaidAt())
                ))
                .toList();

        String scope = from == null && to == null
                ? "All payments"
                : "Payments from " + (from == null ? "the beginning" : PDF_DATE_FORMAT.format(from))
                        + " to " + (to == null ? "now" : PDF_DATE_FORMAT.format(to.minusSeconds(1)));

        return PdfExportUtil.buildReport("Payments export", scope, PAYMENT_EXPORT_HEADERS, rows,
                new float[]{2.2f, 1f, 1.1f, 1.1f, 2f, 1.4f});
    }

    private String generateReference() {
        return "CASH-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
    }
}
