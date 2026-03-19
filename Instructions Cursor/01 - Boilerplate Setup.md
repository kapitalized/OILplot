# **01 \- The B2B Vibe-Coding Blueprint: Next.js \+ Supabase \+ Payload CMS \+ FastAPI**

This blueprint creates a professional-grade B2B foundation. It uses Next.js for the UI, Supabase for data, and a dedicated AI Module for complex analysis.

## **1\. Pre-Flight Requirement**

**MANDATORY:** Complete all manual actions in @20\_external\_services\_setup.md before initiating Step 1\. (No external services need to exist yet—create them when ready to deploy or integrate.)

## **2\. The Core Stack**

* **Frontend/Orchestration:** Next.js 15 (App Router) — *See @10\_react\_vs\_nextjs\_b2b.md*  
* **Admin/CMS:** Payload CMS (Nested in /admin)  
* **Data Engine:** Python 3.12 \+ **FastAPI** — *See @09\_python\_engine\_guide.md*  
* **Database:** Supabase (PostgreSQL \+ pgvector)  
* **Intelligence:** 3-Step AI Pipeline — *See @05\_ai\_integration\_guide.md*  
* **Security:** AES-256-GCM Encryption — *See @11\_api\_key\_storage\_logic.md*  
* **Billing:** Stripe SaaS Integration — *See @21\_stripe\_billing\_setup.md*

## **3\. Brand & Identity**

* **File:** /lib/brand.ts

```

export const BRAND = {
  name: "ConstructAI",
  logo: "/logo.svg",
  colors: { primary: "#2563eb", secondary: "#64748b" },
  slogan: "Precision AI for Technical Industries"
};

```

## **4\. Folder & File Structure (Modular AI Design)**

```

/root
├── /app
│   ├── (marketing)         # SEO public pages (See @07\_seo\_module\_blueprint.md)
│   ├── (auth)              # Zero-flash auth (See @10\_react\_vs\_nextjs\_b2b.md)
│   ├── (dashboard)         # Authenticated B2B workspace
│   └── /api/webhooks       # Stripe & Ingestion webhooks (See @21\_stripe\_billing\_setup.md)
├── /services
│   └── /python-engine      # FastAPI Math Service (See @16\_fastapi\_main)
├── /collections            # Payload Definitions
│   ├── Integrations.ts     # Encrypted secrets (See @19\_payload\_integrations)
│   └── KnowledgeLibrary.ts # Constants (See @06\_library\_module\_blueprint.md)
├── /lib
│   ├── brand.ts            # Source of truth for identity
│   ├── stripe.ts           # Stripe utility (See @21\_stripe\_billing\_setup.md)
│   └── python-client.ts    # Service Bridge (See @17\_python\_client)
├── /components
│   └── /ai                 # UI: @13\_AIReportViewer, @14\_AITaskStatus, @15\_ReviewResultsDrawer
└── payload.config.ts

```

## **5\. Cursor Setup Prompts**

To build this application, follow the **7-Step Sequence** defined in **@12\_cursor\_orchestration\_plan.md**.

* **Step 0:** External Setup using @20\_external\_services\_setup.md.
* **Step 3:** Python Bridge using @17\_python\_client and @16\_fastapi\_main.
* **Step 4:** AI Logic using @04\_ai\_module\_blueprint.md and @05\_ai\_integration\_guide.md.
* **Step 6:** Security Vault using @11\_api\_key\_storage\_logic.md and @19\_payload\_integrations.
* **Step 7:** Stripe Billing using @21\_stripe\_billing\_setup.md.

