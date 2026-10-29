# C4 diagrams

Draw.io files for the warehouse design draft. Open each `.drawio` file in [diagrams.net](https://app.diagrams.net) (Draw.io). The same three views are drawn below in Mermaid so they can be read on GitHub.

| View | File |
|------|------|
| System Context | [c4-context.drawio](c4-context.drawio) |
| Container | [c4-container.drawio](c4-container.drawio) |
| Deployment | [c4-deployment.drawio](c4-deployment.drawio) |

Decisions behind the boxes: [ADR-0001](../adr/0001-vue-express-mysql-stack.md), [ADR-0002](../adr/0002-role-based-shared-warehouse-data.md).

## System Context

```mermaid
C4Context
  title Warehouse System Context
  Person(staff, "Warehouse staff", "Manager, Office Staff, Warehouse Worker, Driver")
  System(wh, "Warehouse System", "Staff login, customers, suppliers, items, orders, inventory, and shipping")
  System_Ext(outside, "Customers and suppliers", "Not users. Their records are typed in by staff.")
  Rel(staff, wh, "Uses", "Browser")
  Rel(wh, outside, "Stores records about")
```

## Container

```mermaid
C4Container
  title Warehouse Containers
  Person(staff, "Warehouse staff", "Uses the screens for their role")
  Container(spa, "Web app", "Vue 3, Vuetify", "Screens in docs/ui")
  Container(api, "API", "Node, Express, Sequelize", "Routes under /warehouse")
  ContainerDb(db, "Database", "MySQL", "staff, customers, suppliers, items, orders, inventory")
  Rel(staff, spa, "Uses")
  Rel(spa, api, "JSON, Bearer token", "HTTPS")
  Rel(api, db, "Reads and writes")
```

## Deployment

```mermaid
C4Deployment
  title Warehouse Deployment (class)
  Deployment_Node(pc, "Staff PC", "Browser") {
    Container(spa, "Web app", "Vue", "Runs in the browser")
  }
  Deployment_Node(host, "Class server", "One machine") {
    Container(api, "API process", "Node", "Express on /warehouse")
    ContainerDb(db, "MySQL", "MySQL", "One database")
  }
  Rel(spa, api, "HTTPS JSON")
  Rel(api, db, "SQL")
```
