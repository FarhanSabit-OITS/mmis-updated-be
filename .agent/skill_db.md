# Antigravity Backend Analysis Skill

## Skill Name

**Comprehensive Backend Repository Analysis with Antigravity**

## Skill Purpose

This skill defines a repeatable workflow for using **Antigravity** to deeply analyze a Node.js backend repository and produce:

- Architecture understanding
- API documentation
- Security audit
- Prisma/database review
- Performance & reliability findings
- Refactor and improvement roadmap

The goal is to turn a raw backend codebase into **clear, actionable technical insight**.

---

## When to Use This Skill

Use this workflow when:

- Onboarding to an existing backend project
- Performing a security or architecture review
- Preparing technical documentation
- Planning refactors or modernization
- Auditing ERP / business-critical systems
- Reviewing code before scaling or production hardening

---

## Supported Stack (Current Repo)

This skill is optimized for:

- Node.js (CommonJS)
- Express (v5+)
- Prisma ORM
- JWT authentication
- Zod validation
- File uploads (CSV/XLSX)
- Nodemailer
- Environment-based configuration

---

## Inputs Required

1. **Repository access**

   - Full read access to:

     - `src/`
     - `prisma/`
     - `package.json`
2. **Comprehensive Antigravity Prompt**

   - The Option 7 prompt (All‑in‑one analysis)
3. **Single execution**

   - Run once for best reasoning coherence

---

## Workflow

### Step 1: Prepare the Repository

- Ensure the repository contains:

  - Clear entry point (e.g., `src/index.js`)
  - Prisma schema and migrations
- Remove or ignore:

  - `node_modules/`
  - build artifacts (`dist/`, `build/`)
  - logs and coverage

---

### Step 2: Start a New Antigravity Analysis

- Open Antigravity
- Select the target repository
- Create a **new analysis session**
- Do not reuse an old conversation

---

### Step 3: Provide the Prompt

- Paste the **entire comprehensive prompt** at once
- Do not split it across messages
- Do not paraphrase or shorten it

**Important rules:**

- One prompt
- One run
- No interruptions

---

### Step 4: Antigravity Internal Processing (What Happens)

Antigravity will automatically:

1. Scan project structure
2. Identify entry points and middleware chain
3. Map routes → controllers → services → Prisma
4. Correlate auth, validation, and data access
5. Detect risks and architectural smells
6. Generate a structured Markdown report

---

### Step 5: Review the Output

Focus on these sections first:

- **Executive Summary**
- **Endpoint Inventory**
- **Security Findings (P0 / P1)**
- **Prisma & Data Model Summary**
- **“Do This Next” checklist**

Treat recommendations as guidance, not mandatory rules.

---

## Output Structure (Expected)

The analysis output should include:

1. Executive Summary (non-technical)
2. Architecture Overview

   - Module map
   - Request lifecycle
3. Endpoint Inventory (table)
4. Prisma / Database Summary
5. Security Findings

   - Severity-based (P0, P1, P2)
   - Evidence-based (file paths)
6. Validation & Data Handling Review
7. File Upload & CSV/XLSX Risks
8. Email & Template Review
9. Performance & Reliability Findings
10. Refactor Plan (phased)
11. Action Checklist (Top 10 next steps)

---

## Post‑Analysis Actions

### Immediate (Same Day)

- Create issues for all **P0 security findings**
- Fix missing validation on auth or uploads
- Address hardcoded secrets or unsafe defaults

### Short Term

- Add centralized error handling
- Introduce consistent Zod validation middleware
- Harden JWT and cookie configuration

### Medium Term

- Refactor folder structure if needed
- Improve Prisma queries and indexing
- Introduce background jobs for email and file processing

---

## Best Practices

- Always require **evidence-based findings**
- Never accept hallucinated routes or models
- Run this skill again after major refactors
- Use follow‑up prompts for:

  - OpenAPI generation
  - Auth redesign
  - Validation standardization

---

## Anti‑Patterns to Avoid

- Running multiple analysis prompts in parallel
- Interrupting Antigravity mid-run
- Removing constraints like “do not invent endpoints”
- Treating recommendations as automatic truth

---

## Skill Outcome

After applying this skill, you should have:

- Clear understanding of the backend system
- Documented APIs and data models
- Identified security and reliability risks
- A realistic, phased improvement roadmap

This skill turns **code into clarity**.
