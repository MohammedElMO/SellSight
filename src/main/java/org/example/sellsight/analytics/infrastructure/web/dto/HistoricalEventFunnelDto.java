package org.example.sellsight.analytics.infrastructure.web.dto;

public record HistoricalEventFunnelDto(
        String eventType,
        Long eventCount
) {}
