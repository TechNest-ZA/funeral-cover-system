package co.za.funeralcover.service;

import co.za.funeralcover.dto.PlanResponse;
import co.za.funeralcover.repository.PlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PlanService {

    private final PlanRepository planRepository;

    public List<PlanResponse> listActivePlans() {
        return planRepository.findByActiveTrue().stream()
                .map(PlanResponse::from)
                .toList();
    }
}
