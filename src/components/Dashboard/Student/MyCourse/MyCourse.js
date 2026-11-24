import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import moment from "moment";
import { SquareArrowOutUpRight } from "lucide-react";
import Loading from "../../../UI/Loading";
import DSSidebar from "../DSSideBar/DSSideBar";
import BuyCourse from "../BuyCourse/BuyCourse";
import ajaxCall from "../../../../helpers/ajaxCall";
import { openLoaderTab } from "../../../../helpers/tcy";

const MyCourse = () => {
  const navigate = useNavigate();
  const [courseList, setCourseList] = useState([]);
  const [expiryDate, setExpiryDate] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const courseIds = JSON.parse(localStorage.getItem("courses"));
  const category = JSON.parse(localStorage.getItem("course"))?.course_category;

  const courses = courseList.filter((course) =>
    courseIds.some(
      (data) => data === course?.id && course?.Category?.name === category
    )
  );

  const coursesWithExpiry = courses.map((course) => {
    const expiry = expiryDate.find((exp) => exp.course_id === course.id);
    return {
      ...course,
      expiryDate: expiry ? expiry.expiry_date : null,
    };
  });

  const fetchCourses = useCallback(async () => {
    try {
      const response = await ajaxCall(
        // Free courses are hidden from public listings, but a student who got
        // one bundled with a package still has it in My Courses.
        "/courselistview/?include_additional_free=true",
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
        setCourseList(
          Array.isArray(response.data)
            ? response.data
            : response.data?.results || []
        );
      }
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchExpiryDates = useCallback(async () => {
    try {
      const response = await ajaxCall(
        "/student/course-enrollment/",
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
        setExpiryDate(response.data);
      }
    } catch (error) {
      console.log("error", error);
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    fetchExpiryDates();
  }, [fetchExpiryDates]);

  // Opens the student's TCY dashboard (TCY auto-login link) in a new tab
  const openTcyCourse = async (courseId) => {
    // Tab opened before the API call, so the browser does not block it as a popup
    const tcyTab = openLoaderTab();
    const response = await ajaxCall(
      `/tcyloginview/${courseId}/`,
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

  const getDaysRemaining = (endDate) => {
    const end = moment(endDate);
    const today = moment();
    return end.diff(today, "days");
  };
  const formatDuration = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);

    if (hours > 0) {
      return `${hours} Hrs, ${minutes} Minutes`;
    } else {
      return `${minutes} Minutes`;
    }
  };

  const myCourseButtonStyle = {
    paddingLeft: 8,
    paddingRight: 8,
    fontSize: 14,
    whiteSpace: "nowrap",
  };

  return (
    <div className="body__wrapper">
      <div className="main_wrapper overflow-hidden">
        <div className="dashboardarea sp_bottom_100">
          <div className="dashboard">
            <div className="container-fluid full__width__padding">
              <div className="row">
                <DSSidebar />
                <div className="col-xl-12 col-lg-12 col-md-12">
                  <div className="dashboard__content__wraper common-background-color-across-app">
                    <div className="dashboard__section__title flex-wrap gap-2">
                      <h4>Courses</h4>
                      <h5 className="text-danger mb-0">
                        {coursesWithExpiry
                          ?.filter((item) => item.expiryDate)
                          ?.map((item, index) => {
                            const daysRemaining = getDaysRemaining(
                              item.expiryDate
                            );
                            return (
                              <span
                                key={index}
                                style={{
                                  display: "block",
                                  marginBottom: "4px",
                                }}
                              >
                                {item.Course_Title} :{" "}
                                {daysRemaining > 0
                                  ? `${daysRemaining} days Left`
                                  : daysRemaining === 0
                                  ? "Expires Today"
                                  : "Expired"}
                              </span>
                            );
                          })}
                      </h5>
                    </div>
                    <div className="row">
                      {isLoading ? (
                        <Loading />
                      ) : courses?.length > 0 ? (
                        courses?.map((item, index) => (
                          <div
                            className="col-xl-4 col-lg-6 col-md-6 col-sm-6 col-12"
                            key={index}
                          >
                            <div
                              className="gridarea__wraper gridarea__wraper__2 global-neomorphism-card-styling d-flex flex-column"
                              style={{ height: "calc(100% - 50px)" }}
                            >
                              <div
                                className="gridarea__img"
                                style={{
                                  height: 192,
                                  background: "#E9E7EF", 
                                }}
                              >
                                <img
                                  src={item?.Course_Thumbnail}
                                  alt={item?.Course_Title}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain",
                                    borderRadius: 0,
                                  }}
                                />
                              </div>
                              <div className="gridarea__content d-flex flex-column justify-content-between flex-grow-1">
                                <div className="gridarea__heading">
                                  <h3>{item?.Course_Title}</h3>
                                </div>
                                <div className="gridarea__list">
                                  <ul className="ps-0">
                                    <li>
                                      <i className="icofont-book-alt"></i>{" "}
                                      {item?.total_lesson} Lessons
                                    </li>
                                    <li>
                                      <i className="icofont-clock-time"></i>{" "}
                                      {formatDuration(item?.total_duration)}
                                    </li>
                                  </ul>
                                </div>
                                <div className="d-flex flex-column gap-2 mt-auto">
                                  {item?.is_tcy_course && (
                                    <button
                                      onClick={() => openTcyCourse(item?.id)}
                                      className="default__button w-100"
                                      style={myCourseButtonStyle}
                                    >
                                      Practice Exam
                                      {/* Opens in a new tab */}
                                      <SquareArrowOutUpRight
                                        size={14}
                                        style={{ display: "inline-block", marginLeft: 6, verticalAlign: "middle" }}
                                      />
                                    </button>
                                  )}
                                  <div className="d-flex flex-wrap gap-2">
                                    <button
                                      onClick={() =>
                                        navigate(`/courseLessons/${item?.id}`)
                                      }
                                      className="default__button flex-fill"
                                      style={myCourseButtonStyle}
                                    >
                                      Start Lessons
                                    </button>
                                    <button
                                      onClick={() =>
                                        navigate(`/courseMaterials/${item?.id}`)
                                      }
                                      className="default__button flex-fill"
                                      style={myCourseButtonStyle}
                                    >
                                      View Materials
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <BuyCourse message="No Courses Available, Please Buy a Course !!" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCourse;
