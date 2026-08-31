package co.za.funeralcover.controller;

import co.za.funeralcover.dto.AdminUserResponse;
import co.za.funeralcover.dto.CreateStaffRequest;
import co.za.funeralcover.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/staff")
@RequiredArgsConstructor
@PreAuthorize("hasRole('OWNER')")
public class StaffController {

    private final AdminUserService adminUserService;

    @GetMapping
    public List<AdminUserResponse> listStaff() {
        return adminUserService.listUsers();
    }

    @PostMapping
    public ResponseEntity<AdminUserResponse> createStaff(@Valid @RequestBody CreateStaffRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminUserService.createUser(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStaff(@PathVariable Long id) {
        adminUserService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
