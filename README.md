# Secure WebApp Architecture on AWS

This repository contains a step-by-step implementation of the **Enterprise Architecture Workshop: Secure Application Design**.

## Workshop Goal

Design and deploy a secure, scalable web application on AWS with:

- **Server 1 (Apache):** serves an asynchronous HTML + JavaScript client over HTTPS.
- **Server 2 (Spring):** exposes REST API endpoints over HTTPS.
- **Login security:** passwords stored as secure hashes (never plain text).
- **TLS certificates:** Let's Encrypt in AWS production.
- **Clean documentation:** architecture, deployment steps, validation evidence.

## Scope and Rules

- We implement the workshop incrementally (small commits).
- We follow only workshop requirements and provided hints.
- We keep deployment configuration externalized (12-factor style) using environment variables.
- We reuse lessons from the previous secure workshop where applicable.

## Current Phase

**Phase 1 - Repository foundation and implementation plan**

Completed in this phase:

- Initial architecture and security plan.
- Reusable pattern mapping from previous workshop to this lab.
- Commit-by-commit roadmap.
- Validation checklists for each phase.

## Planned Repository Structure

```text
secure-webapp-architecture-aws/
  README.md
  docs/
    workshop-patterns.md
    roadmap.md
    commits-plan.md
    phase-checklists.md
  frontend-apache/
    README.md
  backend-spring/
    README.md
  infra-aws/
    README.md
```

## Next Step

Implement backend foundation in `backend-spring/`:

- Spring Boot project skeleton.
- Health and auth endpoints.
- Password hashing with BCrypt.
- HTTPS configuration prepared for local development and AWS deployment.

See `docs/roadmap.md` for the full phase plan.
