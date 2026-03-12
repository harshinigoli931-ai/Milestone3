package com.petwellness.repository;

import com.petwellness.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);
}
