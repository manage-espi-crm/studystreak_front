import ajaxCall from "./ajaxCall";
import { getFromLocalStorage } from "./helperFunction";

// Console output only in development (npm start)
const isDevelopment = process.env.NODE_ENV === "development";

// Max reports per page load, and minimum gap before the same error is sent again
const MAX_REPORTS_PER_PAGE = 20;
const REPEAT_WINDOW_MS = 10000;
let reportCount = 0;
const lastSentAt = {};

const logger = {
  log: (...args) => {
    if (isDevelopment) console.log(...args);
  },
  warn: (...args) => {
    if (isDevelopment) console.warn(...args);
  },
  error: (...args) => {
    if (isDevelopment) console.error(...args);
  },
  group: (...args) => {
    if (isDevelopment) console.group(...args);
  },
  groupEnd: () => {
    if (isDevelopment) console.groupEnd();
  },

  // Sends the error to /client-log/
  report: (error, context = {}) => {
    try {
      const message = String(error?.message || error || "Unknown error").slice(0, 500);
      const page = window.location.pathname;
      const key = `${message}|${page}`;
      const now = Date.now();
      if (reportCount >= MAX_REPORTS_PER_PAGE || now - (lastSentAt[key] || 0) < REPEAT_WINDOW_MS) {
        return;
      }
      reportCount += 1;
      lastSentAt[key] = now;

      const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
      };
      const accessToken = getFromLocalStorage("loginInfo", true)?.accessToken;
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      ajaxCall(
        "/client-log/",
        {
          headers,
          method: "POST",
          body: JSON.stringify({
            message,
            stack: error?.stack,
            component_stack: context.componentStack,
            page,
            request_id: context.requestId,
          }),
        },
        8000
      );
    } catch (e) {
      // Ignore errors while reporting
    }
  },
};

export default logger;
