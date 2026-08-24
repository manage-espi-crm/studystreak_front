import { jwtDecode } from "jwt-decode";
import store from "../store";
import { authAction } from "../store/authStore";
import ajaxCall from "./ajaxCall";

Storage.prototype.setObject = (key, value) => {
  this.setItem(key, JSON.stringify(value));
};

const setToLocalStorage = (key, value, isObj) => {
  let data = value;
  if (isObj) data = JSON.stringify(value);
  localStorage.setItem(key, data);
  return true;
};

const getFromLocalStorage = (key, isObj) => {
  if (localStorage.getItem(key)) {
    if (isObj) return JSON.parse(localStorage.getItem(key));
    return localStorage.getItem(key);
  }
  return -1;
};

const deleteFromLocalStorage = (key) => {
  localStorage.removeItem(key);
};

const getRefreshToken = async (refreshToken) => {
  const response = await ajaxCall(
    "/token/refresh/",
    {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    "POST",
    JSON.stringify({
      refresh: refreshToken,
    })
  );
  if (response.msg === "login Successful") {
    const localObj = {
      accessToken: response.token.access,
      refreshToken: response.token.refresh,
      user_type: response.token.user_status,
      userId: response.token.userid,
      timeOfLogin: Date.now(),
    };
    setToLocalStorage("loginInfo", localObj, true);
  }
};

// Shared logout routine so every failure path (expired refresh token, network
// error during refresh, etc.) leaves auth state consistent instead of each
// call site re-implementing its own copy.
const forceLogout = () => {
  store.dispatch(
    authAction.setAuthStatus({
      username: "",
      authLoading: false,
      loggedIn: false,
      accessToken: null,
      refreshToken: null,
      userId: null,
      user_type: null,
      user_role: null,
      timeOfLogin: null,
      logInOperation: 0,
    })
  );
  localStorage.clear();
  window.location.href = "/login";
};

// Checks the ACTUAL JWT expiry (`exp` claim) instead of an arbitrary window
// since login, and refreshes only when the token is genuinely close to
// expiring. Return shape is kept identical to the previous implementation
// (`-1` / `true` / `{ data: { access } }`) so callers don't need to change.
async function authenticateUser(accessToken, refreshToken) {
  if (!accessToken) {
    deleteFromLocalStorage("loginInfo");
    return -1;
  }

  let expiresAt;
  try {
    expiresAt = jwtDecode(accessToken).exp * 1000;
  } catch (error) {
    deleteFromLocalStorage("loginInfo");
    return -1;
  }

  const thirtySeconds = 30000;
  if (expiresAt - Date.now() >= thirtySeconds) {
    return true;
  }

  const newAccessToken = await getAndSetRefreshToken();
  if (!newAccessToken) {
    // getAndSetRefreshToken() already forces logout on a real failure; this
    // also covers the edge case where no refreshToken was stored at all.
    return -1;
  }

  return { data: { access: newAccessToken } };
}

// Concurrent requests whose tokens are all near-expiry (e.g. several widgets
// fetching on the same idle-then-reactivated page) would previously each
// call this independently, racing to redeem the same single-use refresh
// token. `refreshPromise` makes them share one in-flight refresh instead.
let refreshPromise = null;

const getAndSetRefreshToken = () => {
  if (!refreshPromise) {
    refreshPromise = doRefreshToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

const doRefreshToken = async () => {
  const { refreshToken, timeOfLogin, userId, user_role, user_type, username } =
    getFromLocalStorage("loginInfo", true) || {};

  if (refreshToken) {
    try {
      const baseUrl = process.env.REACT_APP_API_BASE_URL;
      const response = await fetch(
        `${baseUrl}/token/refresh/`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({ refresh: refreshToken }),
        }
      );

      if (response.status === 401) {
        forceLogout();
        return;
      }

      const data = await response.json();

      if (response?.status === 200 && data?.access) {
        const localObj = {
          //update access token and set existing data as it is
          user_type,
          userId,
          user_role,
          timeOfLogin,
          username,
          refreshToken,
          accessToken: data.access,
        };
        setToLocalStorage("loginInfo", localObj, true); //set data to local storage
        //update data to the store
        store.dispatch(
          authAction.setRefreshTokenAuthStatus({
            accessToken: data?.access,
          })
        );
        return data?.access;
      }
    } catch (error) {
      forceLogout();
    }
  }
  return "";
};

export {
  setToLocalStorage,
  getFromLocalStorage,
  deleteFromLocalStorage,
  getRefreshToken,
  authenticateUser,
  getAndSetRefreshToken,
  forceLogout,
};
