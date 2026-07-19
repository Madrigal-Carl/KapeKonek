export const DEFAULT_PASSWORD = "KapeKonek123";

export const FARMERS = [
    {
        id: "FR-001",
        fullName: "Lina Okoro",
        email: "lina.okoro@kapekonek.ph",
        farmCount: 2,
        status: "approved",
        associationStatus: "approved",
        joinedAt: "2026-01-04",
        files: [
            {
                name: "Valid_ID.jpg",
                type: "image",
                size: 184320,
                url: "https://picsum.photos/seed/fr001-id/800/500",
            },
            { name: "Business_Permit.pdf", type: "pdf", size: 245760 },
        ],
    },
    {
        id: "FR-002",
        fullName: "Samuel Mwangi",
        email: "samuel.mwangi@kapekonek.ph",
        farmCount: 1,
        status: "approved",
        associationStatus: "pending",
        joinedAt: "2026-01-18",
        files: [
            {
                name: "Valid_ID.jpg",
                type: "image",
                size: 176210,
                url: "https://picsum.photos/seed/fr002-id/800/500",
            },
        ],
    },
    {
        id: "FR-003",
        fullName: "Aisha Bello",
        email: "aisha.bello@kapekonek.ph",
        farmCount: 3,
        status: "pending",
        associationStatus: "pending",
        joinedAt: "2026-05-22",
        files: [
            {
                name: "Valid_ID.jpg",
                type: "image",
                size: 201340,
                url: "https://picsum.photos/seed/fr003-id/800/500",
            },
            { name: "Land_Title.pdf", type: "pdf", size: 512000 },
            {
                name: "Farm_Photo.jpg",
                type: "image",
                size: 298400,
                url: "https://picsum.photos/seed/fr003-farm/800/500",
            },
        ],
    },
    {
        id: "FR-004",
        fullName: "Chidi Okafor",
        email: "chidi.okafor@kapekonek.ph",
        farmCount: 1,
        status: "pending",
        associationStatus: "pending",
        joinedAt: "2026-06-01",
        files: [
            {
                name: "Valid_ID.jpg",
                type: "image",
                size: 168900,
                url: "https://picsum.photos/seed/fr004-id/800/500",
            },
            { name: "Business_Permit.pdf", type: "pdf", size: 233480 },
        ],
    },
    {
        id: "FR-005",
        fullName: "Joseph Kamau",
        email: "joseph.kamau@kapekonek.ph",
        farmCount: 2,
        status: "approved",
        associationStatus: "approved",
        joinedAt: "2025-11-14",
        files: [
            {
                name: "Valid_ID.jpg",
                type: "image",
                size: 190220,
                url: "https://picsum.photos/seed/fr005-id/800/500",
            },
        ],
    },
    {
        id: "FR-006",
        fullName: "Mariam Diallo",
        email: "mariam.diallo@kapekonek.ph",
        farmCount: 0,
        status: "denied",
        associationStatus: "denied",
        joinedAt: "2026-03-09",
        files: [
            {
                name: "Valid_ID.jpg",
                type: "image",
                size: 155600,
                url: "https://picsum.photos/seed/fr006-id/800/500",
            },
        ],
    },
    {
        id: "FR-007",
        fullName: "Noah Santos",
        email: "noah.santos@kapekonek.ph",
        farmCount: 1,
        status: "pending",
        associationStatus: "pending",
        joinedAt: "2026-06-20",
        files: [
            {
                name: "Valid_ID.jpg",
                type: "image",
                size: 172000,
                url: "https://picsum.photos/seed/fr007-id/800/500",
            },
            { name: "Business_Permit.pdf", type: "pdf", size: 264000 },
            { name: "Land_Title.pdf", type: "pdf", size: 498000 },
        ],
    },
];

