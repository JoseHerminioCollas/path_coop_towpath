#!/bin/bash
set -e
cd "$(dirname "$0")/.."

# Ensure dependencies installed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

npx tsx src/update-gpx.ts
gpsbabel -i gpx -f coop_towpath_wpt.gpx -o kml -F coop_towpath_wpt.kml 

echo "1) Update GPX with image <link> and <desc> tags"
# npx ts-node --esm src/update-gpx.ts
# gpsbabel -i gpx -f coop_towpath_trkpt.gpx -o kml -F coop_towpath_trkpt.kml
# echo "2) Convert updated GPX → KML"
# npx ts-node --esm src/convert-gpx-to-kml.ts

# echo "Done. You can now upload the generated KML (see src/upload-kml.ts for helper)."
