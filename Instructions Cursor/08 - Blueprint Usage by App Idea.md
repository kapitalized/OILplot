# **08 \- Blueprint Usage by App Idea**

| App Idea | AI Role (Reasoning/Vision) | Python Role (Math/Data) |
| :---- | :---- | :---- |
| **1\. Massive File RAG** | Semantic search, entity linking, summarizing. | Document chunking, vector embedding generation. |
| **2\. Financial Due Diligence** | Finding anomalies, risk identification. | Normalizing multi-source ERP data, ratio math. |
| **3\. Financial Forecasting** | Suggesting assumptions, narrative summaries. | Complex math (NPV, IRR), time-series (Prophet). |
| **4\. CAD Takeoffs** | Vision detection of labels and symbols. | Geometric calculations (Volume), DXF parsing. |
| **5\. Industry Research** | Synthesizing data, professional drafting. | Web scraping aggregation, API data merging. |
| **6\. Investment Memos** | Narrative generation, tone adjustment. | ROI/Multiple calculations, PDF formatting. |

## **Detailed Analysis of Core Strengths**

* **RAG:** pgvector in Supabase handles high-scale similarity search with tenant-scoping.  
* **CAD Takeoffs:** The **Citation & Verification Layer** ensures trust in engineering quantities.  
* **Forecasting:** **FastAPI** handles Python math (NumPy/Pandas) which is faster and safer than Node.js for complex calculation.  
* **Library Layer:** Using Payload CMS to store standard values (material densities, financial benchmarks) ensures the AI behaves as a domain expert.