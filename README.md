TEST WORKBENCH BRANCH

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run in development

```bash
npm run dev
```

This starts:

- Vite frontend
- Express backend on `http://localhost:5001`
- Electron desktop shell

## Scripts

- `npm run dev` - Run frontend, backend, and Electron together
- `npm run build` - Build frontend assets with Vite
- `npm run dist` - Create distributable desktop build

## Notes

- MongoDB is optional for basic dashboard metrics.
- If `MONGO_URI` is not set, the server still starts for local metrics monitoring.
