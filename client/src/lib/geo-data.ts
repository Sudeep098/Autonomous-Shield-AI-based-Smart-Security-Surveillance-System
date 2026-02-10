export const INDIA_GEOJSON = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": { "name": "India High Risk Zone", "type": "high-risk" },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [74.0, 34.0], [76.0, 34.0], [76.0, 32.0], [74.0, 32.0], [74.0, 34.0]
                ]]
            }
        },
        {
            "type": "Feature",
            "properties": { "name": "Coastal Watch Zone", "type": "watch" },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [72.0, 19.0], [73.0, 19.0], [73.0, 15.0], [72.0, 15.0], [72.0, 19.0]
                ]]
            }
        }
    ]
};

// Simulated Thermal Data (Lat, Lng, Intensity)
export const THERMAL_DATA = [
    [34.083, 74.797, 0.9], // Kashmir
    [28.613, 77.209, 0.5], // Delhi
    [19.076, 72.877, 0.6], // Mumbai
    [22.572, 88.363, 0.7], // Kolkata
    [13.082, 80.270, 0.6], // Chennai
    [34.1, 74.8, 0.8],
    [34.2, 74.7, 0.7],
    [28.7, 77.3, 0.4]
];
