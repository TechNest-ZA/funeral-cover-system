package co.za.funeralcover.service;

import co.za.funeralcover.dto.AdminUserResponse;
import co.za.funeralcover.dto.ChangePasswordRequest;
import co.za.funeralcover.dto.CreateStaffRequest;
import co.za.funeralcover.dto.ResetPasswordRequest;
import co.za.funeralcover.entity.AdminRole;
import co.za.funeralcover.entity.AdminUser;
import co.za.funeralcover.exception.CannotRemoveLastOwnerException;
import co.za.funeralcover.exception.DuplicateUsernameException;
import co.za.funeralcover.exception.IncorrectPasswordException;
import co.za.funeralcover.exception.ResourceNotFoundException;
import co.za.funeralcover.repository.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<AdminUserResponse> listUsers() {
        return adminUserRepository.findAllByOrderByCreatedAtAsc().stream()
                .map(AdminUserResponse::from)
                .toList();
    }

    @Transactional
    public AdminUserResponse createUser(CreateStaffRequest request) {
        if (adminUserRepository.existsByUsername(request.username())) {
            throw new DuplicateUsernameException("Username \"" + request.username() + "\" is already taken");
        }

        AdminUser user = new AdminUser();
        user.setUsername(request.username());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(request.role());
        user = adminUserRepository.save(user);

        return AdminUserResponse.from(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        AdminUser user = adminUserRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user " + id + " not found"));

        if (user.getRole() == AdminRole.owner && adminUserRepository.countByRole(AdminRole.owner) <= 1) {
            throw new CannotRemoveLastOwnerException("Cannot remove the last remaining owner account");
        }

        adminUserRepository.delete(user);
    }

    @Transactional
    public void changeOwnPassword(String username, ChangePasswordRequest request) {
        AdminUser user = adminUserRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new IncorrectPasswordException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        adminUserRepository.save(user);
    }

    @Transactional
    public void resetPassword(Long id, ResetPasswordRequest request) {
        AdminUser user = adminUserRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user " + id + " not found"));

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        adminUserRepository.save(user);
    }
}
