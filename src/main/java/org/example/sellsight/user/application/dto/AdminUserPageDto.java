package org.example.sellsight.user.application.dto;

import java.util.List;

public record AdminUserPageDto(
        List<AdminUserDto> users,
        long total,
        int page,
        int size,
        int totalPages
) {}
