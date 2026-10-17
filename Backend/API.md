# Billbook API contract

Base URL: `http://localhost:5000`. All protected requests must send
`credentials: "include"` so the HTTP-only `access_token` cookie is included.
The API also accepts the standard `Authorization: Bearer <access-token>`
header. JSON requests use `Content-Type: application/json`.

## Authentication

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create a local user |
| POST | `/api/auth/login` | No | Set `access_token` and `refresh_token` cookies |
| POST | `/api/auth/refresh` | Refresh cookie | Issue a new access cookie |
| POST | `/api/auth/logout` | No | Clear authentication cookies |
| GET | `/api/auth/me` | Yes | Return current user |

Register body:

```json
{"email":"owner@example.com","password":"at-least-8-chars","displayName":"Owner"}
```

Login body:

```json
{"email":"owner@example.com","password":"at-least-8-chars"}
```

The frontend should call `refresh` after a `401`, then retry the original
request once. Do not read or store either cookie in JavaScript.

## Businesses and membership

| Method | Endpoint | Roles | Purpose |
|---|---|---|---|
| POST | `/api/businesses` | Authenticated | Create a business; caller becomes OWNER |
| GET | `/api/businesses` | Authenticated | List caller's active memberships |
| GET | `/api/businesses/{businessId}` | Member | Get business |
| POST | `/api/businesses/{businessId}/members` | OWNER, ADMIN | Add or reactivate a member |
| DELETE | `/api/businesses/{businessId}/members/{userId}` | OWNER, ADMIN | Disable membership |
| GET | `/api/businesses/{businessId}/dashboard` | Member | Dashboard counters and totals |

Create business:

```json
{
  "legalName":"Acme Pvt Ltd",
  "displayName":"Acme",
  "businessRegistrationId":"REG-123",
  "defaultCurrency":"INR"
}
```

Add member:

```json
{"userId":12,"role":"ACCOUNTANT"}
```

Roles are `OWNER`, `ADMIN`, `ACCOUNTANT`, `STAFF`, and `VIEWER`.

## Subjects and addresses

Subjects replace the old customer model and support `CUSTOMER`, `SUPPLIER`,
`BOTH`, and `OTHER`.

| Method | Endpoint | Roles |
|---|---|---|
| GET | `/api/businesses/{businessId}/subjects?active=true` | Member |
| POST | `/api/businesses/{businessId}/subjects` | OWNER, ADMIN, ACCOUNTANT, STAFF |
| GET | `/api/businesses/{businessId}/subjects/{subjectId}` | Member |
| PUT | `/api/businesses/{businessId}/subjects/{subjectId}` | OWNER, ADMIN, ACCOUNTANT, STAFF |
| DELETE | `/api/businesses/{businessId}/subjects/{subjectId}` | OWNER, ADMIN |
| GET | `/api/businesses/{businessId}/subjects/{subjectId}/addresses` | Member |
| POST | `/api/businesses/{businessId}/subjects/{subjectId}/addresses` | OWNER, ADMIN, ACCOUNTANT, STAFF |
| DELETE | `/api/businesses/{businessId}/subjects/{subjectId}/addresses/{addressId}` | OWNER, ADMIN, ACCOUNTANT, STAFF |

Subject body:

```json
{
  "subjectType":"CUSTOMER",
  "name":"Customer One",
  "taxId":"GST123",
  "vatId":null,
  "businessRegistrationId":null,
  "email":"customer@example.com",
  "phone":"+91-9999999999"
}
```

Address body:

```json
{
  "addressLine1":"10 Main Street",
  "addressLine2":"Suite 2",
  "streetNumber":"10",
  "city":"Pune",
  "region":"Maharashtra",
  "postalCode":"411001",
  "countryCode":"IN",
  "addressType":"BILLING",
  "isDefault":true,
  "validFrom":"2026-01-01",
  "validTo":null
}
```

## Products

