import axios from 'axios';

// Load API Key from Environment
const API_KEY = process.env.GEOAPIFY_API_KEY;

export const geoapifyService = {
    // Proxy Tile Requests to hide API Key
    async getTile(z: string, x: string, y: string) {
        // FALLBACK: If API Key is missing, use OpenStreetMap (Standard)
        if (!API_KEY) {
            console.warn("GEOAPIFY_API_KEY missing, using OSM Fallback");
            const url = `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
            const response = await axios.get(url, {
                responseType: 'arraybuffer',
                headers: { 'User-Agent': 'DefenseSystem/1.0' }
            });
            return response.data;
        }

        const url = `https://maps.geoapify.com/v1/tile/dark-matter-brown/${z}/${x}/${y}.png?apiKey=${API_KEY}`;
        try {
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            return response.data;
        } catch (e) {
            console.error("Geoapify Error, falling back to OSM");
            const fallbackUrl = `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
            const response = await axios.get(fallbackUrl, {
                responseType: 'arraybuffer',
                headers: { 'User-Agent': 'DefenseSystem/1.0' }
            });
            return response.data;
        }
    },

    // Geocoding (Forward Search)
    async search(query: string) {
        const apiKey = process.env.GEOAPIFY_API_KEY;
        if (!apiKey) {
            console.error("GEOAPIFY_API_KEY is missing in environment variables.");
            throw new Error("API Key Missing");
        }

        // Bias results locally if possible, or country specific
        const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(query)}&apiKey=${apiKey}`;
        console.log("Proxying Search:", url.replace(apiKey, "HIDDEN"));
        const response = await axios.get(url);
        return response.data;
    },

    // Reverse Geocoding
    async reverse(lat: number, lon: number) {
        const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${API_KEY}`;
        const response = await axios.get(url);
        return response.data;
    },

    // Routing (Tactical Pathfinding)
    async route(start: { lat: number, lon: number }, end: { lat: number, lon: number }) {
        const waypoints = `${start.lat},${start.lon}|${end.lat},${end.lon}`;
        const url = `https://api.geoapify.com/v1/routing?waypoints=${waypoints}&mode=drive&apiKey=${API_KEY}`;
        const response = await axios.get(url);
        return response.data;
    },

    // Isochrones (Reachability)
    async isochrone(lat: number, lon: number, timeMin: number = 10) {
        const url = `https://api.geoapify.com/v1/isoline?lat=${lat}&lon=${lon}&type=time&mode=drive&range=${timeMin * 60}&apiKey=${API_KEY}`;
        const response = await axios.get(url);
        return response.data;
    }
};
