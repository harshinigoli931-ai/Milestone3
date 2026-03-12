@echo off
REM Helper script for Windows to run the Pet Reminder Node.js App
SET PROJECT_DIR=%~dp0
cd /d "%PROJECT_DIR%petcare\petcare\petwellnessreminder\PetReminderApp"
echo Starting Pet Reminder App...
npm start
