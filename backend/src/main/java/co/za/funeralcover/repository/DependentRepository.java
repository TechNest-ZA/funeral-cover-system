package co.za.funeralcover.repository;

import co.za.funeralcover.entity.Dependent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DependentRepository extends JpaRepository<Dependent, Long> {

    List<Dependent> findByMemberIdOrderByCreatedAtAsc(Long memberId);

    Optional<Dependent> findByIdAndMemberId(Long id, Long memberId);

    long countByMemberId(Long memberId);
}
