# **04 \- B2B AI Intelligence Module: Extraction & Analysis Engine**

This module defines the asynchronous pipeline for processing complex B2B data (CAD, Finance, IoT) using LLMs with full citation traceability.

## **1\. The Three-Step Pipeline (Vision \-\> Logic \-\> Synthesis)**

To ensure "Reasonably Robust" trust, we split the work across specialized models:

### **Step 1: Vision Extraction (The "Eyes")**

* **Model:** google/gemini-2.0-flash-001 (via OpenRouter)  
* **Goal:** Identify text, labels, and geometric coordinates.  
* **Output:** Raw JSON objects with coordinates (Citations).

### **Step 2: Reasoning Analysis (The "Brain")**

* **Model:** deepseek/deepseek-r1 (via OpenRouter)  
* **Goal:** Mathematical logic. Apply "Knowledge Library" constants (e.g., Area x Density).  
* **Output:** Validated numerical dataset.

### **Step 3: Synthesis & Sanity Check (The "Editor")**

* **Model:** anthropic/claude-3.7-sonnet (via OpenRouter)  
* **Goal:** Review Step 2 for outliers. Format results into high-density Markdown reports using Templates from Payload CMS.  
* **Output:** Finalized Report ready for **Human Review**.

## **2\. Citation Traceability System**

* **No Orphan Numbers:** Every quantity in the final report MUST reference a citation\_id or coordinate\_set from Step 1\.  
* **Visual Overlays:** Clicking a report line item highlights the corresponding coordinate box on the original source file.  
* **Audit Rule:** Step 3 compares Step 2 results against the KnowledgeLibrary benchmarks. If an anomaly \> 15% is detected, a 'CRITICAL WARNING' is flagged.

## **3\. Modular Model Selector (/lib/ai/model-selector.ts)**

export const AI\_STEPS \= {  
  EXTRACTION: "google/gemini-2.0-flash-001",   
  ANALYSIS: "deepseek/deepseek-r1",              
  SYNTHESIS: "anthropic/claude-3.7-sonnet"      
};

## **4\. Usage Quotas & Cost Tracking**

To prevent runaway costs, every AI job checks against the organization's quota.

### **Schema: ai\_usage**

create table ai\_usage (  
  id uuid primary key default uuid\_generate\_v4(),  
  org\_id uuid references organizations(id),  
  month text, \-- e.g., '2026-03'  
  token\_count int default 0,  
  job\_count int default 0,  
  is\_blocked boolean default false  
);

## **5\. Verification & Versioning**

When a user clicks 'Approve' in the ReviewResultsDrawer:

1. ai\_task.is\_verified is set to true.  
2. Data is moved to Inventory/Master tables.  
3. If the user edits a quantity, the original AI estimation is kept in ai\_tasks.final\_analysis for auditing.