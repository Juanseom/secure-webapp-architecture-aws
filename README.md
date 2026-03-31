# Secure Web App Architecture - Enterprise Security Workshop

Secure web application with two servers:
- Apache server that serves an asynchronous HTML + JavaScript client over HTTPS.
- Spring Boot server that exposes REST endpoints over HTTPS.

The project focuses on login security with hashed passwords and AWS deployment with TLS certificates from Let's Encrypt.

---

## Author

Juan Sebastian Ortega Muñoz

---

## Table of contents

1. [Project objective](#project-objective)
2. [Architecture](#architecture)
3. [Implemented requirements](#implemented-requirements)
4. [Project structure](#project-structure)
5. [Requirements](#requirements)
6. [Run locally](#run-locally)
7. [Automated tests](#automated-tests)
8. [AWS deployment guide (step by step)](#aws-deployment-guide-step-by-step)
9. [TLS setup with Lets Encrypt](#tls-setup-with-lets-encrypt)
10. [Troubleshooting](#troubleshooting)

---

## Project objective

Build a secure application that satisfies the workshop goals:

- Asynchronous frontend in HTML + JavaScript.
- Apache as frontend web server over TLS.
- Spring Boot backend with REST API over TLS.
- Login with passwords stored as secure hashes.
- Deployment on AWS with separate servers.
- Certificates managed with Lets Encrypt.

---

## Architecture

```text
Browser Client
    |
    | HTTPS (Lets Encrypt cert)
    v
Server 1 - Apache (EC2 public)
    - serves index.html, auth.js, style.css
    - reverse proxy for /api
    |
    | HTTPS (internal)
    v
Server 2 - Spring Boot (EC2 private/public)
    - /api/auth/login
    - /api/health
    - Password hashing with BCrypt
    |
    v
PostgreSQL
```

---

## Implemented requirements

### Already implemented in code

- Asynchronous client using `fetch` + `async/await` (`frontend/auth.js`).
- Apache frontend config with TLS support (`frontend/httpd-ssl.conf`).
- Spring Boot REST endpoints (`backend/src/main/java/.../auth`, `.../health`).
- Login flow and JWT response.
- Password hashing with BCrypt:
  - `backend/src/main/java/edu/eci/tdse/securewebapp/security/SecurityConfig.java`
  - `backend/src/main/java/edu/eci/tdse/securewebapp/auth/AuthService.java`
  - `backend/src/main/java/edu/eci/tdse/securewebapp/auth/AuthDataInitializer.java`
- Unit tests in backend (auth and health).

### Not implemented in code repository (must be done on AWS)

- Real AWS deployment on two EC2 instances.
- Lets Encrypt certificate issuance for real domain(s).
- Security Groups and EC2 network hardening.

---

## Project structure

```text
secure-webapp-architecture-aws/
|-- .gitignore
|-- README.md
|-- backend/
|   |-- pom.xml
|   |-- Dockerfile
|   |-- scripts/
|   |   `-- generate-local-keystore.ps1
|   `-- src/
|       |-- main/java/edu/eci/tdse/securewebapp/
|       |   |-- SecureWebappApplication.java
|       |   |-- auth/
|       |   |-- health/
|       |   `-- security/
|       `-- test/java/edu/eci/tdse/securewebapp/
|           |-- auth/
|           `-- health/
`-- frontend/
    |-- index.html
    |-- auth.js
    |-- style.css
    |-- Dockerfile
    `-- httpd-ssl.conf
```

---

## Requirements

- Java 21+
- Maven 3.9+
- PostgreSQL 15+
- Docker (optional, local support)
- AWS account (for final deployment)
- Domain name pointing to EC2 (required for Lets Encrypt)

---

## Run locally

### 1) Backend

```powershell
Set-Location "C:\UNIVERSIDAD\TDSE\secure-webapp-architecture-aws\backend"
mvn clean package
mvn spring-boot:run
```

Backend URL:
- `https://localhost:5000/api/health`

### 2) Frontend

Serve static files with Apache container or any static server.

Example with Python for quick local test:

```powershell
Set-Location "C:\UNIVERSIDAD\TDSE\secure-webapp-architecture-aws\frontend"
python -m http.server 8080
```

Frontend URL:
- `http://localhost:8080`

Note: local frontend points to backend HTTPS at `https://localhost:5000/api`.

---

## Automated tests

Run backend tests:

```powershell
Set-Location "C:\UNIVERSIDAD\TDSE\secure-webapp-architecture-aws\backend"
mvn test
```

Test classes:
- `AuthControllerTest`
- `AuthServiceTest`
- `HealthControllerTest`

---

## AWS deployment guide (step by step)

This is the exact pending part from the rubric.

### Step 1 - Create infrastructure

1. Create **EC2-Apache** (public subnet).
2. Create **EC2-Backend** (preferably private subnet).
3. Create PostgreSQL (RDS recommended).
4. Create Security Groups:
   - `sg-apache`: inbound 80, 443 from `0.0.0.0/0`.
   - `sg-backend`: inbound 5000 only from `sg-apache`.
   - `sg-db`: inbound 5432 only from `sg-backend`.

### Step 2 - Install Apache server (EC2-Apache)

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y apache2 certbot python3-certbot-apache
sudo a2enmod ssl proxy proxy_http headers rewrite
sudo systemctl enable apache2
sudo systemctl start apache2
```

Copy frontend files (`index.html`, `auth.js`, `style.css`) to `/var/www/html/`.

### Step 3 - Install backend server (EC2-Backend)

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y openjdk-21-jdk maven certbot
```

Build JAR locally and copy it to backend EC2:

```powershell
Set-Location "C:\UNIVERSIDAD\TDSE\secure-webapp-architecture-aws\backend"
mvn clean package
scp -i <KEY.pem> target\*.jar ubuntu@<BACKEND_EC2_IP>:/home/ubuntu/app.jar
```

Run backend:

```bash
java -jar /home/ubuntu/app.jar
```

For production, create a systemd service.

### Step 4 - Configure Apache reverse proxy to backend

In Apache vhost config:

```apache
ProxyPass /api https://<BACKEND_PRIVATE_IP>:5000/api
ProxyPassReverse /api https://<BACKEND_PRIVATE_IP>:5000/api
```

Reload Apache:

```bash
sudo systemctl reload apache2
```

### Step 5 - Configure database on backend

Set backend environment variables on EC2-Backend:

```bash
export DB_URL=jdbc:postgresql://<RDS_ENDPOINT>:5432/<DB_NAME>
export DB_USERNAME=<DB_USER>
export DB_PASSWORD=<DB_PASSWORD>
```

### Step 6 - Validate end to end

- Open `https://<YOUR_DOMAIN>`.
- Login with test credentials.
- Verify `/api/health` loads through Apache -> Backend.

---

## TLS setup with Lets Encrypt

Important: Lets Encrypt requires a real domain pointing to each server.

### Apache certificate

```bash
sudo certbot --apache -d <FRONTEND_DOMAIN>
```

### Backend certificate

Option A (public backend domain):

```bash
sudo certbot certonly --standalone -d <BACKEND_DOMAIN>
```

Convert to PKCS12 for Java:

```bash
sudo openssl pkcs12 -export \
  -in /etc/letsencrypt/live/<BACKEND_DOMAIN>/fullchain.pem \
  -inkey /etc/letsencrypt/live/<BACKEND_DOMAIN>/privkey.pem \
  -out /home/ubuntu/keystore.p12 \
  -name spring \
  -password pass:<KEYSTORE_PASSWORD>
```

Then set Spring SSL env vars:

```bash
export SSL_ENABLED=true
export SSL_KEYSTORE_TYPE=PKCS12
export SSL_KEYSTORE_PATH=/home/ubuntu/keystore.p12
export SSL_KEYSTORE_PASSWORD=<KEYSTORE_PASSWORD>
export SSL_KEY_ALIAS=spring
```

Renewal check:

```bash
sudo certbot renew --dry-run
```

---

## Troubleshooting

- `HTTP 502` in Apache: backend not reachable from Apache SG/network.
- TLS handshake error: wrong keystore path/password/alias in backend env vars.
- Browser warns about certificate: domain DNS not correctly pointing to EC2 or cert not issued for that hostname.
- Login fails but API up: verify seeded user and hashed password in DB.

---

## Rubric alignment summary

- Async HTML + JS client: implemented.
- Apache + Spring on separate servers: pending AWS deployment.
- TLS on both servers: local/dev present, Lets Encrypt pending on AWS.
- Hashed password storage: implemented with BCrypt.
- GitHub code + README: implemented.
- Video deliverable: pending.
