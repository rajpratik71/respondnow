package io.respondnow.security;

import io.respondnow.util.JWTUtil;
import java.io.IOException;
import java.util.Set;
import java.util.stream.Collectors;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Slf4j
public class JWTAuthenticationFilter extends OncePerRequestFilter {

  @Autowired private JWTUtil jwtUtil;

  @Override
  protected void doFilterInternal(
      HttpServletRequest request,
      javax.servlet.http.HttpServletResponse response,
      FilterChain filterChain)
      throws ServletException, IOException {

    try {
      String token = getJWTFromRequest(request);
      if (token != null && jwtUtil.validateToken(token, jwtUtil.getUsernameFromToken(token))) {
        String username = jwtUtil.getUsernameFromToken(token);
        String userId = jwtUtil.getUserIdFromToken(token);
        
        // Extract roles from JWT token and convert to authorities
        Set<String> roleNames = jwtUtil.getRoleNamesFromToken(token);
        var authorities = roleNames.stream()
            .map(SimpleGrantedAuthority::new)
            .collect(Collectors.toList());
        
        log.debug("JWT Authentication - userId: {}, username: {}, roles: {}", userId, username, roleNames);
        
        UsernamePasswordAuthenticationToken authentication =
            new UsernamePasswordAuthenticationToken(username, null, authorities);
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        log.debug("Authentication successful for user: {} with authorities: {}", username, authorities);
      }
    } catch (Exception e) {
      log.error("JWT authentication failed", e);
    }

    filterChain.doFilter(request, response);
  }

  // Extract JWT from the request
  private String getJWTFromRequest(HttpServletRequest request) {
    String bearerToken = request.getHeader("Authorization");
    if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
      return bearerToken.substring(7);
    }
    return null;
  }
}
