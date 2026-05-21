# ResumeIQ

ResumeIQ is an AI-powered resume analyzer built with React and a Node.js backend. It scores resumes, identifies strengths and weaknesses, and provides ATS-friendly recommendations.

## Features

- Upload and parse resume text
- ATS score analysis
- Strength and weakness detection
- Missing skills identification
- Resume improvement recommendations
- Hiring recommendation summary

## Tech Stack

- React
- Vite
- Express
- Groq API
- PDF.js

## Setup

### 1. Install dependencies

From the root project folder:

```bash
npm install
```

Then install backend dependencies:

```bash
cd backend
npm install
```

### 2. Create backend environment file

In `backend/.env`, add your Groq API key:

```env
GROQ_API_KEY=YOUR_GROQ_API_KEY
```

> The backend reads this key using `process.env.GROQ_API_KEY`.

### 3. Run the backend server

From the `backend` folder:

```bash
npm run dev
```

The backend will start on the configured port (default is `http://localhost:3000`).

### 4. Run the frontend

From the root project folder:

```bash
npm run dev
```

Then open the Vite app in your browser at the address shown in the terminal, typically `http://localhost:5173`.

## Notes

- Do not commit `.env` to GitHub. It is already ignored by `.gitignore`.
- Your friend must create their own `backend/.env` file with a valid `GROQ_API_KEY` to run the project locally.

## Troubleshooting

- If the app returns `MISSING` or an authorization error, verify that `backend/.env` contains `GROQ_API_KEY` and the backend was restarted after updating the file.
- Confirm the frontend is allowed by CORS and is using the correct `http://localhost:5173` origin.

## Future improvements

- Resume-job matching
- Authentication
- Downloadable reports
- Better PDF text extraction
- Enhanced AI scoring logic
