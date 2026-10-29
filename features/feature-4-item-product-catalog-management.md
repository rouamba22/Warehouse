# Feature: Item and Product Catalog

**Feature ID:** 4
**Branch pattern:** `feature/4-item-product-catalog-management`
**Status:** Draft
**Created:** 2026-09-28
**Input:** The warehouse needs an item catalog so staff can pick and receive by item number instead of by memory. Item cost is private. Only the Manager can see or change cost. Warehouse Workers can see the item number, description, bin, and quantity on hand.
**Depends on:** [Feature 1 — Staff Login and Access](feature-1-staff-login-access.md), [Feature 3 — Supplier Management](feature-3-supplier-management.md)
**Related:** [ADR-0002](../docs/adr/0002-role-based-shared-warehouse-data.md), [ADR-0004](../docs/adr/0004-inventory-quantity-changes.md), [Items screen](../docs/ui/items.svg)

The requirements file for this feature was empty on the requirements branch. This draft fills the requirements and the design in the same style as Features 1, 3, and 8.

---

## User Stories

### US-4.1: Manager adds an item
**As a** Manager
**I want to** add an item with an item number, description, supplier, unit cost, bin, and reorder point
**So that** the warehouse can track that product

**Priority:** P1
**Independent test:** Add item `IN-4021` and check that it shows up in the catalog.
**Acceptance scenarios:** see ### US-4.1 under Gherkin AC

### US-4.2: Manager looks up an item
**As a** Manager
**I want to** search by item number and see the full record, including unit cost
**So that** I can check cost and where the item sits

**Priority:** P1
**Independent test:** Search `IN-4021` as Manager and check that unit cost is visible.
**Acceptance scenarios:** see ### US-4.2 under Gherkin AC

### US-4.3: Warehouse Worker looks up an item without cost
**As a** Warehouse Worker
**I want to** see the item number, description, bin, and quantity on hand
**So that** I can find the item without seeing what it cost

**Priority:** P1
**Independent test:** Log in as a Warehouse Worker, open the item, and check that unit cost is not on the screen.
**Acceptance scenarios:** see ### US-4.3 under Gherkin AC

### US-4.4: Manager edits an item
**As a** Manager
**I want to** change an item's description, supplier, cost, bin, or reorder point
**So that** the catalog stays correct

**Priority:** P1
**Independent test:** Change the bin for `IN-4021` and check that it is saved.
**Acceptance scenarios:** see ### US-4.4 under Gherkin AC

### US-4.5: Manager deactivates an item
**As a** Manager
**I want to** deactivate an item
**So that** staff do not order or sell an item the warehouse dropped

**Priority:** P2
**Independent test:** Deactivate an item and check that its status becomes inactive.
**Acceptance scenarios:** see ### US-4.5 under Gherkin AC

---

## Functional Requirements

- **FR-001**: The system MUST identify each item by a unique item number.
- **FR-002**: Only a Manager MUST be allowed to add, edit, or deactivate an item.
- **FR-003**: A new item MUST have an item number, description, supplier, unit cost, bin location, and reorder point. Quantity on hand starts at `0`.
- **FR-004**: The supplier on an item MUST be an active supplier from Feature 3.
- **FR-005**: Only a Manager MUST be able to see unit cost.
- **FR-006**: A Warehouse Worker MUST be able to look up an item and see item number, description, bin, and quantity on hand, and MUST NOT see unit cost.
- **FR-007**: The system MUST NOT let Office Staff or a Driver open the item catalog.
- **FR-008**: Quantity on hand MUST NOT be typed on this screen. It changes only when goods are received, picked, or counted (Features 5, 6, and 7).

---

## Assumptions

- Item number is typed by the Manager, such as `IN-4021`. It is not the database `id`.
- Unit cost is the cost from the supplier, not the price charged to a customer. Customer price is out of scope.
- One item has one supplier and one bin in this draft.
- Reorder point is a number the Manager stores. This feature does not create a purchase order by itself.

## Edge Cases

- A duplicate item number shows `That item number is already in use.`
- A missing field shows `Please fill in all required fields.`
- An unknown or inactive supplier shows `Choose an active supplier.`
- A search with no match shows `No item found with that number.`
- A Warehouse Worker who calls the item API does not receive `unitCost` in the JSON.

## Success Criteria

- **SC-001**: A Manager can add `IN-4021` for supplier `Arizona` and see its unit cost.
- **SC-002**: A Warehouse Worker can see the bin and quantity for `IN-4021` and cannot see unit cost.
- **SC-003**: Quantity on hand stays `0` until a later feature receives, picks, or counts the item.

---

## Key Entities

- **Item**: a product the warehouse stocks; has an item number, a description, a supplier, a unit cost, a bin, a quantity on hand, a reorder point, and whether it is active

---

## Initial Data Model

### `items` table
| Field | Type | Rules |
|-------|------|-------|
| `id` | INTEGER PK | Auto-increment |
| `itemNumber` | STRING(20) | Required, unique (example: `IN-4021`) |
| `description` | STRING(255) | Required |
| `supplierId` | INTEGER FK | Required, references `suppliers.id` |
| `unitCost` | DECIMAL(10,2) | Required; greater than 0; Manager only |
| `binLocation` | STRING(30) | Required (example: `A-12`) |
| `qtyOnHand` | INTEGER | Required; default `0`; not edited on this screen |
| `reorderPoint` | INTEGER | Required; `0` or more |
| `isActive` | BOOLEAN | Required; default `true` |
| `createdAt` | DATETIME | Auto-set |

