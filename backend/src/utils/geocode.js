/**
 * Address -> { lat, lng }.
 *
 * The property map pins coordinates when it has them and otherwise lets Google
 * guess from the address text. So when an admin fills in an address but leaves
 * the pin empty, the coordinates are looked up once at save time and stored.
 *
 * Two providers, chosen by what is in the environment:
 *
 *   GOOGLE_MAPS_API_KEY set   Google Geocoding — reads "Sector 84, Faridabad"
 *                             the way a local does. Free tier covers this by a
 *                             wide margin; enable "Geocoding API" on the key.
 *   not set                   OpenStreetMap's Nominatim — no key, no billing,
 *                             one request a second, and thin on Faridabad's
 *                             sectors.
 *
 * A wrong pin is worse than none: without one the map still searches the
 * address text, which reads those sectors correctly. So an answer has to earn
 * its place — inside the district, and naming the sector that was asked for.
 * Anything short of that returns null and nothing is stored.
 */

const NOMINATIM = 'https://nominatim.openstreetmap.org/search';
const GOOGLE = 'https://maps.googleapis.com/maps/api/geocode/json';
const USER_AGENT = 'RamaKripaEstates/1.0 (https://www.ramakripaestate.com)';
const TIMEOUT_MS = 7000;

/** Faridabad district, west,north,east,south — widen this if the firm ever leaves the city. */
const VIEWBOX = '77.15,28.56,77.58,28.14';

/** Earliest moment the next Nominatim request may go out. */
let nextSlot = 0;

async function throttle() {
  const wait = nextSlot - Date.now();
  nextSlot = Math.max(Date.now(), nextSlot) + 1100;
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
}

/** The address as a human would write it, duplicates dropped. */
export function addressLine(loc = {}) {
  const parts = [loc.address, loc.landmark, loc.sector, loc.locality, loc.city, loc.state, loc.pincode];
  return parts.filter((part, i) => part && parts.indexOf(part) === i).join(', ');
}

const sectorNumber = (text) => String(text || '').match(/sector\s*-?\s*(\d{1,3})/i)?.[1] || null;

/**
 * Nominatim answers "Sector 84, Faridabad" with Sector 78 and keeps a straight
 * face. If a sector was asked for, the hit has to say the same one — unless it
 * names no sector at all, which is how a landmark or a colony comes back.
 */
function sectorAgrees(label, wanted) {
  if (!wanted) return true;
  const got = sectorNumber(label);
  return got === null || got === wanted;
}

async function fromNominatim(query) {
  await throttle();

  const url =
    `${NOMINATIM}?format=jsonv2&limit=1&countrycodes=in&bounded=1` +
    `&viewbox=${VIEWBOX}&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Nominatim replied ${res.status}`);

  const [hit] = await res.json();
  return hit ? { lat: Number(hit.lat), lng: Number(hit.lon), label: hit.display_name } : null;
}

async function fromGoogle(query, key) {
  const url =
    `${GOOGLE}?key=${encodeURIComponent(key)}&region=in` +
    `&components=country:IN&address=${encodeURIComponent(query)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`Google replied ${res.status}`);

  const body = await res.json();
  if (body.status === 'ZERO_RESULTS') return null;
  if (body.status !== 'OK') throw new Error(body.error_message || body.status);

  const hit = body.results[0];
  // Google flags its own guesswork; a partial match is exactly the pin we do
  // not want to store as if it were the address.
  if (!hit || hit.partial_match) return null;

  const { lat, lng } = hit.geometry.location;
  return { lat, lng, label: hit.formatted_address };
}

const lookup = (query) => {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  return key ? fromGoogle(query, key) : fromNominatim(query);
};

/**
 * @param {object} loc a property's `location` sub-document
 * @returns {Promise<{lat:number,lng:number}|null>} null when nothing matched
 *          convincingly, which is not an error: the map then works off the
 *          address text, exactly as it does today.
 */
export default async function geocode(loc = {}) {
  const sector = sectorNumber(loc.sector) || sectorNumber(loc.address);

  // Full address first. A door number on a service road is often missing, so
  // fall back to the sector — first with the locality, then without it, since
  // "Greater Faridabad" is a local name that map data rarely carries. Nothing
  // coarser: "Faridabad, Haryana" alone would pin the city centre and pass it
  // off as this property's address.
  const city = loc.city || 'Faridabad';
  const queries = [
    addressLine(loc),
    (sector || loc.locality) && [loc.sector, loc.locality, city, 'Haryana'].filter(Boolean).join(', '),
    sector && `Sector ${sector}, ${city}, Haryana`,
  ];

  for (const query of [...new Set(queries.filter(Boolean))]) {
    try {
      const hit = await lookup(query);
      if (!hit || !Number.isFinite(hit.lat) || !Number.isFinite(hit.lng)) continue;
      if (!sectorAgrees(hit.label, sector)) {
        console.warn(`[geocode] ignored "${hit.label}" for "${query}"`);
        continue;
      }
      return { lat: hit.lat, lng: hit.lng };
    } catch (err) {
      // Offline, blocked, out of quota: save the property anyway, without a pin.
      console.warn('[geocode] lookup failed:', err.message);
      return null;
    }
  }

  return null;
}
