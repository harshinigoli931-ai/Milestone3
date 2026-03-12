# Pet Wellness - Integrated Pet Wellness & Service Management

## Tech Stack
- **Backend:** Java 17+, Spring Boot 3.2, Spring Security, JWT, Spring Data JPA
- **Database:** MySQL 8.x
- **Auth:** JWT Bearer tokens + API Key (`X-API-KEY`) dual authentication
- **Docs:** Swagger UI (SpringDoc OpenAPI)

## Prerequisites
- Java 17+ (JDK)
- Maven 3.8+
- MySQL 8.x running with a database created:
  ```sql
  CREATE DATABASE pet_wellness_db;
  ```

## Configuration
Edit `src/main/resources/application.properties`:
```properties
# MySQL credentials
spring.datasource.username=root
spring.datasource.password=your_password

# JWT secret (min 64 chars)
app.jwt.secret=your-secret-key-here

# Gmail SMTP (optional, falls back to console logging)
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

## Build & Run
```bash
# Build
mvn clean package -DskipTests

# Run
java -jar target/pet-wellness-app-1.0.0.jar

# Or run directly
mvn spring-boot:run
```

## Default Credentials
On first startup, the app auto-creates:
- **Admin:** `admin@petwellness.com` / `admin123`
- **API Key:** Printed in console logs (look for `X-API-KEY`)

## API Documentation
Once running, visit: **http://localhost:8080/swagger-ui.html**

## Authentication Flow
1. `POST /api/auth/login` — Submit email + password → OTP sent to email
2. `POST /api/auth/verify-otp` — Submit OTP → JWT token returned
3. Use JWT in `Authorization: Bearer <token>` header for subsequent requests

## API Endpoints

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login (sends OTP) |
| POST | `/api/auth/verify-otp` | Verify OTP, get JWT |
| POST | `/api/auth/register` | Self-register (needs admin approval) |
| POST | `/api/auth/forgot-password` | Request password reset OTP |
| GET | `/api/marketplace/products` | Browse products |

### Admin (`ROLE_ADMIN`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/owners` | Create owner (sends credentials) |
| POST | `/api/admin/owners/{id}/approve` | Approve registration |
| POST | `/api/admin/owners/{id}/reject` | Reject registration |
| GET | `/api/admin/owners/pending` | List pending registrations |
| POST | `/api/admin/slots` | Create appointment slot |
| POST | `/api/admin/products` | Create product |
| POST | `/api/admin/api-keys` | Generate API key |

### Pet Owner (`ROLE_PET_OWNER`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/PUT | `/api/owner/profile` | Get/update profile |
| GET/POST | `/api/pets` | List/add pets |
| POST | `/api/pets/{id}/medical-history` | Add medical record |
| POST | `/api/pets/{id}/vaccinations` | Add vaccination |
| GET | `/api/appointments/slots` | View available slots |
| POST | `/api/appointments/book` | Book appointment |
| POST | `/api/marketplace/orders` | Place order |

## Project Structure
```
src/main/java/com/petwellness/
├── config/          # SecurityConfig, SwaggerConfig, DataInitializer
├── controller/      # REST controllers (6)
├── dto/             # Request/Response DTOs (23)
├── entity/          # JPA entities (16) + enums (8)
├── exception/       # GlobalExceptionHandler + custom exceptions
├── repository/      # JPA repositories (15)
├── security/        # JWT, API Key filters, UserDetailsService
├── service/         # Business logic services (10)
└── util/            # PasswordGenerator, ProfileCompletionCalculator
```

## XAMPP / MySQL Troubleshooting

If you are using XAMPP's MySQL, follow these steps to ensure the app can connect:

- Start MySQL in the XAMPP Control Panel (ensure the service shows "Running").
- Verify the port MySQL is listening on (default is `3306`; XAMPP sometimes uses `3307`).
  - Open XAMPP Control Panel -> MySQL -> Config -> my.ini to confirm the `port` value.
- Ensure the `pet_wellness_db` database exists (or let the app create it if the DB user has sufficient privileges).
  - To create manually (PowerShell / cmd):

```sql
CREATE DATABASE IF NOT EXISTS pet_wellness_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

- Ensure the DB user has privileges. For XAMPP default root user (no password):

```sql
GRANT ALL PRIVILEGES ON pet_wellness_db.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

- If you prefer to use a non-root user, create one and grant privileges:

```sql
CREATE USER 'pw_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
GRANT ALL PRIVILEGES ON pet_wellness_db.* TO 'pw_user'@'localhost';
FLUSH PRIVILEGES;
```

- Authentication plugin note: MySQL 8 defaults to `caching_sha2_password`. The project uses the official MySQL Connector/J from Spring Boot, which supports this. If you encounter authentication errors, consider creating the user with `mysql_native_password` as shown above.

- Port override / env vars: you can override DB settings using environment variables instead of editing `application.properties`.
  - `DB_URL` — full JDBC URL (e.g. `jdbc:mysql://localhost:3307/pet_wellness_db?useSSL=false&serverTimezone=UTC`)
  - `DB_USER` — DB username (default: `root`)
  - `DB_PASS` — DB password (default: empty)

Example (PowerShell) to run the app with env vars:

```powershell
$env:DB_URL='jdbc:mysql://localhost:3306/pet_wellness_db?useSSL=false&serverTimezone=UTC'
$env:DB_USER='root'
$env:DB_PASS=''
mvn spring-boot:run
```

If you still see connection errors, paste the startup log or the exception message here and I'll help diagnose further.
