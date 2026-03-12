package com.petwellness.service;

import com.petwellness.dto.OwnerProfileResponse;
import com.petwellness.dto.RegistrationRequest;
import com.petwellness.entity.*;
import com.petwellness.exception.ResourceNotFoundException;
import com.petwellness.repository.*;
import com.petwellness.util.ProfileCompletionCalculator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OwnerService {

    private final UserRepository userRepository;
    private final PersonalInformationRepository personalInfoRepo;
    private final AddressRepository addressRepo;
    private final WorkExperienceRepository workExpRepo;
    private final ProfileCompletionCalculator profileCalculator;

    public OwnerService(UserRepository userRepository,
            PersonalInformationRepository personalInfoRepo,
            AddressRepository addressRepo,
            WorkExperienceRepository workExpRepo,
            ProfileCompletionCalculator profileCalculator) {
        this.userRepository = userRepository;
        this.personalInfoRepo = personalInfoRepo;
        this.addressRepo = addressRepo;
        this.workExpRepo = workExpRepo;
        this.profileCalculator = profileCalculator;
    }

    public OwnerProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        OwnerProfileResponse.OwnerProfileResponseBuilder builder = OwnerProfileResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .accountStatus(user.getAccountStatus().name())
                .emailVerified(user.isEmailVerified())
                .profileCompletion(user.getProfileCompletion());

        personalInfoRepo.findByUserId(userId).ifPresent(info -> {
            builder.firstName(info.getFirstName())
                    .lastName(info.getLastName())
                    .phone(info.getPhone())
                    .dateOfBirth(info.getDateOfBirth())
                    .gender(info.getGender());
        });

        addressRepo.findByUserId(userId).ifPresent(addr -> {
            builder.street(addr.getStreet())
                    .city(addr.getCity())
                    .state(addr.getState())
                    .zipCode(addr.getZipCode())
                    .country(addr.getCountry());
        });

        workExpRepo.findByUserId(userId).ifPresent(work -> {
            builder.companyName(work.getCompanyName())
                    .designation(work.getDesignation())
                    .industry(work.getIndustry())
                    .yearsOfExperience(work.getYearsOfExperience());
        });

        return builder.build();
    }

    @Transactional
    public OwnerProfileResponse updateProfile(Long userId, RegistrationRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Update personal info
        PersonalInformation info = personalInfoRepo.findByUserId(userId)
                .orElse(PersonalInformation.builder().user(user).build());
        if (request.getFirstName() != null)
            info.setFirstName(request.getFirstName());
        if (request.getLastName() != null)
            info.setLastName(request.getLastName());
        if (request.getPhone() != null)
            info.setPhone(request.getPhone());
        if (request.getDateOfBirth() != null)
            info.setDateOfBirth(request.getDateOfBirth());
        if (request.getGender() != null)
            info.setGender(request.getGender());
        personalInfoRepo.save(info);

        // Update address
        Address address = addressRepo.findByUserId(userId)
                .orElse(Address.builder().user(user).build());
        if (request.getStreet() != null)
            address.setStreet(request.getStreet());
        if (request.getCity() != null)
            address.setCity(request.getCity());
        if (request.getState() != null)
            address.setState(request.getState());
        if (request.getZipCode() != null)
            address.setZipCode(request.getZipCode());
        if (request.getCountry() != null)
            address.setCountry(request.getCountry());
        addressRepo.save(address);

        // Update work experience
        WorkExperience work = workExpRepo.findByUserId(userId)
                .orElse(WorkExperience.builder().user(user).build());
        if (request.getCompanyName() != null)
            work.setCompanyName(request.getCompanyName());
        if (request.getDesignation() != null)
            work.setDesignation(request.getDesignation());
        if (request.getIndustry() != null)
            work.setIndustry(request.getIndustry());
        if (request.getYearsOfExperience() != null)
            work.setYearsOfExperience(request.getYearsOfExperience());
        workExpRepo.save(work);

        // Recalculate profile completion
        int completion = profileCalculator.calculate(user);
        user.setProfileCompletion(completion);
        userRepository.save(user);

        return getProfile(userId);
    }

    public int getProfileCompletion(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return profileCalculator.calculate(user);
    }
}
