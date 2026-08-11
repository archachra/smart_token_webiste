# SmartToken Team Website

The public website for the SmartToken software engineering project.

## What is included

- Public homepage with a short project introduction
- Navigation to Project, Team, and Planning Presentation v1 pages
- A dedicated API service module ready to point at a future Express backend
- Placeholder team members and presentation content for the team to replace

## Run locally

1. Install dependencies: `npm install`
2. Start the site: `npm run dev`
3. Open the local address shown in the terminal.

## Future backend connection

When the Express API is ready, create a `.env` file with:

```
VITE_API_BASE_URL=http://localhost:3000
```

The frontend will then request `GET /api/status` from that API. Additional API calls should be added in `src/services/api.js`.
