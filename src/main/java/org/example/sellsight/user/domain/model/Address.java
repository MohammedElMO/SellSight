package org.example.sellsight.user.domain.model;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

/**
 * Address entity — shipping/billing address for a user.
 */
public class Address {

    private final UUID id;
    private final String userId;
    private String label;
    private String firstName;
    private String lastName;
    private String street;
    private String city;
    private String state;
    private String zip;
    private String country;
    private String phone;
    private boolean defaultShipping;
    private boolean defaultBilling;
    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Address(UUID id, String userId, String label, String firstName, String lastName,
                   String street, String city, String state, String zip, String country,
                   String phone, boolean defaultShipping, boolean defaultBilling,
                   LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = Objects.requireNonNull(id);
        this.userId = Objects.requireNonNull(userId);
        this.label = label != null ? label : "Home";
        this.createdAt = Objects.requireNonNull(createdAt);
        this.updatedAt = updatedAt;
        this.defaultShipping = defaultShipping;
        this.defaultBilling = defaultBilling;
        setFirstName(firstName);
        setLastName(lastName);
        setStreet(street);
        setCity(city);
        this.state = state;
        setZip(zip);
        this.country = country != null ? country : "US";
        this.phone = phone;
    }

    public void update(String label, String firstName, String lastName, String street,
                       String city, String state, String zip, String country, String phone) {
        this.label = label;
        setFirstName(firstName);
        setLastName(lastName);
        setStreet(street);
        setCity(city);
        this.state = state;
        setZip(zip);
        this.country = country;
        this.phone = phone;
        this.updatedAt = LocalDateTime.now();
    }

    public void setAsDefaultShipping() { this.defaultShipping = true; }
    public void setAsDefaultBilling() { this.defaultBilling = true; }
    public void clearDefaultShipping() { this.defaultShipping = false; }
    public void clearDefaultBilling() { this.defaultBilling = false; }

    private void setFirstName(String v) {
        if (v == null || v.isBlank()) throw new IllegalArgumentException("First name required");
        this.firstName = v.trim();
    }
    private void setLastName(String v) {
        if (v == null || v.isBlank()) throw new IllegalArgumentException("Last name required");
        this.lastName = v.trim();
    }
    private void setStreet(String v) {
        if (v == null || v.isBlank()) throw new IllegalArgumentException("Street required");
        this.street = v.trim();
    }
    private void setCity(String v) {
        if (v == null || v.isBlank()) throw new IllegalArgumentException("City required");
        this.city = v.trim();
    }
    private void setZip(String v) {
        if (v == null || v.isBlank()) throw new IllegalArgumentException("ZIP required");
        this.zip = v.trim();
    }

    // ── Getters ─────────────────────────────────────────────
    public UUID getId() { return id; }
    public String getUserId() { return userId; }
    public String getLabel() { return label; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getStreet() { return street; }
    public String getCity() { return city; }
    public String getState() { return state; }
    public String getZip() { return zip; }
    public String getCountry() { return country; }
    public String getPhone() { return phone; }
    public boolean isDefaultShipping() { return defaultShipping; }
    public boolean isDefaultBilling() { return defaultBilling; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
