package com.petwellness.service;

import com.petwellness.dto.ApiKeyRequest;
import com.petwellness.dto.ApiKeyResponse;
import com.petwellness.entity.ApiKey;
import com.petwellness.entity.User;
import com.petwellness.exception.ResourceNotFoundException;
import com.petwellness.repository.ApiKeyRepository;
import com.petwellness.repository.UserRepository;
import com.petwellness.util.PasswordGenerator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ApiKeyService {

    private final ApiKeyRepository apiKeyRepository;
    private final UserRepository userRepository;

    public ApiKeyService(ApiKeyRepository apiKeyRepository, UserRepository userRepository) {
        this.apiKeyRepository = apiKeyRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ApiKeyResponse generateApiKey(Long userId, ApiKeyRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String keyValue;
        do {
            keyValue = PasswordGenerator.generateApiKey();
        } while (apiKeyRepository.existsByKeyValue(keyValue));

        ApiKey apiKey = ApiKey.builder()
                .keyValue(keyValue)
                .name(request.getName() != null ? request.getName() : "Default API Key")
                .createdBy(user)
                .active(true)
                .build();

        apiKey = apiKeyRepository.save(apiKey);
        return mapToResponse(apiKey);
    }

    public boolean validateApiKey(String keyValue) {
        return apiKeyRepository.findByKeyValueAndActiveTrue(keyValue).isPresent();
    }

    public List<ApiKeyResponse> listApiKeys(Long userId) {
        return apiKeyRepository.findByCreatedById(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void revokeApiKey(Long keyId) {
        ApiKey apiKey = apiKeyRepository.findById(keyId)
                .orElseThrow(() -> new ResourceNotFoundException("API key not found"));
        apiKey.setActive(false);
        apiKeyRepository.save(apiKey);
    }

    private ApiKeyResponse mapToResponse(ApiKey apiKey) {
        return ApiKeyResponse.builder()
                .id(apiKey.getId())
                .keyValue(apiKey.getKeyValue())
                .name(apiKey.getName())
                .active(apiKey.isActive())
                .createdAt(apiKey.getCreatedAt())
                .lastUsedAt(apiKey.getLastUsedAt())
                .build();
    }
}
