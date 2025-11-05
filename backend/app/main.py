"""
Main FastAPI application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
import os

from app.core.config import settings
from app.api.routes import health, plex, library, scanning, dashboard

# Configure logger - create logs directory if it doesn't exist
os.makedirs("logs", exist_ok=True)
logger.add(
    "logs/plex-toolbox.log",
    rotation="500 MB",
    retention="10 days",
    level="INFO"
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Advanced management tools for Plex Media Server",
    version="0.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(plex.router, prefix="/api/plex", tags=["plex"])
app.include_router(library.router, prefix="/api/library", tags=["library"])
app.include_router(scanning.router, prefix="/api/scan", tags=["scanning"])
app.include_router(dashboard.router, prefix="/api", tags=["dashboard"])


@app.on_event("startup")
async def startup_event():
    """Application startup tasks"""
    logger.info("Starting Plex Toolbox application")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Database: {settings.DATABASE_URL}")
    
    # Initialize database tables
    try:
        from app.db.session import init_db
        init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        # Don't raise - allow app to start even if DB init fails
        # This way we can still access API docs
    
    # Load Plex configuration from database
    try:
        from app.db.session import SessionLocal
        from app.models.plex import PlexServerConfig
        from app.services.plex.connection import plex_connection
        
        db = SessionLocal()
        try:
            config = db.query(PlexServerConfig).first()
            if config:
                plex_connection.set_config(config.url, config.token)
                logger.info(f"Loaded Plex config from database: {config.name}")
            else:
                logger.info("No Plex configuration found in database")
        finally:
            db.close()
    except Exception as e:
        logger.error(f"Failed to load Plex config: {e}")


@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown tasks"""
    logger.info("Shutting down Plex Toolbox application")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
