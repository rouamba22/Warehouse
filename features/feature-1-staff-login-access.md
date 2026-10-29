# Feature: Staff Login and Access

**Feature ID:** 1
**Branch pattern:** `feature/1-staff-authentication-access-management`
**Status:** Draft
**Created:** 2026-09-28
**Input:** Workers need their own login so the warehouse can stop using paper and make sure people only see the screens they need for their job.
**Depends on:** none
**Related:** [ADR-0001](../docs/adr/0001-vue-express-mysql-stack.md), [ADR-0002](../docs/adr/0002-role-based-shared-warehouse-data.md), [ADR-0003](../docs/adr/0003-session-token-until-logout.md), [Login screen](../docs/ui/login.svg), [Staff screen](../docs/ui/staff.svg)

---

## User Stories

### US-1.1: Manager adds a new worker
**As a** Manager
**I want to** add a new staff account with an Employee ID, a PIN, and a job role
**So that** a new hire can log in and use the system

**Priority:** P1
**Independent test:** Log in as Manager, add a worker with the role Warehouse Worker, and check that the new worker shows up in the staff list.
**Acceptance scenarios:** see ### US-1.1 under Gherkin AC

### US-1.2: Log in
**As a** staff member
**I want to** log in with my Employee ID and PIN
**So that** I can use the parts of the system I need for my job

**Priority:** P1
**Independent test:** Log in with a real Employee ID and PIN and land on the right home screen.
**Acceptance scenarios:** see ### US-1.2 under Gherkin AC

### US-1.3: Stay logged in
**As a** logged-in staff member
**I want to** stay logged in when I refresh the page
**So that** I don't have to type my PIN over and over during my shift

**Priority:** P2
**Independent test:** Refresh the page while logged in and check that I am still logged in.
**Acceptance scenarios:** see ### US-1.3 under Gherkin AC

### US-1.4: Log out
**As a** logged-in staff member
**I want to** log out
**So that** nobody else can use the system under my name

**Priority:** P1
**Independent test:** Log out, then try to open a locked screen and check that it sends me back to the login page.
**Acceptance scenarios:** see ### US-1.4 under Gherkin AC

### US-1.5: Only show workers what they need
**As the** application
**I want to** only show each worker the screens for their job
**So that** people cannot touch parts of the system that are not their job

**Priority:** P1
**Independent test:** Log in as a Driver and check that only Shipping & Delivery shows up.
**Acceptance scenarios:** see ### US-1.5 under Gherkin AC

### US-1.6: Manager turns off a worker's account
**As a** Manager
**I want to** turn off a staff account
**So that** someone who no longer works here cannot log in anymore

**Priority:** P2
**Independent test:** Turn off an account, then try to log in with it and check that it fails.
**Acceptance scenarios:** see ### US-1.6 under Gherkin AC

---

## Functional Requirements

