# **05 \- AI & LLM Integration Guide: B2B Intelligence Layer**

This guide outlines the mandatory 3-step asynchronous pipeline for professional B2B data processing (CAD, Finance, RAG).

## **1\. Architectural Mandates**

1. **The Ingestion Layer:** Converts raw files (PDF, DXF, CSV) into "AI-Ready" text or image tensors stored in Supabase Storage.  
2. **The Orchestration Layer:** Manages long-running jobs. Use the ai\_tasks table to track status: PENDING \-\> EXTRACTING \-\> ANALYZING \-\> SYNTHESIZING \-\> REVIEW\_REQUIRED.  
3. **The Verification Layer:** Every AI output must be editable. Never save AI data directly to "Master" tables without a is\_verified boolean and a human timestamp.

## **2\. The Three-Step Pipeline (Vision \-\> Logic \-\> Synthesis)**

To ensure "Reasonably Robust" trust, we split the work across specialized models:

### **Step 1: Vision Extraction (The "Eyes")**

* **Primary:** google/gemini-2.0-flash-001 (Industry-leading context window).  
* **Open Source Alt:** qwen/qwen-2-vl-72b-instruct (Excellent spatial understanding).  
* **Goal:** Identify text labels and geometric coordinates. Output: Raw JSON with coordinates (Citations).

### **Step 2: Reasoning Analysis (The "Brain")**

* **Primary:** deepseek/deepseek-r1 or deepseek/deepseek-v3 (Superior mathematical reasoning).  
* **Goal:** Apply "Knowledge Library" constants (e.g., Area x Density). Perform heavy logic/math.  
* **Output:** Validated numerical dataset.

### **Step 3: Synthesis & Sanity Check (The "Editor")**

* **Primary:** anthropic/claude-3.7-sonnet (Best professional formatting).  
* **Goal:** Review Step 2 for outliers. Format results into high-density Markdown reports using Payload CMS templates.  
* **Sanity Check:** If a result deviates from Library Benchmarks by \>15%, flag a "Critical Warning."

## **3\. UI Template: The "Canvas" Pattern**

B2B users need a **Split-View Dashboard** instead of a chat bubble:

* **Left Panel:** File Preview (The Source Document/Drawing).  
* **Right Panel:** AI Insight/Analysis (The Resulting Report).  
* **Interaction:** Clicking a report line item must highlight the corresponding coordinate box on the left-hand source file.

## **4\. Cursor Setup & Prompts**

### **File: .cursor/prompts/ai-job-system.md**

"Implement an asynchronous AI job system.

1. Create an ai\_tasks table in Supabase to track job status.  
2. Build a Next.js API route that triggers the 3-step orchestrator and returns a job\_id immediately.  
3. Create a React hook useAIJob(jobId) that uses Supabase Realtime to update the UI as the AI moves through 'Extraction', 'Analysis', and 'Synthesis'."

### **File: .cursor/prompts/structured-extraction.md**

"Create a 'Vision' analysis utility in /lib/ai/vision.ts.

1. Use Gemini 2.0 Flash to extract a JSON list of materials/entities.  
2. Use a Zod schema to enforce that every item has a 'confidence\_score' and 'coordinate\_polygons'.  
3. If confidence is below 0.75, flag the item for 'Manual Review' in the UI."

## **5\. Security & Multi-Tenancy**

* **Org-Scoping:** Every AI request must be wrapped in an organization\_id check.  
* **Model Throttling:** Implement a daily\_usage\_limit in the profiles table to prevent API credit exhaustion.  
* **Traceability:** Store the "Thought" tokens from Reasoning models (DeepSeek-R1) in an audit\_logs table for compliance.