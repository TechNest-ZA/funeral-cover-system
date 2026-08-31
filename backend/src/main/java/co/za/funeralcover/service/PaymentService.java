package co.za.funeralcover.service;

import co.za.funeralcover.dto.PaymentInitiateRequest;
import co.za.funeralcover.dto.PaymentInitiateResponse;
import co.za.funeralcover.dto.PaymentWebhookRequest;
import co.za.funeralcover.entity.Member;
import co.za.funeralcover.entity.MemberStatus;
import co.za.funeralcover.entity.Payment;
import co.za.funeralcover.entity.PaymentStatus;
import co.za.funeralcover.exception.PaymentGatewayNotConfiguredException;
import co.za.funeralcover.exception.ResourceNotFoundException;
import co.za.funeralcover.repository.MemberRepository;
import co.za.funeralcover.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final MemberRepository memberRepository;
    private final EmailService emailService;

    @Value("${app.payments.fake-pay}")
    private boolean fakePayEnabled;

    @Transactional
    public PaymentInitiateResponse initiate(PaymentInitiateRequest request) {
        Member member = memberRepository.findById(request.memberId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Member " + request.memberId() + " not found"));

        Payment payment = new Payment();
        payment.setMember(member);
        payment.setAmount(member.getPlan().getMonthlyPremium());
        payment.setMethod(request.method());
        payment.setStatus(PaymentStatus.pending);
        payment.setReference(generateReference());
        payment = paymentRepository.save(payment);

        if (fakePayEnabled) {
            payment.setStatus(PaymentStatus.success);
            payment.setPaidAt(Instant.now());
            paymentRepository.save(payment);

            member.setStatus(MemberStatus.active);
            memberRepository.save(member);
            emailService.sendMembershipConfirmation(member);

            return new PaymentInitiateResponse(
                    payment.getId(), payment.getStatus().name(), true, null, payment.getReference());
        }

        throw new PaymentGatewayNotConfiguredException(
                "PayFast integration is not wired up yet. Set app.payments.fake-pay=true to test the signup flow.");
    }

    @Transactional
    public void handleWebhook(PaymentWebhookRequest webhook) {
        Payment payment = paymentRepository.findByReference(webhook.reference())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No payment found for reference " + webhook.reference()));

        boolean success = "success".equalsIgnoreCase(webhook.status())
                || "COMPLETE".equalsIgnoreCase(webhook.status());

        payment.setStatus(success ? PaymentStatus.success : PaymentStatus.failed);
        if (success) {
            payment.setPaidAt(Instant.now());
        }
        paymentRepository.save(payment);

        if (success) {
            Member member = payment.getMember();
            member.setStatus(MemberStatus.active);
            memberRepository.save(member);
            emailService.sendMembershipConfirmation(member);
        }
    }

    private String generateReference() {
        return "FC-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
    }
}
