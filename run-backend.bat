@echo off
REM Helper script for Windows to run the backend from the project root
SET PROJECT_DIR=%~dp0
mvn -f "%PROJECT_DIR%backend\pom.xml" clean spring-boot:run
