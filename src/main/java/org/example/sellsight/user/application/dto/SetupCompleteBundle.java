package org.example.sellsight.user.application.dto;

import java.util.List;

public record SetupCompleteBundle(AuthBundle authBundle, List<String> backupCodes) {}
