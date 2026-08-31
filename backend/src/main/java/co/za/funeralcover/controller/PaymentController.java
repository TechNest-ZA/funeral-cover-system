package co.za.funeralcover.controller;

import co.za.funeralcover.dto.PaymentInitiateRequest;
import co.za.funeralcover.dto.PaymentInitiateResponse;
import co.za.funeralcover.dto.PaymentWebhookRequest;
import co.za.funeralcover.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/initiate")
    public PaymentInitiateResponse initiate(@Valid @RequestBody PaymentInitiateRequest request) {
        return paymentService.initiate(request);
    }

    @PostMapping("/webhook")
    public void webhook(@RequestBody PaymentWebhookRequest webhook) {
        paymentService.handleWebhook(webhook);
    }
}
