# Feature: Inventory Count and Adjustment

**Feature ID:** 7
**Branch pattern:** `feature/7-inventory-count-adjustment`
**Status:** Draft
**Created:** 2026-09-28
**Input:** A Warehouse Worker counts what is really in the bin. If the count does not match quantity on hand, they enter a reason and the system updates the quantity. The old paper count sheet goes away.
**Depends on:** [Feature 1 — Staff Login and Access](feature-1-staff-login-access.md), [Feature 4 — Item and Product Catalog](feature-4-item-product-catalog-management.md)
**Related:** [ADR-0004](../docs/adr/0004-inventory-quantity-changes.md), [Inventory screen](../docs/ui/inventory.svg)

The requirements file for this feature was empty on the requirements branch. This draft fills the requirements and the design.

---

## User Stories

### US-7.1: Warehouse Worker counts an item
**As a** Warehouse Worker
**I want to** look up an item and enter the quantity I counted
**So that** the system can compare it to quantity on hand

**Priority:** P1
**Independent test:** Count item `IN-4021` and check that the screen shows the book quantity and the counted quantity.
**Acceptance scenarios:** see ### US-7.1 under Gherkin AC

### US-7.2: A difference requires a reason
**As a** Warehouse Worker
**I want to** enter a reason when my count does not match
**So that** the warehouse has a record of why the quantity changed

**Priority:** P1
**Independent test:** Enter a count that does not match, leave the reason blank, and check that the save is blocked.
**Acceptance scenarios:** see ### US-7.2 under Gherkin AC

### US-7.3: Only a Warehouse Worker or Manager can adjust
**As the** application
**I want to** block Office Staff and Drivers from changing a count
**So that** only the people who handle stock can adjust it

**Priority:** P1
**Independent test:** Log in as a Driver, try to save a count, and check that it is blocked.
**Acceptance scenarios:** see ### US-7.3 under Gherkin AC

---

## Functional Requirements

- **FR-001**: A Warehouse Worker MUST be able to look up an item by item number and see the bin and quantity on hand. They MUST NOT see unit cost.
- **FR-002**: The worker MUST enter a counted quantity of `0` or more.
- **FR-003**: If the counted quantity equals quantity on hand, the system MUST save a count record and MUST NOT change quantity on hand. A reason is not required.
- **FR-004**: If the counted quantity is different, the system MUST require a reason, save an adjustment, and set quantity on hand to the counted quantity.
- **FR-005**: The adjustment MUST record the previous quantity, the counted quantity, the reason, and which staff member saved it.
- **FR-006**: A Manager MAY view the adjustment list. A Manager MUST NOT type a new quantity on the item screen (Feature 4). A Manager MAY save a count on this screen.
- **FR-007**: The system MUST NOT let Office Staff or a Driver save a count.

---

## Assumptions

- One count is for one item, not a whole warehouse at once.
- The reason is short text, such as `Damaged` or `Miscount`.
- A matching count is still saved so there is a record that the bin was checked.
- Deactivated items can still be counted so the warehouse can zero them out.

## Edge Cases

- Unknown item number shows `No item found with that number.`
- A blank count shows `Please fill in all required fields.`
- A negative count shows `Quantity must be zero or more.`
- A mismatch with no reason shows `Enter a reason for the adjustment.`
- Two workers counting the same item: the last saved count wins, and both adjustment rows stay in the list.

## Success Criteria

- **SC-001**: A matching count saves a record and leaves quantity on hand the same.
- **SC-002**: A mismatch with a reason changes quantity on hand to the counted quantity and keeps the reason.
- **SC-003**: A Driver who tries to save a count sees `You do not have permission to perform this action.`

---

## Key Entities

- **Inventory adjustment**: one count of one item; has the previous quantity, the counted quantity, an optional reason, and the staff member who saved it

---

## Initial Data Model

