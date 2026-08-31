package co.za.funeralcover.controller;

import co.za.funeralcover.dto.PlanResponse;
import co.za.funeralcover.service.PlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/plans")
@RequiredArgsConstructor
public class PlanController {

    private final PlanService planService;

    @GetMapping
    public List<PlanResponse> listPlans() {
        return planService.listActivePlans();
    }
}
