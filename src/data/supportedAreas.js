export const SERVICE_RADIUS_KM = 25;

// Town centres, not device locations. Keep names compatible with job filtering.
export const supportedAreas = [
  // https://www.geodatos.net/en/coordinates/india/patna
  { name: "Patna", lat: 25.59408, lng: 85.13563 },
  // https://www.distancecalculator.net/from-danapur-to-khagaul
  { name: "Danapur", lat: 25.6368, lng: 85.0459 },
  { name: "Khagaul", lat: 25.5828, lng: 85.0455 },
  // https://www.geocountries.com/map/india/bihar/phulwari-sharif
  { name: "Phulwari", lat: 25.5777, lng: 85.0725 },
  // No verified centre yet: retain the existing manual option without guessing.
  { name: "Gorgawan" },
  // https://geographic.org/streetview/india/jharkhand/bokaro.html
  { name: "Bokaro", lat: 23.695226, lng: 85.997462 },
];

export function nearestSupportedArea(latitude, longitude) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)
    || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;

  const radians = (degrees) => degrees * Math.PI / 180;
  let nearest = null;
  let nearestDistance = Infinity;
  for (const area of supportedAreas) {
    if (!Number.isFinite(area.lat) || !Number.isFinite(area.lng)) continue;
    const a = Math.sin(radians(area.lat - latitude) / 2) ** 2
      + Math.cos(radians(latitude)) * Math.cos(radians(area.lat))
      * Math.sin(radians(area.lng - longitude) / 2) ** 2;
    const distance = 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, Math.max(0, a))));
    if (distance < nearestDistance) {
      nearest = area;
      nearestDistance = distance;
    }
  }
  return nearestDistance <= SERVICE_RADIUS_KM ? nearest : null;
}
