# Billbook Management Spring Boot backend

The backend is now a clean Spring Boot 3.5/MySQL service. The database model is
the tenant-aware accounting schema in
`billbook_final_schema (1).sql`; the old Express/Mongoose source has been
removed to prevent two competing persistence models from being maintained.

## Run locally

1. Create a MySQL database (the default is `billbook`).
2. Set `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, and a random `JWT_SECRET` of at
   least 32 bytes. Set `COOKIE_SECURE=true` when serving over HTTPS.
3. Start the API:

```bash
mvn spring-boot:run
```

Flyway applies
`src/main/resources/db/migration/V1__billbook_final_schema.sql`. The migration
intentionally omits the source file's `CREATE DATABASE` and `USE` statements;
the JDBC URL selects the database. Hibernate does not generate or alter the
schema (`ddl-auto: none`). The default port is `5000`.

The current health endpoint is `GET /health`. It verifies the MySQL connection
with `SELECT 1` and returns the database status.

## Modular MVC structure

The API uses package-by-feature modules inside the single Spring Boot
application. Each feature owns its MVC entry points while shared authentication,
tenant access checks, and API exceptions remain in `shared`:

```text
com.billbookmanagement
├── modules
│   ├── auth
│   │   ├── entity
│   │   ├── repository
│   │   └── service
│   ├── business
│   ├── dashboard
│   ├── subjects
│   ├── invoices
│   ├── payments
│   ├── products
│   ├── reference
│   └── system
├── shared
│   └── service
├── config
└── security
```

The endpoint URLs and database contracts are unchanged by this organization.
Feature controllers can be split into feature services and repositories
incrementally without moving routes or changing the frontend API contract.

The authentication module demonstrates the full entity-repository-service-
controller boundary:

- `entity/AppUser` maps the `app_user` table.
- `repository/AppUserRepository` owns persistence queries.
- `service/AuthService` owns registration, credential verification, JWT
  issuance, refresh, and cookie management.
- `AuthController` owns HTTP mapping and request validation only.

All business features follow the same boundary:

```text
modules/<feature>/
├── entity/       persistence model
├── repository/   database access
├── service/      business rules and transactions
└── *Controller   HTTP mapping and validation
```

This structure is implemented for authentication, business, dashboard,
subjects and addresses, products, invoices, payments, reference data, and
system health. Controllers do not directly use `JdbcTemplate`; transaction
boundaries and database operations belong to services and repositories.

## Exception handling

[`ApiExceptionHandler`](src/main/java/com/billbookmanagement/config/ApiExceptionHandler.java)
provides the API-wide error boundary. It handles domain errors, validation
failures, malformed requests, unsupported methods/media types, missing
resources, database conflicts/failures, authentication, authorization, and
unexpected exceptions. Responses use this shape:

```json
{
  "error": "Request validation failed",
  "timestamp": "2026-01-01T00:00:00Z",
  "details": {
    "email": "must be a well-formed email address"
  }
}
```

Unexpected and database failures are logged server-side without exposing SQL,
stack traces, credentials, or implementation details to clients.

## Included dependencies

The Maven project includes the requested core starters (Web MVC, JPA, MySQL,
Security, OAuth2 resource server, validation, Flyway, Actuator, and tests), as
well as the requested optional starters for OpenAPI, mail, cache/Redis, AOP,
Quartz, Batch, Thymeleaf, OAuth2 client, WebSocket, AMQP, Kafka, and GraphQL.
Optional integrations are dependency-ready but are not enabled until their
corresponding application configuration is supplied. Invoice issuance,
payment allocation, status transitions, tenant ownership checks, and audit
logging must be implemented in transactional services before production use;
the supplied schema deliberately leaves those accounting rules to the service
layer.
