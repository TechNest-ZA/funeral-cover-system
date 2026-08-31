package co.za.funeralcover.controller;

import co.za.funeralcover.dto.DependentRequest;
import co.za.funeralcover.dto.DependentResponse;
import co.za.funeralcover.dto.MemberBookResponse;
import co.za.funeralcover.dto.MemberCardResponse;
import co.za.funeralcover.dto.MemberSignupRequest;
import co.za.funeralcover.dto.MemberSignupResponse;
import co.za.funeralcover.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    @PostMapping
    public ResponseEntity<MemberSignupResponse> signup(@Valid @RequestBody MemberSignupRequest request) {
        MemberSignupResponse response = memberService.signup(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}/card")
    public MemberCardResponse getCard(@PathVariable Long id) {
        return memberService.getCard(id);
    }

    @GetMapping("/book/{token}")
    public MemberBookResponse getBook(@PathVariable String token) {
        return memberService.getBook(token);
    }

    @PostMapping("/book/{token}/dependents")
    public ResponseEntity<DependentResponse> addDependent(@PathVariable String token,
                                                            @Valid @RequestBody DependentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(memberService.addDependent(token, request));
    }

    @DeleteMapping("/book/{token}/dependents/{dependentId}")
    public ResponseEntity<Void> removeDependent(@PathVariable String token, @PathVariable Long dependentId) {
        memberService.removeDependent(token, dependentId);
        return ResponseEntity.noContent().build();
    }
}
