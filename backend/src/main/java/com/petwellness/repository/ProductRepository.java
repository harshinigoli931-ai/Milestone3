package com.petwellness.repository;

import com.petwellness.entity.Product;
import com.petwellness.entity.enums.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByActiveTrue();

    List<Product> findByCategoryAndActiveTrue(ProductCategory category);

    List<Product> findByNameContainingIgnoreCaseAndActiveTrue(String name);
}
