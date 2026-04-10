import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase, isSupabaseReady } from "@/lib/supabase";

const QUEUE_KEY = "kiranaai_sync_queue";

/**
 * A pending mutation that needs to be retried against Supabase.
 */
interface QueuedMutation {
  id: string;
  table: string;
  operation: "insert" | "update" | "delete";
  payload: Record<string, unknown>;
  /** For update/delete — the row ID to target */
  targetId?: string;
  createdAt: string;
  retries: number;
}

/**
 * Enqueue a failed mutation for later retry.
 */
export async function enqueueMutation(
  table: string,
  operation: "insert" | "update" | "delete",
  payload: Record<string, unknown>,
  targetId?: string
): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    const queue: QueuedMutation[] = raw ? JSON.parse(raw) : [];

    queue.push({
      id: `sync_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      table,
      operation,
      payload,
      targetId,
      createdAt: new Date().toISOString(),
      retries: 0,
    });

    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    console.log(`[SyncQueue] Enqueued ${operation} on ${table} (queue size: ${queue.length})`);
  } catch (err) {
    console.log("[SyncQueue] Failed to enqueue:", err);
  }
}

/**
 * Process all pending mutations in the queue.
 * Call this on app foreground or after network recovery.
 * Returns the number of successfully processed items.
 */
export async function processSyncQueue(): Promise<number> {
  if (!isSupabaseReady) return 0;

  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    if (!raw) return 0;

    const queue: QueuedMutation[] = JSON.parse(raw);
    if (queue.length === 0) return 0;

    console.log(`[SyncQueue] Processing ${queue.length} pending mutations...`);

    const failed: QueuedMutation[] = [];
    let processed = 0;

    for (const item of queue) {
      try {
        let error: any = null;

        if (item.operation === "insert") {
          const res = await supabase.from(item.table).insert(item.payload);
          error = res.error;
        } else if (item.operation === "update" && item.targetId) {
          const res = await supabase.from(item.table).update(item.payload).eq("id", item.targetId);
          error = res.error;
        } else if (item.operation === "delete" && item.targetId) {
          const res = await supabase.from(item.table).delete().eq("id", item.targetId);
          error = res.error;
        }

        if (error) {
          // Duplicate key errors — the data already exists, skip
          if (error.code === "23505") {
            console.log(`[SyncQueue] Skipped duplicate: ${item.table}/${item.targetId || "new"}`);
            processed++;
            continue;
          }
          throw error;
        }

        processed++;
        console.log(`[SyncQueue] ✓ ${item.operation} ${item.table}/${item.targetId || "new"}`);
      } catch (err) {
        item.retries += 1;
        // Drop items that have failed too many times (max 5 retries)
        if (item.retries < 5) {
          failed.push(item);
        } else {
          console.log(`[SyncQueue] Dropped after 5 retries: ${item.table}/${item.targetId || "new"}`);
        }
      }
    }

    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(failed));
    console.log(`[SyncQueue] Done: ${processed} processed, ${failed.length} still pending`);
    return processed;
  } catch (err) {
    console.log("[SyncQueue] Queue processing error:", err);
    return 0;
  }
}

/**
 * Get the current queue size (for UI indicators).
 */
export async function getSyncQueueSize(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    if (!raw) return 0;
    return JSON.parse(raw).length;
  } catch {
    return 0;
  }
}
