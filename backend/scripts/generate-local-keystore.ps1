param(
    [string]$KeystorePath = "C:\\UNIVERSIDAD\\TDSE\\secure-webapp-architecture-aws\\backend\\certs\\securewebapp-local.p12",
    [string]$StorePassword = "changeit",
    [string]$Alias = "securewebapp-local",
    [string]$DnsName = "localhost",
    [int]$ValidityDays = 365,
    [switch]$ForceOverwrite
)

$javaHome = $env:JAVA_HOME
if ([string]::IsNullOrWhiteSpace($javaHome)) {
    Write-Error "JAVA_HOME is not set."
    exit 1
}

$keytoolPath = Join-Path $javaHome "bin\keytool.exe"
if (-not (Test-Path $keytoolPath)) {
    Write-Error "keytool not found at $keytoolPath"
    exit 1
}

$certsDir = Split-Path -Parent $KeystorePath
if (-not (Test-Path $certsDir)) {
    New-Item -ItemType Directory -Path $certsDir -Force | Out-Null
}

if (Test-Path $KeystorePath) {
    if ($ForceOverwrite) {
        Remove-Item $KeystorePath -Force
    } else {
        Write-Error "Keystore already exists at $KeystorePath."
        exit 1
    }
}

& $keytoolPath -genkeypair `
  -alias $Alias `
  -keyalg RSA `
  -keysize 2048 `
  -storetype PKCS12 `
  -keystore $KeystorePath `
  -validity $ValidityDays `
  -storepass $StorePassword `
  -keypass $StorePassword `
  -dname "CN=$DnsName, OU=TDSE, O=ECI, L=Bogota, S=Cundinamarca, C=CO"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Keystore successfully created at: $KeystorePath"
    Write-Host ""
    Write-Host "Set environment variables before running backend:"
    Write-Host "SSL_ENABLED=true"
    Write-Host "SSL_KEYSTORE_PATH=$KeystorePath"
    Write-Host "SSL_KEYSTORE_PASSWORD=$StorePassword"
    Write-Host "SSL_KEY_ALIAS=$Alias"
} else {
    Write-Error "Failed to create keystore. keytool exit code: $LASTEXITCODE"
    exit $LASTEXITCODE
}

