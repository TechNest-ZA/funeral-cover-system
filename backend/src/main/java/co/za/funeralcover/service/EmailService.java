package co.za.funeralcover.service;

import co.za.funeralcover.entity.Member;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Stub notification sender - logs to console instead of sending real email.
 * Swap the log line for a real mail client (e.g. JavaMailSender) when ready;
 * WhatsApp delivery is phase 2, not this build.
 */
@Service
@Slf4j
public class EmailService {

    public void sendMembershipConfirmation(Member member) {
        if (member.getEmail() == null || member.getEmail().isBlank()) {
            log.info("Membership confirmation for {} (member #{}) - no email on file, skipped",
                    member.getFullName(), member.getId());
            return;
        }

        log.info("[EMAIL STUB] To: {} | Subject: Welcome to your {} cover | " +
                        "Body: Hi {}, your membership (#{}) is now active.",
                member.getEmail(), member.getPlan().getName(), member.getFullName(), member.getId());
    }
}
