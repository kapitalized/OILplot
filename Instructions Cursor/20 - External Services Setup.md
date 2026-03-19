# **20 \- External Services & Manual Setup Guide**

This guide lists the mandatory manual actions required on external platforms. These steps provide the infrastructure "skeleton" that the AI cannot configure automatically. **At the outset, none of these external services need to exist yet**—create them when you are ready to deploy or integrate. Complete the steps below before starting the **Cursor Orchestration Plan** (or before going live).

## **1\. Supabase (Database & Auth)**

1. **Create Project:** Initialize a new project in the Supabase Dashboard.  
2. **Enable pgvector:** Navigate to Database \-\> Extensions \-\> Search for vector and enable it. This is required for all RAG and similarity search features.  
3. **Storage Buckets:**  
   * Create a bucket named documents (Set to **Public: False**). Used for sensitive B2B uploads.  
   * Create a bucket named avatars (Set to **Public: True**).  
4. **Auth Settings:** \* Add your local (http://localhost:3000) and production URLs to Authentication \-\> Redirect URLs.  
   * Disable "Confirm Email" for development if you want to test the auth flow faster.

## **2\. GitHub & Vercel (CI/CD)**

1. **GitHub Repo:** Create a new **Private** repository. Initialize it locally with git init and push an initial commit. Cursor functions best with a clean git history.  
2. **Vercel Import:** Link your GitHub repo to Vercel.  
3. **Next.js Settings:** Ensure the framework is set to Next.js.  
4. **Production Variables:** You must manually paste the variables from Section 6 below into the Vercel "Environment Variables" panel.

## **3\. OpenRouter (AI Intelligence)**

1. **Account:** Create an account at [openrouter.ai](https://openrouter.ai).  
2. **Credits:** Add a small amount of credit ($5.00+) to access professional models like Claude 3.7 and DeepSeek-R1.  
3. **API Key:** Generate a new key and name it B2B\_PLATFORM\_KEY.

## **4\. Python Engine Hosting (FastAPI)**

*The Python microservice handles heavy math and should be hosted separately from the Next.js frontend.*

1. **Platform:** Use **Railway**, **Render**, or **DigitalOcean App Platform**.  
2. **Internal URL:** Take the provided internal/private URL from your host (e.g., python-engine.railway.app) and add it to your Next.js environment variables.

## **5\. Stripe Billing (SaaS Monetization)**

*Refer to @21\_stripe\_billing\_setup.md for the full configuration workflow.*

1. **Test Mode:** Ensure your Stripe account is in "Test Mode".  
2. **Webhook:** Register your Vercel URL (e.g., https://your-app.vercel.app/api/webhooks/stripe) in the Stripe Developers dashboard.

## **6\. Required Environment Variables (.env.local)**

Copy these into your local .env.local and your Vercel/Supabase settings.

\# BRANDING  
NEXT\_PUBLIC\_APP\_NAME="ConstructAI"

\# SUPABASE (Project Settings \-\> API)  
NEXT\_PUBLIC\_SUPABASE\_URL="\[https://your-project-id.supabase.co\](https://your-project-id.supabase.co)"  
NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY="your-anon-key"  
SUPABASE\_SERVICE\_ROLE\_KEY="your-service-role-key"

\# PAYLOAD CMS  
PAYLOAD\_SECRET="any-long-random-string"  
\# Use your Supabase Postgres connection string  
DATABASE\_URI="postgresql://postgres:password@db.your-id.supabase.co:5432/postgres"

\# AI & MATH BRIDGE  
OPENROUTER\_API\_KEY="your-openrouter-key"  
INTERNAL\_SERVICE\_KEY="generate-a-uuid-for-handshake"  
PYTHON\_ENGINE\_URL="http://localhost:8000" \# Update for production

\# STRIPE BILLING  
STRIPE\_SECRET\_KEY="sk\_test\_..."  
STRIPE\_WEBHOOK\_SECRET="whsec\_..."  
NEXT\_PUBLIC\_STRIPE\_PUBLISHABLE\_KEY="pk\_test\_..."

\# SECURITY  
ENCRYPTION\_KEY="32-character-string-for-aes-256"  
