import { LayoutDashboard, Sprout, Bean, MessageCircle, Users, Store, Package, Settings, LogOut } from "lucide-react";

export const farmerNavSections = [
    {
        label: "Dashboard",
        items: [{ to: "/farmer/overview", label: "Overview", icon: LayoutDashboard, exact: true }]
    },
    {
        label: "Records",
        items: [
            { to: "/farmer/farm", label: "Farm", icon: Sprout },
            { to: "/farmer/harvest", label: "Harvest", icon: Bean }
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
