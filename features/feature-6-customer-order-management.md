# Feature: Customer Order Management

**Feature ID:** 6
**Branch pattern:** `feature/6-customer-order-management`
**Status:** Draft
**Created:** 2026-09-28
**Input:** Office Staff take a customer order using only the customer name and ID. A Warehouse Worker picks the items. When the pick is done, the order is Ready for pickup or delivery. Address, phone, and billing terms stay hidden from Office Staff and from the Worker.
**Depends on:** [Feature 1 — Staff Login and Access](feature-1-staff-login-access.md), [Feature 2 — Customer Management](feature-2-customer-management.md), [Feature 4 — Item and Product Catalog](feature-4-item-product-catalog-management.md)
**Related:** [ADR-0002](../docs/adr/0002-role-based-shared-warehouse-data.md), [ADR-0004](../docs/adr/0004-inventory-quantity-changes.md), [Customer order screen](../docs/ui/customer-order.svg), [Pick screen](../docs/ui/pick.svg)

The requirements file for this feature was empty on the requirements branch. This draft fills the requirements and the design so Feature 8 has an order to ship. Feature 8 adds Driver, shipped date, completed date, and received-by onto this same `orders` table.

---

## User Stories

### US-6.1: Office Staff create a customer order
**As an** Office Staff member
**I want to** pick a customer by name and ID, choose Delivery or Pickup, and add items and quantities
**So that** the warehouse has the order without me seeing the customer's address or billing terms

**Priority:** P1
**Independent test:** Create a delivery order for `Joe's Stop and Run` with item `IN-4021` quantity `5` and check that the status is Pending.
**Acceptance scenarios:** see ### US-6.1 under Gherkin AC

### US-6.2: Warehouse Worker picks an order
**As a** Warehouse Worker
**I want to** see the item, bin, and quantity to pick
**So that** I can pull the order without seeing who the customer is

**Priority:** P1
**Independent test:** Open a pending order as a Warehouse Worker and check that the item and quantity show, and the customer name does not.
**Acceptance scenarios:** see ### US-6.2 under Gherkin AC

### US-6.3: Picking marks the order Ready
**As a** Warehouse Worker
**I want to** finish the pick
**So that** the quantity on hand goes down and the order is ready to ship or hand over

**Priority:** P1
**Independent test:** Finish a pick for quantity `5` and check that status is Ready and quantity on hand dropped by 5.
**Acceptance scenarios:** see ### US-6.3 under Gherkin AC

### US-6.4: Only the right role can create or pick
**As the** application
**I want to** let only Office Staff create an order and only a Warehouse Worker pick it
**So that** drivers and other roles cannot change the order

**Priority:** P1
**Independent test:** Log in as a Driver and check that creating an order is blocked.
**Acceptance scenarios:** see ### US-6.4 under Gherkin AC

---

## Functional Requirements

- **FR-001**: Office Staff and a Manager MUST be allowed to create a customer order. A Warehouse Worker and a Driver MUST NOT.
- **FR-002**: The customer lookup on this screen MUST return customer ID and business name only. It MUST NOT return address, contact, phone, billing terms, or credit limit.
- **FR-003**: An order MUST use an active customer, a type of `delivery` or `pickup`, and at least one active item with a quantity greater than 0.
- **FR-004**: For a delivery, the system MUST copy the customer's address onto the order and MUST NOT show that address to Office Staff.
- **FR-005**: A new order MUST start with status `pending`.
- **FR-006**: The system MUST NOT create an order line when quantity on hand is less than the quantity ordered. It shows `Not enough on hand.`
- **FR-007**: A Warehouse Worker or a Manager MUST be allowed to pick an order. The pick list MUST show item number, description, bin, and quantity. It MUST NOT show customer name, phone, address, or billing terms. Office Staff and a Driver MUST NOT pick.
- **FR-008**: When the pick is finished, the system MUST subtract each line quantity from `qtyOnHand` and set the order status to `ready`.

---

## Assumptions

- One pick finishes the whole order. Partial picks are out of scope.
- Office Staff and a Manager may create orders. A Warehouse Worker or a Manager may pick. The pick screen stays item, bin, and quantity for both.
- The copied delivery address is stored for Feature 8. Drivers see it there. Office Staff do not see it here.
- Customer sell price is not on this order. The order records item and quantity only.

## Edge Cases

- An inactive customer shows `That customer is not active.`
- No customer match shows `No customer found with that name.`
- A pickup order does not store a delivery address.
- Picking an order that is already `ready` shows `This order is already picked.`
- Quantity of `0` or less shows `Quantity must be greater than zero.`
- An unknown item number shows `No item found with that number.`
- If quantity on hand drops before the pick is finished, the pick is blocked with `Not enough on hand.` and the status stays `pending`.

## Success Criteria

- **SC-001**: Office Staff can create a pending delivery order while seeing only the customer name and ID.
- **SC-002**: A Warehouse Worker can pick that order, quantity on hand drops, and the status becomes `ready`.
- **SC-003**: The pick screen does not show the customer name.
- **SC-004**: A Driver cannot create or pick an order.

---

## Key Entities

- **Order**: a customer order; has a customer, a type (`delivery` or `pickup`), a status, and optional delivery address copied for later shipping
- **Order line**: one item and quantity on that order

Feature 8 adds driver, shipped date, completed date, and received-by on this same order.

---

## Initial Data Model

