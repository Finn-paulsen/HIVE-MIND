import { useSyncExternalStore } from 'react';

export const AUDIT_EVENTS = Object.freeze({
  SEARCH_EXECUTED: 'SEARCH_EXECUTED',
  LAYER_TOGGLED: 'LAYER_TOGGLED',
  ASSET_OPENED: 'ASSET_OPENED',
});

const STORE_KEY = '__HIVE_MIND_AUDIT_STORE__';

function getStore() {
  if (!globalThis[STORE_KEY]) {
    globalThis[STORE_KEY] = {
      events: [],
      listeners: new Set(),
    };
  }

  return globalThis[STORE_KEY];
}

function notifyListeners() {
  const store = getStore();
  store.listeners.forEach(listener => listener());
}

export function logEvent(type, payload = {}) {
  const store = getStore();
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    payload,
    timestamp: new Date().toISOString(),
  };

  store.events = [...store.events, entry].slice(-100);
  if (import.meta.env.DEV) {
    console.info('[AUDIT]', entry.type, entry.payload, entry.timestamp);
  }
  notifyListeners();

  return entry;
}

function subscribe(listener) {
  const store = getStore();
  store.listeners.add(listener);

  return () => {
    store.listeners.delete(listener);
  };
}

function getSnapshot() {
  return getStore().events;
}

export function clearAuditLog() {
  const store = getStore();
  store.events = [];
  notifyListeners();
}

export function useAuditLog() {
  const events = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return {
    events,
    clearLog: clearAuditLog,
  };
}
