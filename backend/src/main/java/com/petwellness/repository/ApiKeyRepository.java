package com.petwellness.repository;

import com.petwellness.entity.ApiKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApiKeyRepository extends JpaRepository<ApiKey, Long> {
    Optional<ApiKey> findByKeyValueAndActiveTrue(String keyValue);

    List<ApiKey> findByCreatedById(Long userId);

    boolean existsByKeyValue(String keyValue);
}
