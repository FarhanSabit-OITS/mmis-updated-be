# MarketMasterApi

Backend APIs for MarketMasterERP

## Project Structure

```bash
MarketMasterApi/
│── prisma/
│   └── schema.prisma        # Prisma models & DB schema
│
│── src/
│   ├── index.js             # Express server entry point
│   ├── routes/
│   │   └── auth.routes.js   # Authentication routes
│   ├── controllers/
│   │   └── auth.controller.js  # Controller logic (register/login)
│   └── middlewares/         # (Reserved for future)
│
│── .env                     # Environment variables (ignored by Git)
│── package.json
│── README.md
```

## How to run

1 Install dependencies

```bash
npm install
```

2 Generate Prisma Client

```bash
npx prisma generate
```

3 Apply initial database migrations

```bash
npx prisma migrate dev --name init_user
```

4 Start the development server

```bash
npm run dev
```

or

```bash
npm start
```

Server should run at:

```bash
http://localhost:5000
```
