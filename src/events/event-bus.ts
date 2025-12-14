type EventHandler<T = any> = (payload: T) => void;

export class EventBus {
  private listeners: Map<string, EventHandler[]> = new Map();

  on<T>(event: string, handler: EventHandler<T>) {
    const existing = this.listeners.get(event) || [];
    existing.push(handler);
    this.listeners.set(event, existing);
  }

  emit<T>(event: string, payload: T) {
    const handlers = this.listeners.get(event) || [];
    for (const handler of handlers) {
      Promise.resolve(handler(payload)).catch((err) => {
        console.error(`Error in event "${event}" handler:`, err);
      });
    }
  }
}

export const eventBus = new EventBus();
