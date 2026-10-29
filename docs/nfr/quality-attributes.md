# Quality attributes

App-wide non-functional targets for **this** product.

**Teaching policy:** Specs say *what* to build. This table says *how good* the system should be. Only **Accepted** rows (and feature **Requirements (FR-00N)** / **Success Criteria (SC-00N)**) constrain implementation. **Deferred** is the quality backlog / example. **Out of scope** is what not to build. See [`.cursor/rules/quality-attributes.mdc`](../../.cursor/rules/quality-attributes.mdc).

## Column meanings

| Column | Meaning |
|--------|---------|
| **Target** | Measure or bar — prefer a **number**. Illustrative until Status is **Accepted** and tests enforce it. |
| **Approach** | How the target is realized or limited |
| **Status** | **Accepted** / **Accepted (minimal)** / **Deferred** / **Out of scope** (see below) |
| **Links** | ADR (why), Cursor rule (how), code path, or **—** |

## Status values

| Status | Meaning |
|--------|---------|
| **Accepted** | In force — do not regress |
| **Accepted (minimal)** | Thin bar in force — do not expand |
| **Deferred** | Documented example — not a coding requirement unless a feature spec says so |
| **Out of scope** | Do not invent |

## Links column

| Link type | When |
|-----------|------|
| ADR | Approach decision |
| Cursor rule | Day-to-day agent/code constraint |
| Code path | Concrete implementation |
| **—** | No artifact yet |

| Attribute | Target | Approach | How we verify | Status | Links |
|-----------|--------|----------|---------------|--------|-------|
| **Security** | **100%** of routes except `POST /warehouse/login` require a session token. **0** API responses return a PIN, and non-Manager responses do not return customer address, phone, billing terms, supplier terms, or item unit cost. | Role check on the server ([ADR-0002](../adr/0002-role-based-shared-warehouse-data.md)). PIN stored as a bcrypt hash. Token has no timer ([ADR-0003](../adr/0003-session-token-until-logout.md)). Wrong role returns `403` with `You do not have permission to perform this action.` | Each feature's Gherkin permission scenario. Response bodies checked for omitted fields. | Accepted | [ADR-0002](../adr/0002-role-based-shared-warehouse-data.md), [ADR-0003](../adr/0003-session-token-until-logout.md), [Feature 1](../../features/feature-1-staff-login-access.md) |
| **Reliability** | Quantity on hand changes only from a receive, a finished pick, or a count. An order line is rejected when quantity ordered is greater than quantity on hand. | [ADR-0004](../adr/0004-inventory-quantity-changes.md). Item PUT ignores `qtyOnHand`. | Feature 5, 6, and 7 scenarios for quantity before and after. | Accepted | [ADR-0004](../adr/0004-inventory-quantity-changes.md) |
| **Availability** | The class demo runs on one machine for a lab session. No uptime number beyond that. | Single Node process and one MySQL database. See the deployment diagram. | Manual demo of login through shipping. | Accepted (minimal) | [C4 deployment](../architecture/c4-deployment.drawio) |
| **Performance** | Local API calls complete in **&lt; 1 s** for a list under **500** rows. | No extra services. Lists are the current tables, not a search engine. | Manual timing during the demo. | Accepted (minimal) | [ADR-0001](../adr/0001-vue-express-mysql-stack.md) |
| **Observability** | Unhandled server errors are logged. No 7-day log store is required for class. | winston + morgan from the starter kit. | A failed request leaves a log line. | Accepted (minimal) | `.cursor/rules/api-conventions.mdc` |
| **Usability** | A logged-in worker sees only their menu. Button labels match the feature specs (**Log in**, **Log out**, **Add worker**, **Place order**, **Finish pick**, **Mark delivered**). Error text matches the Gherkin sentence. | One screen per job step. Pictures in `docs/ui/`. | Compare each screen to its feature Screen Requirements. | Accepted | [UI index](../ui/README.md) |
| **Accessibility (a11y)** | Form fields have visible labels. No WCAG audit in this draft. | Labels are written in Screen Requirements. | Read the screen pictures and the spec labels. | Deferred | [UI index](../ui/README.md) |
| **Internationalization (i18n)** | **1** locale: English. | Copy is the English sentences in the feature specs. | — | Out of scope | — |
| **Maintainability** | Each feature lists its routes, tables, and done checklist. `npm test` is green before an implementation merge. | Specs in `features/` are the source of truth. This design draft does not include a Test Coverage Map. | Definition of Done on the feature. `npm test` when the feature is built. | Accepted | [framework.md](../../features/framework.md), [features/README.md](../../features/README.md) |

---

## Feature-local NFRs

If only one feature needs a bar:

1. Put it in that feature’s **Requirements (FR-00N)** or **Success Criteria (SC-00N)**.
2. Add Gherkin when tests must prove it.
3. Optionally link from a row here (“see Feature N **FR-00N** / **SC-00N**”).

See [feature spec template](../../features/framework.md#feature-spec-template) in the teaching repo.

---

## Changing a bar

1. Edit **Target**, **Approach**, **Status**, **Links**. Prefer a number in **Target**.
2. **Approach** change → [ADR](../adr/README.md); add to **Links**.
3. Agent coding constraint → `.cursor/rules/`; add to **Links**.
4. API/schema change → `features/reference/` in the same feature PR ([Agent implementation request](../../features/framework.md#agent-implementation-request)).
5. **Deferred** → **Accepted** only with matching verification.
