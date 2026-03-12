package com.petwellness.security;

import com.petwellness.entity.ApiKey;
import com.petwellness.repository.ApiKeyRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Component
public class ApiKeyAuthenticationFilter extends OncePerRequestFilter {

    private final ApiKeyRepository apiKeyRepository;

    public ApiKeyAuthenticationFilter(ApiKeyRepository apiKeyRepository) {
        this.apiKeyRepository = apiKeyRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        // Only process if no JWT auth already set
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            String apiKeyValue = request.getHeader("X-API-KEY");

            if (StringUtils.hasText(apiKeyValue)) {
                Optional<ApiKey> apiKeyOpt = apiKeyRepository.findByKeyValueAndActiveTrue(apiKeyValue);

                if (apiKeyOpt.isPresent()) {
                    ApiKey apiKey = apiKeyOpt.get();
                    apiKey.setLastUsedAt(LocalDateTime.now());
                    apiKeyRepository.save(apiKey);

                    // Grant API_CLIENT role for API key authenticated requests
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            apiKey.getName(),
                            null,
                            List.of(new SimpleGrantedAuthority("ROLE_API_CLIENT")));
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}
