package com.petwellness.repository;

import com.petwellness.entity.Pet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PetRepository extends JpaRepository<Pet, Long> {
    List<Pet> findByOwnerId(Long ownerId);

    long countByOwnerId(Long ownerId);

    @org.springframework.data.jpa.repository.Query("SELECT p.species, COUNT(p) FROM Pet p GROUP BY p.species")
    List<Object[]> countPetsBySpecies();
}