### `orders` table
| Field | Type | Rules |
|-------|------|-------|
| `id` | INTEGER PK | Auto-increment |
| `customerId` | INTEGER FK | Required, references `customers.id` |
| `orderType` | ENUM('delivery','pickup') | Required |
| `status` | ENUM('pending','ready') | Required; default `pending`. Feature 8 adds `assigned` and `completed` |
| `deliveryAddress` | STRING(255) | Copied from the customer when type is `delivery`; hidden from Office Staff |
| `createdBy` | INTEGER FK | Required, references `staff.id` |
| `pickedBy` | INTEGER FK | Optional, references `staff.id` |
| `pickedAt` | DATETIME | Set when the pick is finished |
| `createdAt` | DATETIME | Auto-set |

### `order_lines` table
| Field | Type | Rules |
|-------|------|-------|
| `id` | INTEGER PK | Auto-increment |
| `orderId` | INTEGER FK | Required, references `orders.id` |
| `itemId` | INTEGER FK | Required, references `items.id` |
| `qty` | INTEGER | Required; greater than 0 |

### Associations
- Each `order` belongs to one `customer` and has many `order_lines`.
- Each line belongs to one `item`.

---

## Gherkin AC

### US-6.1 — Office Staff create a customer order

#### Scenario: Office Staff create a delivery order
* **Given** I am logged in as Office Staff
* **And** an active customer exists with customer ID `C-1042` and business name `Joe's Stop and Run`
* **And** item `IN-4021` is active with quantity on hand `10`
* **When** I create a delivery order for `Joe's Stop and Run` with item `IN-4021` and quantity `5`
* **Then** the system saves the order with status `pending`
* **And** I see the customer name and customer ID
* **And** I do not see the address, phone, or billing terms

#### Scenario: Not enough on hand
* **Given** item `IN-4021` has quantity on hand `2`
* **When** I try to order quantity `5`
* **Then** the system blocks it and shows `Not enough on hand.`

### US-6.2 — Warehouse Worker picks an order

#### Scenario: Warehouse Worker sees the pick list
* **Given** a pending order has item `IN-4021`, bin `A-12`, and quantity `5`
* **And** I am logged in as a Warehouse Worker
* **When** I open the pick list
* **Then** I see item `IN-4021`, bin `A-12`, and quantity `5`
* **And** I do not see the customer name

### US-6.3 — Picking marks the order Ready

#### Scenario: Warehouse Worker finishes the pick
* **Given** a pending order has item `IN-4021` quantity `5`
* **And** quantity on hand for `IN-4021` is `10`
* **When** I finish the pick
* **Then** the order status becomes `ready`
* **And** the quantity on hand for `IN-4021` becomes `5`

### US-6.4 — Only the right role can create or pick

#### Scenario: Driver tries to create an order
* **Given** I am logged in as a Driver
* **When** I try to create a customer order
* **Then** the system blocks it and shows `You do not have permission to perform this action.`

#### Scenario: Office Staff tries to pick an order
* **Given** I am logged in as Office Staff
* **When** I try to finish a pick
* **Then** the system blocks it and shows `You do not have permission to perform this action.`

---

## Data Ownership

The order is shared. Private customer fields stay off the Office Staff and Warehouse Worker payloads.

| Action | Who | Fields they can see |
|--------|-----|---------------------|
| Create an order, search customers | Office Staff, Manager | Customer ID and business name only |
| Read delivery address | Not Office Staff on this feature | Stored for Feature 8 |
| Pick | Warehouse Worker, Manager | Item number, description, bin, quantity |
| Create or pick | Not a Driver | — |

Wrong role: `403` and `You do not have permission to perform this action.`

## API Requirements

Base path: `/warehouse`. Auth: Bearer token. Errors: `{ "message": "..." }`.

| Method | Path | Auth | Success | Errors |
|--------|------|------|---------|--------|
| GET | `/warehouse/customers/lookup?name=` | Yes | `200` array of `{ id, customerCode, businessName }` only | `403` |
| POST | `/warehouse/orders` | Yes | `201` order without `deliveryAddress` for office staff | `400` `No customer found with that name.` or `That customer is not active.` or `No item found with that number.` or `Quantity must be greater than zero.` or `Not enough on hand.` or `Add at least one item.` · `403` |
| GET | `/warehouse/orders?status=pending` | Yes | `200` orders; worker payload has lines only, no customer name | `403` |
| POST | `/warehouse/orders/:id/pick` | Yes | `200` order with status `ready` | `400` `This order is already picked.` or `Not enough on hand.` · `403` · `404` `No order found.` |

The lookup is the only customer read Office Staff get. It must not select address, phone, or billing columns.

## Screen Requirements

| Screen | Route | Who | Picture |
|--------|-------|-----|---------|
| Customer orders | `/orders` | Office Staff, Manager | [customer-order.svg](../docs/ui/customer-order.svg) |
| Pick | `/orders/:id/pick` | Warehouse Worker, Manager | [pick.svg](../docs/ui/pick.svg) |

- Office labels: **Customer name**, **Customer ID**, **Delivery** or **Pickup**, **Item number**, **Quantity**, button **Place order**. No address, phone, or billing fields.
- Worker labels: **Item number**, **Bin**, **Quantity**, button **Finish pick**. No customer name.
- Empty list: `No orders yet.`
- Loading: `Loading...`
- Not enough stock shows `Not enough on hand.`

## Definition of Done

*   [ ] Backend and frontend implemented per this spec (**FR-001** through **FR-008**)
*   [ ] **Success Criteria (SC-001** through **SC-004)** met
*   [ ] Office lookup returns only `id`, `customerCode`, and `businessName`
*   [ ] Pick lowers `qtyOnHand` and sets status to `ready`
*   [ ] `features/reference/data-model.md`, `api.md`, and `behavior.md` updated

## Out of Scope

*   Assigning a driver, marking delivered, or marking picked up ([Feature 8](feature-8-shipping-delivery.md))
*   Customer sell price, tax, and invoices
*   Partial picks
*   Editing an order after it is placed
