# Feature: Shipping & Delivery

**Feature ID:** 8
**Branch pattern:** `feature/8-shipping-delivery`
**Status:** Draft
**Created:** 2026-09-28
**Input:** Once an order is ready, it needs to go out on a truck or be picked up, and the warehouse needs to track that instead of using a paper Bill of Lading.
**Depends on:** [Feature 1 — Staff Login and Access](feature-1-staff-login-access.md), [Feature 6 — Customer Order Management](feature-6-customer-order-management.md)
**Related:** [ADR-0002](../docs/adr/0002-role-based-shared-warehouse-data.md), [Office shipping screen](../docs/ui/shipping-office.svg), [Driver shipping screen](../docs/ui/shipping-driver.svg)

---

## User Stories

### US-8.1: Office Staff assigns a Driver to a delivery
**As an** Office Staff member
**I want to** assign a Driver to an order that is ready and marked for delivery
**So that** the order gets loaded on a truck and sent out

**Priority:** P1
**Independent test:** Assign a Driver to a ready delivery order and check that the order's status becomes Assigned.
**Acceptance scenarios:** see ### US-8.1 under Gherkin AC

### US-8.2: Driver views their assigned deliveries
**As a** Driver
**I want to** see the delivery address, items, and quantities for orders assigned to me
**So that** I know where to go and what to bring

**Priority:** P1
**Independent test:** Log in as a Driver and check that an assigned delivery shows the address, items, and quantities.
**Acceptance scenarios:** see ### US-8.2 under Gherkin AC

### US-8.3: Driver marks a delivery as delivered
**As a** Driver
**I want to** mark a delivery as delivered and enter who received it
**So that** the warehouse has a record instead of a paper Bill of Lading

**Priority:** P1
**Independent test:** Mark an assigned delivery as delivered with a received-by name and check that the order's status becomes Completed.
**Acceptance scenarios:** see ### US-8.3 under Gherkin AC

### US-8.4: Office Staff marks a pickup as picked up
**As an** Office Staff member
**I want to** mark a pickup order as picked up when the customer arrives, and enter who picked it up
**So that** the warehouse has a record that the order was handed over

**Priority:** P1
**Independent test:** Mark a ready pickup order as picked up with a received-by name and check that its status becomes Completed.
**Acceptance scenarios:** see ### US-8.4 under Gherkin AC

### US-8.5: Only Office Staff can assign a Driver
**As the** application
**I want to** block anyone who is not Office Staff from assigning a Driver to a delivery
**So that** only the right people schedule deliveries

**Priority:** P1
**Independent test:** Log in as a Driver, try to assign a Driver to an order, and check that it is blocked.
**Acceptance scenarios:** see ### US-8.5 under Gherkin AC

### US-8.6: Only a Driver can mark a delivery as delivered
**As the** application
**I want to** block anyone who is not a Driver from marking a delivery as delivered
**So that** only the person actually delivering it confirms the delivery

**Priority:** P1
**Independent test:** Log in as Office Staff, try to mark a delivery as delivered, and check that it is blocked.
**Acceptance scenarios:** see ### US-8.6 under Gherkin AC

---

## Functional Requirements

- **FR-001**: Office Staff MUST be able to assign a Driver to an order only when its type is Delivery and its status is Ready.
- **FR-002**: When a Driver is assigned, the system MUST set the order's status to Assigned and record the date it was shipped.
- **FR-003**: A Driver MUST be able to view their assigned orders, including the delivery address, items, and quantities.
- **FR-004**: A Driver MUST NOT see the customer's name, phone number, or billing/credit terms.
- **FR-005**: A Driver MUST be able to mark an assigned order as delivered, entering the name of the person who received it.
- **FR-006**: When an order is marked delivered, the system MUST set its status to Completed and record the date delivered and who received it.
- **FR-007**: Office Staff MUST be able to mark a ready pickup order as picked up, entering the name of the person who picked it up.
- **FR-008**: When a pickup order is marked picked up, the system MUST set its status to Completed and record the date and who picked it up.
- **FR-009**: The system MUST NOT let anyone who is not Office Staff assign a Driver to an order.
- **FR-010**: The system MUST NOT let anyone who is not a Driver mark a delivery as delivered.

