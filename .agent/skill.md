# Skill: Backend Repository Analysis (Template)

> **Skill Type:** Engineering / Architecture / Security

> **Audience:** Backend Engineers, Tech Leads, Architects

> **Tools:** Antigravity / Copilot (Repo-aware AI)

---

## 1. Skill Overview

### Skill Name

**<SKILL_NAME>**

(e.g., “Comprehensive Backend Repo Analysis with Antigravity”)

### Skill Objective

Describe what this skill achieves in one paragraph.

Example:

> This skill provides a repeatable workflow to analyze an existing backend repository using Antigravity, producing architecture insight, API documentation, security findings, and a prioritized improvement plan.

---

## 2. When to Use This Skill

Use this skill when:

- ☐ Onboarding to an unfamiliar backend codebase
- ☐ Performing architecture or security review
- ☐ Preparing documentation for APIs or data models
- ☐ Planning refactors or modernization
- ☐ Auditing production or ERP systems

Do **not** use this skill for:

- Greenfield projects
- Frontend-only repositories
- Non-code artifacts

---

## 3. Supported Technology Scope

> ✅ Adjust this section per repository

- Runtime: <Node.js / Python / Java / etc.>
- Framework: <Express / FastAPI / Spring / etc.>
- ORM / Data Access: <Prisma / TypeORM / Hibernate / etc.>
- Auth: <JWT / OAuth / Session-based>
- Validation: <Zod / Joi / Pydantic>
- File handling: <Uploads / CSV / XLSX / None>
- Messaging / Email: <Nodemailer / SES / None>

---

## 4. Inputs Required

### Mandatory

- ✅ Full **read access** to the repository
- ✅ Access to:

  - `src/` or main application folder
  - database/ORM definitions
  - configuration files
- ✅ A **single comprehensive analysis prompt**

### Optional

- Architecture diagrams
- API contracts (Swagger/OpenAPI)
- Known pain points or constraints

---

## 5. Setup & Configuration Instructions

### Step 1: Repository Preparation

Ensure the following before analysis:

- Entry point is identifiable (e.g., `index.js`, `main.ts`)
- ORM schema and migrations are present
- Secrets are **not required** to run analysis

Ignore:

- `node_modules/`
- build artifacts (`dist/`, `build/`)
- logs, coverage, cache directories

---

### Step 2: Tool Configuration (Antigravity / Copilot)

1. Open the AI tool
2. Connect or select the target repository
3. Grant **read-only** permissions
4. Start a **new analysis session**

   - Do not reuse prior conversations

---

### Step 3: Prompt Configuration

Paste **one complete prompt** that includes:

- Goal definition
- Context about the tech stack
- Explicit scope and constraints
- Structured output requirements
- Evidence-based rules (“do not invent”)

**Rules:**

- ⛔ Do not split the prompt
- ⛔ Do not paraphrase the prompt
- ✅ Run once per analysis

---

## 6. Execution Workflow

### Phase 1: Indexing

The tool scans:

- Folder structure
- Entry points
- Routes, controllers, services
- ORM schemas and queries

### Phase 2: Correlation

The tool maps:

- Requests → middleware → handlers → data access
- Auth & validation coverage
- Cross-cutting concerns (security, config, errors)

### Phase 3: Synthesis

The tool produces:

- Structured analysis
- Evidence-backed findings
- Recommendations and priorities

---

## 7. Expected Output Structure

The final output **must** include:

1. Executive Summary (non-technical)
2. Architecture Overview

   - Module map
   - Request lifecycle
3. Endpoint Inventory (table)
4. Data Model / ORM Summary
5. Security Findings

   - Severity-based (P0 / P1 / P2)
   - File/path evidence
6. Validation & Input Handling Review
7. File Processing & Upload Risks (if applicable)
8. Email / Messaging Review (if applicable)
9. Performance & Reliability Findings
10. Refactor & Improvement Plan
11. Action Checklist (Top priorities)

---

## 8. Post‑Analysis Workflow

### Immediate Actions

- ☐ Create issues for all **P0** findings
- ☐ Fix missing validation or auth gaps
- ☐ Secure secrets and unsafe defaults

### Short-Term

- ☐ Centralize error handling
- ☐ Standardize validation
- ☐ Improve logging & observability

### Medium-Term

- ☐ Refactor architecture boundaries
- ☐ Optimize ORM queries and indexes
- ☐ Introduce async/background processing

---

## 9. Quality & Safety Rules

- ✅ All findings must reference code evidence
- ✅ Speculative risks must be labeled clearly
- ⛔ No hallucinated endpoints or models
- ⛔ No secrets or credentials in output
- ✅ Recommendations must be defensive and ethical

---

## 10. Reusability Notes

To reuse this skill:

1. Duplicate this file
2. Update:

   - Skill name
   - Supported stack
   - Prompt used
3. Store under:

   - `/docs/skills/`
   - or organization knowledge base

---

## 11. Skill Outcome

After applying this skill, you should have:

- Clear system understanding
- Documented APIs and data models
- Identified risks and bottlenecks
- A prioritized improvement roadmap

> **This skill converts codebases into actionable insight.**
>
