// 55 Strategic Camera Locations across Kashmir Region
export const KASHMIR_CAMERAS = [
    // Srinagar City (12 cameras)
    { id: "CAM_SRG_001", name: "Srinagar Central Square", location: [74.7973, 34.0837, 1585], zone: "urban" },
    { id: "CAM_SRG_002", name: "Dal Lake Viewpoint", location: [74.8370, 34.0910, 1590], zone: "urban" },
    { id: "CAM_SRG_003", name: "Lal Chowk Junction", location: [74.8077, 34.0882, 1587], zone: "urban" },
    { id: "CAM_SRG_004", name: "Hazratbal Shrine", location: [74.8736, 34.1209, 1583], zone: "urban" },
    { id: "CAM_SRG_005", name: "Airport Road", location: [74.7680, 33.9870, 1620], zone: "urban" },
    { id: "CAM_SRG_006", name: "Boulevard Road", location: [74.8503, 34.0995, 1585], zone: "urban" },
    { id: "CAM_SRG_007", name: "Nishat Garden Gate", location: [74.8838, 34.1156, 1589], zone: "urban" },
    { id: "CAM_SRG_008", name: "Pari Mahal Entry", location: [74.8645, 34.0919, 1640], zone: "urban" },
    { id: "CAM_SRG_009", name: "Habba Kadal Bridge", location: [74.8088, 34.0808, 1584], zone: "urban" },
    { id: "CAM_SRG_010", name: "Zero Bridge", location: [74.8143, 34.0752, 1583], zone: "urban" },
    { id: "CAM_SRG_011", name: "Batamaloo Bus Stand", location: [74.7919, 34.0641, 1586], zone: "urban" },
    { id: "CAM_SRG_012", name: "Jawahar Nagar Market", location: [74.8266, 34.1106, 1591], zone: "urban" },

    // Jammu City (10 cameras)
    { id: "CAM_JMU_001", name: "Jammu Tawi Station", location: [74.8570, 32.7266, 305], zone: "urban" },
    { id: "CAM_JMU_002", name: "Raghunath Temple", location: [74.8642, 32.7362, 320], zone: "urban" },
    { id: "CAM_JMU_003", name: "Mubarak Mandi", location: [74.8680, 32.7321, 315], zone: "urban" },
    { id: "CAM_JMU_004", name: "Gandhi Nagar Market", location: [74.8434, 32.7083, 295], zone: "urban" },
    { id: "CAM_JMU_005", name: "Bahu Fort Approach", location: [74.8837, 32.7447, 410], zone: "urban" },
    { id: "CAM_JMU_006", name: "Airport Junction", location: [74.8268, 32.6753, 360], zone: "urban" },
    { id: "CAM_JMU_007", name: "Residency Road", location: [74.8502, 32.7219, 308], zone: "urban" },
    { id: "CAM_JMU_008", name: "Canal Road", location: [74.8124, 32.6921, 285], zone: "urban" },
    { id: "CAM_JMU_009", name: "University Gate", location: [74.8753, 32.7007, 365], zone: "urban" },
    { id: "CAM_JMU_010", name: "Bikram Chowk", location: [74.8401, 32.7154, 300], zone: "urban" },

    // Border Areas - LOC & International Border (15 cameras)
    { id: "CAM_BDR_001", name: "Uri Sector Checkpoint", location: [74.1001, 34.0785, 1720], zone: "border" },
    { id: "CAM_BDR_002", name: "Tangdhar Forward Post", location: [74.4783, 34.5612, 2280], zone: "border" },
    { id: "CAM_BDR_003", name: "Kargil Sector Watch", location: [75.9886, 34.5563, 2676], zone: "border" },
    { id: "CAM_BDR_004", name: "Dras Observation", location: [75.7632, 34.4282, 3230], zone: "border" },
    { id: "CAM_BDR_005", name: "Poonch Border Gate", location: [74.1116, 33.7708, 1045], zone: "border" },
    { id: "CAM_BDR_006", name: "Rajouri Checkpoint", location: [74.3086, 33.3751, 915], zone: "border" },
    { id: "CAM_BDR_007", name: "Kupwara Entry", location: [74.2553, 34.5204, 1692], zone: "border" },
    { id: "CAM_BDR_008", name: "Handwara Patrol Base", location: [74.2802, 34.3999, 1670], zone: "border" },
    { id: "CAM_BDR_009", name: "Gurez Valley Gate", location: [74.8372, 34.6515, 2400], zone: "border" },
    { id: "CAM_BDR_010", name: "Machil Border Post", location: [74.2108, 34.6322, 2140], zone: "border" },
    { id: "CAM_BDR_011", name: "Krishna Ghati Sector", location: [74.1423, 33.6847, 1120], zone: "border" },
    { id: "CAM_BDR_012", name: "Akhnoor Bridge", location: [74.7150, 32.8770, 360], zone: "border" },
    { id: "CAM_BDR_013", name: "RS Pura Border", location: [74.8213, 32.6103, 275], zone: "border" },
    { id: "CAM_BDR_014", name: "Suchetgarh Fence", location: [74.8556, 32.4863, 268], zone: "border" },
    { id: "CAM_BDR_015", name: "Hiranagar Outpost", location: [75.2458, 32.4603, 365], zone: "border" },

    // Highways & Checkpoints (10 cameras)
    { id: "CAM_HWY_001", name: "NH-44 Qazigund", location: [75.1517, 33.5938, 1670], zone: "highway" },
    { id: "CAM_HWY_002", name: "NH-44 Banihal Tunnel", location: [75.2021, 33.4161, 1710], zone: "highway" },
    { id: "CAM_HWY_003", name: "NH-44 Ramban", location: [75.1936, 33.2469, 860], zone: "highway" },
    { id: "CAM_HWY_004", name: "NH-1A Sonmarg Junction", location: [75.2987, 34.3068, 2730], zone: "highway" },
    { id: "CAM_HWY_005", name: "NH-1A Kangan Bridge", location: [75.0235, 34.2165, 2150], zone: "highway" },
    { id: "CAM_HWY_006", name: "Jawahar Tunnel Entrance", location: [75.2381, 33.5234, 2190], zone: "highway" },
    { id: "CAM_HWY_007", name: "Udhampur Bypass", location: [75.1416, 32.9147, 756], zone: "highway" },
    { id: "CAM_HWY_008", name: "Kathua Junction", location: [75.5176, 32.3704, 420], zone: "highway" },
    { id: "CAM_HWY_009", name: "Samba Checkpoint", location: [75.1091, 32.5628, 315], zone: "highway" },
    { id: "CAM_HWY_010", name: "Pathankot Entry", location: [75.6353, 32.2733, 332], zone: "highway" },

    // Remote & Strategic Areas (8 cameras)
    { id: "CAM_REM_001", name: "Anantnag Town Center", location: [75.1487, 33.7311, 1620], zone: "remote" },
    { id: "CAM_REM_002", name: "Baramulla Market", location: [74.3636, 34.1980, 1595], zone: "remote" },
    { id: "CAM_REM_003", name: "Sopore Junction", location: [74.4605, 34.3025, 1600], zone: "remote" },
    { id: "CAM_REM_004", name: "Pulwama Chowk", location: [75.0174, 33.8707, 1670], zone: "remote" },
    { id: "CAM_REM_005", name: "Shopian Town Gate", location: [74.8304, 33.7083, 1935], zone: "remote" },
    { id: "CAM_REM_006", name: "Doda District HQ", location: [75.5485, 33.1395, 1105], zone: "remote" },
    { id: "CAM_REM_007", name: "Kishtwar Town", location: [75.7688, 33.3116, 1640], zone: "remote" },
    { id: "CAM_REM_008", name: "Reasi Temple Road", location: [74.8330, 33.0819, 645], zone: "remote" },
];

// Kashmir Region Bounds
export const KASHMIR_BOUNDS = {
    west: 73.5,
    south: 32.0,
    east: 77.5,
    north: 37.0,
};

// Camera status generator
export function generateCameraStatus(cameraId: string) {
    const isDemoCamera = cameraId === "CAM_SRG_001";

    return {
        status: isDemoCamera ? "LIVE" : (Math.random() > 0.1 ? "LIVE" : "OFFLINE"),
        detectionCount: isDemoCamera ? 142 : Math.floor(Math.random() * 200),
        threatLevel: isDemoCamera ? "suspicious" : (Math.random() > 0.9 ? "critical" : Math.random() > 0.7 ? "suspicious" : "normal"),
        lastDetection: new Date(Date.now() - Math.random() * 3600000),
        recording: isDemoCamera ? true : Math.random() > 0.3,
        health: isDemoCamera ? 98 : Math.floor(75 + Math.random() * 25),
    };
}
