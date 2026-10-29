# Feature Specifications

Spec-driven development (SDD) source of truth for **this** application.  
No application code may be written unless it maps to a requirement in one of these files.

**Methodology:** [framework.md](./framework.md) — how to write, trace, and ship feature specs.  
**Student guide (requirements):** [writing-feature-requirements.md](./writing-feature-requirements.md) — stories, FRs, initial data model, Gherkin AC.  
**Student guide (design):** [writing-feature-design.md](./writing-feature-design.md) — ownership, API, screens, test map, DoD, out of scope.  
**Student guide (living reference):** [reference/writing-living-reference.md](./reference/writing-living-reference.md) — update api / data-model / behavior in the same PR.

*(Examples in the writing guides often cite the OC CS Speckit Todo sample app — use them as patterns for your product.)*

**Sprints** live in your agile tool — they are **not** part of these specs.

## Feature catalog

| ID | File | Branch | Depends on |
|----|------|--------|------------|
| 1 | [feature-1-staff-login-access.md](./feature-1-staff-login-access.md) | `feature/1-staff-login-access` | — |
| 2 | [feature-2-customer-management.md](./feature-2-customer-management.md) | `feature/2-customer-management` | Feature 1 |
| 3 | [feature-3-supplier-management.md](./feature-3-supplier-management.md) | `feature/3-supplier-management` | Feature 1 |
| 4 | [feature-4-item-product-catalog-management.md](./feature-4-item-product-catalog-management.md) | `feature/4-item-product-catalog-management` | Feature 1, Feature 3 |
| 5 | [feature-5-supplier-ordering-receiving.md](./feature-5-supplier-ordering-receiving.md) | `feature/5-supplier-ordering-receiving` | Feature 1, Feature 3, Feature 4 |
| 6 | [feature-6-customer-order-management.md](./feature-6-customer-order-management.md) | `feature/6-customer-order-management` | Feature 1, Feature 2, Feature 4 |
| 7 | [feature-7-inventory-count-adjustment.md](./feature-7-inventory-count-adjustment.md) | `feature/7-inventory-count-adjustment` | Feature 1, Feature 4 |
| 8 | [feature-8-shipping-delivery.md](./feature-8-shipping-delivery.md) | `feature/8-shipping-delivery` | Feature 1, Feature 6 |

New features: follow [framework.md](./framework.md#feature-spec-template) — **Status**, **Input**, **FR-00N**, **SC-00N**, **Key Entities**, Gherkin, **Agent implementation request**, **Definition of Done**.

**Branch roles:** `main` = scaffold-only starter kit · `dev` = integration · `feature/N-*` = feature work (branch from `dev`).

## Living reference

Keep snapshots in sync when schema, API, or product rules change — **in the same PR as implementation** (required DoD; see [Merge checklist + Agility sync](./framework.md#merge-checklist--agility-sync)). Each `feature-N-*.md` includes an **Agent implementation request** block so Cursor updates reference during implementation ([framework.md](./framework.md#agent-implementation-request)). Spec evolution after merge: [prefer a new feature delta](./framework.md#spec-evolution-after-merge).

| File | Purpose |
|------|---------|
| [reference/README.md](./reference/README.md) | How to maintain reference docs |
| [reference/writing-living-reference.md](./reference/writing-living-reference.md) | Student guide — writing/updating living reference |
| [reference/data-model.md](./reference/data-model.md) | Current database tables (update in feature PR when schema changes) |
| [reference/api.md](./reference/api.md) | Current REST API (update in feature PR when API changes) |
| [reference/behavior.md](./reference/behavior.md) | Current product rules (update in feature PR when rules change) |

## Design draft

This branch (`design-draft`) adds design sections to each feature: Assumptions, Edge Cases, Success Criteria, Data Ownership, API Requirements, Screen Requirements, Definition of Done, and Out of Scope. Test Coverage Map and the Agent implementation request are not part of this draft.

Features 2, 4, 5, 6, and 7 had empty files on the requirements branch. Those files now include the requirements and the design so later features have something to depend on.

Screen pictures: [docs/ui/README.md](../docs/ui/README.md).  
C4 diagrams: [docs/architecture/README.md](../docs/architecture/README.md).

## Related

- Cursor rules: `.cursor/rules/`
- ADRs: `docs/adr/`
- Quality attributes (NFRs): `docs/nfr/`
- UI screens: `docs/ui/`
- C4 diagrams: `docs/architecture/`
- Starter kit notes: `docs/STARTER-KIT.md`