export const FARMS = [
    {
        id: "FM-001",
        address: "Sitio Malusak, Boac, Marinduque",
        size: 4.2,
        farmers: ["FR-001 · Lina Okoro", "FR-002 · Samuel Mwangi"],
        associations: ["Boac Farmers Cooperative Association"],
        crops: [
            { crop: "Arabica", status: "growing" },
            { crop: "Banana", status: "planted" },
        ],
        yieldKg: 1820,
        location: { lat: 13.4521, lng: 121.8389 },
        joinedAt: "2026-01-15",
        history: [
            { action: "Received", item: "Arabica seeds", date: "2026-02-04" },
            { action: "Harvested", item: "Arabica", date: "2026-05-12" },
        ],
    },
    {
        id: "FM-002",
        address: "Barangay Tugos, Mogpog, Marinduque",
        size: 2.6,
        farmers: ["FR-003 · Aisha Bello"],
        associations: ["Mogpog Growers Association"],
        crops: [{ crop: "Robusta", status: "harvested" }],
        yieldKg: 940,
        location: { lat: 13.4731, lng: 121.8612 },
        joinedAt: "2025-11-03",
        history: [{ action: "Harvested", item: "Robusta", date: "2026-06-02" }],
    },
    {
        id: "FM-003",
        address: "Sitio Hinapulan, Gasan, Marinduque",
        size: 6.8,
        farmers: ["FR-004 · Chidi Okafor", "FR-005 · Joseph Kamau"],
        associations: [],
        crops: [
            { crop: "Liberica", status: "growing" },
            { crop: "Excelsa", status: "planted" },
            { crop: "Maize", status: "fallow" },
        ],
        yieldKg: 3120,
        location: { lat: 13.3221, lng: 121.8693 },
        joinedAt: "2025-08-21",
        history: [
            { action: "Received", item: "Liberica seeds", date: "2026-01-19" },
        ],
    },
];

export const EXISTING_FARM_REGISTRY = [
    {
        id: "RG-101",
        address: "Sitio Bantad, Boac, Marinduque",
        size: 3.4,
        location: { lat: 13.4612, lng: 121.8501 },
    },
    {
        id: "RG-102",
        address: "Barangay Balogo, Mogpog, Marinduque",
        size: 5.1,
        location: { lat: 13.4801, lng: 121.8702 },
    },
    {
        id: "RG-103",
        address: "Sitio Bayuti, Torrijos, Marinduque",
        size: 2.9,
        location: { lat: 13.3215, lng: 122.0843 },
    },
    {
        id: "RG-104",
        address: "Barangay Tapuyan, Buenavista, Marinduque",
        size: 7.2,
        location: { lat: 13.2658, lng: 121.9381 },
    },
    {
        id: "RG-105",
        address: "Sitio Marlangga, Santa Cruz, Marinduque",
        size: 4.6,
        location: { lat: 13.4762, lng: 122.0291 },
    },
];

export const BOAC_CENTER = { lat: 13.4477, lng: 121.8407 };

export const CROP_OPTIONS = [
    "Arabica",
    "Robusta",
    "Liberica",
    "Excelsa",
    "Maize",
    "Banana",
];

export const FARMER_OPTIONS = [
    "FR-001 · Lina Okoro",
    "FR-002 · Samuel Mwangi",
    "FR-003 · Aisha Bello",
    "FR-004 · Chidi Okafor",
    "FR-005 · Joseph Kamau",
    "FR-006 · Mariam Diallo",
];

export const ASSOCIATION_OPTIONS = [
    "Boac Farmers Cooperative Association",
    "Mogpog Growers Association",
    "Torrijos Coffee Growers Association",
    "Buenavista Agrarian Association",
    "Santa Cruz Farmers Association",
    "Marinduque Coffee Council",
];

export const CROP_STATUS_LABEL = {
    planted: "Planted",
    growing: "Growing",
    harvested: "Harvested",
    fallow: "Fallow",
};

export const CROP_STATUS_TONE = {
    planted: "info",
    growing: "success",
    harvested: "warning",
    fallow: "neutral",
};

export const CROP_STATUS_OPTIONS = [
    { value: "planted", label: "Planted" },
    { value: "growing", label: "Growing" },
    { value: "harvested", label: "Harvested" },
    { value: "fallow", label: "Fallow" },
];

export const HARVEST_CATEGORY_OPTIONS = [
    "Coffee Seedlings",
    "Coffee Cherries",
    "Fertilizer",
    "Coffee Beans",
];

export const HARVEST_VARIETY_OPTIONS = ["Arabica", "Robusta", "Liberica", "Excelsa"];

export const HARVEST_FARM_OPTIONS = [
    "FM-001 \xB7 Sitio Malusak, Boac, Marinduque",
    "FM-002 \xB7 Barangay Tugos, Mogpog, Marinduque",
    "FM-003 \xB7 Sitio Hinapulan, Gasan, Marinduque",
    "FM-004 \xB7 Barangay Balogo, Mogpog, Marinduque",
    "FM-005 \xB7 Sitio Bayuti, Torrijos, Marinduque",
];

