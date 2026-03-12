# PowerShell helper for running the Spring Boot backend from the project root
$rootDir = $PSScriptRoot
$backendDir = Join-Path $rootDir "backend"

if (-not (Test-Path "$backendDir\pom.xml")) {
    Write-Error "pom.xml not found in backend directory. Please ensure the project structure is correct."
    exit 1
}

Push-Location $backendDir
try {
    & mvn clean spring-boot:run
} finally {
    Pop-Location
}
