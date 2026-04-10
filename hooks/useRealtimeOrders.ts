import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useData } from "@/context/DataContext";
import type { RealtimeChannel } from "@supabase/supabase-js";

/**
 * useRealtimeOrders — Subscribes to the Supabase `orders` table via Realtime
 * and automatically updates local state when order statuses change remotely.
 *
 * Usage: Call `useRealtimeOrders(storeId)` inside any screen that needs
 * live order tracking (Owner Dashboard, Customer Orders).
 *
 * Gracefully no-ops if Supabase is not configured.
 */
export function useRealtimeOrders(storeId?: string) {
  const { updateOrderStatus } = useData();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!storeId) return;

    // Create a unique channel name per store
    const channel = supabase
      .channel(`orders-store-${storeId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `store_id=eq.${storeId}`,
        },
        (payload) => {
          const { id, status } = payload.new as { id: string; status: string };
          if (id && status) {
            // Update local state from the realtime event
            updateOrderStatus(id, status as any);
            console.log(`[Realtime] Order ${id} → ${status}`);
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(`[Realtime] Listening for order updates on store ${storeId}`);
        }
      });

    channelRef.current = channel;

    // Cleanup: unsubscribe when component unmounts or storeId changes
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [storeId, updateOrderStatus]);
}

/**
 * useRealtimeCustomerOrders — Subscribes for a specific customer's orders.
 * Used in the Customer Orders screen to see live status changes.
 */
export function useRealtimeCustomerOrders(customerId?: string) {
  const { updateOrderStatus } = useData();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!customerId) return;

    const channel = supabase
      .channel(`orders-customer-${customerId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `customer_id=eq.${customerId}`,
        },
        (payload) => {
          const { id, status } = payload.new as { id: string; status: string };
          if (id && status) {
            updateOrderStatus(id, status as any);
            console.log(`[Realtime] Customer Order ${id} → ${status}`);
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(`[Realtime] Listening for customer ${customerId} order updates`);
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [customerId, updateOrderStatus]);
}