export const HARVESTS = [
    {
        id: "HV-001",
        name: "Spring Arabica Lot A",
        category: "Coffee Seedlings",
        variety: "Arabica",
        yieldKg: 820,
        farm: "FM-001 \xB7 Sitio Malusak, Boac, Marinduque",
        farmer: "FR-001 \xB7 Lina Okoro",
        harvestedAt: "2026-05-12",
    },
    {
        id: "HV-002",
        name: "Robusta Cycle 2",
        category: "Coffee Cherries",
        variety: "Robusta",
        yieldKg: 540,
        farm: "FM-002 \xB7 Barangay Tugos, Mogpog, Marinduque",
        farmer: "FR-002 \xB7 Samuel Mwangi",
        harvestedAt: "2026-06-02",
    },
    {
        id: "HV-003",
        name: "Liberica Field Pick",
        category: "Fertilizer",
        variety: "Liberica",
        yieldKg: 310,
        farm: "FM-003 \xB7 Sitio Hinapulan, Gasan, Marinduque",
        farmer: "FR-004 \xB7 Chidi Okafor",
        harvestedAt: "2026-04-18",
    },
];

export const PRODUCT_CATEGORY_OPTIONS = [
    "Coffee Seedlings",
    "Coffee Cherries",
    "Fertilizer",
    "Coffee Beans",
];

export const PRODUCT_VARIETY_OPTIONS = ["Arabica", "Robusta", "Liberica", "Excelsa"];

export const PRODUCTS = [
    {
        id: "PD-001",
        name: "Arabica Green Beans",
        category: "Coffee Beans",
        variety: "Arabica",
        stock: 120,
        weightKg: 60,
        price: 350,
        description: "Washed Arabica green beans from Marinduque highlands.",
        images: [],
        status: "active",
        farmer: "FR-001 \xB7 Lina Okoro",
    },
    {
        id: "PD-002",
        name: "Robusta Roasted Medium",
        category: "Coffee Beans",
        variety: "Robusta",
        stock: 45,
        weightKg: 22.5,
        price: 220,
        description: "Medium roast Robusta with chocolatey notes.",
        images: [],
        status: "active",
        farmer: "FR-002 \xB7 Samuel Mwangi",
    },
    {
        id: "PD-003",
        name: "Liberica Ground",
        category: "Coffee Beans",
        variety: "Liberica",
        stock: 0,
        weightKg: 0,
        price: 260,
        description: "Bold ground Liberica, woody and smoky.",
        images: [],
        status: "inactive",
        farmer: "FR-004 \xB7 Chidi Okafor",
    },
    {
        id: "PD-004",
        name: "Coffee Seedlings (Excelsa)",
        category: "Coffee Seedlings",
        variety: "Excelsa",
        stock: 320,
        weightKg: 96,
        price: 45,
        description: "Healthy Excelsa seedlings, 6 months old.",
        images: [],
        status: "active",
        farmer: "FR-005 \xB7 Joseph Kamau",
    },
];

export const ORDERS = [
    {
        ref: "OR-1001",
        customer: "Maria Santos",
        method: "e-wallet",
        total: 1250,
        status: "pending",
        createdAt: "2025-06-24",
        items: [
            { name: "Arabica Green Beans", qty: 2, price: 500 },
            { name: "Ground Liberica", qty: 1, price: 250 },
        ],
    },
    {
        ref: "OR-1002",
        customer: "Juan Dela Cruz",
        method: "cash",
        total: 480,
        status: "reserved",
        createdAt: "2025-06-25",
        items: [{ name: "Coffee Seedlings (Excelsa)", qty: 4, price: 120 }],
    },
    {
        ref: "OR-1003",
        customer: "Ana Reyes",
        method: "e-wallet",
        total: 2100,
        status: "completed",
        createdAt: "2025-06-20",
        items: [{ name: "Robusta Roasted Medium", qty: 3, price: 700 }],
    },
    {
        ref: "OR-1004",
        customer: "Paolo Mercado",
        method: "cash",
        total: 350,
        status: "cancelled",
        createdAt: "2025-06-18",
        items: [{ name: "Ground Liberica", qty: 1, price: 350 }],
        cancelReason: "Customer changed mind",
    },
    {
        ref: "OR-1005",
        customer: "Liza Bautista",
        method: "e-wallet",
        total: 900,
        status: "pending",
        createdAt: "2025-06-26",
        items: [{ name: "Arabica Green Beans", qty: 3, price: 300 }],
    },
    {
        ref: "OR-1006",
        customer: "Carlos Yu",
        method: "cash",
        total: 1600,
        status: "reserved",
        createdAt: "2025-06-22",
        items: [{ name: "Robusta Roasted Medium", qty: 2, price: 800 }],
    },
    {
        ref: "OR-1007",
        customer: "Grace Lim",
        method: "e-wallet",
        total: 540,
        status: "completed",
        createdAt: "2025-06-15",
        items: [{ name: "Coffee Seedlings (Excelsa)", qty: 6, price: 90 }],
    },
];