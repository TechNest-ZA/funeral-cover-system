package co.za.funeralcover.repository;

import co.za.funeralcover.entity.Plan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlanRepository extends JpaRepository<Plan, Long> {

    List<Plan> findByActiveTrue();
}
