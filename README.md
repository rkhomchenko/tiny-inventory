# Tiny Inventory System

A production-ready inventory management system tracking stores and products. Built with TypeScript, Fastify, PostgreSQL, and React.

## Quick Start

```bash
# Start everything with Docker
docker compose up --build

# Access:
# - Frontend: http://localhost:80
# - Backend API: http://localhost:3000
# - Health check: http://localhost:3000/health
```

The system automatically seeds the database with 5 stores and 20 products on startup.

## API Overview

```
POST   /api/auth/token                           # Generate JWT token
GET    /api/stores                               # List all stores
GET    /api/stores/:id                           # Get store details
GET    /api/stores/:storeId/inventory            # Get store inventory (filterable, paginated)
POST   /api/stores/:storeId/inventory            # Add product to store
GET    /api/products                             # List products (filterable, paginated)
POST   /api/products                             # Create product
GET    /api/products/:id                         # Get product details
```

All `GET` requests are public. `POST/PUT/DELETE` require JWT token in `Authorization: Bearer <token>` header.

## Decisions & Trade-offs

### 1. Data Model: Normalized Many-to-Many with Junction Table

**Architecture Decision:** Store ↔ Inventory ↔ Product (products are global entities)

```
Store (1) ──── (Many) Inventory ──── (Many) Product
```

**Why this design:**
- **Products are shared:** "iPhone 15" exists once globally, tracked separately in each store's inventory
- **Inventory is the relationship:** Junction table stores `store_id`, `product_id`, `quantity`
- **Prevents duplication:** One product definition prevents inconsistent data (different prices/names per store)
- **Enables analytics:** Can query "which stores carry this product" or "what's the total value across all stores"

**Composite unique constraint:** `(store_id, product_id)` prevents duplicate inventory entries

**Alternative considered:** Store-specific products (embedded model)
```
Store → Products (embedded array)
```
- **Rejected because:** Products should be globally defined - "iPhone 15" is the same product everywhere
- **Rejected because:** Can't query "show me all stores with iPhone 15" efficiently
- **Rejected because:** Duplicate product definitions lead to data inconsistency

**Trade-offs:**
- **Pro:** Normalized data - single source of truth for product definitions
- **Pro:** Easy to add new stores carrying existing products
- **Con:** More joins required (3-way join for "get products in store")
- **Con:** Slightly more complex queries than embedded model

**Decision:** Normalization > query simplicity. Data integrity matters more than query convenience.

---

### 2. Architecture: 4-Layer Service Pattern

**Layers:** Routes → Handlers → Services → Entities

```
┌─────────────────────────────────────────────┐
│  Routes (endpoint definitions + schemas)    │  ← API contract
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│  Handlers (request/response mapping)        │  ← I/O boundary
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│  Services (business logic)                  │  ← Core domain
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│  Entities (ORM models)                      │  ← Persistence
└─────────────────────────────────────────────┘
```

**Why 4 layers instead of 2 (controllers + models):**

**1. Routes layer** - API contract definition
- Defines URL structure, HTTP methods, request/response schemas
- Single place to see "what does this endpoint accept and return"
- Makes API documentation generation easy (can generate OpenAPI from schemas)

**2. Handlers layer** - I/O boundary
- Extracts parameters from HTTP request (`request.params.id`, `request.body`)
- Calls service with extracted data
- Formats service response as HTTP response (status codes, headers)
- **Thin layer** - no business logic

**3. Services layer** - Business logic
- Core domain operations: validation, business rules, data transformations
- **Stateless** - instantiated per request with forked EntityManager
- **Easily testable** - pure TypeScript functions, no HTTP concerns
- Throws domain errors (`NotFoundError`, `ConflictError`)

**4. Entities layer** - Data model
- ORM entities with relationships, constraints, indexes
- Database schema representation

**Alternative considered:** Fat controllers (routes + handlers + services in one)
```typescript
// All in one file - easier to follow
app.post('/products', async (req, reply) => {
  // Validation
  if (!req.body.name) throw new Error('Name required');

  // Business logic
  const existing = await em.findOne(Product, { name: req.body.name });
  if (existing) throw new Error('Duplicate');

  // Persistence
  const product = em.create(Product, req.body);
  await em.flush();

  reply.send(product);
});
```

**Why this was rejected:**
- **Hard to test:** Must mock HTTP request/response objects
- **Mixed concerns:** HTTP logic intertwined with business logic
- **Hard to reuse:** Can't call business logic from CLI, cron jobs, or other services
- **Harder to maintain:** 200-line controller files vs 50-line focused services

**Trade-offs:**
- **Pro:** Clear separation - each layer has one responsibility
- **Pro:** Services testable without HTTP mocking
- **Pro:** Business logic reusable (can call from CLI scripts, background jobs)
- **Con:** More files (4 per feature vs 1-2 for fat controllers)
- **Con:** More indirection - have to trace through layers to follow code
- **Con:** More boilerplate - handler methods just call service methods

