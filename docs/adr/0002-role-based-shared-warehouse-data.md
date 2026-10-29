# ADR-0002: Role-based shared warehouse data

**Status:** Accepted
**Date:** 2026-10-28
**Deciders:** Warehouse design draft

## Context

The warehouse has one set of customers, suppliers, items, and orders. Workers do not each own a private copy. Feature 1 still says each job role only sees its own screens. Some fields are private even when the row is shared: customer address and billing, supplier terms, and item unit cost.

The todo starter kit hides another user's rows with `404`. That rule does not fit shared warehouse rows. A Driver who opens Supplier Management is not "missing a row." They are the wrong role.

## Decision

Treat warehouse records as shared. Authorize by role on every request.

- Wrong role: `403` and `{ "message": "You do not have permission to perform this action." }`
- Not logged in: `401`, and the UI sends the person to `/login`
- Missing row: `404` with the feature's not-found message
- A Driver asking for another driver's delivery: `404` and `No order found.` so the response does not reveal that the order exists

Private fields are omitted from the JSON for roles that must not see them. The UI also hides those fields and menu items. The API check is the one that counts.

## Consequences

### Positive
- The same error sentence in the Gherkin scenarios is the API `message`.
- Office Staff can take an order without receiving address, phone, or billing terms.
- Drivers get an address and items, not the customer name or phone.

### Negative / tradeoffs
- This is different from the todo kit's "404 for another user's row." Warehouse specs follow this ADR instead.
- Every new endpoint has to say which role may call it and which fields it returns.

## Alternatives considered

| Option | Why not |
|--------|---------|
| One row owner, like the todo lists | Orders and stock belong to the warehouse, not to one employee. |
| Hide menus only in Vue | A person can still call the URL. Feature 1 requires the direct link to be blocked. |
| `403` when a Driver opens another driver's delivery | That would tell them the order exists. `404` matches the privacy goal for that one case. |

## Related artifacts

- Feature specs: Feature 1 FR-005, Feature 2, Feature 3, Feature 4, Feature 6, Feature 8
- NFR: Security in `docs/nfr/quality-attributes.md`
