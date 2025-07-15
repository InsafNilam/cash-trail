# 💸 CashTrail

**CashTrail** is a personal finance tracker that helps users effortlessly track their income and expenses with a beautiful UI and robust backend.

## 🚀 Tech Stack

- **Next.js** (App Router)
- **Prisma ORM**
- **Clerk** (Authentication)
- **SQLite (dev)** → **PostgreSQL (prod via Vercel)**
- **Tailwind CSS + ShadCN UI**
- **Zod** (Validation)
- **@tanstack/react-query**
- **@tanstack/react-table**
- **Recharts** (Data visualization)
- **Server Actions** for mutations
- **App Router API routes** for queries

## 📦 Project Structure

- `src/app/api/...` → REST API routes (GET)
- Server actions handle Create/Update/Delete
- Prisma client generated to `src/generated/prisma`

## 🧠 Data Models

### Prisma Schema Highlights

```prisma
model UserSettings {
  userId   String @id
  currency String
}

model Category {
  name      String
  userId    String
  icon      String
  type      String @default("income")
  createdAt DateTime @default(now())

  @@unique([name, userId, type])
}

model Transaction {
  id           String   @id @default(uuid())
  createdAt    DateTime @default(now())
  updatedAt    DateTime @default(now())
  amount       Float
  description  String
  date         DateTime
  userId       String
  type         String   @default("income")
  category     String
  categoryIcon String
}

model MonthHistory {
  userId  String
  day     Int
  month   Int
  year    Int
  income  Float
  expense Float

  @@id([day, month, year, userId])
}

model YearHistory {
  userId  String
  month   Int
  year    Int
  income  Float
  expense Float

  @@id([month, year, userId])
}
```

> **Note**: User accounts are handled by **Clerk**.

---

## 📊 Aggregation Strategy

When a transaction is created, updated, or deleted, aggregate tables (`MonthHistory`, `YearHistory`) are updated in the same transaction to keep monthly/yearly summaries in sync:

```ts
await prisma.$transaction([
  // Respective Database Operation for transaction management
  prisma.monthHistory.upsert(...),
  prisma.yearHistory.upsert(...),
]);
```

This approach is **type-safe** and **consistent**, though it may require optimization as data volume increases.

---

## 🛠 Local Development

### SQLite for Dev

In `schema.prisma`:

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

### Prisma Setup

```bash
npx prisma init                    # Initialize Prisma
npx prisma migrate dev --name init # Apply migrations
npx prisma generate                # Generate Prisma client
npx prisma studio                  # Optional: Visual schema explorer
```

---

## 🚀 Deploying to Vercel

### Step 1: Update `schema.prisma`

Switch to PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
  url       = env("POSTGRES_PRISMA_URL")
  directUrl = env("POSTGRES_URL_NON_POOLING")
}
```

### Step 2: Add Prisma postinstall Hook

```json
// package.json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### Step 3: Vercel Setup

1. After making the above changes, push your updates to the GitHub repository so Vercel can access and deploy the latest version of your application.
2. Go to your [Vercel dashboard](https://vercel.com).
3. In the **Storage** tab, create a **PostgreSQL** database.
4. Create a new project in Vercel by connecting your GitHub repository and granting the necessary access.
5. Copy the PostgreSQL environment variables from your Vercel dashboard and add them to both Vercel’s Project Environment Variables and the local .env file of your project to ensure proper configuration during deployment.

### Step 4: Prepare Migrations

```bash
# Optional cleanup
rm -rf prisma/migrations
rm prisma/dev.db

# Recreate initial migration
prisma migrate dev --name init
```

Once the above steps are completed, your application will be successfully deployed on Vercel and should function as expected.

---

## 📁 .env Setup

Create a \`.env.local\` for development (PostgreSQL database \`.env.local\`) and make sure it includes the correct database connection string:

```env
POSTGRES_PRISMA_URL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."
```

---

## 🧪 Useful Commands

```bash
npx prisma db pull         # Introspect DB
npx prisma generate        # Regenerate client
npx prisma migrate dev     # Run migrations in dev
npm run dev                # Run development env
```

---

## 🎯 Features

- ✅ User authentication with Clerk
- ✅ Category-based income/expense tracking
- ✅ Daily/Monthly/Yearly aggregations
- ✅ Beautiful UI with Tailwind + ShadCN
- ✅ Type-safe APIs with Zod + Prisma
- ✅ Fast queries using react-query
- ✅ Charts with Recharts

---

## 📌 Roadmap

- [ ] Add recurring transactions
- [ ] Add budget limits and warnings
- [ ] Export to CSV
- [ ] Insights & Recommendations

---

## 📃 License

MIT — feel free to use, modify, and deploy 🚀

---

> Built with 💙 by Insaf Nilam