**Decision:** Maintainability + testability > initial development speed. This pattern scales better as codebase grows.

---

### 3. Pagination Strategy: Offset-Based vs Cursor-Based

**Chose:** Offset-based (`?page=1&limit=20`)

```sql
-- Offset pagination
SELECT * FROM products
ORDER BY created_at DESC
LIMIT 20 OFFSET 40;  -- Page 3 (skip first 40)
```

**Why offset over cursor:**

**1. User expectations:** Users expect "Go to page 5" button
- Offset allows arbitrary page jumps
- Cursor-based only allows "Next"/"Previous"

**2. Simpler implementation:**
```typescript
// Offset - simple math
const offset = (page - 1) * limit;
const products = await em.find(Product, {}, { limit, offset });
```

```typescript
// Cursor - more complex
const products = await em.find(Product, {
  createdAt: { $lt: cursor }  // Find records after cursor
}, { limit, orderBy: { createdAt: 'DESC' } });
```

**3. Sufficient for scale:** Works well for < 100k records per query
- Most queries filter (by category, store) - reduces dataset size
- Pagination used for UI display, not bulk processing

**Alternative: Cursor-based pagination**
```
GET /products?after=2024-01-15T10:30:00Z&limit=20
```

**Cursor benefits:**
- **Performance:** No matter how deep, always scans O(limit) rows
  - `created_at > '2024-01-15'` uses index directly
  - `OFFSET 10000` must scan 10,000 rows then take next 20
- **Consistency:** Adding/removing items doesn't cause duplicates or skips
  - Offset: If item deleted on page 1, page 2 shows duplicate from page 1
  - Cursor: Always consistent based on timestamp

**Why cursor was rejected:**
- **Can't jump to page N** - only "next" and "previous"
- **Poor UX for small datasets** - "1 2 3 4 5" pagination is intuitive
- **Overkill for this scale** - inventory system unlikely to have millions of products

**Trade-offs:**
- **Pro:** Simple to implement and understand
- **Pro:** Allows page number UI (1, 2, 3, 4, 5...)
- **Pro:** Familiar pattern for most developers
- **Con:** Performance degrades with large offsets (OFFSET 10000 is slow)
- **Con:** Phantom reads - data changes between requests cause inconsistencies
- **Con:** Not ideal for infinite scroll UIs

**Decision:** UX + simplicity > performance at scale. If dataset grows beyond 100k records, migrate to cursor-based.

---

### 4. UUID vs Auto-increment Primary Keys

**Chose:** UUIDs for all entity IDs

```typescript
@PrimaryKey({ type: 'uuid' })
id: string = v4();  // "a3bb189e-8bf9-4f4c-8e1f-3e6c8e90e1a7"
```

**Security implications:**

**Sequential IDs leak information:**
```
POST /stores → { "id": 42 }
POST /stores → { "id": 43 }
POST /stores → { "id": 44 }
```
- **Enumeration attack:** Attacker can guess valid IDs (try 1, 2, 3, 4...)
- **Information leakage:** ID 1000 means ~1000 total records
- **Competitive intelligence:** Order ID incrementing by 100/day = ~100 orders/day

**UUIDs prevent this:**
```
POST /stores → { "id": "a3bb189e-8bf9-4f4c-8e1f-3e6c8e90e1a7" }
```
- **No enumeration:** Can't guess valid IDs
- **No information leakage:** Can't infer total record count
- **Globally unique:** Safe to merge databases from multiple sources

**Distributed systems benefits:**
- **Client-side generation:** Can create ID before database insert
- **No ID collisions:** Can insert into multiple databases, then merge
- **No coordination needed:** No "next ID" counter to synchronize

**Performance implications:**

**Index size:**
- UUID: 16 bytes per ID
- BIGINT: 8 bytes per ID
- INT: 4 bytes per ID
- **Impact:** Larger indexes = more disk I/O, less cache-friendly

**Join performance:**
```sql
-- UUID join (16-byte comparison)
SELECT * FROM inventory i
JOIN products p ON i.product_id = p.id;

-- INT join (4-byte comparison)
-- Slightly faster, but difference negligible for < 1M records
```

**Insert performance:**
- **UUIDs are random** - can cause B-tree index fragmentation
- **Sequential IDs** - always append to end of index (faster)
- **Impact:** Marginal for typical workload (< 1000 inserts/sec)

**Trade-offs:**
- **Pro:** Security - no enumeration or information leakage
- **Pro:** Distributed systems - no coordination needed
- **Pro:** Flexibility - can generate IDs anywhere (client, server, lambda)
- **Con:** Larger indexes (~4x size of INT)
- **Con:** Slower joins (marginal)
- **Con:** Less human-readable (hard to debug "product a3bb189e")

