# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Environment variables

Create a `.env` file at the project root with the backend base URL and the API Ninjas key used for exercise search:

```
VITE_API_BASE=https://your-backend.example.com
VITE_API_NINJAS_KEY=your_api_ninjas_key
# Optional override if you are proxying/constraining the external API
VITE_EXTERNAL_EXERCISE_URL=https://api.api-ninjas.com/v1/exercises
```

`VITE_API_NINJAS_KEY` is required for the new exercise search UI. In production you should proxy external requests through your backend so the key is not exposed to browsers.
