# AI Recruiter – Candidate Sourcing Refinement Loop (Backend)

A Spring Boot & React candidate sourcing refinement platform that turns recruiter requirements into objective search filters and subjective fit rubrics, deterministically evaluates a local candidate dataset, and continuously refines criteria based on recruiter feedback loops.

---

## Key Features

1. **Natural Language Requirement Parsing**:
   Translates free-text recruitment criteria into structured JSON containing objective filters (experience range, location, company types, skills) and a subjective fit rubric (weighted criteria summing to exactly 100%).

2. **Deterministic Candidate Filtering**:
   Local candidate profile querying based on deterministic matching of experience ranges, location, company background, and skill set.

3. **AI Candidate Scoring with Specific Rationale**:
   Scores candidates against the rubric with weighted criteria breakdown and profile citations (no generic platitudes).

4. **Iterative Refinement Loop**:
   Recruiters can accept/reject candidates or provide natural language feedback ("Candidate 1 is too junior, candidates 2 and 4 are good matches"). The LLM dynamically updates filters and rubric weights, tracks before/after diffs, and re-ranks candidates.

5. **Search Freeze & Finalization**:
   Locks down the search session, generates a final exportable shortlist, and preserves an audit trail of refinement decisions.

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Vite
- **Backend**:
  - **Live Runtime Environment**: Full-stack Node.js/Express + Vite proxy server running on port `3000` with native ESM/CJS esbuild support.
  - **Java Spring Boot Suite**: Located in `/backend` with Maven (`pom.xml`), Spring Boot 3.2.x, Jackson, and REST Controllers.
- **AI/LLM**: Google Gemini API via `@google/genai` with Thinking Mode (`ThinkingLevel.HIGH`).

---

## Running the Spring Boot Application

### Prerequisites
- JDK 17 or higher
- Apache Maven 3.8+
- A valid Gemini API Key (`GEMINI_API_KEY`)

### Build & Run
```bash
cd backend
export GEMINI_API_KEY="your_api_key_here"
mvn clean package
java -jar target/ai-recruiter-backend-1.0.0.jar
```
The Spring Boot server will run on `http://localhost:8080`.

---

## Running the Full-Stack Web App (Vite + Express)
```bash
npm install
npm run dev
```
Accessible at `http://localhost:3000`.
