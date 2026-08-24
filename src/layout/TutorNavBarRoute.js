import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { Box } from "@mui/material";
import NavBar from "../components/NavBar/NavBar";
import MobileTopBar from "../components/TopBar/MobileTopBar";
import DTLeftDrawer from "../components/Dashboard/Tutor/DTSideBar/DTLeftDrawer";
import { useCheckAuth } from "../hooks/useCheckAuth";
import Loading from "../components/UI/Loading";

const TutorNavBarRoute = ({ isProtected }) => {
  const authData = useSelector((state) => state.authStore);
  const { checkAuth } = useCheckAuth();

  useEffect(() => {
    if (isProtected) checkAuth();
  }, [authData, checkAuth, isProtected]);

  if (isProtected && authData?.authLoading) {
    return <Loading />;
  }

  if (isProtected && !authData?.loggedIn) {
    return <Navigate to="/" />;
  }

  return isProtected ? (
    <Box
      sx={(theme) => ({
        [theme.breakpoints.up(991)]: {
          display: "flex",
        },
      })}
    >
      <Box
        sx={(theme) => ({
          [theme.breakpoints.down(991)]: {
            display: "none",
          },
        })}
      >
        <DTLeftDrawer />
      </Box>
      <Box
        className="fixing-navbar-at-top-side"
        sx={(theme) => ({
          [theme.breakpoints.up(991)]: {
            display: "none",
          },
        })}
      >
        <MobileTopBar />
      </Box>
      <Box width="100%">
        <Outlet />
      </Box>
    </Box>
  ) : (
    <>
      <div className="fixing-navbar-at-top-side">
        <NavBar showNavBar={false} />
        <MobileTopBar />
      </div>
      <Box mt="70px">
        <Outlet />
      </Box>
    </>
  );
};

export default TutorNavBarRoute;
