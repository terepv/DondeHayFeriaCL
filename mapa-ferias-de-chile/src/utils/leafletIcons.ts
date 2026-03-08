import L from 'leaflet';

// Use public URLs so every marker (including unclustered ones from MarkerClusterGroup) gets a valid icon.
// Leaflet sometimes resolves default icon paths relative to node_modules, which breaks in the browser.
const iconUrl = '/images/marker-icon.png';
const iconRetinaUrl = '/images/marker-icon-2x.png';
const shadowUrl = '/images/marker-shadow.png';

export function setupLeafletIcons(): void {
  // Prevent Leaflet from prepending imagePath (which can become /node_modules/... and 404).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconUrl,
    iconRetinaUrl,
    shadowUrl
  });
}

let _marketMarkerIcon: L.Icon | null = null;

/** Default pin icon with class so we can hide unclustered market pins (polyline is the real representation). */
export function getMarketMarkerIcon(): L.Icon {
  if (!_marketMarkerIcon) {
    _marketMarkerIcon = L.icon({
      iconUrl,
      iconRetinaUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
      className: 'leaflet-marker-icon leaflet-zoom-animated leaflet-interactive market-marker'
    });
  }
  return _marketMarkerIcon;
}