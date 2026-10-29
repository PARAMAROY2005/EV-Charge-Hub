"""
EV Charging Demand Prediction - FastAPI Application Entrypoint
Industry-grade REST API backend with full OpenAPI specification.
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.routes import router as api_router
from backend.ml.pipeline import EVModelPipeline
from backend.services.analytics import AnalyticsService
from backend.database.db import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database
    init_db()
    # Preload ML pipeline
    EVModelPipeline.get_instance()
    # Preload and cache analytics
    AnalyticsService.get_instance()
    print("[Server Startup] Database initialized, ML model loaded, and Analytics cached.")
    yield
    print("[Server Shutdown] Cleaning up background resources.")


app = FastAPI(
    title="EV Charging Demand Prediction API",
    description=(
        "Production-ready Machine Learning REST API for predicting Electric Vehicle "
        "charging station demand levels, analyzing operational metrics, and managing "
        "historical prediction records."
    ),
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration for local React development and production
IS_VERCEL = bool(os.environ.get("VERCEL"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
app.include_router(api_router)

# Only serve static frontend files when NOT on Vercel
# (Vercel serves the frontend as a separate static build)
if not IS_VERCEL:
    from pathlib import Path
    from fastapi.staticfiles import StaticFiles

    frontend_dist = Path(__file__).resolve().parent.parent / "frontend" / "dist"
    if frontend_dist.exists():
        app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="frontend")
    else:
        @app.get("/", tags=["Root"])
        def root():
            return {
                "project": "EV Charging Demand Prediction Full-Stack ML Platform",
                "version": "2.0.0",
                "docs": "/docs",
                "health": "/api/health",
                "status": "online"
            }
else:
    @app.get("/", tags=["Root"])
    def root():
        return {
            "project": "EV Charging Demand Prediction Full-Stack ML Platform",
            "version": "2.0.0",
            "docs": "/docs",
            "health": "/api/health",
            "status": "online"
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
