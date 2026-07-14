import { renderApi } from './api';
import { RenderResponse } from '@/types/api';

/**
 * A WebSocket facade that falls back to HTTP status polling
 * since the backend runs jobs in background worker threads without a WebSocket server.
 */
export class RenderWebSocketClient {
  private projectId: string;
  private intervalId: NodeJS.Timeout | null = null;
  private isConnected = false;

  constructor(projectId: string) {
    this.projectId = projectId;
  }

  connect(onMessage: (data: RenderResponse) => void, onError?: (err: any) => void) {
    if (this.isConnected) return;
    this.isConnected = true;

    // Immediate initial fetch
    this.fetchStatus(onMessage, onError);

    // Poll every 3 seconds
    this.intervalId = setInterval(() => {
      this.fetchStatus(onMessage, onError);
    }, 3000);
  }

  private async fetchStatus(
    onMessage: (data: RenderResponse) => void,
    onError?: (err: any) => void
  ) {
    try {
      const data = await renderApi.getRenderStatus(this.projectId);
      onMessage(data);

      // Stop polling when reached terminal states
      if (
        data.status === 'done' ||
        data.status === 'error' ||
        data.status === 'cancelled' ||
        data.status === 'not_started'
      ) {
        this.disconnect();
      }
    } catch (err) {
      if (onError) onError(err);
      this.disconnect();
    }
  }

  disconnect() {
    this.isConnected = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export function subscribeToRenderProgress(
  projectId: string,
  onMessage: (data: RenderResponse) => void,
  onError?: (err: any) => void
) {
  const client = new RenderWebSocketClient(projectId);
  client.connect(onMessage, onError);
  return () => client.disconnect();
}
