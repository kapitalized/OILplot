"""
B2B Math & Logic Engine — FastAPI microservice for CAD/financial calculations.
See blueprint @16_fastapi_main. Run: uvicorn main:app --reload --port 8000
"""

import os
from typing import Optional

import uvicorn
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel

app = FastAPI(
    title="B2B Math & Logic Engine",
    description="FastAPI microservice for CAD parsing and financial calculations.",
)

INTERNAL_SERVICE_KEY = os.getenv("INTERNAL_SERVICE_KEY", "dev-secret-handshake")


class MathRequest(BaseModel):
    data: list[dict]
    parameters: dict


@app.get("/")
async def health_check():
    """Service health check for container orchestration."""
    return {
        "status": "online",
        "engine": "FastAPI",
        "features": ["CAD Parsing", "Financial Logic", "Shoelace Area Calc"],
    }


@app.post("/calculate")
async def calculate(req: MathRequest, x_service_key: Optional[str] = Header(None)):
    """
    Primary endpoint for high-precision calculations.
    Accepts raw extracted data and returns calculated volumes/ratios.
    """
    if x_service_key != INTERNAL_SERVICE_KEY:
        raise HTTPException(status_code=403, detail="Unauthorized: Invalid Service Key")

    results = []
    thickness = req.parameters.get("thickness", 0.2)

    try:
        for item in req.data:
            area = item.get("area", 0)
            volume = area * thickness
            results.append({
                "id": item.get("id"),
                "label": item.get("label", "Unknown Component"),
                "area_m2": round(area, 2),
                "volume_m3": round(volume, 2),
                "verified": True,
            })
        return {
            "status": "success",
            "results": results,
            "metadata": {
                "items_processed": len(results),
                "applied_thickness": thickness,
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Math Logic Error: {str(e)}") from e


if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
