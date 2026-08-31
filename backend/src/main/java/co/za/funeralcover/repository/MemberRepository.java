package co.za.funeralcover.repository;

import co.za.funeralcover.entity.Member;
import co.za.funeralcover.entity.MemberStatus;
import co.za.funeralcover.entity.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {

    Optional<Member> findByIdNumber(String idNumber);

    boolean existsByIdNumber(String idNumber);

    Optional<Member> findByAccessToken(String accessToken);

    List<Member> findByStatusOrderBySignupDateAsc(MemberStatus status);

    long countByStatus(MemberStatus status);

    long countBySignupDateGreaterThanEqual(Instant from);

    long countByFuneralEventIdIsNotNullAndSignupDateGreaterThanEqual(Instant from);

    List<Member> findByFuneralEventIdIsNotNullAndSignupDateGreaterThanEqual(Instant from);

    long countByFuneralEventId(Long funeralEventId);

    long countByFuneralEventIdAndSignupDateGreaterThanEqual(Long funeralEventId, Instant from);

    @Query("""
        SELECT m FROM Member m
        WHERE (:status IS NULL OR m.status = :status)
        AND (:search IS NULL OR :search = ''
             OR LOWER(m.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
             OR m.idNumber LIKE CONCAT('%', :search, '%'))
        ORDER BY m.signupDate DESC
        """)
    Page<Member> search(@Param("search") String search,
                         @Param("status") MemberStatus status,
                         Pageable pageable);

    @Query(value = """
        SELECT m FROM Member m
        WHERE (:search IS NULL OR :search = ''
             OR LOWER(m.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
             OR m.idNumber LIKE CONCAT('%', :search, '%'))
        AND (:onlyPending = false OR m.status = :pendingStatus)
        AND (:onlyDeceased = false OR m.status = :deceasedStatus)
        AND (:onlyNewThisMonth = false OR m.signupDate >= :monthStart)
        AND (:onlyFromFuneral = false OR m.funeralEvent IS NOT NULL)
        AND (:onlyBehind = false OR (m.status = :activeStatus
             AND (SELECT MAX(p.paidAt) FROM Payment p WHERE p.member = m AND p.status = :successStatus) < :behindCutoff))
        ORDER BY m.signupDate DESC
        """,
        countQuery = """
        SELECT COUNT(m) FROM Member m
        WHERE (:search IS NULL OR :search = ''
             OR LOWER(m.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
             OR m.idNumber LIKE CONCAT('%', :search, '%'))
        AND (:onlyPending = false OR m.status = :pendingStatus)
        AND (:onlyDeceased = false OR m.status = :deceasedStatus)
        AND (:onlyNewThisMonth = false OR m.signupDate >= :monthStart)
        AND (:onlyFromFuneral = false OR m.funeralEvent IS NOT NULL)
        AND (:onlyBehind = false OR (m.status = :activeStatus
             AND (SELECT MAX(p.paidAt) FROM Payment p WHERE p.member = m AND p.status = :successStatus) < :behindCutoff))
        """)
    Page<Member> searchBook(@Param("search") String search,
                             @Param("onlyPending") boolean onlyPending,
                             @Param("onlyDeceased") boolean onlyDeceased,
                             @Param("onlyNewThisMonth") boolean onlyNewThisMonth,
                             @Param("monthStart") Instant monthStart,
                             @Param("onlyFromFuneral") boolean onlyFromFuneral,
                             @Param("onlyBehind") boolean onlyBehind,
                             @Param("activeStatus") MemberStatus activeStatus,
                             @Param("pendingStatus") MemberStatus pendingStatus,
                             @Param("deceasedStatus") MemberStatus deceasedStatus,
                             @Param("successStatus") PaymentStatus successStatus,
                             @Param("behindCutoff") Instant behindCutoff,
                             Pageable pageable);
}
