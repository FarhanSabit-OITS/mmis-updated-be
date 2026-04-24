# Postman Collection Comparative Analysis

This report compares the three versions of the `Infinate Citadel-Nexgen` Postman collection found in the `tmp` directory.

## Collection Versions

| File Name | Size | Modules Covered | Recommendation |
| :--- | :--- | :--- | :--- |
| `(1).json` | 37 KB | Auth, Menu, Supplier, Order (Base) | **Redundant** |
| `(2).json` | 69 KB | + Citadel-Branch, Citadel-Part | **Redundant** |
| [postman_collection.json](file:///c:/FTS/JAN26-OITS/Infinet_OITS/OITS_POC/Infinate%20Citadel-Nexgen.postman_collection.json) (Latest) | 70 KB | + Citadel-Stock, Citadel-Transaction | **Keep as Primary** |

## Module Deep Dive

### 1. `Infinate Citadel-Nexgen... (1).json`
- **Focus**: Initial Casdoor Auth integration and basic GraphQL CRUD for Menu Items and Orders.
- **Missing**: No support for Branch management, Part numbering (UUID conversion), or Stock movements.

### 2. `Infinate Citadel-Nexgen... (2).json`
- **Improvements**: Adds complete GraphQL suites for `Citadel-Branch` and `Citadel-Part`.
- **Missing**: Missing the latest `Citadel-Stock` and `Citadel-Transaction` logic required for the inventory module.

### 3. `Infinate Citadel-Nexgen.postman_collection.json` (Latest)
- **Status**: The most comprehensive and updated version.
- **Additions**: Includes refined GraphQL queries for Stock levels and Transaction history, matching the latest backend schema optimizations.

## Proposal & Justification
**Keep**: `Infinate Citadel-Nexgen.postman_collection.json`
**Justification**: It contains the superset of all endpoints found in the other two versions. Keeping the older versions creates confusion during API testing, as they lack the latest inventory and stock modules.

**Action**: Move `(1).json` and `(2).json` to `tmp/redundants`.
