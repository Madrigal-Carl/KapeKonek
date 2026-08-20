import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAuth from "@/hooks/useAuth";
import { getOrders } from "@/services/order.service";

const getStorageKey = (userId) => (userId ? `kk_viewed_order_ids_${userId}` : null);

const loadViewedOrderIds = (userId) => {
  const key = getStorageKey(userId);
  if (!key) return new Set();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch (err) {
    console.error("Failed to load viewed order IDs from localStorage:", err);
    return new Set();
  }
};

const saveViewedOrderIds = (userId, set) => {
  const key = getStorageKey(userId);
  if (!key) return;
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
  } catch (err) {
    console.error("Failed to save viewed order IDs to localStorage:", err);
  }
};

export function useOrderBadge() {
  const { user, isAuthenticated } = useAuth();
  const userId = user?._id;
  const isOrderRole = user?.role === "kaluppa" || user?.role === "farmer";

  const [viewedSet, setViewedSet] = useState(() => loadViewedOrderIds(userId));

  // Sync viewedSet when userId changes (e.g. login/logout/switch user)
  useEffect(() => {
    setViewedSet(loadViewedOrderIds(userId));
  }, [userId]);

  const { data: orders = [] } = useQuery({
    queryKey: ["orders", "badge", userId],
    queryFn: () => getOrders({ all: true }).then((res) => res.orders || []),
    enabled: Boolean(isAuthenticated && isOrderRole && userId),
    refetchInterval: 20_000, // Check for new orders every 20 seconds
    staleTime: 10_000,
  });

  const unseenOrders = useMemo(() => {
    if (!orders.length) return [];
    return orders.filter((o) => o._id && !viewedSet.has(o._id));
  }, [orders, viewedSet]);

  const unseenCount = unseenOrders.length;

  const markAllAsViewed = useCallback(() => {
    if (!userId || !orders.length) return;
    setViewedSet((prev) => {
      const next = new Set(prev);
      orders.forEach((o) => {
        if (o._id) next.add(o._id);
      });
      saveViewedOrderIds(userId, next);
      return next;
    });
  }, [userId, orders]);

  const markOrderAsViewed = useCallback(
    (orderId) => {
      if (!userId || !orderId) return;
      setViewedSet((prev) => {
        if (prev.has(orderId)) return prev;
        const next = new Set(prev);
        next.add(orderId);
        saveViewedOrderIds(userId, next);
        return next;
      });
    },
    [userId],
  );

  return {
    orders,
    unseenCount,
    unseenOrders,
    markAllAsViewed,
    markOrderAsViewed,
  };
}
