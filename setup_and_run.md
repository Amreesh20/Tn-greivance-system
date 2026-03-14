# Project Setup and Run Guide

This guide explains how to install dependencies and run each component of the **TN Grievance System** separately in their respective terminals.

## 1. Backend (Node.js/Express)

The backend serves as the core API for the system.

**Terminal 1:**
```bash
cd backend

# Install dependencies
npm install

# Run the server
npm start
# OR for development with auto-restart:
# npm run dev
```

## 2. Frontend (React User App)

The main user-facing frontend application.

**Terminal 2:**
```bash
cd frontend

# Install dependencies
npm install

# Run the frontend
npm start
```

## 3. Frontend Admin (React Admin Portal)

The portal for system administrators.

**Terminal 3:**
```bash
cd frontend-admin

# Install dependencies
npm install

# Run the admin frontend
npm start
```

## 4. Frontend Officer (Vite/React Officer Portal)

The portal for grievance officers.

**Terminal 4:**
```bash
cd frontend-officer

# Install dependencies
npm install

# Run the officer frontend (Vite)
npm run dev
```

## 5. ML Service (Python/FastAPI)

The machine learning microservice for classification and analysis.

**Terminal 5:**
```bash
cd ml-service

# Create a virtual environment (Windows)
python -m venv venv

# Activate the virtual environment (Windows)
.\venv\Scripts\activate
# (On macOS/Linux use: source venv/bin/activate)

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
uvicorn app.main:app --reload
```

---

## Important Notes:
- **Environment Variables**: Ensure you create appropriate `.env` files in each service directory based on their respective `.env.example` templates before running them.
- **Ports**: By default, each frontend will attempt to run on a different port if they detect that another service is using the default port (e.g., 3000, 3001, 3002). For `frontend-officer`, Vite typically runs on port 5173. The backend and ML service should be running on their specific designated ports defined in their settings.
