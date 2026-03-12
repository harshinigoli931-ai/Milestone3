package com.petwellness.service;

import com.petwellness.entity.Vet;
import com.petwellness.repository.VetRepository;
import com.petwellness.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class VetService {

    private final VetRepository vetRepository;

    public VetService(VetRepository vetRepository) {
        this.vetRepository = vetRepository;
    }

    @Transactional
    public Vet saveVet(Vet vet) {
        return vetRepository.save(vet);
    }

    public List<Vet> getAllVets() {
        return vetRepository.findAll();
    }

    public Vet getVetById(Long id) {
        return vetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vet not found"));
    }

    @Transactional
    public void deleteVet(Long id) {
        vetRepository.deleteById(id);
    }
}
