package org.example.sellsight.user.application.dto;

import java.util.List;

public record Enable2faResponse(List<String> backupCodes) {}
