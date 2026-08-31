package co.za.funeralcover.repository;

import co.za.funeralcover.entity.MemberStatus;
import co.za.funeralcover.entity.Payment;
import co.za.funeralcover.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByMemberIdOrderByCreatedAtDesc(Long memberId);

    Optional<Payment> findByReference(String reference);

    long countByStatus(PaymentStatus status);

    long countByStatusAndPaidAtBetween(PaymentStatus status, Instant from, Instant to);

    @Query("""
        SELECT COALESCE(SUM(p.amount), 0) FROM Payment p
        WHERE p.status = :status AND p.paidAt >= :from AND p.paidAt < :to
        """)
    java.math.BigDecimal sumAmountByStatusAndPaidAtBetween(@Param("status") PaymentStatus status,
                                                             @Param("from") Instant from,
                                                             @Param("to") Instant to);

    @Query("""
        SELECT COUNT(DISTINCT p.member.id) FROM Payment p
        WHERE p.status = :status AND p.paidAt >= :from AND p.paidAt < :to
        AND p.member.status = :memberStatus
        """)
    long countDistinctMembersByStatusAndPaidAtBetweenAndMemberStatus(@Param("status") PaymentStatus status,
                                                                       @Param("from") Instant from,
                                                                       @Param("to") Instant to,
                                                                       @Param("memberStatus") MemberStatus memberStatus);

    List<Payment> findByMemberIdAndStatusOrderByPaidAtDesc(Long memberId, PaymentStatus status);

    @Query("""
        SELECT p FROM Payment p
        WHERE (:from IS NULL OR p.createdAt >= :from)
        AND (:to IS NULL OR p.createdAt < :to)
        ORDER BY p.createdAt DESC
        """)
    List<Payment> findForExport(@Param("from") Instant from, @Param("to") Instant to);
}
