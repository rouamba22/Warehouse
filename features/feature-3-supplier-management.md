# Feature: Supplier Management

**Feature ID:** 3
**Branch pattern:** `feature/3-supplier-management`
**Status:** Draft
**Created:** 2026-09-28
**Input:** The warehouse buys from suppliers and needs to store their info instead of keeping it on paper. Supplier info like terms and cost is private, so only the Manager can see or change it.
**Depends on:** [Feature 1 — Staff Login and Access](feature-1-staff-login-access.md)
**Related:** [ADR-0002](../docs/adr/0002-role-based-shared-warehouse-data.md), [Suppliers screen](../docs/ui/suppliers.svg)

---

## User Stories

### US-3.1: Manager adds a new supplier
**As a** Manager
**I want to** add a new supplier with their name, address, ship days, terms, and minimum order amount
**So that** the warehouse has their info on file instead of on paper

**Priority:** P1
**Independent test:** Add a supplier and check that it shows up under its business name.
**Acceptance scenarios:** see ### US-3.1 under Gherkin AC

### US-3.2: Manager looks up a supplier by name
**As a** Manager
**I want to** type in a supplier's business name and see their info
**So that** I can find the right supplier without looking through a whole list

**Priority:** P1
**Independent test:** Type in a real supplier's business name and check that the right supplier's info shows up.
**Acceptance scenarios:** see ### US-3.2 under Gherkin AC

### US-3.3: Manager edits a supplier's info
**As a** Manager
**I want to** change a supplier's info
**So that** the system stays correct when something changes, like their terms or ship days

**Priority:** P1
**Independent test:** Change a supplier's terms and check that it is saved.
**Acceptance scenarios:** see ### US-3.3 under Gherkin AC

### US-3.4: Manager deactivates a supplier
**As a** Manager
**I want to** deactivate a supplier
**So that** a supplier the warehouse no longer buys from is not used for new orders

**Priority:** P2
**Independent test:** Deactivate a supplier and check that its status changes to inactive.
**Acceptance scenarios:** see ### US-3.4 under Gherkin AC

### US-3.5: Only a Manager can use Supplier Management
**As the** application
**I want to** block anyone who is not a Manager from opening Supplier Management
**So that** supplier terms and cost info stay private

**Priority:** P1
**Independent test:** Log in as Office Staff, try to open Supplier Management, and check that it is blocked.
**Acceptance scenarios:** see ### US-3.5 under Gherkin AC

---

## Functional Requirements

- **FR-001**: The system MUST identify each supplier by their business name.
- **FR-002**: Only a Manager MUST be allowed to add a new supplier.
- **FR-003**: A new supplier MUST have a business name, address, ship days, terms, and minimum order amount filled in.
- **FR-004**: Only a Manager MUST be able to look up a supplier by their business name.
- **FR-005**: Only a Manager MUST be allowed to edit a supplier's info.
- **FR-006**: Only a Manager MUST be allowed to deactivate a supplier.
- **FR-007**: The system MUST NOT let anyone who is not a Manager open Supplier Management.
- **FR-008**: The system MUST NOT allow two suppliers to have the same business name.

---

## Assumptions

- Ship days are text, such as `Mon, Wed, Fri`. This feature does not build a calendar.
- Terms are text, such as `Net 30`. This feature does not pay the supplier.
- Minimum order amount is money, with two decimal places.
- A deactivated supplier stays in the database so old supplier orders still have a name. Feature 5 blocks new orders to an inactive supplier.

## Edge Cases

- A missing required field shows `Please fill in all required fields.`
- A duplicate business name is blocked.
- A search with no match shows `No supplier found with that name.`
- A minimum order amount of zero or less is blocked with `Minimum order amount must be greater than zero.`

## Success Criteria

- **SC-001**: A Manager can add supplier `Arizona` and find it by that name with address, ship days, terms, and minimum order amount showing.
- **SC-002**: Office Staff who open `/suppliers` see `You do not have permission to perform this action.`
- **SC-003**: Two suppliers cannot be saved with the business name `Arizona`.

---

## Key Entities

- **Supplier**: a business the warehouse buys items from; has a business name, an address, ship days, payment terms, a minimum order amount, and whether it is active or deactivated

---

## Initial Data Model

### `suppliers` table
| Field | Type | Rules |
|-------|------|-------|
| `id` | INTEGER PK | Auto-increment |
| `businessName` | STRING(150) | Required, unique |
| `address` | STRING(255) | Required |
| `shipDays` | STRING(100) | Required (example: "Mon, Wed, Fri") |
| `terms` | STRING(100) | Required (example: "Net 30") |
| `minOrderAmount` | DECIMAL(10,2) | Required; must be greater than 0 |
| `isActive` | BOOLEAN | Required; default `true` |
| `createdAt` | DATETIME | Auto-set |

