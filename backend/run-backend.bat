@echo off
REM Helper script to start the Spring Boot backend from the backend directory
SET PROJECT_DIR=%~dp0
cd /d "%PROJECT_DIR%"
IF NOT EXIST "pom.xml" (
    echo ERROR: pom.xml not found in %PROJECT_DIR%
    exit /b 1
)
mvn clean spring-boot:run