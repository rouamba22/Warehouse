# Feature: Shipping & Delivery

**Feature ID:** 8
**Branch pattern:** `feature/8-shipping-delivery`
**Status:** Draft
**Created:** 2026-09-28
**Input:** Once an order is ready, it needs to go out on a truck or be picked up, and the warehouse needs to track that instead of using a paper Bill of Lading.
**Depends on:** [Feature 1 — Staff Login and Access](feature-1-staff-login-access.md), [Feature 6 — Customer Order Management](feature-6-customer-order-management.md)

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

## Key Entities

- **Order** (from Customer Order Management): now also has a Driver (for a delivery), a date it was shipped, a date it was completed, and the name of who received or picked it up

---

## Initial Data Model

This feature adds new fields to the `orders` table from Customer Order Management, and expands its status options.

### `orders` table — new/changed fields
| Field | Type | Rules |
|-------|------|-------|
| `driverId` | INTEGER FK | Optional, references `staff.id`; set only for a Delivery order |
| `shippedAt` | DATETIME | Set when a Driver is assigned |
| `completedAt` | DATETIME | Set when the order is delivered or picked up |
| `receivedBy` | STRING(150) | Set when the order is delivered or picked up; the name of the person who received it |
| `status` | ENUM('pending','ready','assigned','completed') | Required; default `'pending'`; replaces the smaller status list from Customer Order Management |

### Associations
- Each `order` optionally belongs to one `staff` member as its Driver.

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
