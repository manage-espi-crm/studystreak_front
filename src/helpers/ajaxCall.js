import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { getAndSetRefreshToken, forceLogout } from "./helperFunction";
import logger from "./logger";

const ajaxCall = async (
  url,
  fetchObj = {},
  timeOut,
  timeOutFunction = () => {},
  _isRetry = false
) => {
  // /client-log/ calls are not reported
  const isReportCall = typeof url === "string" && url.startsWith("/client-log/");
  let serverErrorReported = false;
  try {
    const id = setTimeout(() => {
      timeOutFunction();
    }, timeOut);

    const token = fetchObj?.headers?.Authorization;

    if (token && !_isRetry) {
      const decodedToken = jwtDecode(token);
      const tokenExpirationTime = decodedToken.exp * 1000;

      const updatedToken = await checkTokenExpiration(
        token,
        tokenExpirationTime
      );
      if (updatedToken) {
        fetchObj.headers.Authorization = updatedToken;
      }
    }

    const baseUrl = process.env.REACT_APP_API_BASE_URL
    const response = await fetch(`${baseUrl}${url}`, fetchObj);
    clearTimeout(id);
    // Report 5xx responses with the request id
    if (response.status >= 500 && !isReportCall) {
      serverErrorReported = true;
      logger.report(new Error(`API ${response.status} ${String(url).split("?")[0]}`), {
        requestId: response.headers.get("X-Request-ID"),
      });
    }
    const data = await response.json();

    const result = {
      status: response.status,
      isError: !response.ok,
      isNetwork: false,
      data,
    };

    // Only reactive-refresh/retry requests that were actually authenticated.
    // Unauthenticated calls (login, signup, forgot-password, ...) keep their
    // existing 401 behaviour untouched — each of those pages already shows
    // its own "invalid credentials" style message.
    if (result.status === 401 && token) {
      if (!_isRetry) {
        const newAccessToken = await getAndSetRefreshToken();
        if (newAccessToken) {
          fetchObj.headers.Authorization = `Bearer ${newAccessToken}`;
          return ajaxCall(url, fetchObj, timeOut, timeOutFunction, true);
        }
        // getAndSetRefreshToken() already forces logout when it has a
        // refreshToken to try; this covers the case where none was stored.
        forceLogout();
        return result;
      }

      // Retried with a freshly refreshed token and still got 401 — the
      // session is genuinely invalid, not just a stale-token race.
      toast.error("Your session has expired. Please login again.", {
        toastId: "session-expired",
      });
      forceLogout();
      return result;
    }

    if (result.status === 403 && token) {
      toast.error("You do not have permission to perform this action.", {
        toastId: "permission-denied",
      });
    }

    return result;
  } catch (e) {
    // No toast for a failed error report
    if (!isReportCall) {
      toast.error("Something went wrong. Please check your connection and try again.", {
        toastId: "network-error",
      });
    }
    // Report network errors
    if (!isReportCall && !serverErrorReported) {
      logger.report(new Error(`API request failed ${String(url).split("?")[0]}: ${e?.message}`));
    }
    return {
      status: null,
      isError: true,
      isNetwork: true,
      data: null,
      error: e,
    };
  }
};

const checkTokenExpiration = async (token, tokenExpirationTime) => {
  const currentTime = new Date().getTime();
  const thirtySeconds = 30000;

  if (tokenExpirationTime - currentTime < thirtySeconds) {
    const newToken = await getAndSetRefreshToken();
    return `Bearer ${newToken}`;
  } else {
    return token;
  }
};

export default ajaxCall;
