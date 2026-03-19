# **09 \- Python Engine Guide: Heavy-Duty Data Manipulation**

When your B2B app needs to do more than "chat"—when it needs to calculate—you move the logic to the **FastAPI Engine**.

## **1\. Why FastAPI instead of Django/Flask?**

* **Speed:** It's as fast as Node.js, unlike Django which is heavy and opinionated.  
* **Type Safety:** It uses Python Type Hints, which makes it much easier for **Cursor** to write bug-free math logic.  
* **Async:** It can handle long-running financial forecasts or CAD parsing without blocking other incoming requests.

## **2\. Key Python Libraries for your Use Cases**

| Use Case | Recommended Library |
| :---- | :---- |
| **CAD/Floorplans** | ezdxf (for DXF parsing), opencv-python (for image-based plan analysis). |
| **Finance/Forecasting** | pandas (dataframes), numpy (high-speed math), prophet (time-series forecasting). |
| **Dataset Analysis** | scikit-learn (statistical modeling and clustering). |
| **Excel/CSV Export** | openpyxl (for generating high-density, multi-sheet Excel reports). |

## **3\. The "Service-to-Service" Auth Pattern**

To ensure your Python engine isn't public, use an Internal Secret shared with the Next.js orchestrator:

\# services/python-engine/main.py  
from fastapi import FastAPI, Header, HTTPException  
import os

app \= FastAPI()  
INTERNAL\_SECRET \= os.getenv("INTERNAL\_SERVICE\_KEY")

@app.post("/calculate-quantities")  
async def calculate(data: dict, x\_service\_key: str \= Header(None)):  
    if x\_service\_key \!= INTERNAL\_SECRET:  
        raise HTTPException(status\_code=403, detail="Unauthorized")  
      
    \# Perform heavy math here  
    return {"status": "success", "result": data}

## **4\. Cursor Prompt: Math Logic**

When you are ready to build specific engineering or financial logic, use this prompt:

"In the Python Engine, write a calculator for 'Concrete Slab Volume'.

1. It should take a list of polygons (coordinates) as input.  
2. Calculate the area of each polygon using the Shoelace Formula.  
3. Multiply the area by a 'thickness' parameter provided in the request.  
4. Return the total volume and a granular breakdown per slab in structured JSON."

## **5\. Storage Flow**

Python should **never** talk to the database directly if you want to keep the app "Reasonably Robust."

* **The Rule:** Python receives data \-\> Performs Math \-\> Returns JSON \-\> Next.js (The Orchestrator) saves the result to Supabase.  
* **The Exception:** For extremely large datasets (millions of rows), Python can use the supabase-py client to write directly to a "Landing Table" to avoid memory overflows in the Node.js layer.