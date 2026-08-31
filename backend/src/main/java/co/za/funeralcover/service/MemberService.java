package co.za.funeralcover.service;

import co.za.funeralcover.dto.DependentRequest;
import co.za.funeralcover.dto.DependentResponse;
import co.za.funeralcover.dto.MemberBookResponse;
import co.za.funeralcover.dto.MemberCardResponse;
import co.za.funeralcover.dto.MemberSignupRequest;
import co.za.funeralcover.dto.MemberSignupResponse;
import co.za.funeralcover.dto.PaymentSummaryResponse;
import co.za.funeralcover.entity.Dependent;
import co.za.funeralcover.entity.FuneralEvent;
import co.za.funeralcover.entity.Member;
import co.za.funeralcover.entity.MemberStatus;
import co.za.funeralcover.entity.Payment;
import co.za.funeralcover.entity.PaymentStatus;
import co.za.funeralcover.entity.Plan;
import co.za.funeralcover.exception.DuplicateMemberException;
import co.za.funeralcover.exception.InvalidIdNumberException;
import co.za.funeralcover.exception.ResourceNotFoundException;
import co.za.funeralcover.repository.DependentRepository;
import co.za.funeralcover.repository.FuneralEventRepository;
import co.za.funeralcover.repository.MemberRepository;
import co.za.funeralcover.repository.PaymentRepository;
import co.za.funeralcover.repository.PlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final PlanRepository planRepository;
    private final PaymentRepository paymentRepository;
    private final DependentRepository dependentRepository;
    private final FuneralEventRepository funeralEventRepository;

    @Transactional
    public MemberSignupResponse signup(MemberSignupRequest request) {
        if (!SaIdValidator.isValid(request.idNumber())) {
            throw new InvalidIdNumberException("That doesn't look like a valid SA ID number");
        }

        if (memberRepository.existsByIdNumber(request.idNumber())) {
            throw new DuplicateMemberException(
                    "A member with this ID number is already registered");
        }

        Plan plan = planRepository.findById(request.planId())
                .filter(Plan::isActive)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Plan " + request.planId() + " not found or no longer available"));

        Member member = new Member();
        member.setFullName(request.fullName());
        member.setIdNumber(request.idNumber());
        member.setAccessToken(UUID.randomUUID().toString());
        member.setPhone(request.phone());
        member.setBeneficiaryName(request.beneficiaryName());
        member.setBeneficiaryRelationship(request.beneficiaryRelationship());
        member.setBeneficiaryPhone(request.beneficiaryPhone());
        member.setBeneficiaryIdNumber(request.beneficiaryIdNumber());
        member.setEmail(request.email());
        member.setPlan(plan);
        member.setStatus(MemberStatus.pending);

        if (request.sourceCode() != null && !request.sourceCode().isBlank()) {
            funeralEventRepository.findByQrToken(request.sourceCode()).ifPresent(member::setFuneralEvent);
        }

        member = memberRepository.save(member);
        return MemberSignupResponse.from(member);
    }

    @Transactional(readOnly = true)
    public MemberCardResponse getCard(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member " + memberId + " not found"));

        return new MemberCardResponse(
                member.getId(),
                formatMemberNumber(member.getId()),
                member.getFullName(),
                member.getPlan().getName(),
                member.getPlan().getMonthlyPremium(),
                member.getPlan().getCoverAmount(),
                member.getPlan().getBenefitsList(),
                member.getStatus().name(),
                member.getSignupDate()
        );
    }

    @Transactional(readOnly = true)
    public MemberBookResponse getBook(String accessToken) {
        Member member = findByToken(accessToken);

        List<Payment> payments = paymentRepository.findByMemberIdOrderByCreatedAtDesc(member.getId());

        Instant nextDueDate = payments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.success)
                .map(Payment::getPaidAt)
                .max(Instant::compareTo)
                .map(paidAt -> paidAt.atZone(ZoneId.systemDefault()).plusMonths(1).toInstant())
                .orElse(null);

        List<DependentResponse> dependents = dependentRepository.findByMemberIdOrderByCreatedAtAsc(member.getId())
                .stream().map(DependentResponse::from).toList();

        return new MemberBookResponse(
                member.getId(),
                formatMemberNumber(member.getId()),
                member.getFullName(),
                member.getPlan().getName(),
                member.getPlan().getMonthlyPremium(),
                member.getPlan().getCoverAmount(),
                member.getPlan().getBenefitsList(),
                member.getStatus().name(),
                member.getSignupDate(),
                nextDueDate,
                payments.stream().map(PaymentSummaryResponse::from).toList(),
                dependents
        );
    }

    @Transactional
    public DependentResponse addDependent(String accessToken, DependentRequest request) {
        Member member = findByToken(accessToken);

        Dependent dependent = new Dependent();
        dependent.setMember(member);
        dependent.setFullName(request.fullName());
        dependent.setIdNumber(request.idNumber());
        dependent.setRelationship(request.relationship());
        dependent = dependentRepository.save(dependent);

        return DependentResponse.from(dependent);
    }

    @Transactional
    public void removeDependent(String accessToken, Long dependentId) {
        Member member = findByToken(accessToken);

        Dependent dependent = dependentRepository.findByIdAndMemberId(dependentId, member.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Dependent " + dependentId + " not found"));

        dependentRepository.delete(dependent);
    }

    private Member findByToken(String accessToken) {
        return memberRepository.findByAccessToken(accessToken)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));
    }

    private String formatMemberNumber(Long id) {
        return String.format("FC-%06d", id);
    }
}
