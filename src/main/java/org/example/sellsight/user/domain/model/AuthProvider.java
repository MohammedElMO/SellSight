package org.example.sellsight.user.domain.model;

/**
 * Authentication provider — tracks how the user signed up.
 * LOCAL = email + password, GOOGLE/SLACK = OAuth2.
 */
public enum AuthProvider {
    LOCAL, GOOGLE, SLACK
}
