# Feature: Customer Management

**Feature ID:** 2
**Branch pattern:** `feature/2-customer-management`
**Status:** Draft
**Created:** 2026-09-28
**Input:** The warehouse sells to customers and needs their info on file instead of on paper. Address, contact, and billing terms are private, so only the Manager can see or change the full record. Office Staff later see only the customer name and ID when they take an order (Feature 6).
**Depends on:** [Feature 1 — Staff Login and Access](feature-1-staff-login-access.md)
**Related:** [ADR-0002](../docs/adr/0002-role-based-shared-warehouse-data.md), [Customers screen](../docs/ui/customers.svg)

The requirements file for this feature was empty on the requirements branch. This draft fills the requirements and the design in the same style as Features 1, 3, and 8.

---

## User Stories

### US-2.1: Manager adds a new customer
**As a** Manager
**I want to** add a customer with a customer ID, business name, address, contact, phone, billing terms, and credit limit
**So that** the warehouse has their info on file instead of on paper

**Priority:** P1
**Independent test:** Add a customer and check that it shows up under its business name.
**Acceptance scenarios:** see ### US-2.1 under Gherkin AC

### US-2.2: Manager looks up a customer by name
**As a** Manager
**I want to** type in a customer's business name and see their full info
**So that** I can find the right customer without looking through a whole list

**Priority:** P1
**Independent test:** Type in a real customer's business name and check that the address and billing terms show up.
**Acceptance scenarios:** see ### US-2.2 under Gherkin AC

### US-2.3: Manager edits a customer's info
**As a** Manager
**I want to** change a customer's info
**So that** the system stays correct when their address or terms change

**Priority:** P1
**Independent test:** Change a customer's billing terms and check that they are saved.
**Acceptance scenarios:** see ### US-2.3 under Gherkin AC

### US-2.4: Manager deactivates a customer
**As a** Manager
**I want to** deactivate a customer
**So that** a customer the warehouse no longer sells to is not used for new orders

**Priority:** P2
**Independent test:** Deactivate a customer and check that its status changes to inactive.
**Acceptance scenarios:** see ### US-2.4 under Gherkin AC

### US-2.5: Only a Manager can use Customer Management
**As the** application
**I want to** block anyone who is not a Manager from opening Customer Management
**So that** address, contact, and billing info stay private

**Priority:** P1
**Independent test:** Log in as Office Staff, try to open Customer Management, and check that it is blocked.
**Acceptance scenarios:** see ### US-2.5 under Gherkin AC

---

## Functional Requirements

- **FR-001**: The system MUST identify each customer by a customer ID and a business name.
- **FR-002**: Only a Manager MUST be allowed to add a new customer.
- **FR-003**: A new customer MUST have a customer ID, business name, address, contact name, phone, billing terms, and credit limit filled in.
- **FR-004**: Only a Manager MUST be able to look up a customer and see the address, contact, phone, billing terms, and credit limit.
- **FR-005**: Only a Manager MUST be allowed to edit a customer's info.
- **FR-006**: Only a Manager MUST be allowed to deactivate a customer.
- **FR-007**: The system MUST NOT let anyone who is not a Manager open Customer Management.
- **FR-008**: The system MUST NOT allow two customers to have the same customer ID or the same business name.

---

## Assumptions

- Customer ID is a short code the Manager types, such as `C-1042`. It is not the database `id`.
- Billing terms are text, such as `Net 30`. This feature does not calculate invoices.
- Deactivating a customer does not delete old orders. Feature 6 blocks new orders for an inactive customer.
- Office Staff never use this screen. Their name-and-ID lookup lives on the order screen in Feature 6.

## Edge Cases

- A missing required field shows `Please fill in all required fields.`
- A duplicate customer ID or business name is blocked.
- A search with no match shows `No customer found with that name.`
- Editing a deactivated customer is blocked until a later feature turns them back on. Turning a customer back on is out of scope.

## Success Criteria

- **SC-001**: A Manager can add customer `Joe's Stop and Run` and find that customer by name with address and billing terms showing.
- **SC-002**: Office Staff who open `/customers` see `You do not have permission to perform this action.`
- **SC-003**: The customer API response for a non-Manager does not include address, phone, or billing terms. Feature 6's lookup returns name and customer ID only.

---

## Key Entities

- **Customer**: a business the warehouse sells to; has a customer ID, a business name, an address, a contact name, a phone, billing terms, a credit limit, and whether it is active or deactivated

---

## Initial Data Model

### `customers` table
| Field | Type | Rules |
|-------|------|-------|
| `id` | INTEGER PK | Auto-increment |
| `customerCode` | STRING(20) | Required, unique (example: `C-1042`) |
| `businessName` | STRING(150) | Required, unique |
| `address` | STRING(255) | Required; Manager only |
| `contactName` | STRING(100) | Required; Manager only |
| `phone` | STRING(30) | Required; Manager only |
| `billingTerms` | STRING(100) | Required (example: `Net 30`); Manager only |
| `creditLimit` | DECIMAL(10,2) | Required; Manager only |
| `isActive` | BOOLEAN | Required; default `true` |
| `createdAt` | DATETIME | Auto-set |

