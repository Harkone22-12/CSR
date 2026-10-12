<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your UniPortal app (Client-Side Rendering)

This contains everything you need to run the React + Vite version of UniPortal locally. There is no API and no database: the server only sends an HTML shell and a JavaScript bundle, and the student list lives in React state (seeded from `data/students.json`). Adding a student updates the page without any request or reload.

View your app in AI Studio: https://ai.studio/apps/1883e430-eef4-4a05-8bfb-6d89112b0d48

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`
3. Open the app in your browser:
   `http://localhost:5173/#/students`

## Build for Production

1. Build the HTML shell and JS bundle into `dist/`:
   `npm run build`
2. Preview the built app:
   `npm run preview`
