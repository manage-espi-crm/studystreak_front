import React, { useEffect, useState } from "react";
import moment from "moment";
import ajaxCall from "../../../../../helpers/ajaxCall";

const PTEScoreCard = () => {
  const [lastExam, setLastExam] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await ajaxCall(
          "/tcydashboardscoreview/?category=PTE",
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
          setLastExam(response.data?.[0] || null);
        }
      } catch (error) {
        console.log("error", error);
      }
    })();
  }, []);

  return (
    <>
      <div className="col-xl-6 column__custom__class">
        <div className="gridarea__wraper card-background">
          <div className="gridarea__content">
            <div className="gridarea__heading">
              <h6>Your Latest Given PTE Exam</h6>
            </div>
            {lastExam ? (
              <div className="gridarea__price mb-0">
                <h5 className="text-break">{lastExam.test_name}</h5>
                <h5>Score : {lastExam.total_score}</h5>
                <h6>
                  {lastExam.attempt_date
                    ? moment(lastExam.attempt_date).format(
                        "MMM DD, YYYY hh:mm A"
                      )
                    : ""}
                </h6>
              </div>
            ) : (
              <h6 className="text-center text-danger">
                No Result Available !!
              </h6>
            )}
          </div>
        </div>
      </div>
      {/* Your Latest Given Diagnostic Test: title only, no data yet */}
      <div className="col-xl-6 column__custom__class">
        <div className="gridarea__wraper card-background">
          <div className="gridarea__content">
            <div className="gridarea__heading">
              <h6>Your Latest Given Diagnostic Test</h6>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PTEScoreCard;