### Associations
- One `customer` can have many `orders` (Feature 6).

---

## Gherkin AC

### US-2.1 — Manager adds a new customer

#### Scenario: Manager adds a new customer
* **Given** I am logged in as a Manager
* **When** I add a new customer with customer ID `C-1042`, business name `Joe's Stop and Run`, an address, a contact, a phone, billing terms, and a credit limit
* **Then** the system saves the customer
* **And** the customer shows up under the business name `Joe's Stop and Run`

#### Scenario: A required field is missing
* **Given** I am logged in as a Manager
* **When** I try to add a new customer without an address
* **Then** the system blocks it and shows `Please fill in all required fields.`

### US-2.2 — Manager looks up a customer by name

#### Scenario: Manager finds a customer by name
* **Given** a customer exists with business name `Joe's Stop and Run`
* **When** I type in `Joe's Stop and Run` and search
* **Then** I see that customer's address, contact, phone, billing terms, and credit limit

#### Scenario: No customer has that name
* **Given** no customer exists with business name `Nowhere Shop`
* **When** I type in `Nowhere Shop` and search
* **Then** the system shows `No customer found with that name.`

### US-2.3 — Manager edits a customer's info

#### Scenario: Manager edits a customer's billing terms
* **Given** a customer exists with business name `Joe's Stop and Run`
* **When** I change their billing terms and save
* **Then** the new billing terms are saved on that customer

### US-2.4 — Manager deactivates a customer

#### Scenario: Manager deactivates a customer
* **Given** I am logged in as a Manager
* **And** an active customer exists with business name `Joe's Stop and Run`
* **When** I deactivate customer `Joe's Stop and Run`
* **Then** that customer's status becomes inactive

### US-2.5 — Only a Manager can use Customer Management

#### Scenario: Office Staff tries to open Customer Management
* **Given** I am logged in as Office Staff
* **When** I try to open Customer Management directly by its link
* **Then** the system blocks it and shows `You do not have permission to perform this action.`

---

## Data Ownership

Customer address, contact, phone, billing terms, and credit limit are Manager-only. Office Staff do not get those fields from this feature.

| Action | Who |
|--------|-----|
| Read full customer record | Manager |
| Add, edit, deactivate | Manager |
| Open `/customers` | Manager |
| See name and customer ID while taking an order | Office Staff, on Feature 6 only |

A non-Manager call gets `403` and `You do not have permission to perform this action.` The UI hides **Customers** from every role except Manager.

## API Requirements

Base path: `/warehouse`. Auth: Bearer token. Errors: `{ "message": "..." }`.

| Method | Path | Auth | Success | Errors |
|--------|------|------|---------|--------|
| GET | `/warehouse/customers?name=` | Yes | `200` array of full customer rows | `403` |
| GET | `/warehouse/customers/:id` | Yes | `200` one full customer | `403` · `404` `No customer found with that name.` |
| POST | `/warehouse/customers` | Yes | `201` the new customer | `400` `Please fill in all required fields.` or `That customer ID is already in use.` or `That business name is already in use.` · `403` |
| PUT | `/warehouse/customers/:id` | Yes | `200` updated customer | `400` required-field message · `403` · `404` |
| PATCH | `/warehouse/customers/:id/deactivate` | Yes | `200` customer with `isActive: false` | `403` · `404` |

Search uses `name`. If the list is empty, the API returns `[]` and the screen shows `No customer found with that name.`

## Screen Requirements

| Screen | Route | Who | Picture |
|--------|-------|-----|---------|
| Customers | `/customers` | Manager | [customers.svg](../docs/ui/customers.svg) |

- Labels: **Customer ID**, **Business name**, **Address**, **Contact**, **Phone**, **Billing terms**, **Credit limit**, button **Add customer**, button **Search**, button **Save**, button **Deactivate**.
- Empty list: `No customers yet.`
- No search match: `No customer found with that name.`
- Loading: `Loading...`
- Office Staff who open `/customers` see `You do not have permission to perform this action.`

## Definition of Done

*   [ ] Backend and frontend implemented per this spec (**FR-001** through **FR-008**)
*   [ ] **Success Criteria (SC-001** through **SC-003)** met
*   [ ] Non-Manager requests get `403` and do not return address, phone, or billing terms
*   [ ] `features/reference/data-model.md`, `api.md`, and `behavior.md` updated for customers

## Out of Scope

*   Turning a customer back on
*   Invoices, payments, and credit checks
*   The Office Staff name-and-ID lookup used while taking an order ([Feature 6](feature-6-customer-order-management.md))
*   Deleting a customer
