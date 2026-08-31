package co.za.funeralcover.controller;

import co.za.funeralcover.dto.*;
import co.za.funeralcover.entity.BookFilter;
import co.za.funeralcover.entity.MemberStatus;
import co.za.funeralcover.service.AdminService;
import co.za.funeralcover.service.FuneralEventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private static final int PAGE_SIZE = 20;

    private final AdminService adminService;
    private final FuneralEventService funeralEventService;

    @PostMapping("/members")
    public ResponseEntity<MemberDetailResponse> createMember(@Valid @RequestBody MemberSignupRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createMember(request));
    }

    @GetMapping("/members")
    public PageResponse<MemberListItemResponse> listMembers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) MemberStatus status,
            @RequestParam(defaultValue = "0") int page) {
        return adminService.searchMembers(search, status, PageRequest.of(page, PAGE_SIZE));
    }

    @GetMapping("/members/book")
    public PageResponse<BookRowResponse> getBook(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) BookFilter filter,
            @RequestParam(defaultValue = "0") int page) {
        return adminService.searchBook(search, filter, PageRequest.of(page, PAGE_SIZE));
    }

    @GetMapping("/members/{id}")
    public MemberDetailResponse getMember(@PathVariable Long id) {
        return adminService.getMemberDetail(id);
    }

    @PostMapping("/payments/manual")
    public PaymentSummaryResponse recordManualPayment(@Valid @RequestBody ManualPaymentRequest request) {
        return adminService.recordManualPayment(request);
    }

    @PostMapping("/members/{id}/claim")
    public ClaimResponse recordClaim(@PathVariable Long id, @Valid @RequestBody RecordClaimRequest request,
                                      Authentication authentication) {
        return adminService.recordClaim(id, request, authentication.getName());
    }

    @PostMapping("/members/{id}/regenerate-token")
    public RegenerateTokenResponse regenerateToken(@PathVariable Long id) {
        return adminService.regenerateAccessToken(id);
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('OWNER')")
    public DashboardStatsResponse getStats() {
        return adminService.getStats();
    }

    @GetMapping("/today")
    public TodayResponse getToday() {
        return adminService.getToday();
    }

    @PostMapping("/funeral-events")
    public ResponseEntity<FuneralEventResponse> createFuneralEvent(@Valid @RequestBody FuneralEventCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(funeralEventService.create(request));
    }

    @GetMapping("/funeral-events")
    public List<FuneralEventResponse> listFuneralEvents() {
        return funeralEventService.list();
    }

    @GetMapping("/export/members")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<byte[]> exportMembers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) MemberStatus status,
            @RequestParam(defaultValue = "csv") String format) {
        if ("pdf".equalsIgnoreCase(format)) {
            return fileResponse("members.pdf", MediaType.APPLICATION_PDF, adminService.exportMembersPdf(search, status));
        }
        return fileResponse("members.csv", MediaType.parseMediaType("text/csv"),
                adminService.exportMembersCsv(search, status).getBytes(StandardCharsets.UTF_8));
    }

    @GetMapping("/export/payments")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<byte[]> exportPayments(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "csv") String format) {
        ZoneId zone = ZoneId.systemDefault();
        Instant fromInstant = from != null ? from.atStartOfDay(zone).toInstant() : null;
        // "to" is inclusive of the whole day from the caller's point of view
        Instant toInstant = to != null ? to.plusDays(1).atStartOfDay(zone).toInstant() : null;

        if ("pdf".equalsIgnoreCase(format)) {
            return fileResponse("payments.pdf", MediaType.APPLICATION_PDF,
                    adminService.exportPaymentsPdf(fromInstant, toInstant));
        }
        return fileResponse("payments.csv", MediaType.parseMediaType("text/csv"),
                adminService.exportPaymentsCsv(fromInstant, toInstant).getBytes(StandardCharsets.UTF_8));
    }

    private ResponseEntity<byte[]> fileResponse(String filename, MediaType contentType, byte[] content) {
        return ResponseEntity.ok()
                .contentType(contentType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(content);
    }
}
