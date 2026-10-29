# Feature: Supplier Ordering and Receiving

**Feature ID:** 5
**Branch pattern:** `feature/5-supplier-ordering-receiving`
**Status:** Draft
**Created:** 2026-09-28
**Input:** The Manager orders stock from a supplier. A Warehouse Worker receives the shipment, puts it in a bin, and the quantity on hand goes up. This replaces the paper receiving log.
**Depends on:** [Feature 1 — Staff Login and Access](feature-1-staff-login-access.md), [Feature 3 — Supplier Management](feature-3-supplier-management.md), [Feature 4 — Item and Product Catalog](feature-4-item-product-catalog-management.md)
**Related:** [ADR-0004](../docs/adr/0004-inventory-quantity-changes.md), [Supplier order screen](../docs/ui/supplier-order.svg), [Receive screen](../docs/ui/receive.svg)

The requirements file for this feature was empty on the requirements branch. This draft fills the requirements and the design in the same style as Features 1, 3, and 8.

---

## User Stories

### US-5.1: Manager creates a supplier order
**As a** Manager
**I want to** order items from an active supplier
**So that** the warehouse has a record of what was ordered

**Priority:** P1
**Independent test:** Create an order for supplier `Arizona` with item `IN-4021` and check that the status is Open.
**Acceptance scenarios:** see ### US-5.1 under Gherkin AC

### US-5.2: Warehouse Worker receives a shipment
**As a** Warehouse Worker
**I want to** enter how many of each item arrived and the bin I put them in
**So that** quantity on hand goes up and the order is marked received

**Priority:** P1
**Independent test:** Receive 10 of `IN-4021` into bin `A-12` and check that quantity on hand increased by 10.
**Acceptance scenarios:** see ### US-5.2 under Gherkin AC

### US-5.3: Only the right role can order or receive
**As the** application
**I want to** let only a Manager create a supplier order and only a Warehouse Worker receive it
**So that** office and drivers cannot change incoming stock

**Priority:** P1
**Independent test:** Log in as Office Staff and check that both actions are blocked.
**Acceptance scenarios:** see ### US-5.3 under Gherkin AC

---

## Functional Requirements

- **FR-001**: Only a Manager MUST be allowed to create a supplier order.
- **FR-002**: A supplier order MUST name an active supplier and at least one line with an active item from that supplier and a quantity greater than 0.
- **FR-003**: The line cost MUST be copied from the item's unit cost at the time of the order. The order total MUST be the sum of quantity times unit cost.
- **FR-004**: The order total MUST be at least the supplier's minimum order amount.
- **FR-005**: A new supplier order MUST start with status `open`.
- **FR-006**: Only a Warehouse Worker MUST be allowed to receive an open supplier order.
- **FR-007**: Receiving MUST record the quantity received and the bin for each line, add the quantity received to `qtyOnHand`, and set the order status to `received`.
- **FR-008**: A Warehouse Worker MUST NOT see unit cost or the order total.
- **FR-009**: The system MUST NOT let Office Staff or a Driver create or receive a supplier order.

---

## Assumptions

- One receive action closes the whole order. Partial receives are out of scope.
- The worker can confirm a quantity of `0` on a line if that item did not arrive. Quantity on hand does not change for that line.
- The bin entered at receive updates the item's `binLocation`.
- The Manager can see open orders. The Warehouse Worker sees open orders as a receive list, without money fields.

## Edge Cases

- An inactive supplier or inactive item is blocked with `Choose an active supplier.` or `Choose an active item.`
- An order under the minimum shows `This order is below the supplier minimum.`
- Receiving an order that is already `received` shows `This order is already received.`
- A received quantity less than 0 shows `Quantity must be zero or more.`
- An empty order with no lines shows `Add at least one item.`

## Success Criteria

- **SC-001**: A Manager can place an open order to `Arizona` that meets the minimum order amount.
- **SC-002**: A Warehouse Worker can receive that order and the item's quantity on hand increases by the quantity received.
- **SC-003**: The Warehouse Worker screen and API do not include unit cost or order total.
- **SC-004**: Office Staff cannot create or receive a supplier order.

---

## Key Entities

- **Supplier order**: a purchase from one supplier; has a status (`open` or `received`), an order total, and the date it was received
- **Supplier order line**: one item on that order; has quantity ordered, unit cost, quantity received, and bin

---

## Initial Data Model

### `supplier_orders` table
| Field | Type | Rules |
|-------|------|-------|
| `id` | INTEGER PK | Auto-increment |
| `supplierId` | INTEGER FK | Required, references `suppliers.id` |
| `status` | ENUM('open','received') | Required; default `open` |
| `orderTotal` | DECIMAL(10,2) | Required; Manager only |
| `createdBy` | INTEGER FK | Required, references `staff.id` |
| `receivedBy` | INTEGER FK | Optional, references `staff.id`; set when received |
| `receivedAt` | DATETIME | Set when received |
| `createdAt` | DATETIME | Auto-set |

