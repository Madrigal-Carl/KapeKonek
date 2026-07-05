import { LayoutDashboard, Sprout, Bean, MessageCircle, Users, Store, Package, Settings, LogOut, ClipboardList, UserCog, SquareUser } from "lucide-react";

export const farmerNavSections = [
    {
        label: "Dashboard",
        items: [{ to: "/farmer/overview", label: "Overview", icon: LayoutDashboard, exact: true }]
    },
    {
        label: "Records",
        items: [
            { to: "/farmer/farms", label: "Farm", icon: Sprout },
            { to: "/farmer/harvests", label: "Harvest", icon: Bean }
        ]
    },
    {
        label: "Community",
        items: [
            { to: "/farmer/chat", label: "Chat", icon: MessageCircle },
            { to: "/knowledge-hub", label: "Hub", icon: Users, badge: 3 }
        ]
    },
    {
        label: "Marketplace",
        items: [
            { to: "/farmer/inventory", label: "Inventory", icon: Package },
            { to: "/farmer/orders", label: "Order", icon: ClipboardList, badge: 3 },
            { to: "/", label: "Store", icon: Store }
        ]
    },
    {
        label: "Settings",
        items: [
            { to: "/farmer/settings", label: "Settings", icon: Settings },
            { label: "Logout", icon: LogOut, action: "logout" }
        ]
    }
];

export const managerNavSections = [
    {
        label: "Dashboard",
        items: [{ to: "/manager/overview", label: "Overview", icon: LayoutDashboard, exact: true }]
    },
    {
        label: "Records",
        items: [
            { to: "/manager/farmers", label: "Farmer", icon: UserCog },
            { to: "/manager/farms", label: "Farm", icon: Sprout },
            { to: "/manager/harvests", label: "Harvest", icon: Bean }
        ]
    },
    {
        label: "Community",
        items: [
            { to: "/manager/chat", label: "Chat", icon: MessageCircle },
            { to: "/knowledge-hub", label: "Hub", icon: Users, badge: 3 }
        ]
    },
    {
        label: "Marketplace",
        items: [
            { to: "/manager/inventory", label: "Inventory", icon: Package },
            { to: "/manager/orders", label: "Order", icon: ClipboardList, badge: 3 },
        ]
    },
    {
        label: "Settings",
        items: [
            { to: "/manager/settings", label: "Settings", icon: Settings },
            { label: "Logout", icon: LogOut, action: "logout" }
        ]
    }
];

export const dtiNavSections = [
    {
        label: "Dashboard",
        items: [{ to: "/dti/overview", label: "Overview", icon: LayoutDashboard, exact: true }]
    },
    {
        label: "Records",
        items: [
            { to: "/dti/farmers", label: "Farmer", icon: UserCog },
            { to: "/dti/farms", label: "Farm", icon: Sprout },
            { to: "/dti/harvests", label: "Harvest", icon: Bean }
        ]
    },
    {
        label: "Community",
        items: [
            { to: "/knowledge-hub", label: "Hub", icon: Users, badge: 3 }
        ]
    },
    {
        label: "Marketplace",
        items: [
            { to: "/dti/inventory", label: "Inventory", icon: Package },
        ]
    },
    {
        label: "Settings",
        items: [
            { to: "/dti/settings", label: "Settings", icon: Settings },
            { label: "Logout", icon: LogOut, action: "logout" }
        ]
    }
];

export const kaluppaNavSections = [
    {
        label: "Dashboard",
        items: [{ to: "/kaluppa/overview", label: "Overview", icon: LayoutDashboard, exact: true }]
    },
    {
        label: "Records",
        items: [
            { to: "/kaluppa/managers", label: "Manager", icon: SquareUser },
            { to: "/kaluppa/farms", label: "Farm", icon: Sprout },
            { to: "/kaluppa/harvests", label: "Harvest", icon: Bean }
        ]
    },
    {
        label: "Community",
        items: [
            { to: "/knowledge-hub", label: "Hub", icon: Users, badge: 3 }
        ]
    },
    {
        label: "Marketplace",
        items: [
            { to: "/kaluppa/inventory", label: "Inventory", icon: Package },
            { to: "/kaluppa/orders", label: "Order", icon: ClipboardList, badge: 3 },
            { to: "/", label: "Store", icon: Store }
        ]
    },
    {
        label: "Settings",
        items: [
            { to: "/kaluppa/settings", label: "Settings", icon: Settings },
            { label: "Logout", icon: LogOut, action: "logout" }
        ]
    }
];
/* ---------------- ROLE MAP ---------------- */
export const navSectionsByRole = {
    farmer: farmerNavSections,
    manager: managerNavSections,
    dti: dtiNavSections,
    kaluppa: kaluppaNavSections,
};

export function resolveRoleKey(role, fallback = "farmer") {
    if (!role) return fallback;
    const key = String(role).toLowerCase();
    return navSectionsByRole[key] ? key : fallback;
}

export function getNavSectionsForRole(role) {
    return navSectionsByRole[resolveRoleKey(role)];
}