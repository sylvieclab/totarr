# Plex Toolbox

Advanced management tools for Plex Media Server

## Current Status

**Version**: 0.3.0  
**Status**: Active Development - Priorities 1-3 Complete

### Working Features
- Database Persistence - Configure once, works forever
- Enhanced Libraries Page - Search, filter, sort with beautiful cards
- Scan History Tracking - Complete history of all library scans
- Library Management - View and scan all your libraries
- Modern UI - Dark theme matching Plex aesthetic

### Planned Features
- Dashboard Enhancements (Priority 4)
- Advanced Scanning Features (Priority 5)

---

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Plex Media Server with authentication token

### Installation

1. Clone the repository
   ```bash
   git clone <your-repo-url>
   cd plex-toolbox
   ```

2. Start the application
   ```bash
   start-simple.bat
   ```

3. Configure Plex
   - Open http://localhost:3000
   - Enter your Plex server URL and token
   - Configuration persists automatically

### Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/api/docs

---

## Features

### Phase 1: Core Features (Current)
- ✓ Database Persistence - Configuration management
- ✓ Enhanced Libraries - Search, filter, sort with visual cards
- ✓ Scan History - Track all library scans with status
- Planned: Dashboard Stats - Overview and quick actions

### Phase 2: Advanced Features
- Scan Completion Tracking - Real-time scan progress
- Directory Scanning - Scan specific folders
- Duplicate Media Finder - Find and remove duplicates
- Metadata Management - Bulk edit metadata and artwork

### Phase 3: Automation
- Scheduled Scans - Automatic recurring scans
- Auto-Organization - Rules-based file management
- Notifications - Email/Discord/Slack alerts

### Phase 4: Integrations
- Sonarr/Radarr - Integration with *arr stack
- Overseerr - Request management
- Webhooks - Custom event triggers

---

## Technology Stack

### Backend
- FastAPI - Modern Python web framework
- SQLAlchemy - Database ORM
- PlexAPI - Plex server integration
- SQLite - Local database

### Frontend
- React 18 - UI framework
- TypeScript - Type safety
- Material-UI - Component library
- Axios - HTTP client

---

## Development

### Start Development Environment

**Backend (Terminal 1)**
```bash
cd backend
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
uvicorn app.main:app --reload
```

**Frontend (Terminal 2)**
```bash
cd frontend
npm start
```

### Project Structure
```
plex-toolbox/
├── backend/          # Python FastAPI backend
│   ├── app/
│   │   ├── api/      # API routes
│   │   ├── models/   # Database models
│   │   └── services/ # Business logic
│   └── plex_toolbox.db  # SQLite database
└── frontend/         # React TypeScript frontend
    └── src/
        ├── pages/    # Page components
        ├── components/ # Reusable components
        └── services/ # API client
```

---

## Troubleshooting

### Backend Issues
```bash
cd backend
pip install -r requirements.txt --break-system-packages
```

### Frontend Issues
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Database Issues
```bash
cd backend
del plex_toolbox.db  # Windows
rm plex_toolbox.db   # Linux/Mac
# Restart backend - database will recreate
```

For more help, check the API documentation at http://localhost:8000/api/docs

---

## Contributing

This is a personal project in active development. Feel free to:
- Report issues
- Suggest features
- Submit pull requests

---

## License

MIT License - See LICENSE file for details

---

## Acknowledgments

- **Plex** - For the amazing media server
- **PlexAPI** - Python library for Plex integration
- **FastAPI** - Modern Python web framework
- **React** - UI library
- **Material-UI** - Component library

---

## Support

For issues or questions:
1. Check the API docs at http://localhost:8000/api/docs
2. Check browser console (F12) for frontend errors
3. Review backend logs in `backend/logs/`

---

**Built for Plex enthusiasts**

*Last Updated: 2025-11-04*  
*Version: 0.3.0*  
*Status: Priorities 1-3 Complete - Working Application*
