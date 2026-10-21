<div dir="rtl">

# FILE MANIFEST

| Path | Type | Role | Read | Relevant | Notes |
|---|---|---|---|---|---|
| `package.json` | Config | Dependencies & Scripts | Yes | Yes | Contains Vite, React, Express, Firebase, Gemini dependencies |
| `vite.config.ts` | Config | Vite Bundler Setup | Yes | Yes | React + Tailwind |
| `server.ts` | Source (Backend) | Express API & Dev Server | Yes | Yes | Handles AI proxies, serves dist/ in prod |
| `src/main.tsx` | Source (Frontend) | React Entry Point | No | Yes | Mounts App.tsx |
| `src/App.tsx` | Source (Frontend) | Main App Component | Partial | Yes | Extremely large (~2800 lines). Contains primary state & routing. |
| `src/types.ts` | Source | TS Definitions | No | Yes | Data structures |
| `src/firebase.ts` | Source | DB/Auth Init | No | Yes | Firebase setup |
| `src/components/*` | Source (Frontend)| React Components | Partial| Yes | Contains various UI components like DashboardView, CommunityView, etc. |
| `*.cjs` files | Generated | Patch scripts | No | No | Likely historical agent patch files, to be ignored. |

</div>
