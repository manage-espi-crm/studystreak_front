import { toast } from "react-toastify";
import ajaxCall from "./ajaxCall";

export const openTcyPage = async (category, url) => {
  const tcyTab = window.open("", "_blank");
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
