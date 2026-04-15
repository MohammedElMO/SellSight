package org.example.sellsight.user.domain.model;

import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * User aggregate root — rich domain model with behavior.
 * Pure Java, no framework annotations.
 */
@EqualsAndHashCode
public class User {

    private final UserId id;
    private String firstName;
    private String lastName;
    private final Email email;
    private Password password;
    private Role role;
    private final LocalDateTime createdAt;


    public User(UserId id, String firstName, String lastName,
                Email email, Password password, Role role, LocalDateTime createdAt) {
        this.id = Objects.requireNonNull(id, "User ID cannot be null");
        this.email = Objects.requireNonNull(email, "Email cannot be null");
        this.password = Objects.requireNonNull(password, "Password cannot be null");
        this.role = Objects.requireNonNull(role, "Role cannot be null");
        this.createdAt = Objects.requireNonNull(createdAt, "CreatedAt cannot be null");
        setFirstName(firstName);
        setLastName(lastName);
    }


    public void updateProfile(String firstName, String lastName) {
        setFirstName(firstName);
        setLastName(lastName);
    }


    public void changeRole(Role newRole) {
        this.role = Objects.requireNonNull(newRole, "New role cannot be null");
    }


    public void changePassword(Password newPassword) {
        this.password = Objects.requireNonNull(newPassword, "New password cannot be null");
    }


    private void setFirstName(String firstName) {
        if (firstName == null || firstName.isBlank()) {
            throw new IllegalArgumentException("First name cannot be empty");
        }
        this.firstName = firstName.trim();
    }

    private void setLastName(String lastName) {
        if (lastName == null || lastName.isBlank()) {
            throw new IllegalArgumentException("Last name cannot be empty");
        }
        this.lastName = lastName.trim();
    }


    public UserId getId() { return id; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public Email getEmail() { return email; }
    public Password getPassword() { return password; }
    public Role getRole() { return role; }
    public LocalDateTime getCreatedAt() { return createdAt; }


}
