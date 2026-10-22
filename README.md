# React + TypeScript + Vite

## Mapa Ferias de Chile

Interactive web application to explore ferias (markets) on a map using a GeoJSON dataset (ferias libres in Chile).

### License

This project's code and original data are licensed under **CC BY 4.0** (Creative Commons Attribution 4.0). Street geometry derived from OpenStreetMap is attributed separately to [OpenStreetMap contributors](https://www.openstreetmap.org/copyright) under ODbL 1.0; see each feature's `geometry_source`. You must give appropriate credit, link the applicable license, and indicate changes.

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

The map reads `public/data/Ferias_de_Chile.geojson`. To run it locally:

```bash
npm run dev
```

---

### Market data

`public/data/Ferias_de_Chile.geojson` is the single source of truth for map locations and generated city pages. Edit this file to update markets; no database or environment configuration overrides it. Import exports, backups, and research caches are not part of the dataset or committed to the repo.

The dataset contains 1,298 locations: 556 street routes (`LineString`) and 742 reported locations (`Point`). Coordinates use GeoJSON order: longitude, latitude. Both use the same green map styling. Point cards explain that the exact street extent is unavailable.

Properties include `name`, `comuna`, `region`, `Días`, `Horario`, and an optional `address`. Imported records retain compact source references and street names; raw spreadsheet rows and route-debug evidence are kept outside the repo. The reference-location card explanation is shared in the UI rather than repeated in every feature.

Before committing data changes, run:

```bash
npm run validate:data
```

The normal build generates city pages and the sitemap from the same GeoJSON.
