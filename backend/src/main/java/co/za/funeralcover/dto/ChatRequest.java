package co.za.funeralcover.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ChatRequest(
        @NotBlank @Size(max = 1000) String message,
        @Valid List<ChatMessageDto> history
) {
    public List<ChatMessageDto> historyOrEmpty() {
        return history == null ? List.of() : history;
    }
}
