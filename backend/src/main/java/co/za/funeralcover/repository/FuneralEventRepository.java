package co.za.funeralcover.repository;

import co.za.funeralcover.entity.FuneralEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FuneralEventRepository extends JpaRepository<FuneralEvent, Long> {

    Optional<FuneralEvent> findByQrToken(String qrToken);

    List<FuneralEvent> findAllByOrderByServiceDateDesc();
}
