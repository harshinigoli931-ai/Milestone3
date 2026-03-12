package com.petwellness.util;

import com.petwellness.entity.User;
import com.petwellness.repository.AddressRepository;
import com.petwellness.repository.PersonalInformationRepository;
import com.petwellness.repository.WorkExperienceRepository;
import org.springframework.stereotype.Component;

@Component
public class ProfileCompletionCalculator {

    private final PersonalInformationRepository personalInfoRepo;
    private final AddressRepository addressRepo;
    private final WorkExperienceRepository workExpRepo;

    public ProfileCompletionCalculator(PersonalInformationRepository personalInfoRepo,
            AddressRepository addressRepo,
            WorkExperienceRepository workExpRepo) {
        this.personalInfoRepo = personalInfoRepo;
        this.addressRepo = addressRepo;
        this.workExpRepo = workExpRepo;
    }

    public int calculate(User user) {
        int totalFields = 4; // email, personal info, address, work experience
        int completedFields = 1; // email is always present

        if (personalInfoRepo.findByUserId(user.getId()).isPresent()) {
            var info = personalInfoRepo.findByUserId(user.getId()).get();
            if (info.getFirstName() != null && info.getLastName() != null && info.getPhone() != null) {
                completedFields++;
            }
        }

        if (addressRepo.findByUserId(user.getId()).isPresent()) {
            var addr = addressRepo.findByUserId(user.getId()).get();
            if (addr.getCity() != null && addr.getCountry() != null) {
                completedFields++;
            }
        }

        if (workExpRepo.findByUserId(user.getId()).isPresent()) {
            var work = workExpRepo.findByUserId(user.getId()).get();
            if (work.getCompanyName() != null || work.getDesignation() != null) {
                completedFields++;
            }
        }

        return (completedFields * 100) / totalFields;
    }
}
