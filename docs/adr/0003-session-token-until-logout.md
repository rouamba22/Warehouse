# ADR-0003: Session token until logout

**Status:** Accepted
**Date:** 2026-10-28
**Deciders:** Warehouse design draft

## Context

Feature 1 says a worker logs in with Employee ID and PIN, stays logged in across a refresh, and is logged out only when they click **Log out**. A PIN must be stored as a hash. A shift can be long, so a short timeout would fight FR-009.

## Decision

Login checks the Employee ID and the bcrypt hash of the PIN. A success row in `sessions` holds a random token. The browser stores that token and sends `Authorization: Bearer <token>` on later calls. `GET /warehouse/session` is how a refresh proves the token is still valid.

The token does not expire on a timer. `POST /warehouse/logout` deletes that session row. Other devices keep their own sessions.

A wrong PIN and an unknown Employee ID both return `401` with `Invalid Employee ID or PIN.` A turned-off account returns `403` with `This account has been deactivated.` The API never returns `pin`.

## Consequences

### Positive
- Refresh does not ask for the PIN again.
- The database does not hold the plain PIN.
- Logout on one device does not kick off a second device.

### Negative / tradeoffs
- A stolen token works until logout, because there is no timeout. That matches FR-009. Workers must log out at the end of a shift.
- Lost PIN reset is out of scope. A Manager cannot set a new PIN in Feature 1.

## Alternatives considered

| Option | Why not |
|--------|---------|
| JWT with a one-hour expiry | Feature 1 says the login must not time out by itself. |
| Session cookie only | A bearer token matches the starter kit auth notes and is easy to send from Vue. |
| Store the PIN in plain text | Feature 1 FR-008 forbids it. |

## Related artifacts

- Feature spec: `features/feature-1-staff-login-access.md`
- Cursor rule: `.cursor/rules/api-conventions.mdc`
- NFR: Security in `docs/nfr/quality-attributes.md`
