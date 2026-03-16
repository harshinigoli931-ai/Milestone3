package com.petwellness.config;

import com.petwellness.entity.ApiKey;
import com.petwellness.entity.User;
import com.petwellness.entity.enums.AccountStatus;
import com.petwellness.entity.enums.Role;
import com.petwellness.entity.AppointmentSlot;
import com.petwellness.entity.enums.ConsultationType;
import com.petwellness.repository.AppointmentSlotRepository;
import com.petwellness.repository.ApiKeyRepository;
import com.petwellness.repository.UserRepository;
import com.petwellness.entity.Pet;
import com.petwellness.repository.PetRepository;
import com.petwellness.entity.Vet;
import com.petwellness.repository.VetRepository;
import com.petwellness.entity.Vaccination;
import com.petwellness.repository.VaccinationRepository;
import com.petwellness.entity.Product;
import com.petwellness.entity.enums.ProductCategory;
import com.petwellness.repository.ProductRepository;
import com.petwellness.util.PasswordGenerator;
import java.math.BigDecimal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final ApiKeyRepository apiKeyRepository;
    private final AppointmentSlotRepository appointmentSlotRepository;
    private final PasswordEncoder passwordEncoder;
    private final PetRepository petRepository;
    private final VaccinationRepository vaccinationRepository;
    private final VetRepository vetRepository;
    private final ProductRepository productRepository;

    @Value("${app.admin.email:admin@petwellness.com}")
    private String adminEmail;

    @Value("${app.admin.password:admin123}")
    private String adminPassword;


    public DataInitializer(UserRepository userRepository, ApiKeyRepository apiKeyRepository,
            AppointmentSlotRepository appointmentSlotRepository,
            PasswordEncoder passwordEncoder, PetRepository petRepository,
            VaccinationRepository vaccinationRepository,
            VetRepository vetRepository,
            ProductRepository productRepository) {
        this.userRepository = userRepository;
        this.apiKeyRepository = apiKeyRepository;
        this.appointmentSlotRepository = appointmentSlotRepository;
        this.passwordEncoder = passwordEncoder;
        this.petRepository = petRepository;
        this.vaccinationRepository = vaccinationRepository;
        this.vetRepository = vetRepository;
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) {
        createDefaultAdmin();
        createDefaultApiKey();
        createDefaultVets();
        createDefaultSlots();
        createDefaultPets();
        createDefaultVaccinations();
        createDefaultProducts();
        fixSlotMaxBookings();
    }

    /**
     * Recalculate maxBookings for all existing slots so they support 10-minute
     * intervals
     */
    private void fixSlotMaxBookings() {
        appointmentSlotRepository.findAll().forEach(slot -> {
            if (slot.getStartTime() != null && slot.getEndTime() != null) {
                long durationMinutes = java.time.Duration.between(slot.getStartTime(), slot.getEndTime()).toMinutes();
                int calculatedMax = Math.max(1, (int) (durationMinutes / 10));
                if (slot.getMaxBookings() < calculatedMax) {
                    slot.setMaxBookings(calculatedMax);
                    if (slot.getCurrentBookings() < slot.getMaxBookings()) {
                        slot.setAvailable(true);
                    }
                    appointmentSlotRepository.save(slot);
                    log.info("Fixed slot {} maxBookings: {} -> {}", slot.getId(), slot.getMaxBookings(), calculatedMax);
                }
            }
        });
    }

    private void createDefaultAdmin() {
        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            User admin = User.builder()
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .role(Role.ADMIN)
                    .accountStatus(AccountStatus.APPROVED)
                    .emailVerified(true)
                    .mustChangePassword(false)
                    .profileCompletion(100)
                    .enabled(true)
                    .build();
            userRepository.save(admin);
            log.info("==============================================");
            log.info("Default admin created:");
            log.info("  Email: {}", adminEmail);
            log.info("  Password: {}", adminPassword);
            log.info("==============================================");
        } else {
            log.info("Default admin already exists: {}", adminEmail);
            // Ensure admin is enabled and password matches config even if it exists
            User existingAdmin = userRepository.findByEmail(adminEmail).get();
            boolean updated = false;
            
            if (!existingAdmin.isEnabled() || existingAdmin.getAccountStatus() != AccountStatus.APPROVED) {
                existingAdmin.setEnabled(true);
                existingAdmin.setAccountStatus(AccountStatus.APPROVED);
                updated = true;
                log.info("Forced update: Enabled default admin account.");
            }
            
            // Re-encode and update password to be sure it matches application.properties
            existingAdmin.setPassword(passwordEncoder.encode(adminPassword));
            updated = true;
            
            if (updated) {
                userRepository.save(existingAdmin);
                log.info("Forced update: Admin credentials synchronized with configuration.");
            }
        }
    }


    private void createDefaultApiKey() {
        if (apiKeyRepository.findAll().isEmpty()) {
            User admin = userRepository.findByEmail(adminEmail).orElse(null);
            if (admin != null) {
                String keyValue = PasswordGenerator.generateApiKey();
                ApiKey apiKey = ApiKey.builder()
                        .keyValue(keyValue)
                        .name("Default Frontend API Key")
                        .createdBy(admin)
                        .active(true)
                        .build();
                apiKeyRepository.save(apiKey);
                log.info("==============================================");
                log.info("Default API key created:");
                log.info("  Key: {}", keyValue);
                log.info("  Use header: X-API-KEY: {}", keyValue);
                log.info("==============================================");
            }
        } else {
            log.info("API keys already exist.");
            apiKeyRepository.findAll().forEach(key -> {
                log.info("Existing API Key: {} (Name: {})", key.getKeyValue(), key.getName());
            });
        }
    }

    private void createDefaultVets() {
        if (vetRepository.count() == 0) {
            vetRepository.save(Vet.builder()
                    .name("Dr. Sarah Jenkins")
                    .specialization("General Practice")
                    .email("sarah.jenkins@petwellness.com")
                    .phone("123-456-7890")
                    .clinicAddress("123 Pet St, Animal City")
                    .build());
            vetRepository.save(Vet.builder()
                    .name("Dr. Emily Chen")
                    .specialization("Feline Specialist")
                    .email("emily.chen@petwellness.com")
                    .phone("987-654-3210")
                    .clinicAddress("456 Cat Ave, Meow Town")
                    .build());
            log.info("Default vets created.");
        }
    }

    private void createDefaultSlots() {
        long count = appointmentSlotRepository.count();
        log.info("Total appointment slots in DB: {}", count);

        // Ensure there are slots for testing, even if past slots exist.
        if (count == 0
                || appointmentSlotRepository.findByAvailableTrueAndDateGreaterThanEqual(LocalDate.now()).isEmpty()) {
            LocalDate tomorrow = LocalDate.now().plusDays(1);
            LocalDate nextWeek = LocalDate.now().plusDays(7);

            Vet vet1 = vetRepository.findAll().stream()
                    .filter(v -> v.getName().equals("Dr. Sarah Jenkins"))
                    .findFirst().orElse(null);
            Vet vet2 = vetRepository.findAll().stream()
                    .filter(v -> v.getName().equals("Dr. Emily Chen"))
                    .findFirst().orElse(null);

            AppointmentSlot slot1 = AppointmentSlot.builder()
                    .date(tomorrow)
                    .startTime(LocalTime.parse("10:00"))
                    .endTime(LocalTime.parse("10:30"))
                    .consultationType(ConsultationType.CLINIC)
                    .vet(vet1)
                    .available(true)
                    .maxBookings(1)
                    .currentBookings(0)
                    .build();

            AppointmentSlot slot2 = AppointmentSlot.builder()
                    .date(nextWeek)
                    .startTime(LocalTime.parse("14:00"))
                    .endTime(LocalTime.parse("14:45"))
                    .consultationType(ConsultationType.ONLINE)
                    .vet(vet2)
                    .available(true)
                    .maxBookings(2)
                    .currentBookings(0)
                    .build();

            appointmentSlotRepository.save(slot1);
            appointmentSlotRepository.save(slot2);
            log.info("Default appointment slots generated.");
        }
    }

    private void createDefaultPets() {
        String ownerEmail = "owner@petwellness.com";
        User owner = userRepository.findByEmail(ownerEmail).orElse(null);

        if (owner == null) {
            owner = User.builder()
                    .email(ownerEmail)
                    .password(passwordEncoder.encode("owner123"))
                    .role(Role.PET_OWNER)
                    .accountStatus(AccountStatus.APPROVED)
                    .emailVerified(true)
                    .mustChangePassword(false)
                    .profileCompletion(100)
                    .enabled(true)
                    .build();
            owner = userRepository.save(owner);
            log.info("Created default pet owner: {}", ownerEmail);
        }

        if (petRepository.countByOwnerId(owner.getId()) == 0) {
            Pet pet1 = Pet.builder()
                    .owner(owner)
                    .name("Buddy")
                    .species("Dog")
                    .breed("Golden Retriever")
                    .age(3)
                    .gender("Male")
                    .color("Golden")
                    .weight(30.5)
                    .build();

            Pet pet2 = Pet.builder()
                    .owner(owner)
                    .name("Luna")
                    .species("Cat")
                    .breed("Siamese")
                    .age(2)
                    .gender("Female")
                    .color("White and Brown")
                    .weight(10.2)
                    .build();

            petRepository.save(pet1);
            petRepository.save(pet2);
            log.info("Default pets generated for owner.");
        }
    }

    private void createDefaultVaccinations() {
        if (vaccinationRepository.count() == 0) {
            petRepository.findAll().forEach(pet -> {
                if ("Buddy".equals(pet.getName())) {
                    // Overdue
                    vaccinationRepository.save(Vaccination.builder()
                            .pet(pet)
                            .vaccineName("Rabies")
                            .dateGiven(LocalDate.now().minusYears(1).minusMonths(1))
                            .nextDueDate(LocalDate.now().minusMonths(1))
                            .completed(false)
                            .administeredBy("Dr. Sarah Jenkins")
                            .build());
                    // Completed
                    vaccinationRepository.save(Vaccination.builder()
                            .pet(pet)
                            .vaccineName("Parvovirus")
                            .dateGiven(LocalDate.now().minusMonths(6))
                            .nextDueDate(LocalDate.now().plusMonths(6))
                            .completed(true)
                            .administeredBy("Dr. Sarah Jenkins")
                            .build());
                } else if ("Luna".equals(pet.getName())) {
                    // Upcoming
                    vaccinationRepository.save(Vaccination.builder()
                            .pet(pet)
                            .vaccineName("Distemper")
                            .dateGiven(LocalDate.now().minusMonths(11))
                            .nextDueDate(LocalDate.now().plusDays(15))
                            .completed(false)
                            .administeredBy("Dr. Emily Chen")
                            .build());
                }
            });
            log.info("Default vaccination records seeded.");
        }
    }

    private void createDefaultProducts() {
        if (productRepository.count() == 0) {
            // FOOD
            productRepository.save(Product.builder()
                    .name("Dog Food")
                    .description("Nutritious dog food rich in protein for healthy growth.")
                    .category(ProductCategory.FOOD)
                    .price(new BigDecimal("500.00"))
                    .stock(50)
                    .active(true)
                    .build());
            productRepository.save(Product.builder()
                    .name("Cat Food")
                    .description("Healthy and balanced meal specially made for cats.")
                    .category(ProductCategory.FOOD)
                    .price(new BigDecimal("450.00"))
                    .stock(40)
                    .active(true)
                    .build());
            // TOYS
            productRepository.save(Product.builder()
                    .name("Dog Toy")
                    .description("Durable chew toy that keeps dogs active and entertained.")
                    .category(ProductCategory.TOYS)
                    .price(new BigDecimal("250.00"))
                    .stock(100)
                    .active(true)
                    .build());
            productRepository.save(Product.builder()
                    .name("Cat Toy")
                    .description("Interactive toy that keeps cats playful and happy.")
                    .category(ProductCategory.TOYS)
                    .price(new BigDecimal("200.00"))
                    .stock(80)
                    .active(true)
                    .build());
            // ACCESSORIES
            productRepository.save(Product.builder()
                    .name("Dog Collar")
                    .description("Comfortable adjustable collar for everyday use.")
                    .category(ProductCategory.ACCESSORIES)
                    .price(new BigDecimal("150.00"))
                    .stock(60)
                    .active(true)
                    .build());
            productRepository.save(Product.builder()
                    .name("Dog Leash")
                    .description("Strong leash designed for safe outdoor walks.")
                    .category(ProductCategory.ACCESSORIES)
                    .price(new BigDecimal("300.00"))
                    .stock(45)
                    .active(true)
                    .build());
            productRepository.save(Product.builder()
                    .name("Dog Bed")
                    .description("Soft and cozy bed designed for maximum pet comfort.")
                    .category(ProductCategory.ACCESSORIES)
                    .price(new BigDecimal("900.00"))
                    .stock(20)
                    .active(true)
                    .build());
            // GROOMING
            productRepository.save(Product.builder()
                    .name("Pet Shampoo")
                    .description("Gentle shampoo that keeps your pet clean and healthy.")
                    .category(ProductCategory.GROOMING)
                    .price(new BigDecimal("350.00"))
                    .stock(30)
                    .active(true)
                    .build());

            log.info("Successfully migrated 8 products to database.");
        }
    }
}
