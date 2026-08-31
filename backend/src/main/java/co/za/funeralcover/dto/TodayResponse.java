package co.za.funeralcover.dto;

import java.time.LocalDate;
import java.util.List;

public record TodayResponse(
        LocalDate date,
        List<NeedsCallItem> needsCall,
        MonthStats monthStats,
        FuneralAttribution funeralAttribution
) {
}
