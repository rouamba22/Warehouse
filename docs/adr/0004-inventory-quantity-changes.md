# ADR-0004: Inventory quantity changes

**Status:** Accepted
**Date:** 2026-10-28
**Deciders:** Warehouse design draft

## Context

`items.qtyOnHand` is the number the warehouse trusts. If every screen could type a new quantity, receiving, picking, and cycle counts would not match the book. Feature 4 says quantity starts at 0 and is not edited on the item form.

## Decision

Only three actions may change `qtyOnHand`:

| Action | Feature | Effect |
|--------|---------|--------|
| Receive a supplier order | Feature 5 | Add `qtyReceived` |
| Finish a customer pick | Feature 6 | Subtract the line quantity |
| Save an inventory count | Feature 7 | Set quantity to the counted quantity when it differs |

The item PUT ignores `qtyOnHand` if a client sends it. A customer order that wants more than quantity on hand is rejected with `Not enough on hand.` A count that matches does not change the quantity, but it still saves a row. A count that differs requires a reason.

## Consequences

### Positive
- Stock changes have a source: a receive, a pick, or a count.
- The item screen cannot silently overwrite the book quantity.

### Negative / tradeoffs
- There is no partial receive and no partial pick in this draft. The whole order moves in one step.
- The last count wins if two workers count the same item. Both rows stay in `inventory_adjustments`.

## Alternatives considered

| Option | Why not |
|--------|---------|
| Let the Manager type quantity on the item form | Feature 4 FR-008 says not to. A typed quantity would skip the reason required by Feature 7. |
| Block the order and still allow a negative quantity | The warehouse should not promise goods it does not have. |
| Delete the old quantity with no history | Feature 7 needs the previous quantity, the counted quantity, and the reason. |

## Related artifacts

- Feature specs: Features 4, 5, 6, and 7
- NFR: Reliability in `docs/nfr/quality-attributes.md`
