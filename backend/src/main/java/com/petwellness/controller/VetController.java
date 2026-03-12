package com.petwellness.controller;

import com.petwellness.entity.Vet;
import com.petwellness.service.VetService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vets")
@RequiredArgsConstructor
public class VetController {

    private final VetService vetService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Vet addVet(@RequestBody Vet vet) {
        return vetService.saveVet(vet);
    }

    @GetMapping
    public List<Vet> getAllVets() {
        return vetService.getAllVets();
    }

    @GetMapping("/{id}")
    public Vet getVetById(@PathVariable Long id) {
        return vetService.getVetById(id);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteVet(@PathVariable Long id) {
        vetService.deleteVet(id);
    }
}
