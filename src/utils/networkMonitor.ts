import * as Sentry from '@sentry/react-native';

interface NetworkRequest {
  url: string;
  method: string;
  startTime: number;
  endTime?: number;
  status?: number;
  error?: Error;
}

class NetworkMonitor {
  private requests: Map<string, NetworkRequest> = new Map();

  startRequest(id: string, url: string, method: string) {
    this.requests.set(id, {
      url,
      method,
      startTime: Date.now(),
    });
  }

  endRequest(id: string, status: number) {
    const request = this.requests.get(id);
    if (!request) return;

    request.endTime = Date.now();
    request.status = status;

    const duration = request.endTime - request.startTime;

    // Log slow requests
    if (duration > 3000) {
      console.warn(`🐢 Slow request: ${request.method} ${request.url} (${duration}ms)`);

      Sentry.captureMessage('Slow Network Request', {
        level: 'warning',
        extra: {
          url: request.url,
          method: request.method,
          duration,
          status,
        },
      });
    }

    this.requests.delete(id);
  }

  failRequest(id: string, error: Error) {
    const request = this.requests.get(id);
    if (!request) return;

    request.error = error;

    Sentry.captureException(error, {
      contexts: {
        network: {
          url: request.url,
          method: request.method,
        },
      },
    });

    this.requests.delete(id);
  }
}

export const networkMonitor = new NetworkMonitor();