---

## Assumptions

- A Manager may do the Office Staff actions on this feature (assign a driver and mark a pickup). The Gherkin blocks a Driver from assigning and blocks Office Staff from marking a delivery delivered.
- The Driver list shows only staff with role `driver` and `isActive` true.
- A Driver sees only orders assigned to them, not every delivery.
- "Date shipped" is the date and time the driver was assigned. "Date delivered" is `completedAt`.
- The received-by value is a name typed by the worker. This feature does not capture a signature image.

## Edge Cases

- Assigning a driver to a pickup shows `This order is not a delivery.`
- Assigning a driver when status is not `ready` shows `This order is not ready.`
- An inactive or non-driver staff id shows `Choose an active driver.`
- Marking delivered with a blank received-by name shows `Please fill in all required fields.`
- A Driver marking someone else's delivery shows `No order found.` so they cannot tell that another driver's order exists.
- Office Staff marking a delivery as delivered shows `You do not have permission to perform this action.`
- Marking a delivery order as a pickup shows `This order is not a pickup.`

## Success Criteria

- **SC-001**: Office Staff can assign a Driver to a ready delivery and the status becomes `assigned` with a shipped date.
- **SC-002**: That Driver sees the address, item, and quantity, and does not see the customer name or phone.
- **SC-003**: The Driver can complete the delivery with received-by `J. Smith` and the status becomes `completed`.
- **SC-004**: Office Staff can complete a ready pickup with a received-by name.
- **SC-005**: A Driver cannot assign a driver, and Office Staff cannot mark a delivery delivered.

---

## Key Entities

- **Order** (from Customer Order Management): now also has a Driver (for a delivery), a date it was shipped, a date it was completed, and the name of who received or picked it up

---

## Initial Data Model

This feature adds new fields to the `orders` table from Customer Order Management, and expands its status options.

### `orders` table — new/changed fields
| Field | Type | Rules |
|-------|------|-------|
| `driverId` | INTEGER FK | Optional, references `staff.id`; set only for a Delivery order; staff role must be `driver` and `isActive` true |
| `shippedAt` | DATETIME | Set when a Driver is assigned |
| `completedAt` | DATETIME | Set when the order is delivered or picked up |
| `receivedBy` | STRING(150) | Set when the order is delivered or picked up; the name of the person who received it |
| `status` | ENUM('pending','ready','assigned','completed') | Required; default `'pending'`; replaces the smaller status list from Customer Order Management |

### Associations
- Each `order` optionally belongs to one `staff` member as its Driver.
- `deliveryAddress` already exists from Feature 6 and is what the Driver is allowed to see.

---

## Gherkin AC

### US-8.1 — Office Staff assigns a Driver to a delivery

#### Scenario: Office Staff assigns a Driver
* **Given** a delivery order exists with status `Ready`
* **And** a staff account exists with role `Driver`
* **When** I assign that Driver to the order
* **Then** the order's status becomes `Assigned`
* **And** the date shipped is recorded

#### Scenario: Cannot assign a Driver to a pickup order
* **Given** a pickup order exists with status `Ready`
* **When** I try to assign a Driver to that order
* **Then** the system blocks it and shows `This order is not a delivery.`

### US-8.2 — Driver views their assigned deliveries

#### Scenario: Driver sees an assigned delivery's info
* **Given** an order assigned to me as Driver has a delivery address, item `IN-4021`, and quantity `5`
* **When** I log in as a Driver and open my deliveries
* **Then** I see the delivery address, item, and quantity
* **And** I do not see the customer's name or phone number

### US-8.3 — Driver marks a delivery as delivered

#### Scenario: Driver marks a delivery as delivered
* **Given** an order is assigned to me as Driver with status `Assigned`
* **When** I mark it delivered and enter received by `J. Smith`
* **Then** the order's status becomes `Completed`
* **And** the received-by name `J. Smith` is saved

### US-8.4 — Office Staff marks a pickup as picked up

#### Scenario: Office Staff marks a pickup order as picked up
* **Given** a pickup order exists with status `Ready`
* **When** I mark it picked up and enter received by `Joe's Stop and Run`
* **Then** the order's status becomes `Completed`
* **And** the received-by name `Joe's Stop and Run` is saved

