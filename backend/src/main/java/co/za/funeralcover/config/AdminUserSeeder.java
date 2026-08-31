package co.za.funeralcover.config;

import co.za.funeralcover.entity.AdminRole;
import co.za.funeralcover.entity.AdminUser;
import co.za.funeralcover.repository.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminUserSeeder implements CommandLineRunner {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.seed.username}")
    private String seedUsername;

    @Value("${app.admin.seed.password}")
    private String seedPassword;

    @Override
    public void run(String... args) {
        if (adminUserRepository.count() > 0) {
            return;
        }

        AdminUser admin = new AdminUser();
        admin.setUsername(seedUsername);
        admin.setPasswordHash(passwordEncoder.encode(seedPassword));
        admin.setRole(AdminRole.owner);
        adminUserRepository.save(admin);

        log.info("Seeded default admin user - username: {}, password: {} (change this before going live)",
                seedUsername, seedPassword);
    }
}
