package com.petwellness.repository;

import com.petwellness.entity.User;
import com.petwellness.entity.enums.AccountStatus;
import com.petwellness.entity.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByRole(Role role);

    List<User> findByAccountStatus(AccountStatus status);

    List<User> findByRoleAndAccountStatus(Role role, AccountStatus status);

    long countByRole(Role role);
}
