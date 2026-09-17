import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Testing Library only auto-registers cleanup when Vitest globals are on;
// unmount between tests explicitly so one test's DOM never leaks into the next.
afterEach(() => cleanup());
