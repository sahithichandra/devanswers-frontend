import "@testing-library/jest-dom"; // for custom matchers
import { server } from "./mocks/server";
import { beforeAll, afterEach, afterAll } from "vitest";

// jsdom 26+ doesn't fully implement the Storage interface unless a localstorage
// file path is provided. Provide a complete in-memory mock so all tests can use
// localStorage.getItem / setItem / removeItem / clear reliably.
const createStorageMock = () => {
  let store = {};
  return {
    getItem: (key) =>
      Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null,
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index) => Object.keys(store)[index] ?? null,
  };
};

Object.defineProperty(window, "localStorage", {
  value: createStorageMock(),
  writable: true,
  configurable: true,
});

// Establish API mocking before all tests
beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));

// Reset any request handlers that we may add during tests
afterEach(() => server.resetHandlers());

// Clean up after tests are finished
afterAll(() => server.close());
