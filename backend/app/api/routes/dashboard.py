"""
Dashboard API routes - Statistics and overview
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from loguru import logger

from app.services.plex.connection import plex_connection
from app.db.session import get_db
from app.models.plex import ScanHistory

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats")
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Get dashboard statistics overview
    
    Returns:
        - total_libraries: Total number of libraries
        - total_items: Total items across all libraries
        - by_type: Breakdown by library type (movie, show, artist, photo)
        - last_scan: Most recent scan timestamp
        - recent_scans: Count of scans in last 24 hours
    """
    try:
        server = plex_connection.get_connection()
        libraries = server.library.sections()
        
        # Calculate statistics
        total_libraries = len(libraries)
        total_items = 0
        by_type = {
            "movie": 0,
            "show": 0,
            "artist": 0,
            "photo": 0,
            "other": 0
        }
        
        for library in libraries:
            lib_type = library.type
            lib_size = library.totalSize or 0
            total_items += lib_size
            
            if lib_type in by_type:
                by_type[lib_type] += lib_size
            else:
                by_type["other"] += lib_size
        
        # Get last scan from database
        last_scan_record = (
            db.query(ScanHistory)
            .filter(ScanHistory.status == 'completed')
            .order_by(ScanHistory.completed_at.desc())
            .first()
        )
        
        last_scan = None
        if last_scan_record and last_scan_record.completed_at:
            last_scan = last_scan_record.completed_at.isoformat()
        
        # Count recent scans (last 24 hours)
        twenty_four_hours_ago = datetime.utcnow() - timedelta(hours=24)
        recent_scans_count = (
            db.query(ScanHistory)
            .filter(ScanHistory.started_at >= twenty_four_hours_ago)
            .count()
        )
        
        return {
            "total_libraries": total_libraries,
            "total_items": total_items,
            "by_type": by_type,
            "last_scan": last_scan,
            "recent_scans": recent_scans_count
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting dashboard stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/recent")
async def get_recently_added():
    """
    Get recently added items across all libraries
    
    Returns list of last 10 items added to Plex server
    """
    try:
        server = plex_connection.get_connection()
        
        # Get recently added items across all libraries
        # Limit to 10 items
        recent_items = []
        
        try:
            # Get all recently added items from the server
            all_recent = server.library.recentlyAdded(maxresults=10)
            
            for item in all_recent:
                # Get library name safely
                library_name = "Unknown"
                try:
                    if hasattr(item, 'librarySectionTitle'):
                        library_name = item.librarySectionTitle
                    elif hasattr(item, 'section'):
                        section = item.section()
                        if section:
                            library_name = section.title
                except Exception:
                    pass
                
                # Build item data
                item_data = {
                    "title": item.title,
                    "type": item.type,
                    "library": library_name,
                    "added_at": item.addedAt.isoformat() if hasattr(item, 'addedAt') and item.addedAt else None,
                    "year": getattr(item, 'year', None),
                    "rating": getattr(item, 'rating', None),
                    "thumb": None
                }
                
                # Get thumbnail URL safely
                try:
                    if hasattr(item, 'thumbUrl'):
                        item_data["thumb"] = item.thumbUrl
                    elif hasattr(item, 'thumb'):
                        # Build full URL from relative path
                        thumb_path = item.thumb
                        if thumb_path:
                            server_url = server._baseurl
                            token = server._token
                            item_data["thumb"] = f"{server_url}{thumb_path}?X-Plex-Token={token}"
                except Exception as e:
                    logger.debug(f"Could not get thumbnail for {item.title}: {e}")
                
                recent_items.append(item_data)
        
        except Exception as e:
            logger.warning(f"Error getting recently added items: {str(e)}")
            # Return empty list if there's an error
            return {"items": []}
        
        return {"items": recent_items}
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting recent items: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/server-status")
async def get_server_status():
    """
    Get Plex server health status
    
    Returns:
        - connected: Whether server is connected
        - server_name: Name of the Plex server
        - version: Plex server version
        - response_time_ms: Response time in milliseconds
    """
    try:
        start_time = datetime.utcnow()
        
        # Check if configured
        if not plex_connection.is_configured():
            return {
                "connected": False,
                "server_name": None,
                "version": None,
                "response_time_ms": None
            }
        
        # Try to get server
        try:
            server = plex_connection.get_connection()
            
            # Calculate response time
            end_time = datetime.utcnow()
            response_time_ms = (end_time - start_time).total_seconds() * 1000
            
            return {
                "connected": True,
                "server_name": server.friendlyName,
                "version": server.version,
                "response_time_ms": round(response_time_ms, 2)
            }
        except Exception as e:
            logger.error(f"Error checking server status: {str(e)}")
            return {
                "connected": False,
                "server_name": None,
                "version": None,
                "response_time_ms": None,
                "error": str(e)
            }
        
    except Exception as e:
        logger.error(f"Error in server status endpoint: {str(e)}")
        return {
            "connected": False,
            "server_name": None,
            "version": None,
            "response_time_ms": None,
            "error": str(e)
        }
