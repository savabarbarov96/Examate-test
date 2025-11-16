import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { Reader } from "@maxmind/geoip2-node";
import axios from "axios";
import { redis } from "./session.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration from environment variables
const GEO_PROVIDER = process.env.GEO_PROVIDER || "maxmind"; // 'maxmind', 'ipapi', or 'disabled'
const GEO_CACHE_TTL = parseInt(process.env.GEO_CACHE_TTL || "604800"); // 7 days in seconds
const IPAPI_TIMEOUT = parseInt(process.env.IPAPI_TIMEOUT || "3000"); // 3 seconds

// MaxMind database reader (optional)
let maxmindReader: Reader | null = null;

// Initialize MaxMind reader if database exists and provider is set to maxmind
if (GEO_PROVIDER === "maxmind") {
  try {
    const dbPath = path.resolve(__dirname, "../databases/GeoLite2-City.mmdb");
    if (fs.existsSync(dbPath)) {
      const dbBuffer = fs.readFileSync(dbPath);
      maxmindReader = Reader.openBuffer(dbBuffer);
      console.log("✓ MaxMind GeoIP database loaded successfully");
    } else {
      console.warn(
        "⚠ MaxMind database not found. Geo lookups will return 'Unknown'."
      );
      console.warn("  This is non-critical - the app will continue normally.");
    }
  } catch (error) {
    console.warn("⚠ Failed to load MaxMind database:", error instanceof Error ? error.message : String(error));
    console.warn("  Geo lookups will return 'Unknown'.");
  }
}

/**
 * GeoIP lookup result interface
 */
export interface GeoLocation {
  country?: string;
  city?: string;
}

/**
 * Lookup geo location using ipapi.co (external API)
 */
async function lookupViaIPAPI(ip: string): Promise<GeoLocation> {
  try {
    const response = await axios.get(`https://ipapi.co/${ip}/json/`, {
      timeout: IPAPI_TIMEOUT,
    });

    return {
      country: response.data.country_name || "Unknown",
      city: response.data.city || "Unknown",
    };
  } catch (error) {
    console.warn(`ipapi.co lookup failed for ${ip}:`, error instanceof Error ? error.message : String(error));
    return { country: "Unknown", city: "Unknown" };
  }
}

/**
 * Lookup geo location using MaxMind local database
 */
function lookupViaMaxMind(ip: string): GeoLocation {
  if (!maxmindReader) {
    return { country: "Unknown", city: "Unknown" };
  }

  try {
    const result = (maxmindReader as any).city(ip);
    return {
      country: result.country?.names?.en || "Unknown",
      city: result.city?.names?.en || "Unknown",
    };
  } catch (error) {
    // This is expected for local/private IPs (127.0.0.1, 172.x.x.x, etc.)
    return { country: "Unknown", city: "Unknown" };
  }
}

/**
 * Get cached geo location from Redis
 */
async function getCachedGeo(ip: string): Promise<GeoLocation | null> {
  try {
    const cached = await redis.get(`geo:${ip}`);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    // Redis error - continue without cache
    console.warn("Redis cache read failed:", error instanceof Error ? error.message : String(error));
  }
  return null;
}

/**
 * Cache geo location in Redis
 */
async function cacheGeo(ip: string, geo: GeoLocation): Promise<void> {
  try {
    await redis.setex(`geo:${ip}`, GEO_CACHE_TTL, JSON.stringify(geo));
  } catch (error) {
    // Redis error - continue without cache
    console.warn("Redis cache write failed:", error instanceof Error ? error.message : String(error));
  }
}

/**
 * Main geo lookup function with caching and multiple providers
 *
 * Supports:
 * - MaxMind local database (fast, no external calls, but requires 61MB file)
 * - ipapi.co external API (always up-to-date, free tier: 1000 req/day)
 * - Redis caching (reduces API calls and database lookups)
 * - Graceful degradation (returns 'Unknown' instead of crashing)
 *
 * Environment variables:
 * - GEO_PROVIDER: 'maxmind' | 'ipapi' | 'disabled' (default: 'maxmind')
 * - GEO_CACHE_TTL: Cache TTL in seconds (default: 604800 = 7 days)
 * - IPAPI_TIMEOUT: API timeout in ms (default: 3000)
 */
export async function getGeoLocation(ip: string): Promise<GeoLocation> {
  // Return immediately if geo lookup is disabled
  if (GEO_PROVIDER === "disabled") {
    return { country: "Unknown", city: "Unknown" };
  }

  // Skip lookup for local/private IPs
  if (
    ip === "::1" ||
    ip === "127.0.0.1" ||
    ip.startsWith("::ffff:172.") ||
    ip.startsWith("::ffff:192.168.") ||
    ip.startsWith("::ffff:10.") ||
    ip.startsWith("172.") ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.")
  ) {
    return { country: "Local", city: "Local" };
  }

  // Check cache first
  const cached = await getCachedGeo(ip);
  if (cached) {
    return cached;
  }

  // Perform lookup based on provider
  let geo: GeoLocation;

  if (GEO_PROVIDER === "ipapi") {
    geo = await lookupViaIPAPI(ip);
  } else if (GEO_PROVIDER === "maxmind") {
    geo = lookupViaMaxMind(ip);
  } else {
    console.warn(`Unknown GEO_PROVIDER: ${GEO_PROVIDER}, using 'Unknown'`);
    geo = { country: "Unknown", city: "Unknown" };
  }

  // Cache the result
  await cacheGeo(ip, geo);

  return geo;
}

/**
 * Legacy export for backward compatibility
 * This allows existing code using `geoReader.city(ip)` to continue working
 */
export const geoReader = {
  city: (ip: string) => {
    // Synchronous wrapper - returns a MaxMind-like response
    if (maxmindReader) {
      try {
        return (maxmindReader as any).city(ip);
      } catch (error) {
        // Return a minimal response for compatibility
        return {
          country: { names: { en: "Unknown" } },
          city: { names: { en: "Unknown" } },
        };
      }
    }

    // Return a minimal response when MaxMind is not available
    return {
      country: { names: { en: "Unknown" } },
      city: { names: { en: "Unknown" } },
    };
  },
};
