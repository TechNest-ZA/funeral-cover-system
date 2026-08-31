package co.za.funeralcover.service;

import co.za.funeralcover.dto.FuneralEventCreateRequest;
import co.za.funeralcover.dto.FuneralEventResponse;
import co.za.funeralcover.entity.FuneralEvent;
import co.za.funeralcover.repository.FuneralEventRepository;
import co.za.funeralcover.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.ZoneId;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FuneralEventService {

    private static final String TOKEN_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final FuneralEventRepository funeralEventRepository;
    private final MemberRepository memberRepository;

    @Value("${app.public-base-url}")
    private String publicBaseUrl;

    @Transactional
    public FuneralEventResponse create(FuneralEventCreateRequest request) {
        FuneralEvent event = new FuneralEvent();
        event.setLabel(request.label());
        event.setServiceDate(request.serviceDate());
        event.setQrToken(generateUniqueToken());
        event = funeralEventRepository.save(event);
        return toResponse(event);
    }

    @Transactional(readOnly = true)
    public List<FuneralEventResponse> list() {
        return funeralEventRepository.findAllByOrderByServiceDateDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    private FuneralEventResponse toResponse(FuneralEvent event) {
        Instant startOfMonth = Instant.now().atZone(ZoneId.systemDefault())
                .toLocalDate().withDayOfMonth(1).atStartOfDay(ZoneId.systemDefault()).toInstant();

        long total = memberRepository.countByFuneralEventId(event.getId());
        long thisMonth = memberRepository.countByFuneralEventIdAndSignupDateGreaterThanEqual(event.getId(), startOfMonth);
        String signupUrl = publicBaseUrl + "/join?src=" + event.getQrToken();

        return FuneralEventResponse.from(event, signupUrl, total, thisMonth);
    }

    private String generateUniqueToken() {
        String token;
        do {
            StringBuilder sb = new StringBuilder(6);
            for (int i = 0; i < 6; i++) {
                sb.append(TOKEN_CHARS.charAt(RANDOM.nextInt(TOKEN_CHARS.length())));
            }
            token = sb.toString();
        } while (funeralEventRepository.findByQrToken(token).isPresent());
        return token;
    }
}
