# MyFitLog (React + Vite)

Lightweight workout tracker powered by React, Firebase Authentication, Firebase Storage, and an Express/Postgres backend. The Progress Photos page uploads directly to Firebase Storage so lifters can keep a private visual log without additional backend endpoints.

## Prerequisites

- Node 18+
- Firebase project with Email/Password Auth enabled
- Firebase Storage bucket (rules scoped to each authenticated user)
- Express/Postgres backend from src/Backend.md
- API Ninjas key (or a proxy) for exercise search

## Environment variables

Create a `.env` at the repo root with backend and Firebase config values:

```
VITE_API_BASE=https://your-backend.example.com
VITE_API_NINJAS_KEY=your_api_ninjas_key
# Optional override when proxying the external search
VITE_EXTERNAL_EXERCISE_URL=https://api.api-ninjas.com/v1/exercises

# Firebase web config
VITE_API_KEY=your_firebase_web_api_key
VITE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_PROJECT_ID=your-project-id
VITE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_MESSAGING_SENDER_ID=...
VITE_APP_ID=...
```

The storage bucket must match the Firebase Storage instance you intend to use for progress photos. The React app writes files to `progress-photos/<firebase_uid>/` and only reads from the signed-in user’s folder.

### Firebase Storage rules example

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /progress-photos/{uid}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

Adjust the rules to fit your security posture.

## Scripts

```
npm install       # install dependencies
npm run dev       # start Vite dev server
npm run build     # production build / validation
npm run preview   # preview the production build locally
```

## Key flows

- **Workouts:** CRUD via backend (src/ReplitApi.md).
- **Exercises:** Search API Ninjas → normalize metadata → persist to backend.
- **Progress Photos:** Uploads directly to Firebase Storage, lists per-user shots, includes delete support and upload progress indicator.