### US-8.5 — Only Office Staff can assign a Driver

#### Scenario: Driver tries to assign a Driver
* **Given** I am logged in as a Driver
* **When** I try to assign a Driver to an order
* **Then** the system blocks it and shows `You do not have permission to perform this action.`

### US-8.6 — Only a Driver can mark a delivery as delivered

#### Scenario: Office Staff tries to mark a delivery as delivered
* **Given** I am logged in as Office Staff
* **When** I try to mark a delivery as delivered
* **Then** the system blocks it and shows `You do not have permission to perform this action.`

---

## Data Ownership

Shipping uses the shared order. The Driver sees address, items, and quantities for their own assigned deliveries only. They do not see customer name, phone, or billing terms.

| Action | Who |
|--------|-----|
| Assign a driver to a ready delivery | Office Staff, Manager |
| Mark a ready pickup as picked up | Office Staff, Manager |
| List my assigned deliveries | That Driver only |
| Mark my assigned delivery delivered | That Driver only |
| See another driver's delivery | Nobody; API returns `404` `No order found.` |

A wrong role gets `403` and `You do not have permission to perform this action.` The Driver list payload omits `customer.businessName`, `phone`, and `billingTerms`.

## API Requirements

Base path: `/warehouse`. Auth: Bearer token. Errors: `{ "message": "..." }`. Status values in JSON are lowercase: `ready`, `assigned`, `completed`. The screen shows them as Ready, Assigned, and Completed.

| Method | Path | Auth | Success | Errors |
|--------|------|------|---------|--------|
| GET | `/warehouse/staff?role=driver` | Yes | `200` array of `{ id, firstName, lastName, employeeId }` for active drivers | `403` |
| POST | `/warehouse/orders/:id/assign-driver` | Yes | `200` order with status `assigned`, `driverId`, `shippedAt` | `400` `This order is not a delivery.` or `This order is not ready.` or `Choose an active driver.` · `403` · `404` `No order found.` |
| GET | `/warehouse/deliveries/mine` | Yes | `200` array with `deliveryAddress`, lines (`itemNumber`, `qty`); no customer name or phone | `403` |
| POST | `/warehouse/orders/:id/deliver` | Yes | `200` order with status `completed`, `receivedBy`, `completedAt` | `400` `Please fill in all required fields.` · `403` · `404` `No order found.` |
| POST | `/warehouse/orders/:id/pickup` | Yes | `200` order with status `completed`, `receivedBy`, `completedAt` | `400` `This order is not a pickup.` or `This order is not ready.` or `Please fill in all required fields.` · `403` · `404` |

Assign body: `{ "driverId": 4 }`. Deliver and pickup body: `{ "receivedBy": "J. Smith" }`.

## Screen Requirements

| Screen | Route | Who | Picture |
|--------|-------|-----|---------|
| Shipping office | `/shipping` | Office Staff, Manager | [shipping-office.svg](../docs/ui/shipping-office.svg) |
| My deliveries | `/shipping` | Driver | [shipping-driver.svg](../docs/ui/shipping-driver.svg) |

Same route, different screen by role.

- Office labels: **Order**, **Type**, **Status**, **Driver**, **Received by**, button **Assign driver**, button **Mark picked up**.
- Driver labels: **Delivery address**, **Item**, **Quantity**, **Received by**, button **Mark delivered**. No customer name and no phone.
- Empty office list: `No orders ready to ship.`
- Empty driver list: `No deliveries assigned to you.`
- Loading: `Loading...`
- Pickup assign attempt shows `This order is not a delivery.`

## Definition of Done

*   [ ] Backend and frontend implemented per this spec (**FR-001** through **FR-010**)
*   [ ] **Success Criteria (SC-001** through **SC-005)** met
*   [ ] Driver payload includes address, item, and quantity, and omits customer name and phone
*   [ ] Assign sets `assigned` and `shippedAt`; deliver and pickup set `completed` and `completedAt`
*   [ ] `features/reference/data-model.md`, `api.md`, and `behavior.md` updated for the new order fields

## Out of Scope

*   A signature image or a printed Bill of Lading
*   GPS or a route map
*   Changing the driver after the order is assigned
*   Customer email or text when the order is delivered
