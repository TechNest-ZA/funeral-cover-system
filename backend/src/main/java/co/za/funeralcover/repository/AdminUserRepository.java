package co.za.funeralcover.repository;

import co.za.funeralcover.entity.AdminRole;
import co.za.funeralcover.entity.AdminUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AdminUserRepository extends JpaRepository<AdminUser, Long> {

    Optional<AdminUser> findByUsername(String username);

    boolean existsByUsername(String username);

    long countByRole(AdminRole role);

    List<AdminUser> findAllByOrderByCreatedAtAsc();
}
