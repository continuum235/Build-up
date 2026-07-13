/**
 * Curated list of 20 major Indian cities with coordinates.
 * Used for:
 *  - City dropdown validation (job location & user city must be one of these)
 *  - Haversine-based proximity sorting of job recommendations
 */

export interface City {
  name: string;
  lat: number;
  lon: number;
}

export const CITIES: City[] = [
  { name: "Mumbai",       lat: 19.0760, lon: 72.8777 },
  { name: "Delhi",        lat: 28.7041, lon: 77.1025 },
  { name: "Bangalore",    lat: 12.9716, lon: 77.5946 },
  { name: "Hyderabad",    lat: 17.3850, lon: 78.4867 },
  { name: "Chennai",      lat: 13.0827, lon: 80.2707 },
  { name: "Kolkata",      lat: 22.5726, lon: 88.3639 },
  { name: "Pune",         lat: 18.5204, lon: 73.8567 },
  { name: "Ahmedabad",    lat: 23.0225, lon: 72.5714 },
  { name: "Jaipur",       lat: 26.9124, lon: 75.7873 },
  { name: "Surat",        lat: 21.1702, lon: 72.8311 },
  { name: "Lucknow",      lat: 26.8467, lon: 80.9462 },
  { name: "Kanpur",       lat: 26.4499, lon: 80.3319 },
  { name: "Nagpur",       lat: 21.1458, lon: 79.0882 },
  { name: "Indore",       lat: 22.7196, lon: 75.8577 },
  { name: "Bhopal",       lat: 23.2599, lon: 77.4126 },
  { name: "Visakhapatnam",lat: 17.6868, lon: 83.2185 },
  { name: "Patna",        lat: 25.5941, lon: 85.1376 },
  { name: "Vadodara",     lat: 22.3072, lon: 73.1812 },
  { name: "Coimbatore",   lat: 11.0168, lon: 76.9558 },
  { name: "Kochi",        lat: 9.9312,  lon: 76.2673 },
];

export const CITY_NAMES: string[] = CITIES.map((c) => c.name);

/**
 * Haversine distance in kilometres between two lat/lon points.
 */
export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Returns an ordered array of city names sorted by distance from `fromCity`.
 * Cities not found in the list are treated as Infinity distance.
 */
export function citiesByProximity(fromCityName: string): string[] {
  const origin = CITIES.find(
    (c) => c.name.toLowerCase() === fromCityName.toLowerCase(),
  );
  if (!origin) return CITY_NAMES;

  return [...CITIES]
    .sort(
      (a, b) =>
        haversineKm(origin.lat, origin.lon, a.lat, a.lon) -
        haversineKm(origin.lat, origin.lon, b.lat, b.lon),
    )
    .map((c) => c.name);
}
