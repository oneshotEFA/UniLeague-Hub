"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventBus = exports.EventBus = void 0;
class EventBus {
    constructor() {
        this.listeners = new Map();
    }
    on(event, handler) {
        const existing = this.listeners.get(event) || [];
        existing.push(handler);
        this.listeners.set(event, existing);
    }
    emit(event, payload) {
        const handlers = this.listeners.get(event) || [];
        for (const handler of handlers) {
            Promise.resolve(handler(payload)).catch((err) => {
                console.error(`Error in event "${event}" handler:`, err);
            });
        }
    }
}
exports.EventBus = EventBus;
exports.eventBus = new EventBus();
