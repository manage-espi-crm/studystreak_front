import { useEffect } from "react";
import { useCheckAuth } from "../../hooks/useCheckAuth";

// Logs the user out and opens /login. Used as the sign-out redirect URL.
const Logout = () => {
  const { logoutUser } = useCheckAuth();

  useEffect(() => {
    logoutUser();
  }, [logoutUser]);

  return null;
};

export default Logout;
