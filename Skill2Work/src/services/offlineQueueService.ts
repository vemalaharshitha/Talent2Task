/**
 * Offline Action Queue & Auto-Synchronization Service.
 * Persistently queues user operations performed while offline or disconnected,
 * and automatically drains and synchronizes them upstream when connectivity is restored.
 */

import { syncService } from './syncService';

export type OfflineActionType =
  | 'CREATE_JOB'
  | 'CLAIM_JOB'
  | 'UPDATE_JOB_STATUS'
  | 'DELETE_JOB'
  | 'UPSERT_USER'
  | 'SUBMIT_REVIEW'
  | 'SUBMIT_REPORT'
  | 'PROCESS_PAYMENT';

export interface QueuedOfflineAction {
  id: string;
  actionType: OfflineActionType;
  payload: any;
  queuedAt: string;
  attempts: number;
}

const QUEUE_STORAGE_KEY = 'talent2task_offline_action_queue_v1';

class OfflineQueueService {
  private queue: QueuedOfflineAction[] = [];
  private isProcessing = false;
  private listeners: Set<(queueLength: number) => void> = new Set();

  constructor() {
    this.loadQueue();
    this.initNetworkListeners();
  }

  private loadQueue(): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    try {
      const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (err) {
      console.warn('Failed to load offline action queue:', err);
      this.queue = [];
    }
  }

  private saveQueue(): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
      this.notifyListeners();
    } catch (err) {
      console.warn('Failed to persist offline action queue:', err);
    }
  }

  private initNetworkListeners(): void {
    if (typeof window === 'undefined') return;

    // 1. Native browser online event
    window.addEventListener('online', () => {
      console.log(' Network online event detected. Draining offline action queue...');
      this.flushQueue();
    });

    // 2. SyncService connection status
    syncService.subscribeStatus((status) => {
      if (status === 'connected' && this.queue.length > 0) {
        console.log(' Sync server connected. Draining offline action queue...');
        this.flushQueue();
      }
    });
  }

  public enqueueAction(actionType: OfflineActionType, payload: any, autoFlush: boolean = false): QueuedOfflineAction {
    const action: QueuedOfflineAction = {
      id: `queue_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      actionType,
      payload,
      queuedAt: new Date().toISOString(),
      attempts: 0
    };

    this.queue.push(action);
    this.saveQueue();
    console.log(` Queued offline action [${actionType}] (Queue size: ${this.queue.length})`);

    // If autoFlush explicitly requested and online
    if (autoFlush && this.isOnline()) {
      this.flushQueue();
    }

    return action;
  }

  public getPendingQueue(): QueuedOfflineAction[] {
    return [...this.queue];
  }

  public getPendingCount(): number {
    return this.queue.length;
  }

  public subscribe(callback: (queueLength: number) => void): () => void {
    this.listeners.add(callback);
    callback(this.queue.length);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(): void {
    const len = this.queue.length;
    this.listeners.forEach(fn => fn(len));
  }

  public isOnline(): boolean {
    if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
      return navigator.onLine;
    }
    return true;
  }

  public async flushQueue(): Promise<{ processed: number; remaining: number }> {
    if (this.isProcessing || this.queue.length === 0) {
      return { processed: 0, remaining: this.queue.length };
    }

    this.isProcessing = true;
    let processedCount = 0;

    try {
      while (this.queue.length > 0) {
        const item = this.queue[0];
        try {
          await this.dispatchQueuedAction(item);
          // Action succeeded, remove from queue
          this.queue.shift();
          this.saveQueue();
          processedCount++;
        } catch (dispatchErr) {
          console.warn(`Failed to dispatch offline action ${item.id} (${item.actionType}):`, dispatchErr);
          item.attempts += 1;
          if (item.attempts >= 5) {
            // Drop unrecoverable action after 5 failures to avoid blocking queue
            console.error(`Dropping poisonous offline action ${item.id} after 5 failed attempts.`);
            this.queue.shift();
            this.saveQueue();
          } else {
            // Retry later
            break;
          }
        }
      }
    } finally {
      this.isProcessing = false;
      this.notifyListeners();
    }

    return { processed: processedCount, remaining: this.queue.length };
  }

  private async dispatchQueuedAction(item: QueuedOfflineAction): Promise<void> {
    const { actionType, payload } = item;

    switch (actionType) {
      case 'CREATE_JOB':
        syncService.broadcastJobCreated(payload);
        break;
      case 'CLAIM_JOB':
        syncService.broadcastJobClaimed(
          payload.jobId,
          payload.seekerId,
          payload.seekerName,
          payload.seekerPhone
        );
        break;
      case 'UPDATE_JOB_STATUS':
        syncService.broadcastJobStatusUpdated(payload.jobId, payload.status);
        break;
      case 'DELETE_JOB':
        syncService.broadcastJobDeleted(payload.jobId);
        break;
      case 'UPSERT_USER':
        syncService.broadcastUserUpserted(payload);
        break;
      case 'SUBMIT_REVIEW':
        syncService.broadcastReview(payload);
        break;
      case 'SUBMIT_REPORT':
        // Stored in local sqlite
        break;
      case 'PROCESS_PAYMENT':
        syncService.broadcastPayment(payload);
        break;
      default:
        console.warn(`Unknown action type: ${actionType}`);
    }

    // Also push to Node.js backend HTTP sync endpoint if available in browser
    if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
      try {
        await fetch('/api/sync/event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: actionType,
            data: payload,
            timestamp: item.queuedAt
          })
        }).catch(() => {
          // Non-blocking if running purely client-side
        });
      } catch {
        // Ignore network transport errors
      }
    }
  }

  public clearQueue(): void {
    this.queue = [];
    this.saveQueue();
  }
}

export const offlineQueueService = new OfflineQueueService();
