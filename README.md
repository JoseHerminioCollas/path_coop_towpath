# Path Coop Towpath

process GPX

1 remove duplicates
remove-duplicates.ts

2 update names in GPS with full time
update-gpx-names.ts

3 make array of waypoints and images associated with the waypoint
gpx-names-to-array.ts

4 use array to update GPX with images
update-gpx-image.ts

5 Convert GPX to KLM

6 review and update array