### Associations
- One `supplier` can supply many `items` (Feature 4).
- One `supplier` can have many `supplier_orders` (Feature 5).

---

## Gherkin AC

### US-3.1 — Manager adds a new supplier

#### Scenario: Manager adds a new supplier
* **Given** I am logged in as a Manager
* **When** I add a new supplier with business name `Arizona`, an address, ship days, terms, and a minimum order amount
* **Then** the system saves the supplier
* **And** the supplier shows up under the business name `Arizona`

#### Scenario: A required field is missing
* **Given** I am logged in as a Manager
* **When** I try to add a new supplier without a minimum order amount
* **Then** the system blocks it and shows `Please fill in all required fields.`

### US-3.2 — Manager looks up a supplier by name

#### Scenario: Manager finds a supplier by name
* **Given** a supplier exists with business name `Arizona`
* **When** I type in `Arizona` and search
* **Then** I see that supplier's address, ship days, terms, and minimum order amount

#### Scenario: No supplier has that name
* **Given** no supplier exists with business name `Nowhere Supply`
* **When** I type in `Nowhere Supply` and search
* **Then** the system shows `No supplier found with that name.`

### US-3.3 — Manager edits a supplier's info

#### Scenario: Manager edits a supplier's terms
* **Given** a supplier exists with business name `Arizona`
* **When** I change their terms and save
* **Then** the new terms are saved on that supplier

### US-3.4 — Manager deactivates a supplier

#### Scenario: Manager deactivates a supplier
* **Given** I am logged in as a Manager
* **And** an active supplier exists with business name `Arizona`
* **When** I deactivate supplier `Arizona`
* **Then** that supplier's status becomes inactive

### US-3.5 — Only a Manager can use Supplier Management

#### Scenario: Office Staff tries to open Supplier Management
* **Given** I am logged in as Office Staff
* **When** I try to open Supplier Management directly by its link
* **Then** the system blocks it and shows `You do not have permission to perform this action.`

---

## Data Ownership

Supplier address, ship days, terms, and minimum order amount are Manager-only. Warehouse Workers receive goods in Feature 5 without opening this screen.

| Action | Who |
|--------|-----|
| Read, add, edit, deactivate a supplier | Manager |
| Open `/suppliers` | Manager |

A non-Manager call gets `403` and `You do not have permission to perform this action.` The UI hides **Suppliers** from every role except Manager.

## API Requirements

Base path: `/warehouse`. Auth: Bearer token. Errors: `{ "message": "..." }`.

| Method | Path | Auth | Success | Errors |
|--------|------|------|---------|--------|
| GET | `/warehouse/suppliers?name=` | Yes | `200` array of suppliers | `403` |
| GET | `/warehouse/suppliers/:id` | Yes | `200` one supplier | `403` · `404` `No supplier found with that name.` |
| POST | `/warehouse/suppliers` | Yes | `201` the new supplier | `400` `Please fill in all required fields.` or `That business name is already in use.` or `Minimum order amount must be greater than zero.` · `403` |
| PUT | `/warehouse/suppliers/:id` | Yes | `200` updated supplier | `400` same messages · `403` · `404` |
| PATCH | `/warehouse/suppliers/:id/deactivate` | Yes | `200` supplier with `isActive: false` | `403` · `404` |

## Screen Requirements

| Screen | Route | Who | Picture |
|--------|-------|-----|---------|
| Suppliers | `/suppliers` | Manager | [suppliers.svg](../docs/ui/suppliers.svg) |

- Labels: **Business name**, **Address**, **Ship days**, **Terms**, **Minimum order amount**, button **Add supplier**, button **Search**, button **Save**, button **Deactivate**.
- Empty list: `No suppliers yet.`
- No search match: `No supplier found with that name.`
- Loading: `Loading...`
- A missing field shows `Please fill in all required fields.`

## Definition of Done

*   [ ] Backend and frontend implemented per this spec (**FR-001** through **FR-008**)
*   [ ] **Success Criteria (SC-001** through **SC-003)** met
*   [ ] Non-Manager requests get `403`
*   [ ] `features/reference/data-model.md`, `api.md`, and `behavior.md` updated for suppliers

## Out of Scope

*   Turning a supplier back on
*   Paying a supplier
*   Creating a supplier order or receiving a shipment ([Feature 5](feature-5-supplier-ordering-receiving.md))
*   Item cost ([Feature 4](feature-4-item-product-catalog-management.md))
