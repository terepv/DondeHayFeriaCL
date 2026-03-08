# React + TypeScript + Vite

## Mapa Ferias de Chile

Interactive web application to explore ferias (markets) on a map using a GeoJSON dataset (ferias libres in Chile).

### License

This project (code and data) is licensed under **CC BY 4.0** (Creative Commons Attribution 4.0). You may reuse and adapt it for any purpose, including commercial use. You must give **appropriate credit**, provide a link to the [license](https://creativecommons.org/licenses/by/4.0/), and indicate if you made changes.

**Example attribution:**  
*“Mapa Ferias de Chile data and/or code, [repository or project URL], used under CC BY 4.0.”*

### Tech Stack

- **Frontend**: React + TypeScript
- **Map**: Leaflet (via React Leaflet) with marker clustering
- **Styling**: Tailwind CSS
- **Build Tool**: Vite

Leaflet is used instead of Mapbox GL JS to avoid API tokens, keep the app fully static, and leverage a simple OpenStreetMap tile setup.

---

### Getting Started

#### 1. Install dependencies

```bash
npm install
```

#### 2. Run locally (static GeoJSON)

Place your GeoJSON at `public/data/Ferias_de_Chile.geojson` and run:

```bash
npm run dev
```

---

### Loading data from Supabase (optional)

You can load markets from **Supabase** (free tier) instead of a static file. The app will read from the database when configured.

#### 1. Create a Supabase project

- Go to [supabase.com](https://supabase.com) and create a project (free tier).
- In the Dashboard, open **SQL Editor** and run the script in `supabase/schema.sql`. This creates the `markets` table and policies.

#### 2. Configure the app

- Copy `.env.example` to `.env`.
- Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from your project (**Settings → API**).
- Restart the dev server (`npm run dev`).

The map loads from Supabase when these env vars are set; otherwise it uses the static GeoJSON file. No custom backend server is required.
