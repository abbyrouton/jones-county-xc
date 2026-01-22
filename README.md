# Jones County XC

A full-stack web application with a React frontend and Go backend.

## Project Structure

```
jones-county-xc/
├── frontend/       # React app (Vite + TypeScript + Tailwind CSS)
├── backend/        # Go HTTP server
├── docs/           # Documentation
└── README.md
```

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:5173

### Backend

```bash
cd backend
go run main.go
```

The backend will be available at http://localhost:8080

**API Endpoints:**
- `GET /health` - Health check
- `GET /api/hello` - Hello endpoint

## Development

- Frontend: React 18 with TypeScript, Vite for bundling, Tailwind CSS for styling
- Backend: Go with standard library HTTP server
