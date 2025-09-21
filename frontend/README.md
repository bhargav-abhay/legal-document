# Legal AI Platform - Frontend

[![React](https://img.shields.io/badge/react-18.x-06B6D4.svg?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Tailwind](https://img.shields.io/badge/tailwind-3.x-06B6D4.svg?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/firebase-hosting-F97316.svg?style=for-the-badge&logo=firebase)](https://firebase.google.com/)

**Live Demo**: [https://document-legal.web.app/](https://document-legal.web.app/)

Modern React frontend for AI-powered legal document analysis with real-time analytics and intelligent search capabilities.

## Tech Stack

- **React 18** - Modern UI framework with hooks
- **Tailwind CSS** - Utility-first styling
- **Context API** - State management
- **Recharts** - Data visualization
- **Firebase Auth** - User authentication
- **WebSocket** - Real-time updates

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## Key Features

- **Document Upload**: Drag-and-drop interface with progress tracking
- **AI Analysis Results**: Interactive tabs with detailed insights
- **Legal Search**: RAG-powered document querying
- **Analytics Dashboard**: Real-time charts and metrics
- **Responsive Design**: Mobile-optimized glassmorphism UI

## Environment Variables

```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── hooks/              # Custom React hooks
├── services/           # API service layer
├── utils/              # Helper functions
└── App.js              # Main application component
```

## Deployment

Deployed on Firebase Hosting with automatic builds from main branch.

```bash
npm run build
firebase deploy
```