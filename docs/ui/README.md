# Warehouse screens

Wireframe pictures for the design draft. Each picture is the screen named in that feature's Screen Requirements. Open the `.svg` file to see the layout.

The pictures use the same button names and field names as the Gherkin scenarios.

| Screen | Picture | Feature |
|--------|---------|---------|
| Login | [login.svg](login.svg) | [Feature 1](../../features/feature-1-staff-login-access.md) |
| Home (Manager) | [home-manager.svg](home-manager.svg) | [Feature 1](../../features/feature-1-staff-login-access.md) |
| Home (Driver) | [home-driver.svg](home-driver.svg) | [Feature 1](../../features/feature-1-staff-login-access.md) |
| Staff | [staff.svg](staff.svg) | [Feature 1](../../features/feature-1-staff-login-access.md) |
| Customers | [customers.svg](customers.svg) | [Feature 2](../../features/feature-2-customer-management.md) |
| Suppliers | [suppliers.svg](suppliers.svg) | [Feature 3](../../features/feature-3-supplier-management.md) |
| Items | [items.svg](items.svg) | [Feature 4](../../features/feature-4-item-product-catalog-management.md) |
| Supplier order | [supplier-order.svg](supplier-order.svg) | [Feature 5](../../features/feature-5-supplier-ordering-receiving.md) |
| Receive | [receive.svg](receive.svg) | [Feature 5](../../features/feature-5-supplier-ordering-receiving.md) |
| Customer order | [customer-order.svg](customer-order.svg) | [Feature 6](../../features/feature-6-customer-order-management.md) |
| Pick | [pick.svg](pick.svg) | [Feature 6](../../features/feature-6-customer-order-management.md) |
| Inventory count | [inventory.svg](inventory.svg) | [Feature 7](../../features/feature-7-inventory-count-adjustment.md) |
| Shipping (Office) | [shipping-office.svg](shipping-office.svg) | [Feature 8](../../features/feature-8-shipping-delivery.md) |
| My deliveries (Driver) | [shipping-driver.svg](shipping-driver.svg) | [Feature 8](../../features/feature-8-shipping-delivery.md) |

## Screen flow

1. **Log in** (`/login`) goes to **Home** (`/`).
2. The home menu follows the job role from Feature 1.
3. Manager can open Staff, Customers, Suppliers, Items, Supplier orders, Customer orders, Inventory, and Shipping.
4. Office Staff opens Customer orders and Shipping.
5. Warehouse Worker opens Items (no cost), Receive, Pick, and Inventory.
6. Driver opens Shipping only and sees My deliveries.
7. **Log out** returns to **Log in**.
