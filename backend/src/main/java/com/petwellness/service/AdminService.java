package com.petwellness.service;

import com.petwellness.dto.CreateOwnerRequest;
import com.petwellness.entity.PersonalInformation;
import com.petwellness.entity.User;
import com.petwellness.entity.enums.AccountStatus;
import com.petwellness.entity.enums.Role;
import com.petwellness.exception.BadRequestException;
import com.petwellness.exception.ResourceNotFoundException;
import com.petwellness.repository.PersonalInformationRepository;
import com.petwellness.repository.PetRepository;
import com.petwellness.repository.UserRepository;
import com.petwellness.repository.AppointmentSlotRepository;
import com.petwellness.dto.StatisticsResponse;
import com.petwellness.util.PasswordGenerator;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final PersonalInformationRepository personalInfoRepo;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final PetRepository petRepository;
    private final AppointmentSlotRepository appointmentSlotRepo;

    public AdminService(UserRepository userRepository,
            PersonalInformationRepository personalInfoRepo,
            PasswordEncoder passwordEncoder,
            EmailService emailService,
            PetRepository petRepository,
            AppointmentSlotRepository appointmentSlotRepo) {
        this.userRepository = userRepository;
        this.personalInfoRepo = personalInfoRepo;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.petRepository = petRepository;
        this.appointmentSlotRepo = appointmentSlotRepo;
    }

    @Transactional
    public User createOwner(CreateOwnerRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        String tempPassword = PasswordGenerator.generatePassword(12);

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(tempPassword))
                .role(Role.PET_OWNER)
                .accountStatus(AccountStatus.APPROVED)
                .emailVerified(false)
                .mustChangePassword(true)
                .profileCompletion(25)
                .enabled(true)
                .build();
        user = userRepository.save(user);

        // Save personal info if provided
        if (request.getFirstName() != null) {
            PersonalInformation info = PersonalInformation.builder()
                    .user(user)
                    .firstName(request.getFirstName())
                    .lastName(request.getLastName())
                    .phone(request.getPhone())
                    .build();
            personalInfoRepo.save(info);
        }

        // Send credentials via email
        emailService.sendCredentials(request.getEmail(), request.getEmail(), tempPassword);

        return user;
    }

    @Transactional
    public User approveRegistration(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (user.getAccountStatus() != AccountStatus.PENDING) {
            throw new BadRequestException("User is not in pending status");
        }

        user.setAccountStatus(AccountStatus.APPROVED);
        user = userRepository.save(user);

        emailService.sendApprovalNotification(user.getEmail());

        return user;
    }

    @Transactional
    public User rejectRegistration(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (user.getAccountStatus() != AccountStatus.PENDING) {
            throw new BadRequestException("User is not in pending status");
        }

        user.setAccountStatus(AccountStatus.REJECTED);
        user = userRepository.save(user);

        emailService.sendRejectionNotification(user.getEmail());

        return user;
    }

    public List<User> getPendingRegistrations() {
        return userRepository.findByRoleAndAccountStatus(Role.PET_OWNER, AccountStatus.PENDING);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getUsersByRole(Role role) {
        return userRepository.findByRole(role);
    }

    public StatisticsResponse getStatistics() {
        long totalUsers = userRepository.countByRole(Role.PET_OWNER);
        long totalPets = petRepository.count();
        long totalAppointments = appointmentSlotRepo.count();

        List<Object[]> speciesCounts = petRepository.countPetsBySpecies();
        Map<String, Long> petsBySpecies = speciesCounts.stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> (Long) row[1]));

        return StatisticsResponse.builder()
                .totalUsers(totalUsers)
                .totalPets(totalPets)
                .totalAppointments(totalAppointments)
                .petsBySpecies(petsBySpecies)
                .build();
    }
}
