# PowerShell helper for running the Spring Boot backend from the project root
$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
if (-not (Test-Path "$projectDir\pom.xml")) {
    Write-Error "pom.xml not found. Please place this script in the project root."
    exit 1
}

Push-Location $projectDir
try {
    & mvn -f "$projectDir\pom.xml" clean spring-boot:run
} finally {
    Pop-Location
}