### `inventory_adjustments` table
| Field | Type | Rules |
|-------|------|-------|
| `id` | INTEGER PK | Auto-increment |
| `itemId` | INTEGER FK | Required, references `items.id` |
| `previousQty` | INTEGER | Required; copy of `qtyOnHand` before the save |
| `countedQty` | INTEGER | Required; `0` or more |
| `reason` | STRING(255) | Required when `countedQty` is not `previousQty`; otherwise empty |
| `staffId` | INTEGER FK | Required, references `staff.id` |
| `createdAt` | DATETIME | Auto-set |

### Associations
- Each adjustment belongs to one `item` and one `staff` member.
- Saving a mismatch sets `items.qtyOnHand` to `countedQty`.

---

## Gherkin AC

### US-7.1 — Warehouse Worker counts an item

#### Scenario: Count matches quantity on hand
* **Given** item `IN-4021` has quantity on hand `10` and bin `A-12`
* **And** I am logged in as a Warehouse Worker
* **When** I enter a counted quantity of `10`
* **Then** the system saves the count
* **And** the quantity on hand stays `10`

### US-7.2 — A difference requires a reason

#### Scenario: Count does not match and a reason is missing
* **Given** item `IN-4021` has quantity on hand `10`
* **When** I enter a counted quantity of `8` and no reason
* **Then** the system blocks it and shows `Enter a reason for the adjustment.`

#### Scenario: Count does not match and a reason is entered
* **Given** item `IN-4021` has quantity on hand `10`
* **When** I enter a counted quantity of `8` and reason `Damaged`
* **Then** the quantity on hand becomes `8`
* **And** the reason `Damaged` is saved

### US-7.3 — Only a Warehouse Worker or Manager can adjust

#### Scenario: Driver tries to save a count
* **Given** I am logged in as a Driver
* **When** I try to save a count for item `IN-4021`
* **Then** the system blocks it and shows `You do not have permission to perform this action.`

---

## Data Ownership

Quantity on hand is shared stock. The adjustment row records who changed it. Unit cost is not part of this feature.

| Action | Who |
|--------|-----|
| Look up an item and save a count | Warehouse Worker, Manager |
| Read the adjustment list | Warehouse Worker, Manager |
| Save a count | Not Office Staff, not Driver |

Wrong role: `403` and `You do not have permission to perform this action.`

## API Requirements

Base path: `/warehouse`. Auth: Bearer token. Errors: `{ "message": "..." }`. The item lookup on this feature uses Feature 4's `GET /warehouse/items?itemNumber=` and still hides `unitCost` from a Warehouse Worker.

| Method | Path | Auth | Success | Errors |
|--------|------|------|---------|--------|
| POST | `/warehouse/inventory/counts` | Yes | `200` `{ item, adjustment }` | `400` `Please fill in all required fields.` or `Quantity must be zero or more.` or `Enter a reason for the adjustment.` or `No item found with that number.` · `403` |
| GET | `/warehouse/inventory/counts?itemNumber=` | Yes | `200` array of adjustments | `403` |

Count body: `{ "itemNumber": "IN-4021", "countedQty": 8, "reason": "Damaged" }`.

## Screen Requirements

| Screen | Route | Who | Picture |
|--------|-------|-----|---------|
| Inventory count | `/inventory` | Warehouse Worker, Manager | [inventory.svg](../docs/ui/inventory.svg) |

- Labels: **Item number**, **Bin**, **Qty on hand**, **Counted qty**, **Reason**, button **Save count**.
- No unit cost on this screen.
- Empty history: `No counts yet.`
- Loading: `Loading...`
- Mismatch without a reason shows `Enter a reason for the adjustment.`

## Definition of Done

*   [ ] Backend and frontend implemented per this spec (**FR-001** through **FR-007**)
*   [ ] **Success Criteria (SC-001** through **SC-003)** met
*   [ ] A mismatch updates `items.qtyOnHand` and stores the reason and staff id
*   [ ] `features/reference/data-model.md`, `api.md`, and `behavior.md` updated

## Out of Scope

*   Counting every bin in one pass
*   Approval before the quantity changes
*   Editing or deleting an old adjustment
*   Changing unit cost
