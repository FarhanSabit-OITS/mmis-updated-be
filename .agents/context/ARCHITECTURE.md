# Project Architecture

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (managed via Prisma ORM)
- **Frontend**: React / Next.js (MarketMasterERP)
- **Validation**: Zod / Joi

## Directory Structure Rules (Backend)
- `/src/routes/`: Defines API endpoints and attaches middleware/controllers. No business logic here.
- `/src/controllers/`: Handles HTTP requests/responses, extracts parameters, and calls services.
- `/src/services/`: Contains all core business logic and database interactions.
- `/src/middlewares/`: Reusable request interception (auth, logging, validation).
- `/src/utils/`: Pure helper functions.

## Data Flow
Request -> Route -> Middleware (Auth/Validation) -> Controller -> Service (Prisma DB Call) -> Controller -> Response