### Associations
- Each `item` belongs to one `supplier`.
- Each `item` can appear on many supplier-order lines, customer-order lines, and inventory adjustments.

---

## Gherkin AC

### US-4.1 — Manager adds an item

#### Scenario: Manager adds an item
* **Given** I am logged in as a Manager
* **And** an active supplier exists with business name `Arizona`
* **When** I add item number `IN-4021`, a description, supplier `Arizona`, a unit cost, bin `A-12`, and a reorder point
* **Then** the system saves the item
* **And** the quantity on hand is `0`

#### Scenario: A required field is missing
* **Given** I am logged in as a Manager
* **When** I try to add an item without a unit cost
* **Then** the system blocks it and shows `Please fill in all required fields.`

### US-4.2 — Manager looks up an item

#### Scenario: Manager finds an item and sees cost
* **Given** item `IN-4021` exists with a unit cost
* **When** I search for `IN-4021` as a Manager
* **Then** I see the description, supplier, unit cost, bin, and quantity on hand

#### Scenario: No item has that number
* **Given** no item exists with number `IN-0000`
* **When** I search for `IN-0000`
* **Then** the system shows `No item found with that number.`

### US-4.3 — Warehouse Worker looks up an item without cost

#### Scenario: Warehouse Worker does not see cost
* **Given** item `IN-4021` exists
* **And** I am logged in as a Warehouse Worker
* **When** I open item `IN-4021`
* **Then** I see the description, bin, and quantity on hand
* **And** I do not see the unit cost

### US-4.4 — Manager edits an item

#### Scenario: Manager changes the bin
* **Given** item `IN-4021` is in bin `A-12`
* **When** I change the bin to `B-04` and save
* **Then** the bin `B-04` is saved on that item

### US-4.5 — Manager deactivates an item

#### Scenario: Manager deactivates an item
* **Given** I am logged in as a Manager
* **And** item `IN-4021` is active
* **When** I deactivate item `IN-4021`
* **Then** that item's status becomes inactive

---

## Data Ownership

`unitCost` is Manager-only. `qtyOnHand` is shared warehouse stock. Nobody types a new quantity on this screen.

| Action | Who |
|--------|-----|
| Add, edit, deactivate, see unit cost | Manager |
| Read item number, description, bin, quantity | Manager and Warehouse Worker |
| Open `/items` | Manager and Warehouse Worker |
| Change quantity on hand | Features 5, 6, and 7 only |

Office Staff and Drivers get `403` and `You do not have permission to perform this action.` A Warehouse Worker response omits `unitCost`.

## API Requirements

Base path: `/warehouse`. Auth: Bearer token. Errors: `{ "message": "..." }`.

| Method | Path | Auth | Success | Errors |
|--------|------|------|---------|--------|
| GET | `/warehouse/items?itemNumber=` | Yes | `200` array; `unitCost` only if role is manager | `403` |
| GET | `/warehouse/items/:id` | Yes | `200` one item; `unitCost` only for manager | `403` · `404` `No item found with that number.` |
| POST | `/warehouse/items` | Yes | `201` item with `qtyOnHand: 0` | `400` `Please fill in all required fields.` or `That item number is already in use.` or `Choose an active supplier.` · `403` |
| PUT | `/warehouse/items/:id` | Yes | `200` updated item; body cannot change `qtyOnHand` | `400` · `403` · `404` |
| PATCH | `/warehouse/items/:id/deactivate` | Yes | `200` item with `isActive: false` | `403` · `404` |

If a PUT body includes `qtyOnHand`, the API ignores it and keeps the stored quantity.

## Screen Requirements

| Screen | Route | Who | Picture |
|--------|-------|-----|---------|
| Items | `/items` | Manager, Warehouse Worker | [items.svg](../docs/ui/items.svg) |

- Manager labels: **Item number**, **Description**, **Supplier**, **Unit cost**, **Bin**, **Reorder point**, **Qty on hand** (read only), button **Add item**, button **Search**, button **Save**, button **Deactivate**.
- Warehouse Worker sees **Item number**, **Description**, **Bin**, and **Qty on hand** only. No cost fields and no **Add item** button.
- Empty list: `No items yet.`
- No match: `No item found with that number.`
- Loading: `Loading...`

## Definition of Done

*   [ ] Backend and frontend implemented per this spec (**FR-001** through **FR-008**)
*   [ ] **Success Criteria (SC-001** through **SC-003)** met
*   [ ] Warehouse Worker JSON and screen omit `unitCost`
*   [ ] `qtyOnHand` cannot be set from the item form
*   [ ] `features/reference/data-model.md`, `api.md`, and `behavior.md` updated for items

## Out of Scope

*   Customer sell price
*   More than one bin or more than one supplier per item
*   Automatic reorder when quantity hits the reorder point
*   Receiving, picking, and cycle counts ([Feature 5](feature-5-supplier-ordering-receiving.md), [Feature 6](feature-6-customer-order-management.md), [Feature 7](feature-7-inventory-count-adjustment.md))
