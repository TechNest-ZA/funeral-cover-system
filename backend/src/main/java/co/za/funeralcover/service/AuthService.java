package co.za.funeralcover.service;

import co.za.funeralcover.config.JwtService;
import co.za.funeralcover.dto.LoginRequest;
import co.za.funeralcover.dto.LoginResponse;
import co.za.funeralcover.entity.AdminUser;
import co.za.funeralcover.exception.InvalidCredentialsException;
import co.za.funeralcover.repository.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public LoginResponse login(LoginRequest request) {
        AdminUser admin = adminUserRepository.findByUsername(request.username())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid username or password"));

        if (!passwordEncoder.matches(request.password(), admin.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid username or password");
        }

        String token = jwtService.generateToken(admin.getUsername(), admin.getRole().name());
        return new LoginResponse(token, admin.getUsername(), admin.getRole().name());
    }
}
