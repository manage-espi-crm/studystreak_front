import { renderToStaticMarkup } from "react-dom/server";
import { toast } from "react-toastify";
import ajaxCall from "./ajaxCall";
import Loading from "../components/UI/Loading";

// New blank tab showing the app's Loading component (same markup and CSS) until the TCY link is ready
export const openLoaderTab = () => {
  const tab = window.open("", "_blank");
  if (!tab) return null;
  // App stylesheets copied into the blank tab, so the loader uses the real CSS
  const styles = [...document.querySelectorAll('link[rel="stylesheet"], style')]
    .map((el) => el.outerHTML)
    .join("");
  tab.document.write(`<!doctype html>
<html><head><title>Loading...</title><base href="${window.location.origin}/" />${styles}</head>
<body style="margin:0;height:100vh;display:flex;justify-content:center;align-items:center">
${renderToStaticMarkup(<Loading />)}
</body></html>`);
  tab.document.close();
  return tab;
};

export const openTcyPage = async (category, url) => {
  const tcyTab = openLoaderTab();
  const response = await ajaxCall(
    `${url}?category=${encodeURIComponent(category)}`,
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${
          JSON.parse(localStorage.getItem("loginInfo"))?.accessToken
        }`,
      },
      method: "GET",
    },
    8000
  );

  if (response.status === 200 && response.data?.link) {
    if (tcyTab) {
      // TCY page gets no access to this tab
      tcyTab.opener = null;
      tcyTab.location.href = response.data.link;
    } else {
      // New tab blocked: TCY opens in this tab
      window.location.href = response.data.link;
    }
    return;
  }
  tcyTab?.close();
  // Network / 401 / 403 errors: message already shown by ajaxCall
  if (!response.isNetwork && ![401, 403].includes(response.status)) {
    toast.error(response.data?.detail || "Please try again later.");
  }
};
