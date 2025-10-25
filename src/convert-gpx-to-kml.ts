import { readFile, writeFile } from "fs/promises";
import path from "path";
import { XMLParser } from "fast-xml-parser";

const DEFAULT_GPX = path.resolve(process.cwd(), "../coop_towpath_wpt.gpx");
const OUTPUT_KML = path.resolve(process.cwd(), "../coop_towpath_wpt.kml");

function ensureArray<T>(v: T | T[] | undefined): T[] {
  if (v === undefined) return [];
  return Array.isArray(v) ? v : [v];
}

async function main() {
  const gpxPath = process.env.GPX_FILE ?? DEFAULT_GPX;
  console.log(`Converting GPX → KML: ${gpxPath} → ${OUTPUT_KML}`);
  const xml = await readFile(gpxPath, "utf8");

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    cdataPropName: "__cdata",
    ignoreNameSpace: true,
    parseTagValue: false
  });
  const obj: any = parser.parse(xml);
  const wpts = ensureArray(obj.gpx.wpt);

  const kmlParts: string[] = [];
  kmlParts.push('<?xml version="1.0" encoding="UTF-8"?>');
  kmlParts.push('<kml xmlns="http://www.opengis.net/kml/2.2">');
  kmlParts.push('<Document>');
  kmlParts.push(`<name>${path.basename(OUTPUT_KML)}</name>`);

  for (const w of wpts) {
    const lat = w["@_lat"];
    const lon = w["@_lon"];
    if (!lat || !lon) continue;
    const name = w.name && (typeof w.name === "string" ? w.name : "");
    const when = w.time && (typeof w.time === "string" ? w.time : (w.time.when || ""));
    let desc = "";
    if (w.desc) {
      if (typeof w.desc === "object" && w.desc.__cdata) desc = w.desc.__cdata;
      else if (typeof w.desc === "string") desc = w.desc;
    } else if (w.link && w.link["@_href"]) {
      const href = w.link["@_href"];
      desc = `<img src="${href}" />`;
    }

    kmlParts.push("<Placemark>");
    if (name) kmlParts.push(`<name>${escapeXml(name)}</name>`);
    if (when) kmlParts.push("<TimeStamp><when>" + escapeXml(when) + "</when></TimeStamp>");
    if (desc) kmlParts.push(`<description><![CDATA[${desc}]]></description>`);
    const elePart = w.ele ? `,${w.ele}` : "";
    kmlParts.push(`<Point><coordinates>${lon},${lat}${elePart}</coordinates></Point>`);
    kmlParts.push("</Placemark>");
  }

  kmlParts.push("</Document>");
  kmlParts.push("</kml>");

  const kml = kmlParts.join("\n");
  await writeFile(OUTPUT_KML, kml, "utf8");
  console.log("KML written:", OUTPUT_KML);
}

function escapeXml(s: string) {
  return s.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case "\"": return "&quot;";
      default: return c;
    }
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
