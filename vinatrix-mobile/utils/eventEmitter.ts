type EventListener = (...args: any[]) => void;

class EventEmitter {
  private listeners: { [key: string]: EventListener[] } = {};

  on(event: string, listener: EventListener): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  off(event: string, listener: EventListener): void {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((l) => l !== listener);
  }

  emit(event: string, ...args: any[]): void {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach((listener) => {
      try {
        listener(...args);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }
}

export const eventEmitter = new EventEmitter();

export const EVENTS = {
  // Product events
  PRODUCT_ADDED: "PRODUCT_ADDED",

  // Cart events
  CART_UPDATED: "CART_UPDATED",
  CART_COUNT_UPDATED: "CART_COUNT_UPDATED",

  // Wishlist events
  WISHLIST_UPDATED: "WISHLIST_UPDATED",
  WISHLIST_COUNT_UPDATED: "WISHLIST_COUNT_UPDATED",
};
