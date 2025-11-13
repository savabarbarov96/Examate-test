import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { Reader } from "@maxmind/geoip2-node";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, "../databases/GeoLite2-City.mmdb");
const dbBuffer = fs.readFileSync(dbPath);
export const geoReader = Reader.openBuffer(dbBuffer);
