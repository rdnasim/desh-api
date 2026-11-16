/**
 * Solar position and Islamic prayer time astronomical calculation engine.
 *
 * Implements standard astronomical formulas with parameters used by
 * Islamic Foundation Bangladesh (IFB):
 *   - Fajr twilight angle: 18.0°
 *   - Isha twilight angle: 18.0°
 *   - Asr shadow factor: 2.0 (Hanafi, default) or 1.0 (Shafi)
 *   - Elevation: sea level / surface standard
 *   - Timezone: UTC+6 (Bangladesh Standard Time)
 */

export interface SolarTimes {
  sehri_cutoff: string; // HH:MM (24h)
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string; // Sunset / Iftar
  isha: string;
  sunset: string;
}

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

function julianDay(year: number, month: number, day: number): number {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const a = Math.floor(year / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + b - 1524.5;
}

function sunPosition(jd: number): { declination: number; equationOfTime: number } {
  const d = jd - 2451545.0;
  // Mean anomaly of the Sun
  const g = (357.529 + 0.98560028 * d) % 360;
  // Mean longitude of the Sun
  const q = (280.459 + 0.98564736 * d) % 360;
  // Geocentric apparent ecliptic longitude
  const l = (q + 1.915 * Math.sin(rad(g)) + 0.02 * Math.sin(rad(2 * g))) % 360;
  // Mean obliquity of the ecliptic
  const e = 23.439 - 0.00000036 * d;

  // Sun declination
  const sinD = Math.sin(rad(e)) * Math.sin(rad(l));
  const declination = deg(Math.asin(sinD));

  // Right ascension
  const ra = deg(Math.atan2(Math.cos(rad(e)) * Math.sin(rad(l)), Math.cos(rad(l)))) / 15;
  // Equation of time in hours
  const equationOfTime = q / 15 - (ra < 0 ? ra + 24 : ra);

  return { declination, equationOfTime };
}

function hourAngle(altitude: number, lat: number, declination: number): number | null {
  const sinAlt = Math.sin(rad(altitude));
  const cosLat = Math.cos(rad(lat));
  const sinLat = Math.sin(rad(lat));
  const cosDec = Math.cos(rad(declination));
  const sinDec = Math.sin(rad(declination));

  const cosH = (sinAlt - sinLat * sinDec) / (cosLat * cosDec);
  if (cosH < -1 || cosH > 1) return null;
  return deg(Math.acos(cosH));
}

function formatHours(hours: number): string {
  // Normalize into 0..24
  let h = hours % 24;
  if (h < 0) h += 24;
  const totalMinutes = Math.round(h * 60);
  const hh = Math.floor(totalMinutes / 60) % 24;
  const mm = totalMinutes % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

export function computeSolarTimes(
  year: number,
  month: number,
  day: number,
  lat: number,
  lon: number,
  school: 'hanafi' | 'shafi' = 'hanafi',
): SolarTimes {
  const jd = julianDay(year, month, day);
  const { declination, equationOfTime } = sunPosition(jd);

  // Solar noon in UTC+6 (Bangladesh Standard Time: UTC+6 => offset = 6 hours)
  // Local solar noon = 12 + 6 - (lon / 15) - equationOfTime
  const noon = 12 + 6 - lon / 15 - equationOfTime;

  // Sunrise and Sunset: altitude = -0.8333° (atmospheric refraction + sun radius)
  const hSun = hourAngle(-0.8333, lat, declination) ?? 90;
  const sunDiff = hSun / 15;
  const sunriseHours = noon - sunDiff;
  const sunsetHours = noon + sunDiff;

  // Fajr: IFB angle = -18.0°
  const hFajr = hourAngle(-18.0, lat, declination) ?? 108;
  const fajrHours = noon - hFajr / 15;

  // Isha: IFB angle = -18.0°
  const hIsha = hourAngle(-18.0, lat, declination) ?? 108;
  const ishaHours = noon + hIsha / 15;

  // Asr: shadow factor (Hanafi = 2, Shafi = 1)
  const shadowFactor = school === 'hanafi' ? 2 : 1;
  const delta = Math.abs(lat - declination);
  const asrAlt = deg(Math.atan(1 / (shadowFactor + Math.tan(rad(delta)))));
  const hAsr = hourAngle(asrAlt, lat, declination) ?? 45;
  const asrHours = noon + hAsr / 15;

  // Dhuhr: solar noon + 2 min buffer
  const dhuhrHours = noon + 2 / 60;

  // Maghrib: sunset + 2 min safety buffer
  const maghribHours = sunsetHours + 2 / 60;

  // Sehri cutoff: 3 minutes before Fajr as per IFB printed timetables
  const sehriCutoffHours = fajrHours - 3 / 60;

  return {
    sehri_cutoff: formatHours(sehriCutoffHours),
    fajr: formatHours(fajrHours),
    sunrise: formatHours(sunriseHours),
    dhuhr: formatHours(dhuhrHours),
    asr: formatHours(asrHours),
    sunset: formatHours(sunsetHours),
    maghrib: formatHours(maghribHours),
    isha: formatHours(ishaHours),
  };
}