### `supplier_order_lines` table
| Field | Type | Rules |
|-------|------|-------|
| `id` | INTEGER PK | Auto-increment |
| `supplierOrderId` | INTEGER FK | Required, references `supplier_orders.id` |
| `itemId` | INTEGER FK | Required, references `items.id` |
| `qtyOrdered` | INTEGER | Required; greater than 0 |
| `unitCost` | DECIMAL(10,2) | Required; copied from the item; Manager only |
| `qtyReceived` | INTEGER | Optional until receive; `0` or more |
| `binLocation` | STRING(30) | Set when received |

### Associations
- Each `supplier_order` belongs to one `supplier` and has many `supplier_order_lines`.
- Each line belongs to one `item`.

---

## Gherkin AC

### US-5.1 — Manager creates a supplier order

#### Scenario: Manager creates a supplier order
* **Given** I am logged in as a Manager
* **And** supplier `Arizona` is active with a minimum order amount of `50.00`
* **And** item `IN-4021` belongs to `Arizona` with unit cost `10.00`
* **When** I order quantity `10` of `IN-4021` from `Arizona`
* **Then** the system saves the order with status `open`
* **And** the order total is `100.00`

#### Scenario: Order is below the supplier minimum
* **Given** supplier `Arizona` has a minimum order amount of `50.00`
* **And** item `IN-4021` has unit cost `10.00`
* **When** I order quantity `1` of `IN-4021`
* **Then** the system blocks it and shows `This order is below the supplier minimum.`

### US-5.2 — Warehouse Worker receives a shipment

#### Scenario: Warehouse Worker receives the shipment
* **Given** an open supplier order includes item `IN-4021` with quantity ordered `10`
* **And** `IN-4021` has quantity on hand `0`
* **And** I am logged in as a Warehouse Worker
* **When** I receive quantity `10` into bin `A-12`
* **Then** the order status becomes `received`
* **And** the quantity on hand for `IN-4021` becomes `10`
* **And** I do not see the unit cost

### US-5.3 — Only the right role can order or receive

#### Scenario: Office Staff tries to create a supplier order
* **Given** I am logged in as Office Staff
* **When** I try to create a supplier order
* **Then** the system blocks it and shows `You do not have permission to perform this action.`

#### Scenario: Manager tries to receive a shipment
* **Given** I am logged in as a Manager
* **When** I try to receive a supplier order
* **Then** the system blocks it and shows `You do not have permission to perform this action.`

---

## Data Ownership

The supplier order is shared warehouse data. Money fields stay with the Manager. Stock quantity changes only through receive.

| Action | Who |
|--------|-----|
| Create a supplier order, see cost and total | Manager |
| See open orders without cost, receive them | Warehouse Worker |
| Create or receive | Not Office Staff, not Driver |

Wrong role: `403` and `You do not have permission to perform this action.`

## API Requirements

Base path: `/warehouse`. Auth: Bearer token. Errors: `{ "message": "..." }`.

| Method | Path | Auth | Success | Errors |
|--------|------|------|---------|--------|
| POST | `/warehouse/supplier-orders` | Yes | `201` order with lines and `orderTotal` | `400` `Add at least one item.` or `Choose an active supplier.` or `Choose an active item.` or `This order is below the supplier minimum.` · `403` |
| GET | `/warehouse/supplier-orders?status=open` | Yes | `200` array; money fields only for manager | `403` |
| POST | `/warehouse/supplier-orders/:id/receive` | Yes | `200` order with status `received` and updated quantities | `400` `Quantity must be zero or more.` or `This order is already received.` · `403` · `404` `No supplier order found.` |

Receive body: `{ "lines": [ { "lineId": 1, "qtyReceived": 10, "binLocation": "A-12" } ] }`.

## Screen Requirements

| Screen | Route | Who | Picture |
|--------|-------|-----|---------|
| New supplier order | `/supplier-orders` | Manager | [supplier-order.svg](../docs/ui/supplier-order.svg) |
| Receive | `/supplier-orders/:id/receive` | Warehouse Worker | [receive.svg](../docs/ui/receive.svg) |

- Manager labels: **Supplier**, **Item number**, **Quantity**, **Order total**, button **Place order**.
- Worker labels: **Item number**, **Qty ordered**, **Qty received**, **Bin**, button **Receive shipment**. No cost and no order total.
- Empty open list: `No open supplier orders.`
- Loading: `Loading...`

## Definition of Done

*   [ ] Backend and frontend implemented per this spec (**FR-001** through **FR-009**)
*   [ ] **Success Criteria (SC-001** through **SC-004)** met
*   [ ] Receive updates `items.qtyOnHand` and sets status to `received`
*   [ ] Worker responses omit `unitCost` and `orderTotal`
*   [ ] `features/reference/data-model.md`, `api.md`, and `behavior.md` updated

## Out of Scope

*   Partial receive across more than one day
*   Sending the order to the supplier by email
*   Returns to the supplier
*   A Manager receiving the shipment (the Worker does that)