- **FR-001**: The system MUST ask for an Employee ID and a PIN to log in.
- **FR-002**: Only a Manager MUST be allowed to add a new staff account.
- **FR-003**: Only a Manager MUST be allowed to turn off a staff account.
- **FR-004**: Every staff account MUST have exactly one job role: Manager, Office Staff, Warehouse Worker, or Driver.
- **FR-005**: Each role MUST only see its own screens: Manager sees everything, including full customer records, billing/credit terms, full supplier records, and full item cost info; Office Staff sees Customer Order Management (where they can see a customer's name and ID only, not their address, contact info, or billing/credit terms); Warehouse Worker sees Supplier Order Receiving & Putaway, Inventory Count & Adjustment, and the picking part of Customer Order Management; Driver only sees Shipping & Delivery.
- **FR-006**: The system MUST NOT let someone log in if the PIN they typed is wrong.
- **FR-007**: The system MUST NOT let a turned-off account log in.
- **FR-008**: The PIN MUST be saved as a hash, never as plain text, so nobody can read it directly.
- **FR-009**: The system MUST keep a staff member logged in until they log out on purpose; a login MUST NOT time out by itself.

---

## Assumptions

- A first Manager account already exists so someone can log in and add the rest of the staff.
- Employee ID is typed by the Manager. Workers do not sign themselves up.
- A PIN is 4 to 6 digits.
- The warehouse shares one system. Records are not private to one worker. The job role decides who can open a screen. See [ADR-0002](../docs/adr/0002-role-based-shared-warehouse-data.md).
- Logging out ends the session on this device only. A session on another device stays until that device logs out.

## Edge Cases

- Two workers cannot have the same Employee ID. The second save is blocked.
- A blank Employee ID or PIN does not log anyone in.
- A wrong PIN and an unknown Employee ID show the same message, so the screen does not reveal which IDs exist.
- Opening a locked link with no token sends the person to the login screen.
- A Manager cannot turn off their own account from this feature.

## Success Criteria

- **SC-001**: A Manager can add a Warehouse Worker, and that worker can log in with the new Employee ID and PIN.
- **SC-002**: A wrong PIN or unknown Employee ID shows `Invalid Employee ID or PIN.` and stays on the login screen.
- **SC-003**: A Driver's menu shows only **Shipping & Delivery**.
- **SC-004**: After refresh, the same worker is still logged in on the same screen.
- **SC-005**: After **Log out**, a locked link sends the worker back to the login screen.

---

## Key Entities

- **Staff**: a warehouse worker's account; has an Employee ID, a PIN, a job role, and whether the account is turned on or off
- **Role**: the worker's job type — Manager, Office Staff, Warehouse Worker, or Driver — this decides what screens they can use
- **Session**: keeps track that a worker is logged in, on the server side

---

## Initial Data Model

### `staff` table
| Field | Type | Rules |
|-------|------|-------|
| `id` | INTEGER PK | Auto-increment |
| `employeeId` | STRING(20) | Required, unique |
| `pin` | STRING(255) | Required; stored as a hash only; never returned by the API |
| `firstName` | STRING(100) | Required |
| `lastName` | STRING(100) | Required |
| `role` | ENUM('manager','office_staff','warehouse_worker','driver') | Required |
| `isActive` | BOOLEAN | Required; default `true` |
| `createdAt` | DATETIME | Auto-set |

### `sessions` table
| Field | Type | Rules |
|-------|------|-------|
| `id` | INTEGER PK | Auto-increment |
| `token` | STRING(255) | Required, unique |
| `staffId` | INTEGER FK | Required, references `staff.id` |
| `createdAt` | DATETIME | Auto-set |

Sessions do not expire automatically; a session is removed only when the staff member signs out on that device.

### Associations
- One `staff` account can have many `sessions` (signed in on more than one device).

---

## Gherkin AC

### US-1.1 — Manager adds a new worker

#### Scenario: Manager adds a new worker
* **Given** I am logged in as a Manager
* **When** I add a new worker with Employee ID `EMP205`, a PIN, and role `Warehouse Worker`
* **Then** the system saves the new worker
* **And** the worker shows up in the staff list with role `Warehouse Worker`

#### Scenario: A non-Manager cannot add a worker
* **Given** I am logged in as a Driver
* **When** I try to add a new worker
* **Then** the system blocks it and shows `You do not have permission to perform this action.`

### US-1.2 — Log in

#### Scenario: Worker logs in with the right Employee ID and PIN
* **Given** a worker account exists with Employee ID `EMP101`, a known PIN, and it is turned on
* **When** I enter Employee ID `EMP101` and the correct PIN
* **And** I click **Log in**
* **Then** I am logged in
* **And** I am sent to the home screen for my job role

#### Scenario: Worker types the wrong PIN
* **Given** a worker account exists with Employee ID `EMP101`
* **When** I enter Employee ID `EMP101` and a wrong PIN
* **And** I click **Log in**
* **Then** the system shows `Invalid Employee ID or PIN.`
* **And** I stay on the login screen

### US-1.3 — Stay logged in

#### Scenario: Staying logged in after a page refresh
* **Given** I am logged in
* **When** I refresh the page
* **Then** I am still logged in
* **And** I am still on the same screen I was on

### US-1.4 — Log out

#### Scenario: Worker logs out
* **Given** I am logged in
* **When** I click **Log out**
* **Then** my login is ended
* **And** I am sent back to the login screen

#### Scenario: A logged-out worker cannot open a locked screen
* **Given** I have logged out
* **When** I try to open a locked screen directly by its link
* **Then** I am sent back to the login screen

### US-1.5 — Only show workers what they need

#### Scenario: Driver only sees Shipping & Delivery
* **Given** I am logged in as a Driver
* **When** I look at the menu
* **Then** I only see **Shipping & Delivery**
* **And** I cannot open Inventory, Customer Management, or Supplier Management

#### Scenario: A Warehouse Worker is blocked from Supplier Management
* **Given** I am logged in as a Warehouse Worker
* **When** I try to open the Supplier Management screen directly by its link
* **Then** the system blocks it and shows `You do not have permission to perform this action.`

### US-1.6 — Manager turns off a worker's account

#### Scenario: Manager turns off a worker's account
* **Given** I am logged in as a Manager
* **And** a worker account exists with Employee ID `EMP101` and it is turned on
* **When** I turn off the account for `EMP101`
* **Then** the account's status becomes turned off

#### Scenario: A turned-off worker cannot log in
* **Given** a worker account with Employee ID `EMP101` has been turned off
* **When** I try to log in with Employee ID `EMP101` and its PIN
* **Then** the system shows `This account has been deactivated.`

---

## Data Ownership

Warehouse data is shared. A worker does not own their own private copy of staff records. The server checks the role on every request. See [ADR-0002](../docs/adr/0002-role-based-shared-warehouse-data.md).

| Action | Who |
|--------|-----|
| Read the full staff list | Manager |
| Read active drivers only (`id`, `firstName`, `lastName`, `employeeId`) | Manager and Office Staff, so Feature 8 can assign a driver |
| Add a staff account | Manager |
| Turn an account off | Manager, and not their own account |
| Log in, refresh, log out | Any staff member, for their own session |
| See another role's menu | Nobody |

The API never returns `pin`. A wrong role gets `403` and `You do not have permission to perform this action.` A missing login gets `401` and the login screen. The UI hides Staff from every role except Manager, and the API still checks the role.

## API Requirements

Base path: `/warehouse`. Errors are `{ "message": "..." }`. Success returns the record itself, not a wrapper. The PIN hash is never in a response. Login and session check do not need a token. Every other route does. Send `Authorization: Bearer <token>`. JSON `role` values are `manager`, `office_staff`, `warehouse_worker`, and `driver`. The screens show those as Manager, Office Staff, Warehouse Worker, and Driver.

| Method | Path | Auth | Success | Errors |
|--------|------|------|---------|--------|
| POST | `/warehouse/login` | No | `200` `{ token, employeeId, firstName, lastName, role }` | `400` `Please fill in all required fields.` · `401` `Invalid Employee ID or PIN.` · `403` `This account has been deactivated.` |
| GET | `/warehouse/session` | Yes | `200` same staff fields as login, no token | `401` no session |
| POST | `/warehouse/logout` | Yes | `200` `{ message: "Logged out." }` | `401` no session |
| GET | `/warehouse/staff` | Yes | `200` array of staff, no `pin`. Manager only | `401` · `403` permission message |
| GET | `/warehouse/staff?role=driver` | Yes | `200` active drivers only: `id`, `firstName`, `lastName`, `employeeId`. Manager and Office Staff | `403` |
| POST | `/warehouse/staff` | Yes | `201` the new staff row, no `pin` | `400` `Please fill in all required fields.` or `That Employee ID is already in use.` · `403` |
| PATCH | `/warehouse/staff/:id/deactivate` | Yes | `200` staff row with `isActive: false` | `400` `You cannot turn off your own account.` · `403` · `404` `No staff member found.` |

## Screen Requirements

| Screen | Route | Who | Picture |
|--------|-------|-----|---------|
| Login | `/login` | Everyone who is logged out | [login.svg](../docs/ui/login.svg) |
| Home | `/` | Logged-in staff; menu follows FR-005 | [home-manager.svg](../docs/ui/home-manager.svg), [home-driver.svg](../docs/ui/home-driver.svg) |
| Staff | `/staff` | Manager | [staff.svg](../docs/ui/staff.svg) |

- Login labels: **Employee ID**, **PIN**, button **Log in**.
- Home shows the worker's name and a **Log out** button.
- Staff screen labels: **Employee ID**, **First name**, **Last name**, **PIN**, **Role**, button **Add worker**, button **Turn off**.
- Empty staff list: `No workers yet.`
- Loading: `Loading...`
- Wrong PIN stays on Login and shows `Invalid Employee ID or PIN.`
- A locked link with no token goes to `/login`.
- A locked link with the wrong role stays on Home and shows `You do not have permission to perform this action.`

## Definition of Done

*   [ ] Backend and frontend implemented per this spec (**FR-001** through **FR-009**)
*   [ ] **Success Criteria (SC-001** through **SC-005)** met
*   [ ] PIN is stored only as a hash and is never returned by the API
*   [ ] Login does not expire until **Log out**
*   [ ] `features/reference/data-model.md` updated for `staff` and `sessions`
*   [ ] `features/reference/api.md` updated for the routes in this feature
*   [ ] `features/reference/behavior.md` updated for role menus and the three error messages

## Out of Scope

*   Password or PIN reset
*   Editing a worker's name, PIN, or role after they are added
*   Turning an account back on
*   Customer, supplier, item, order, inventory, and shipping screens (Features 2–8)
