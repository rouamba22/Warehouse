# ADR-0001: Vue, Express, and MySQL stack

**Status:** Accepted
**Date:** 2026-10-28
**Deciders:** Warehouse design draft

## Context

The class starter kit is a Vue frontend and a Node/Express/Sequelize backend with MySQL. The warehouse needs the same shape: a browser UI for four job roles and a server that checks those roles before it changes stock, orders, or staff.

The starter kit mounts routes at `/todo`. This product is not a todo list.

## Decision

Keep the starter kit stack: Vue 3 + Vuetify in the browser, Express 4 + Sequelize 6 on the server, MySQL for the database. Mount the warehouse API at `/warehouse` instead of `/todo`. The browser talks only to that API. It does not talk to MySQL.

## Consequences

### Positive
- The class scripts, tests, and folder layout still apply.
- One API prefix (`/warehouse`) is used in every feature spec.
- Role checks live on the server, so hiding a button is not the only protection.

### Negative / tradeoffs
- The `/todo` examples in the starter rules have to be read as `/warehouse` for this product.
- A single MySQL database is enough for the class. It is not a separate database per warehouse site.

## Alternatives considered

| Option | Why not |
|--------|---------|
| Leave the API mounted at `/todo` | The name would not match the warehouse and would confuse later features. |
| Let the Vue app read MySQL directly | The browser would hold database credentials and could skip role checks. |
| A different stack | The starter kit, tests, and Cursor rules already assume Vue, Express, and Sequelize. |

## Related artifacts

- Feature specs: all files in `features/feature-*.md`
- Cursor rules: `.cursor/rules/api-conventions.mdc`, `.cursor/rules/frontend-vue.mdc`
- NFR: Security and Maintainability in `docs/nfr/quality-attributes.md`
