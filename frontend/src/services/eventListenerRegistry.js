// eventListenerRegistry.js

// A simple registry to track global event listeners
const eventListenersRegistry = [];

/**
 * Adds an event listener and registers it.
 * @param {string} event - The event name.
 * @param {function} callback - The callback function.
 * @param {object|boolean} options - Options for the event listener.
 */
export function addGlobalEventListener(event, callback, options) {
  window.addEventListener(event, callback, options);
  eventListenersRegistry.push({
    event,
    callback,
    options,
    lastUsed: Date.now(), // record the time of registration/use
  });
}

/**
 * Updates the last used time for a given listener (if you reuse it).
 * @param {string} event - The event name.
 * @param {function} callback - The callback function.
 */
export function updateListenerUsage(event, callback) {
  const listener = eventListenersRegistry.find(
    (l) => l.event === event && l.callback === callback
  );
  if (listener) listener.lastUsed = Date.now();
}

/**
 * Removes listeners that have been inactive beyond the threshold.
 * @param {number} threshold - Time in milliseconds to consider a listener stale.
 */
export function cleanupEventListeners(threshold = 60000) {
  const now = Date.now();
  // Filter out and remove stale listeners
  eventListenersRegistry.forEach((listener, index) => {
    if (now - listener.lastUsed > threshold) {
      window.removeEventListener(
        listener.event,
        listener.callback,
        listener.options
      );
      // Optionally, mark the entry as null or remove it from the registry array
      eventListenersRegistry[index] = null;
    }
  });
  // Clean up nulls from the registry
  return eventListenersRegistry.filter(Boolean);
}
