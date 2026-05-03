package org.example.sellsight.config.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;

public class AppUserDetails implements UserDetails {

    private final String email;
    private final String password;
    private final Collection<? extends GrantedAuthority> authorities;
    private final boolean disabled;
    private final boolean deleted;

    public AppUserDetails(String email, String password,
                          Collection<? extends GrantedAuthority> authorities,
                          boolean disabled, boolean deleted) {
        this.email       = email;
        this.password    = password;
        this.authorities = authorities;
        this.disabled    = disabled;
        this.deleted     = deleted;
    }

    public boolean isAccountDisabled() { return disabled; }
    public boolean isAccountDeleted()  { return deleted;  }

    @Override public String getUsername()   { return email;    }
    @Override public String getPassword()   { return password; }
    @Override public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }
    @Override public boolean isAccountNonExpired()     { return true;              }
    @Override public boolean isAccountNonLocked()      { return !disabled;         }
    @Override public boolean isCredentialsNonExpired() { return true;              }
    @Override public boolean isEnabled()               { return !disabled && !deleted; }
}
