import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ajaxCall from "../../../../helpers/ajaxCall";
import { openTcyPage } from "../../../../helpers/tcy";
import { useCheckAuth } from "../../../../hooks/useCheckAuth";
import {
  Box,
  List,
  styled,
  ListItem,
  CssBaseline,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Tooltip,
} from "@mui/material";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import NavBar from "../../../NavBar/NavBar";
import NoticeBoard from "../Dashboard/NoticeBoard/NoticeBoard";
import {
  BookCheck,
  BookCopy,
  LayoutPanelLeft,
  LogOut,
  NotebookPen,
  NotepadTextDashed,
  Pencil,
  Scroll,
  Settings,
  SquareArrowOutUpRight,
  UserPen,
  WalletCards,
  BookMarked,
  ClipboardList,
  CirclePlay,
  FolderOpen,
  Video,
} from "lucide-react";

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 12px)`,
  },
});

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

const DSLeftDrawer = () => {
  const location = useLocation().pathname;
  const category = JSON.parse(localStorage.getItem("course"))?.course_category;
  const hasTcyCourse = JSON.parse(localStorage.getItem("course"))?.has_tcy_course;
  const { logoutUser } = useCheckAuth();

  const [open, setOpen] = useState(true);
  const [count, setCount] = useState({
    count: 0,
    all_pt_count: 0,
    practice_test_count: 0,
    all_flt_count: 0,
    full_length_test_count: 0,
  });
  const [givenPTCount, setGivenPTCount] = useState(0);
  const [givenFLTCount, setGivenFLTCount] = useState(0);
  // Old hover open / close, replaced by burger click
  /* const [, setHovered] = useState(false); */

  const logout = (event) => {
    event.preventDefault();
    logoutUser();
  };

  /* const handleMouseEnter = () => {
    setHovered(true);
    if (!open) setOpen(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    if (open) setOpen(false);
  }; */

  // Burger click opens / closes the side menu
  const handleMenuClick = () => setOpen((prev) => !prev);

  // Category changed on the dashboard: re-render to read the saved course again
  const [, setCourseVersion] = useState(0);
  useEffect(() => {
    const onCourseChange = () => setCourseVersion((v) => v + 1);
    window.addEventListener("courseChange", onCourseChange);
    return () => window.removeEventListener("courseChange", onCourseChange);
  }, []);

  const menuList =
    category === "IELTS" || count?.count === 0
      ? [
          {
            name: "Dashboard",
            icon: <LayoutPanelLeft />,
            link: "/studentDashboard",
          },
          {
            name: "My Profile",
            icon: <UserPen />,
            link: "/studentProfile",
          },
          {
            name: "My Course",
            icon: <BookCopy />,
            link: "/studentMyCourse",
          },
          // Practice Exam disabled for a student without an IELTS TCY course
          ...(category === "IELTS"
            ? [
                {
                  name: "Practice Exam",
                  icon: <NotebookPen />,
                  disabled: !hasTcyCourse,
                  onClick: () =>
                    openTcyPage(category, "/tcypracticetestview/"),
                },
              ]
            : []),
          {
            name: "Paper Test",
            icon: <Scroll />,
            link: "/paperTest",
            state: { packageCount: count?.count },
          },
          {
            name: "Mini Test",
            icon: <BookCheck />,
            link: "/mockTest",
            state: { count: count?.count },
          },
          {
            name: "Practice Test",
            icon: <Pencil />,
            link: "/practiceTest",
            state: {
              count: count?.practice_test_count,
              packageCount: count?.count,
            },
          },
          {
            name: "Full Length Test",
            icon: <ClipboardList />,
            link: "/fullLengthTest",
            state: {
              count: count?.full_length_test_count,
              packageCount: count?.count,
            },
          },
          {
            name: "Diagnostic Test",
            icon: <NotepadTextDashed />,
            link: "/diagnosticTest",
            state: {
              packageCount: count?.count,
            },
          },
          {
            name: "Live Classes",
            icon: <Video />,
            link: "/studentLiveClasses",
            state: { packageCount: count?.count },
          },
          {
            name: "Recorded Classes",
            icon: <CirclePlay />,
            link: "/recordedClasses",
            state: { packageCount: count?.count },
          },
          {
            name: "Flash Card",
            icon: <WalletCards />,
            link: "/flashCard",
            state: { packageCount: count?.count },
          },
          {
            name: "Resources",
            icon: <FolderOpen />,
            link: "/resources",
            state: { packageCount: count?.count },
          },
          {
            name: "Reports",
            icon: <BookMarked />,
            link: "/reports",
          },
          {
            name: "Settings",
            icon: <Settings />,
            link: "/studentSettings",
          },
          {
            name: "Logout",
            icon: <LogOut />,
            link: "/logout",
          },
        ]
      : category === "PTE" || category === "DUOLINGO" || category === "TOEFL"
      ? [
          {
            name: "Dashboard",
            icon: <LayoutPanelLeft />,
            link: "/studentDashboard",
          },
          {
            name: "My Profile",
            icon: <UserPen />,
            link: "/studentProfile",
          },
          {
            name: "My Course",
            icon: <BookCopy />,
            link: "/studentMyCourse",
          },
          // Free Mock Test hidden from the PTE menu
          /* {
            name: "Free Mock Test",
            icon: <Ribbon />,
            link: "/PTE/FreeMockTest",
          }, */
          {
            name: "Practice Exam",
            icon: <NotebookPen />,
            disabled: !hasTcyCourse,
            onClick: () => openTcyPage(category, "/tcypracticetestview/"),
          },
          {
            name: "Diagnostic Test",
            icon: <NotepadTextDashed />,
            link: "/diagnosticTest",
          },
          // PTE section items hidden from the PTE menu
          /* {
            name: "PTE Speaking",
            icon: <Mic />,
            link: "/PTE/Speaking",
          },
          {
            name: "PTE Writing",
            icon: <SquarePen />,
            link: "/PTE/Writing",
          },
          {
            name: "PTE Reading",
            icon: <PcCase />,
            link: "/PTE/Reading",
          },
          {
            name: "PTE Listening",
            icon: <BookHeadphones />,
            link: "/PTE/Listening",
          }, */
          {
            name: "Live Classes",
            icon: <Video />,
            link: "/studentLiveClasses",
          },
          // Resources hidden from the PTE menu
          /* {
            name: "Resources",
            icon: <FolderOpen />,
            link: "/resources",
          }, */
          {
            name: "Recorded Classes",
            icon: <CirclePlay />,
            link: "/recordedClasses",
            state: { packageCount: count?.count },
          },
          {
            name: "Flash Card",
            icon: <WalletCards />,
            link: "/flashCard",
          },
          // Old PTE Reports page
          /* {
            name: "Reports",
            icon: <BookMarked />,
            link: "/PTE/Dashboard",
          }, */
          {
            name: "Reports",
            icon: <BookMarked />,
            disabled: !hasTcyCourse,
            onClick: () => openTcyPage(category, "/tcyreportsview/"),
          },
          {
            name: "Settings",
            icon: <Settings />,
            link: "/studentSettings",
          },
          {
            name: "Logout",
            icon: <LogOut />,
            link: "/logout",
          },
        ]
      : [
          {
            name: "Dashboard",
            icon: <LayoutPanelLeft />,
            link: "/studentDashboard",
          },
          {
            name: "My Profile",
            icon: <UserPen />,
            link: "/studentProfile",
          },
          {
            name: "My Course",
            icon: <BookCopy />,
            link: "/studentMyCourse",
          },
          {
            name: "Paper Test",
            icon: <Scroll />,
            link: "/paperTest",
            state: { packageCount: count?.count },
          },
          {
            name: "Mini Test",
            icon: <BookCheck />,
            link: "/mockTest",
            state: { count: count?.count },
          },
          {
            name: "Practice Test",
            icon: <Pencil />,
            link: "/practiceTest",
            state: {
              count: count?.practice_test_count,
              packageCount: count?.count,
            },
          },
          {
            name: "Diagnostic Test",
            icon: <NotepadTextDashed />,
            link: "/diagnosticTest",
            state: {
              packageCount: count?.count,
            },
          },
          {
            name: "Live Classes",
            icon: <Video />,
            link: "/studentLiveClasses",
          },
          {
            name: "Recorded Classes",
            icon: <CirclePlay />,
            link: "/recordedClasses",
          },
          {
            name: "Flash Card",
            icon: <WalletCards />,
            link: "/flashCard",
          },
          {
            name: "Resources",
            icon: <FolderOpen />,
            link: "/resources",
          },
          {
            name: "Reports",
            icon: <BookMarked />,
            link: "/reports",
          },
          {
            name: "Settings",
            icon: <Settings />,
            link: "/studentSettings",
          },
          {
            name: "Logout",
            icon: <LogOut />,
            link: "/logout",
          },
        ];

  useEffect(() => {
    (async () => {
      try {
        const response = await ajaxCall(
          "/student/course-enrollment/details/",
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

        if (response.status === 200) {
          const { data } = response;
          const batchIds = data?.batch_ids?.map((item) => item);
          const courseIds = data?.course_ids?.map((item) => item);

          const givenPTCount = data?.student_details?.student_pt;
          const givenFLTCount = data?.student_details?.student_flt;

          setGivenPTCount(givenPTCount);
          setGivenFLTCount(givenFLTCount);

          const totalPracticeTests = data?.package_details?.reduce(
            (sum, pkg) => sum + pkg.practice_test_count,
            0
          );

          const totalFullLengthTests = data?.package_details?.reduce(
            (sum, pkg) => sum + pkg.full_length_test_count,
            0
          );

          setCount({
            count: data?.course_count,
            all_pt_count: totalPracticeTests,
            practice_test_count: totalPracticeTests - givenPTCount,
            all_flt_count: totalFullLengthTests,
            full_length_test_count: totalFullLengthTests - givenFLTCount,
          });

          localStorage.setItem("StudentID", data?.student_details?.student_id);
          localStorage.setItem("BatchIds", JSON.stringify(batchIds));
          localStorage.setItem("courses", JSON.stringify(courseIds));
        } else {
          console.log("error");
        }
      } catch (error) {
        console.log("error", error);
      }
    })();
  }, [givenFLTCount, givenPTCount, open]);

  const labelStyle = { fontSize: 8, lineHeight: "12px", padding: "0 5px" };

  const getLabel = (itemName, count, givenCount) => {
    const countKey = itemName.replace(/ /g, "_").toLowerCase() + "_count";

    if (itemName === "Practice Test") {
      if (count?.all_pt_count === -1)
        return <span className="dashboard__label bg-success">All</span>;
      if (givenCount === count?.practice_test_count + givenCount)
        return <span className="dashboard__label bg-danger" style={labelStyle}>N/A</span>;
      return (
        <span className="dashboard__label">{count?.practice_test_count}</span>
      );
    }

    if (itemName === "Full Length Test") {
      if (count?.all_flt_count === -1)
        return <span className="dashboard__label bg-success">All</span>;
      if (givenCount === count?.full_length_test_count + givenCount)
        return <span className="dashboard__label bg-danger" style={labelStyle}>N/A</span>;
      return (
        <span className="dashboard__label">
          {count?.full_length_test_count}
        </span>
      );
    }

    return <span className="dashboard__label">{count?.[countKey]}</span>;
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed">
        <div className="fixing-navbar-at-top-side">
          <NavBar
            showNavBar={true}
            handleMenuClick={handleMenuClick}
          />
        </div>
      </AppBar>
      <Drawer
        variant="permanent"
        open={open}
        PaperProps={{
          sx: {
            backgroundColor: "#ebf2f5",
          },
        }}
      >
        <Box sx={{ overflow: "auto", mt: 8 }}>
          <List>
            {menuList.map((item, index) => (
              <ListItem
                key={`${item.name}-${index}`}
                disablePadding
                sx={{
                  display: "block",
                  borderBottom: "1px solid",
                  borderColor: "#d3d3d3",
                }}
              >
                <Link
                  className={
                    location === item.link
                      ? "active admin__menu"
                      : "admin__menu"
                  }
                  to={item.link || location}
                  onClick={
                    item.onClick
                      ? (e) => {
                          e.preventDefault();
                          if (!item.disabled) item.onClick();
                        }
                      : item.name === "Logout"
                      ? logout
                      : () => {}
                  }
                  state={item?.state}
                  style={{
                    textDecoration: "none",
                    color: location === item.link ? "#01579b" : "#000",
                    ...(item.disabled && {
                      opacity: 0.5,
                      cursor: "not-allowed",
                    }),
                  }}
                >
                  <Tooltip
                    title={open ? "" : item.name}
                    placement="right"
                    componentsProps={{ tooltip: { sx: { fontSize: 14 } } }}
                  >
                  <ListItemButton
                    sx={{
                      minHeight: 50,
                      justifyContent: "initial",
                      px: open ? 4 : 2.5,
                      pl: "22px",
                      pr: open ? 4 : 2.5,
                    }}
                  >
                    <ListItemIcon
                      className="admin__menu__icon"
                      sx={{
                        minWidth: 0,
                        display: "flex",
                        mr: open ? 3 : "auto",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                      style={{ height: 20, width: 20, color: "black" }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {open && (
                      <>
                        <ListItemText
                          className="side-navbar-rexr-color-common admin__menu__title"
                          primary={
                            <span style={{ whiteSpace: "nowrap" }}>
                              {item.name}
                              {/* Opens in a new tab */}
                              {item.onClick && (
                                <SquareArrowOutUpRight
                                  size={14}
                                  style={{ display: "inline-block", marginLeft: 6, verticalAlign: "middle" }}
                                />
                              )}
                            </span>
                          }
                        />
                        {getLabel(
                          item.name,
                          count,
                          item.name === "Practice Test"
                            ? givenPTCount
                            : givenFLTCount
                        )}
                      </>
                    )}
                  </ListItemButton>
                  </Tooltip>
                </Link>
              </ListItem>
            ))}
          </List>
        </Box>
        {open && <NoticeBoard />}
      </Drawer>
    </Box>
  );
};

export default DSLeftDrawer;
