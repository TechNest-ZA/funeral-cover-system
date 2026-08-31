package co.za.funeralcover.repository;

import co.za.funeralcover.entity.Claim;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface ClaimRepository extends JpaRepository<Claim, Long> {

    List<Claim> findByMemberIdOrderByCreatedAtDesc(Long memberId);

    boolean existsByMemberIdAndDependentIsNull(Long memberId);

    boolean existsByDependentId(Long dependentId);

    List<Claim> findByCreatedAtBetween(Instant from, Instant to);

    Optional<Claim> findByMemberIdAndDependentIsNull(Long memberId);
}
