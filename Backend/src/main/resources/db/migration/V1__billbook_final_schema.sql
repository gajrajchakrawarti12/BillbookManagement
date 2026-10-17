-- BillBook / Invoice Management System
-- MySQL 8.0.16+ (CHECK constraints are enforced from 8.0.16)
-- Design assumptions:
--   1. One Business is a tenant/issuing business.
--   2. Invoice numbers are unique within a business and document type.
--   3. Credit notes are represented as invoices with document_type='CREDIT_NOTE'
--      and may reference an original invoice through credited_invoice_id.
--   4. Monetary values use DECIMAL; application code must implement the agreed
--      tax and rounding policy and must not trust client-supplied totals.
--   5. Issued documents retain snapshots of issuer, buyer and line descriptions.
-- Review tax, numbering, retention, and credit-note rules for the target jurisdiction.


-- -------------------------
-- Tenant, users and access
-- -------------------------

CREATE TABLE business (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    legal_name VARCHAR(200) NOT NULL,
    display_name VARCHAR(200) NULL,
    business_registration_id VARCHAR(100) NULL,
    default_currency CHAR(3) NOT NULL DEFAULT 'INR',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    CONSTRAINT chk_business_currency CHECK (default_currency REGEXP '^[A-Z]{3}$'),
    KEY idx_business_active (is_active)
) ENGINE=InnoDB;

CREATE TABLE app_user (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    email VARCHAR(254) NOT NULL,
    password_hash VARCHAR(255) NULL,
    display_name VARCHAR(160) NOT NULL,
    auth_provider VARCHAR(40) NOT NULL DEFAULT 'LOCAL',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at DATETIME(6) NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uq_app_user_email (email),
    KEY idx_app_user_active (is_active)
) ENGINE=InnoDB;