**Decision:** Security + scalability > minor performance cost. For inventory system, security and future-proofing matter more than microsecond query optimization.

---

### 5. Raw SQL for Analytics Aggregations

**Pattern:** Use ORM for CRUD, raw SQL for complex aggregations

```typescript
// src/services/analytics.service.ts
const statsQuery = `
  SELECT
    COUNT(DISTINCT i.product_id) as total_products,
    COALESCE(SUM(i.quantity), 0) as total_units,
    COALESCE(SUM(i.quantity * p.price), 0) as total_value,
    COALESCE(AVG(i.quantity), 0) as average_stock_per_product
  FROM inventory i
  INNER JOIN product p ON i.product_id = p.id
  WHERE i.store_id = $1
`;
const result = await connection.execute(statsQuery, [storeId]);
```

**Why raw SQL instead of ORM query builder:**

**1. Readability - SQL is more expressive for complex queries:**
```typescript
// ORM query builder (MikroORM)
const products = await em.createQueryBuilder(Inventory, 'i')
  .select(['COUNT(DISTINCT i.product) as total_products'])
  .addSelect(['SUM(i.quantity) as total_units'])
  .leftJoin('i.product', 'p')
  .addSelect(['SUM(i.quantity * p.price) as total_value'])
  .where({ 'i.store': storeId })
  .execute();

// Raw SQL - more concise and clearer
const query = `SELECT COUNT(DISTINCT product_id), SUM(quantity), SUM(quantity * price) FROM inventory WHERE store_id = $1`;
```

**2. Performance - database performs aggregation, not application:**
```typescript
// BAD - Application-side aggregation
const inventory = await em.find(Inventory, { store: storeId }, { populate: ['product'] });
let totalValue = 0;
for (const item of inventory) {
  totalValue += item.quantity * item.product.price;  // N queries + calculation
}

// GOOD - Database aggregation (one query)
SELECT SUM(i.quantity * p.price) FROM inventory i JOIN product p ...
```

**3. Handles edge cases correctly:**
```sql
COALESCE(SUM(quantity), 0)  -- Returns 0 if no rows (not NULL)
COUNT(DISTINCT product_id)   -- Prevents double-counting
```

**Trade-offs:**
- **Pro:** Performance - single query instead of multiple
- **Pro:** Database does aggregation (optimized, uses indexes)
- **Pro:** More readable for complex queries
- **Con:** Lose type safety - results are `any`, must manually cast
  ```typescript
  const stats = result[0];  // `any` type
  const totalProducts = parseInt(stats.total_products, 10);  // Manual casting
  ```
- **Con:** Database portability - PostgreSQL-specific SQL syntax
- **Con:** Harder to test - can't easily mock raw SQL queries

**Decision:** Performance + readability > type safety for read-heavy analytics endpoints. CRUD operations still use ORM (type-safe, portable).

---

### 6. Technology Choices (Brief Summary)

**Database:** PostgreSQL (relational data, ACID, aggregations)
**ORM:** MikroORM (migrations, decorator entities, raw SQL support)
**Framework:** Fastify (performance, TypeScript, built-in validation)
**Validation:** TypeBox (JSON Schema native, type generation)
**Frontend:** React + React Router (minimal tooling, focused on backend)
**Containerization:** Docker Compose (easy local setup, multi-service orchestration)

## If I Had More Time

1. **Add comprehensive testing**
   - Unit tests for service layer with Vitest
   - Integration tests for API endpoints using Fastify's `inject()` method
   - E2E tests with Playwright for critical user flows
   - Test database operations with testcontainers for PostgreSQL

2. **Improve reliability and performance**
   - Deploy in cluster mode using PM2 or Node.js cluster module for multi-core utilization
   - Add connection pooling tuning and query optimization based on real load patterns
   - Implement rate limiting and request throttling per client

3. **Add observability**
   - Structured logging with correlation IDs across requests
   - Monitoring with Prometheus metrics (request duration, error rates, DB query time)
   - Distributed tracing with OpenTelemetry for debugging production issues

4. **Improve developer experience**
   - ESLint + Prettier with strict rules
   - Git hooks with lint-staged and husky to enforce linting before push
   - Pre-commit hooks to prevent commits with console.logs or debugging code

## Architecture

**Backend:** TypeScript + Fastify + MikroORM + PostgreSQL
**Frontend:** React + TypeScript + Vite
**Infrastructure:** Docker Compose with multi-stage builds

**Data Model:**
```
Store (1) ──── (Many) Inventory ──── (Many) Product
```

Products are global entities. Inventory creates the many-to-many relationship with quantity tracking.

## Project Focus

**Backend-focused implementation.** The backend demonstrates production-ready patterns: layered architecture, comprehensive error handling, schema validation, authentication middleware, and database relationship management. The frontend provides functional UI but was not the primary focus.
