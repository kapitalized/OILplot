# **06 \- B2B Library Module: Domain Knowledge & Templates**

This module acts as the "Standard Reference Manual" for your AI. It allows human experts to define the rules, constants, and structures that the AI must follow.

## **1\. Library Types & Storage**

| Library Type | Storage Location | Purpose |
| :---- | :---- | :---- |
| **Constants & Ratios** | Payload CMS (KnowledgeBase) | Store fixed values like "Density of Concrete" or "Standard Interest Rates." |
| **Report Templates** | Payload CMS (Templates) | Define the exact Markdown structure for "Investment Memos" or "Audit Reports." |
| **Sector Knowledge** | Supabase (pgvector) | Store high-volume technical manuals, compliance codes, or industry whitepapers. |

## **2\. The "Knowledge Grounding" Workflow**

When an AI task is triggered, the **Orchestrator** now performs a "Library Lookup" before calling the LLM:

1. **Context Injection:** The Orchestrator fetches relevant constants (e.g., "Use $2.50/kg for Steel") from the Library.  
2. **Template Enforcement:** The Orchestrator fetches the specific ReportTemplate requested by the user.  
3. **The Prompt:** The final prompt sent to the LLM looks like:  
   "Using the attached file data, apply these **Company Standards** \[Constants\] and format the output exactly like this **Template** \[Template Structure\]."

## **3\. Payload CMS Collections**

### **Collection: KnowledgeLibrary**

* **Key:** (e.g., concrete\_density\_standard)  
* **Value:** (e.g., 2400)  
* **Unit:** (e.g., kg/m3)  
* **Sector:** (e.g., Construction)

### **Collection: ReportTemplates**

* **Slug:** (e.g., investment-memo-v1)  
* **Structure:** (Textarea/Code field containing the Markdown skeleton with {{variables}}).  
* **System Instructions:** Specific AI behavior for this template.

## **4\. Cursor Prompt: Library Setup**

"Implement the Library Module logic.

1. Create the KnowledgeLibrary and ReportTemplates collections in Payload CMS.  
2. In lib/ai/orchestrator.ts, add a function getLibraryContext(sector: string) that retrieves all relevant constants.  
3. Update the report-generator.ts to fetch a template by slug and use the AI to fill it using the verified extraction data.  
4. Ensure that the AI adds a footnote whenever it uses a value from the Knowledge Library for transparency."

## **5\. Security & Multi-Tenancy**

* **Global vs. Private:** Some library items are "Global" (Industry standards), while others are "Private" (Organization-specific pricing or formulas).  
* **RLS:** Use Supabase RLS to ensure org\_id private library entries are never leaked to other tenants.  
* 