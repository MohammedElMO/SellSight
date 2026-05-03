package org.example.sellsight.config.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.io.PrintWriter;

/**
 * JWT authentication filter — extracts and validates Bearer tokens
 * from the Authorization header on every request.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService,
                                    CustomUserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);

        try {
            final String email = jwtService.extractEmail(jwt);

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                if (userDetails instanceof AppUserDetails appUser) {
                    if (appUser.isAccountDeleted()) {
                        writeBlockedResponse(response, "ACCOUNT_DELETED", "This account has been deleted.");
                        return;
                    }
                    if (appUser.isAccountDisabled()) {
                        writeBlockedResponse(response, "ACCOUNT_DISABLED", "Your account has been suspended. Contact support.");
                        return;
                    }
                }

                if (jwtService.isTokenValid(jwt, userDetails.getUsername())) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // Invalid token — continue without authentication
            logger.debug("JWT validation failed: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    private void writeBlockedResponse(HttpServletResponse response, String errorCode, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json");
        PrintWriter writer = response.getWriter();
        writer.write(String.format(
                "{\"status\":403,\"message\":\"%s\",\"errorCode\":\"%s\"}",
                message, errorCode));
        writer.flush();
    }
}