CREATE TABLE business_membership (
    business_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    role ENUM('OWNER','ADMIN','ACCOUNTANT','STAFF','VIEWER') NOT NULL DEFAULT 'STAFF',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (business_id, user_id),
    CONSTRAINT fk_membership_business FOREIGN KEY (business_id)
        REFERENCES business(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_membership_user FOREIGN KEY (user_id)
        REFERENCES app_user(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    KEY idx_membership_user_active (user_id, is_active)
) ENGINE=InnoDB;

-- -------------------------
-- Master data
-- -------------------------

CREATE TABLE country (
    code CHAR(2) NOT NULL,
    name VARCHAR(100) NOT NULL,
    PRIMARY KEY (code),
    CONSTRAINT chk_country_code CHECK (code REGEXP '^[A-Z]{2}$')
) ENGINE=InnoDB;

CREATE TABLE subject (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    business_id BIGINT UNSIGNED NOT NULL,
    subject_type ENUM('CUSTOMER','SUPPLIER','BOTH','OTHER') NOT NULL DEFAULT 'CUSTOMER',
    name VARCHAR(200) NOT NULL,
    tax_id VARCHAR(100) NULL,
    vat_id VARCHAR(100) NULL,
    business_registration_id VARCHAR(100) NULL,
    email VARCHAR(254) NULL,
    phone VARCHAR(40) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_subject_business FOREIGN KEY (business_id)
        REFERENCES business(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    KEY idx_subject_business_name (business_id, name),
    KEY idx_subject_business_active (business_id, is_active),
    KEY idx_subject_tax_id (business_id, tax_id),
    KEY idx_subject_vat_id (business_id, vat_id)
) ENGINE=InnoDB;

CREATE TABLE address (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    address_line1 VARCHAR(200) NOT NULL,
    address_line2 VARCHAR(200) NULL,
    street_number VARCHAR(30) NULL,
    city VARCHAR(100) NOT NULL,
    region VARCHAR(100) NULL,
    postal_code VARCHAR(20) NULL,
    country_code CHAR(2) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_address_country FOREIGN KEY (country_code)
        REFERENCES country(code) ON DELETE RESTRICT ON UPDATE RESTRICT,
    KEY idx_address_city_postal (city, postal_code)
) ENGINE=InnoDB;

CREATE TABLE subject_address (
    subject_id BIGINT UNSIGNED NOT NULL,
    address_id BIGINT UNSIGNED NOT NULL,
    address_type ENUM('REGISTERED','BILLING','SHIPPING','OTHER') NOT NULL DEFAULT 'BILLING',
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    valid_from DATE NULL,
    valid_to DATE NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (subject_id, address_id, address_type),
    CONSTRAINT fk_subject_address_subject FOREIGN KEY (subject_id)
        REFERENCES subject(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_subject_address_address FOREIGN KEY (address_id)
        REFERENCES address(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT chk_subject_address_dates CHECK (
        valid_to IS NULL OR valid_from IS NULL OR valid_to >= valid_from
    ),
    KEY idx_subject_address_address (address_id),
    KEY idx_subject_address_default (subject_id, address_type, is_default)
) ENGINE=InnoDB;

CREATE TABLE product (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    business_id BIGINT UNSIGNED NOT NULL,
    product_code VARCHAR(40) NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT NULL,
    unit_of_measure VARCHAR(30) NOT NULL DEFAULT 'unit',
    current_unit_price DECIMAL(19,4) NOT NULL DEFAULT 0.0000,
    default_tax_rate DECIMAL(7,4) NOT NULL DEFAULT 0.0000,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_product_business FOREIGN KEY (business_id)
        REFERENCES business(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT uq_product_business_code UNIQUE (business_id, product_code),
    CONSTRAINT chk_product_price CHECK (current_unit_price >= 0),
    CONSTRAINT chk_product_tax_rate CHECK (default_tax_rate >= 0 AND default_tax_rate <= 100),
    KEY idx_product_business_name (business_id, name),
    KEY idx_product_business_active (business_id, is_active)
) ENGINE=InnoDB;

-- -------------------------
-- Invoice lifecycle
-- -------------------------

CREATE TABLE invoice_status (
    id TINYINT UNSIGNED NOT NULL,
    code VARCHAR(30) NOT NULL,
    name VARCHAR(50) NOT NULL,
    is_terminal BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (id),
    UNIQUE KEY uq_invoice_status_code (code)
) ENGINE=InnoDB;

INSERT INTO invoice_status (id, code, name, is_terminal) VALUES
    (1, 'DRAFT', 'Draft', FALSE),
    (2, 'ISSUED', 'Issued', TRUE),
    (3, 'PARTIALLY_CREDITED', 'Partially credited', TRUE),
    (4, 'CREDITED', 'Credited', TRUE),
    (5, 'VOID', 'Voided', TRUE);

CREATE TABLE invoice (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    business_id BIGINT UNSIGNED NOT NULL,
    invoice_number VARCHAR(50) NOT NULL,
    document_type ENUM('INVOICE','CREDIT_NOTE') NOT NULL DEFAULT 'INVOICE',
    issuer_subject_id BIGINT UNSIGNED NULL,
    buyer_subject_id BIGINT UNSIGNED NULL,
    credited_invoice_id BIGINT UNSIGNED NULL,
    status_id TINYINT UNSIGNED NOT NULL DEFAULT 1,
    issue_date DATE NULL,
    due_date DATE NULL,
    currency CHAR(3) NOT NULL DEFAULT 'INR',
    note VARCHAR(500) NULL,
    reference VARCHAR(100) NULL,
    is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    is_vat_reverse_charge BOOLEAN NOT NULL DEFAULT FALSE,

    -- Issuer snapshot: preserve the values printed on this document.
    issuer_name_snapshot VARCHAR(200) NOT NULL,
    issuer_street_snapshot VARCHAR(200) NULL,
    issuer_street_number_snapshot VARCHAR(30) NULL,
    issuer_city_snapshot VARCHAR(100) NULL,
    issuer_region_snapshot VARCHAR(100) NULL,
    issuer_postal_code_snapshot VARCHAR(20) NULL,
    issuer_country_code_snapshot CHAR(2) NULL,
    issuer_tax_id_snapshot VARCHAR(100) NULL,
    issuer_vat_id_snapshot VARCHAR(100) NULL,

    -- Buyer snapshot.
    buyer_name_snapshot VARCHAR(200) NOT NULL,
    buyer_street_snapshot VARCHAR(200) NULL,
    buyer_street_number_snapshot VARCHAR(30) NULL,
    buyer_city_snapshot VARCHAR(100) NULL,
    buyer_region_snapshot VARCHAR(100) NULL,
    buyer_postal_code_snapshot VARCHAR(20) NULL,
    buyer_country_code_snapshot CHAR(2) NULL,
    buyer_business_id_snapshot VARCHAR(100) NULL,
    buyer_tax_id_snapshot VARCHAR(100) NULL,
    buyer_vat_id_snapshot VARCHAR(100) NULL,

    total_excl_tax DECIMAL(19,4) NOT NULL DEFAULT 0.0000,
    total_tax DECIMAL(19,4) NOT NULL DEFAULT 0.0000,
    total_incl_tax DECIMAL(19,4) NOT NULL DEFAULT 0.0000,

    created_by BIGINT UNSIGNED NULL,
    issued_at DATETIME(6) NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        ON UPDATE CURRENT_TIMESTAMP(6),

    PRIMARY KEY (id),
    CONSTRAINT fk_invoice_business FOREIGN KEY (business_id)
        REFERENCES business(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_invoice_issuer FOREIGN KEY (issuer_subject_id)
        REFERENCES subject(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_invoice_buyer FOREIGN KEY (buyer_subject_id)
        REFERENCES subject(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_invoice_credited_invoice FOREIGN KEY (credited_invoice_id)
        REFERENCES invoice(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_invoice_status FOREIGN KEY (status_id)
        REFERENCES invoice_status(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_invoice_created_by FOREIGN KEY (created_by)
        REFERENCES app_user(id) ON DELETE SET NULL ON UPDATE RESTRICT,
    CONSTRAINT fk_invoice_issuer_country FOREIGN KEY (issuer_country_code_snapshot)
        REFERENCES country(code) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_invoice_buyer_country FOREIGN KEY (buyer_country_code_snapshot)
        REFERENCES country(code) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT uq_invoice_business_number_type
        UNIQUE (business_id, document_type, invoice_number),
    CONSTRAINT chk_invoice_currency CHECK (currency REGEXP '^[A-Z]{3}$'),
    CONSTRAINT chk_invoice_due_date CHECK (
        due_date IS NULL OR issue_date IS NULL OR due_date >= issue_date
    ),
    CONSTRAINT chk_invoice_totals CHECK (
        total_excl_tax >= 0 AND total_tax >= 0 AND total_incl_tax >= 0
    ),
    CONSTRAINT chk_invoice_issued_fields CHECK (
        status_id = 1 OR (issue_date IS NOT NULL AND issued_at IS NOT NULL)
    ),
    KEY idx_invoice_business_issue_date (business_id, issue_date),
    KEY idx_invoice_business_status (business_id, status_id),
    KEY idx_invoice_buyer (buyer_subject_id),
    KEY idx_invoice_credited_invoice (credited_invoice_id)
) ENGINE=InnoDB;

CREATE TABLE invoice_item (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    invoice_id BIGINT UNSIGNED NOT NULL,
    line_number INT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NULL,

    -- Snapshot fields preserve the issued document even if Product changes.
    product_code_snapshot VARCHAR(40) NULL,
    description_snapshot VARCHAR(500) NOT NULL,
    unit_of_measure_snapshot VARCHAR(30) NOT NULL DEFAULT 'unit',

    quantity DECIMAL(18,4) NOT NULL,
    unit_price DECIMAL(19,4) NOT NULL,
    discount_amount DECIMAL(19,4) NOT NULL DEFAULT 0.0000,
    net_amount DECIMAL(19,4) NOT NULL,
    tax_rate DECIMAL(7,4) NOT NULL DEFAULT 0.0000,
    tax_amount DECIMAL(19,4) NOT NULL DEFAULT 0.0000,
    gross_amount DECIMAL(19,4) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    PRIMARY KEY (id),
    CONSTRAINT fk_invoice_item_invoice FOREIGN KEY (invoice_id)
        REFERENCES invoice(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_invoice_item_product FOREIGN KEY (product_id)
        REFERENCES product(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT uq_invoice_item_line UNIQUE (invoice_id, line_number),
    CONSTRAINT chk_invoice_item_quantity CHECK (quantity > 0),
    CONSTRAINT chk_invoice_item_unit_price CHECK (unit_price >= 0),
    CONSTRAINT chk_invoice_item_discount CHECK (discount_amount >= 0),
    CONSTRAINT chk_invoice_item_tax_rate CHECK (tax_rate >= 0 AND tax_rate <= 100),
    CONSTRAINT chk_invoice_item_amounts CHECK (
        net_amount >= 0 AND tax_amount >= 0 AND gross_amount >= 0
    ),
    KEY idx_invoice_item_product (product_id)
) ENGINE=InnoDB;

CREATE TABLE invoice_status_history (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    invoice_id BIGINT UNSIGNED NOT NULL,
    old_status_id TINYINT UNSIGNED NULL,
    new_status_id TINYINT UNSIGNED NOT NULL,
    changed_by BIGINT UNSIGNED NULL,
    changed_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    reason VARCHAR(500) NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_status_history_invoice FOREIGN KEY (invoice_id)
        REFERENCES invoice(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_status_history_old FOREIGN KEY (old_status_id)
        REFERENCES invoice_status(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_status_history_new FOREIGN KEY (new_status_id)
        REFERENCES invoice_status(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_status_history_actor FOREIGN KEY (changed_by)
        REFERENCES app_user(id) ON DELETE SET NULL ON UPDATE RESTRICT,
    KEY idx_status_history_invoice_time (invoice_id, changed_at)
) ENGINE=InnoDB;

-- -------------------------
-- Payments and allocations
-- -------------------------

CREATE TABLE payment (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    business_id BIGINT UNSIGNED NOT NULL,
    payment_date DATE NOT NULL,
    amount DECIMAL(19,4) NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'INR',
    payment_method ENUM('CASH','BANK_TRANSFER','CARD','CHEQUE','UPI','OTHER') NOT NULL DEFAULT 'OTHER',
    external_reference VARCHAR(100) NULL,
    note VARCHAR(500) NULL,
    created_by BIGINT UNSIGNED NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_payment_business FOREIGN KEY (business_id)
        REFERENCES business(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_payment_created_by FOREIGN KEY (created_by)
        REFERENCES app_user(id) ON DELETE SET NULL ON UPDATE RESTRICT,
    CONSTRAINT chk_payment_amount CHECK (amount > 0),
    CONSTRAINT chk_payment_currency CHECK (currency REGEXP '^[A-Z]{3}$'),
    KEY idx_payment_business_date (business_id, payment_date),
    KEY idx_payment_reference (business_id, external_reference)
) ENGINE=InnoDB;

CREATE TABLE payment_allocation (
    payment_id BIGINT UNSIGNED NOT NULL,
    invoice_id BIGINT UNSIGNED NOT NULL,
    allocated_amount DECIMAL(19,4) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (payment_id, invoice_id),
    CONSTRAINT fk_allocation_payment FOREIGN KEY (payment_id)
        REFERENCES payment(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_allocation_invoice FOREIGN KEY (invoice_id)
        REFERENCES invoice(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT chk_allocation_amount CHECK (allocated_amount > 0),
    KEY idx_allocation_invoice (invoice_id)
) ENGINE=InnoDB;

-- -------------------------
-- Audit trail
-- -------------------------

CREATE TABLE audit_log (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    business_id BIGINT UNSIGNED NULL,
    actor_user_id BIGINT UNSIGNED NULL,
    action VARCHAR(80) NOT NULL,
    entity_type VARCHAR(80) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    occurred_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    request_id VARCHAR(100) NULL,
    details JSON NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_audit_business FOREIGN KEY (business_id)
        REFERENCES business(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_audit_actor FOREIGN KEY (actor_user_id)
        REFERENCES app_user(id) ON DELETE SET NULL ON UPDATE RESTRICT,
    KEY idx_audit_business_time (business_id, occurred_at),
    KEY idx_audit_entity (entity_type, entity_id),
    KEY idx_audit_actor_time (actor_user_id, occurred_at)
) ENGINE=InnoDB;

-- Implementation notes:
-- 1. Seed country with the country codes the application supports before creating
--    addresses or invoice snapshots containing country codes.
-- 2. The app/service layer must enforce same-business ownership for subject,
--    product, invoice, payment and allocation relationships. A plain FK does not
--    prove that two related rows belong to the same tenant.
-- 3. Invoice issuance, line-total calculation, status transitions, payment
--    allocation caps, credit-note limits and immutable-issued-document rules
--    require transactional service logic and tests. CHECK constraints alone
--    cannot enforce all cross-row accounting rules.
-- 4. The status CHECK currently treats status_id=1 as Draft. Keep seed IDs stable
--    or change the constraint if status IDs are changed.
-- 5. Validate MySQL version, migration order, tax rules, retention obligations,
--    and numbering rules before production deployment.