| Method | Endpoint | Roles |
|---|---|---|
| GET | `/api/businesses/{businessId}/products` | Member |
| POST | `/api/businesses/{businessId}/products` | OWNER, ADMIN, ACCOUNTANT, STAFF |
| GET | `/api/businesses/{businessId}/products/{productId}` | Member |
| PUT | `/api/businesses/{businessId}/products/{productId}` | OWNER, ADMIN, ACCOUNTANT, STAFF |

Product body:

```json
{
  "productCode":"SKU-001",
  "name":"Consulting",
  "description":"Professional services",
  "unitOfMeasure":"hour",
  "currentUnitPrice":1000.0000,
  "defaultTaxRate":18.0000,
  "active":true
}
```

## Invoices

| Method | Endpoint | Roles | Purpose |
|---|---|---|---|
| POST | `/api/businesses/{businessId}/invoices` | OWNER, ADMIN, ACCOUNTANT, STAFF | Create draft |
| GET | `/api/businesses/{businessId}/invoices?status=ISSUED` | Member | List invoices |
| GET | `/api/businesses/{businessId}/invoices/{invoiceId}` | Member | Get invoice with lines/history |
| POST | `/api/businesses/{businessId}/invoices/{invoiceId}/issue` | OWNER, ADMIN, ACCOUNTANT | Issue draft |
| POST | `/api/businesses/{businessId}/invoices/{invoiceId}/void` | OWNER, ADMIN, ACCOUNTANT | Void invoice |
| POST | `/api/businesses/{businessId}/invoices/{invoiceId}/credit` | OWNER, ADMIN, ACCOUNTANT | Create a credit note |

Invoice creation body:

```json
{
  "invoiceNumber":"INV-2026-0001",
  "documentType":"INVOICE",
  "issuerSubjectId":10,
  "buyerSubjectId":21,
  "creditedInvoiceId":null,
  "issueDate":"2026-10-17",
  "dueDate":"2026-11-16",
  "currency":"INR",
  "note":"Payment due within 30 days",
  "reference":"PO-123",
  "issuerNameSnapshot":"Acme Pvt Ltd",
  "buyerNameSnapshot":"Customer One",
  "items":[
    {
      "productId":5,
      "description":"Consulting",
      "unitOfMeasure":"hour",
      "quantity":2,
      "unitPrice":1000,
      "discountAmount":0,
      "taxRate":18
    }
  ]
}
```

The server calculates `net_amount`, `tax_amount`, `gross_amount`, and invoice
totals. Frontend totals are display-only and are never trusted. A draft has
status code `DRAFT`; issuing changes it to `ISSUED` and creates a status-history
row. Terminal statuses are `ISSUED`, `PARTIALLY_CREDITED`, `CREDITED`, and
`VOID`.

## Payments

| Method | Endpoint | Roles |
|---|---|---|
| POST | `/api/businesses/{businessId}/payments` | OWNER, ADMIN, ACCOUNTANT |
| GET | `/api/businesses/{businessId}/payments` | Member |
| GET | `/api/businesses/{businessId}/payments/{paymentId}` | Member |

Payment body:

```json
{
  "paymentDate":"2026-10-17",
  "amount":2360,
  "currency":"INR",
  "paymentMethod":"UPI",
  "externalReference":"UPI-123",
  "note":"Paid in full",
  "allocations":[{"invoiceId":1001,"amount":2360}]
}
```

Payment methods are `CASH`, `BANK_TRANSFER`, `CARD`, `CHEQUE`, `UPI`, and
`OTHER`. Allocations cannot exceed the payment amount or the invoice's
remaining total. The invoice `is_paid` flag is updated automatically.

## Utility endpoints

| Method | Endpoint | Auth | Response |
|---|---|---|---|
| GET | `/health` | No | `{ "status":"OK", "dbStatus":"Connected" }` |
| GET | `/api/countries` | Yes | Country code/name list |
| GET | `/actuator/health` | No | Spring health details |

## Errors

Errors use:

```json
{"error":"Human-readable message","timestamp":"2026-10-17T05:55:00Z"}
```

Common status codes: `400` validation/business rule failure, `401` missing or
expired authentication, `403` insufficient business role, `404` resource not
found in the requested tenant, `409` duplicate or invalid lifecycle state, and
`500` unexpected server failure.
