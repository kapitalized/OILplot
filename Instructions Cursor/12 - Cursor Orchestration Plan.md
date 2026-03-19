# **12 \- Cursor Orchestration Plan: Sequential Build**

Follow these steps in order. For each step, open **Cursor Composer (Cmd+I)** and paste the specific prompt provided. Refer to the numbered blueprint docs using @.

### **Step 0: External Setup**

**Goal:** Configure the infrastructure that the AI cannot access. **Reference Files:** @20\_external\_services\_setup.md, @21\_stripe\_billing\_setup.md

**Action:** Manually configure Supabase (pgvector, storage), OpenRouter credits, Vercel environment variables, and Stripe products before beginning Step 1\.

### **Step 1: Base Scaffolding & Branding**

**Goal:** Create the folder structure, install core dependencies, and set the brand identity. **Reference Files:** @01\_boilerplate\_setup.md, @10\_react\_vs\_nextjs\_b2b.md

**Prompt:** "Using the folder structure and brand specifications in @01\_boilerplate\_setup.md:

1. Scaffold all directories in the /app (marketing, dashboard, auth, payload), /lib, /components, and /services folders.  
2. Create /lib/brand.ts with the app name and asset paths from the blueprint.  
3. Update the root app/layout.tsx with global metadata (title, description, favicon) using the BRAND constant.  
4. Ensure the project follows the Next.js 15 App Router standards defined in @10\_react\_vs\_nextjs\_b2b.md."

### **Step 2: Global Navigation & Common UI**

**Goal:** Build the marketing header and the authenticated app header with organization switching logic. **Reference Files:** @01\_boilerplate\_setup.md

**Prompt:** "Based on the Navigation specifications in @01\_boilerplate\_setup.md:

1. Create MarketingHeader.tsx (Horizontal menu, Right-aligned CTAs) and MarketingFooter.tsx.  
2. Create AppHeader.tsx with a top-right User Menu (Avatar, Org Switcher) and AppFooter.tsx (Minimalist with system status).  
3. Apply these to the (marketing)/layout.tsx and (dashboard)/layout.tsx respectively."

### **Step 3: Python Engine & Next.js Bridge**

**Goal:** Setup the FastAPI service and the secure communication utility. **Reference Files:** @09\_python\_engine\_guide.md, @16\_fastapi\_main, @17\_python\_client

**Prompt:** "Set up the Python-to-Next.js bridge.

1. Create /services/python-engine/main.py using the FastAPI code from @16\_fastapi\_main.  
2. Create /lib/python-client.ts in Next.js using @17\_python\_client to securely call the FastAPI service.  
3. Create a test API route in app/api/analyze/route.ts using @18\_nextjs\_analyze\_route to demonstrate a successful round-trip request."

### **Step 4: The AI Intelligence Module (Logic)**

**Goal:** Implement the 3-step orchestrator (Vision \-\> Logic \-\> Synthesis). **Reference Files:** @04\_ai\_module\_blueprint.md, @05\_ai\_integration\_guide.md

**Prompt:** "Using @04\_ai\_module\_blueprint.md and @05\_ai\_integration\_guide.md as logic guides:

1. Implement the AI Orchestrator in /lib/ai/orchestrator.ts to manage the PENDING \-\> EXTRACTING \-\> ANALYZING \-\> REVIEW\_REQUIRED workflow.  
2. Create model-selector.ts to handle dynamic switching between Gemini 2.0 Flash (Extraction) and high-reasoning models (Analysis).  
3. Implement the 'Citation Audit' logic in the Synthesis step to cross-verify math against visual coordinates."

### **Step 5: AI UI Components (Status & Reports)**

**Goal:** Build the interactive viewers and review drawers for the user. **Reference Files:** @13\_AIReportViewer, @14\_AITaskStatus, @15\_ReviewResultsDrawer

**Prompt:** "Build the AI Dashboard components.

1. Create AITaskStatus.tsx using @14\_AITaskStatus to track multi-step background jobs.  
2. Create AIReportViewer.tsx using @13\_AIReportViewer to render Markdown reports with Excel export functionality.  
3. Create ReviewResultsDrawer.tsx using @15\_ReviewResultsDrawer for human-in-the-loop verification."

### **Step 6: Secure Ingestion & API Vault**

**Goal:** Setup Client Data Source API and encrypted secret storage. **Reference Files:** @02\_api\_ingestion\_guide.md, @11\_api\_key\_storage\_logic.md, @19\_Integrations

**Prompt:** "Implement the security layer using @02\_api\_ingestion\_guide.md and @11\_api\_key\_storage\_logic.md.

1. Create the 'External Integrations' collection in Payload CMS using @19\_Integrations.  
2. Create the /api/ingest route handler to receive data via hashed x-api-key verification.  
3. Ensure all decryption utilities are kept server-side in lib/crypto-utils.ts."

### **Step 7: Final Assembly & Stripe**

**Goal:** Wire all pages together and implement billing. **Reference Files:** @21\_stripe\_billing\_setup.md, @01\_boilerplate\_setup.md

**Prompt:** "Finalize the application.

1. Scaffold the core pages for /dashboard/reports, /dashboard/team, and /dashboard/billing.  
2. Implement the Stripe logic defined in @21\_stripe\_billing\_setup.md for checkout sessions and webhooks.  
3. Perform a final 'Vibe Check' to ensure all layouts are responsive and consistent with the BRAND identity."