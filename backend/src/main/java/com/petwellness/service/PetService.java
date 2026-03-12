package com.petwellness.service;

import com.petwellness.dto.*;
import com.petwellness.entity.*;
import com.petwellness.exception.BadRequestException;
import com.petwellness.exception.ResourceNotFoundException;
import com.petwellness.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PetService {

    private final PetRepository petRepository;
    private final UserRepository userRepository;
    private final MedicalHistoryRepository medicalHistoryRepo;
    private final VaccinationRepository vaccinationRepo;
    private final ReminderService reminderService;

    public PetService(PetRepository petRepository, UserRepository userRepository,
            MedicalHistoryRepository medicalHistoryRepo, VaccinationRepository vaccinationRepo,
            ReminderService reminderService) {
        this.petRepository = petRepository;
        this.userRepository = userRepository;
        this.medicalHistoryRepo = medicalHistoryRepo;
        this.vaccinationRepo = vaccinationRepo;
        this.reminderService = reminderService;
    }

    @Transactional
    public PetResponse addPet(Long ownerId, PetRequest request) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));

        Pet pet = Pet.builder()
                .owner(owner)
                .name(request.getName())
                .species(request.getSpecies())
                .breed(request.getBreed())
                .age(request.getAge())
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .weight(request.getWeight())
                .color(request.getColor())
                .microchipId(request.getMicrochipId())
                .imageUrl(request.getImageUrl())
                .notes(request.getNotes())
                .build();
        pet = petRepository.save(pet);
        return mapToResponse(pet);
    }

    @Transactional
    public PetResponse updatePet(Long ownerId, Long petId, PetRequest request) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found"));

        if (!pet.getOwner().getId().equals(ownerId)) {
            throw new BadRequestException("You can only update your own pets");
        }

        if (request.getName() != null)
            pet.setName(request.getName());
        if (request.getSpecies() != null)
            pet.setSpecies(request.getSpecies());
        if (request.getBreed() != null)
            pet.setBreed(request.getBreed());
        if (request.getAge() != null)
            pet.setAge(request.getAge());
        if (request.getDateOfBirth() != null)
            pet.setDateOfBirth(request.getDateOfBirth());
        if (request.getGender() != null)
            pet.setGender(request.getGender());
        if (request.getWeight() != null)
            pet.setWeight(request.getWeight());
        if (request.getColor() != null)
            pet.setColor(request.getColor());
        if (request.getMicrochipId() != null)
            pet.setMicrochipId(request.getMicrochipId());
        if (request.getImageUrl() != null)
            pet.setImageUrl(request.getImageUrl());
        if (request.getNotes() != null)
            pet.setNotes(request.getNotes());

        pet = petRepository.save(pet);
        return mapToResponse(pet);
    }

    @Transactional
    public void deletePet(Long ownerId, Long petId) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found"));
        if (!pet.getOwner().getId().equals(ownerId)) {
            throw new BadRequestException("You can only delete your own pets");
        }
        petRepository.delete(pet);
    }

    public List<PetResponse> getPetsByOwner(Long ownerId) {
        return petRepository.findByOwnerId(ownerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public PetResponse getPetById(Long ownerId, Long petId) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found"));
        if (!pet.getOwner().getId().equals(ownerId)) {
            throw new BadRequestException("You can only view your own pets");
        }
        return mapToDetailedResponse(pet);
    }

    @Transactional
    public PetResponse.MedicalHistoryResponse addMedicalHistory(Long ownerId, Long petId,
            MedicalHistoryRequest request) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found"));
        if (!pet.getOwner().getId().equals(ownerId)) {
            throw new BadRequestException("You can only add records to your own pets");
        }

        MedicalHistory history = MedicalHistory.builder()
                .pet(pet)
                .diagnosis(request.getDiagnosis())
                .treatment(request.getTreatment())
                .prescription(request.getPrescription())
                .vetName(request.getVetName())
                .visitDate(request.getVisitDate())
                .notes(request.getNotes())
                .build();
        history = medicalHistoryRepo.save(history);

        return PetResponse.MedicalHistoryResponse.builder()
                .id(history.getId())
                .diagnosis(history.getDiagnosis())
                .treatment(history.getTreatment())
                .prescription(history.getPrescription())
                .vetName(history.getVetName())
                .visitDate(history.getVisitDate())
                .notes(history.getNotes())
                .build();
    }

    @Transactional
    public PetResponse.VaccinationResponse addVaccination(Long ownerId, Long petId, VaccinationRequest request) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found"));
        if (!pet.getOwner().getId().equals(ownerId)) {
            throw new BadRequestException("You can only add records to your own pets");
        }

        Vaccination vaccination = Vaccination.builder()
                .pet(pet)
                .vaccineName(request.getVaccineName())
                .dateGiven(request.getDateGiven())
                .nextDueDate(request.getNextDueDate())
                .batchNumber(request.getBatchNumber())
                .administeredBy(request.getAdministeredBy())
                .completed(false)
                .notes(request.getNotes())
                .build();
        vaccination = vaccinationRepo.save(vaccination);
        reminderService.sendReminderImmediately(vaccination);

        return PetResponse.VaccinationResponse.builder()
                .id(vaccination.getId())
                .vaccineName(vaccination.getVaccineName())
                .dateGiven(vaccination.getDateGiven())
                .nextDueDate(vaccination.getNextDueDate())
                .batchNumber(vaccination.getBatchNumber())
                .administeredBy(vaccination.getAdministeredBy())
                .completed(vaccination.isCompleted())
                .notes(vaccination.getNotes())
                .build();
    }

    @Transactional
    public void deleteVaccination(Long ownerId, Long petId, Long vaccinationId) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new ResourceNotFoundException("Pet found"));
        if (!pet.getOwner().getId().equals(ownerId)) {
            throw new BadRequestException("You can only delete records from your own pets");
        }

        Vaccination vaccination = vaccinationRepo.findById(vaccinationId)
                .orElseThrow(() -> new ResourceNotFoundException("Vaccination record not found"));

        if (!vaccination.getPet().getId().equals(petId)) {
            throw new BadRequestException("Vaccination record does not belong to this pet");
        }

        vaccinationRepo.delete(vaccination);
    }

    public List<PetResponse> getAllPetsForAdmin() {
        return petRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private PetResponse mapToResponse(Pet pet) {
        return PetResponse.builder()
                .id(pet.getId())
                .name(pet.getName())
                .species(pet.getSpecies())
                .breed(pet.getBreed())
                .age(pet.getAge())
                .dateOfBirth(pet.getDateOfBirth())
                .gender(pet.getGender())
                .weight(pet.getWeight())
                .color(pet.getColor())
                .microchipId(pet.getMicrochipId())
                .imageUrl(pet.getImageUrl())
                .notes(pet.getNotes())
                .ownerId(pet.getOwner() != null ? pet.getOwner().getId() : null)
                .ownerEmail(pet.getOwner() != null ? pet.getOwner().getEmail() : null)
                .build();
    }

    private PetResponse mapToDetailedResponse(Pet pet) {
        PetResponse response = mapToResponse(pet);

        response.setMedicalHistories(
                medicalHistoryRepo.findByPetIdOrderByVisitDateDesc(pet.getId()).stream()
                        .map(h -> PetResponse.MedicalHistoryResponse.builder()
                                .id(h.getId()).diagnosis(h.getDiagnosis()).treatment(h.getTreatment())
                                .prescription(h.getPrescription()).vetName(h.getVetName())
                                .visitDate(h.getVisitDate()).notes(h.getNotes()).build())
                        .collect(Collectors.toList()));

        response.setVaccinations(
                vaccinationRepo.findByPetId(pet.getId()).stream()
                        .map(v -> PetResponse.VaccinationResponse.builder()
                                .id(v.getId()).vaccineName(v.getVaccineName()).dateGiven(v.getDateGiven())
                                .nextDueDate(v.getNextDueDate()).batchNumber(v.getBatchNumber())
                                .administeredBy(v.getAdministeredBy()).completed(v.isCompleted())
                                .notes(v.getNotes()).build())
                        .collect(Collectors.toList()));

        return response;
    }
}
