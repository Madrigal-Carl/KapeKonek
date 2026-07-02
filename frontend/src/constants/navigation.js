import { LayoutDashboard, Sprout, Bean, MessageCircle, Users, Store, Package, Settings, LogOut, ClipboardList } from "lucide-react";

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
            { to: "/farmer/inventorys", label: "Inventory", icon: Package },
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
