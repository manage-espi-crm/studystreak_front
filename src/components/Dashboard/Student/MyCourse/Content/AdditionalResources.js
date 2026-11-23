import React, { useEffect, useState } from "react";
import ajaxCall from "../../../../../helpers/ajaxCall";
import Table from "../../../../UI/Table";
import BuyCourse from "../../BuyCourse/BuyCourse";

const AdditionalResources = ({ courseId }) => {
  const [hasAccess, setHasAccess] = useState(true);
  const [additionalResource, setAdditionalResource] = useState([]);

  const doDownload = (params) => {
    return (
      <button className="take-test" onClick={() => window.open(params.value)}>
        <i className="icofont-download" /> Download
      </button>
    );
  };

  useEffect(() => {
    (async () => {
      try {
        const response = await ajaxCall(
          `/additional-resources/${courseId}/`,
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
          setHasAccess(response?.data?.has_access !== false);
          setAdditionalResource(response?.data?.data);
        } else {
          console.log("error");
        }
      } catch (error) {
        console.log("error:", error);
      }
    })();
  }, [courseId]);

  const columns = [
    {
      headerName: "No.",
      field: "no",
      width: 60,
      cellRenderer: (params) => params.rowIndex + 1,
    },
    { headerName: "Name", field: "info", filter: true, width: 250 },
    {
      headerName: "Download",
      field: "course_files",
      cellRenderer: doDownload,
    },
  ];

  return (
    <div>
      <div className="dashboard__section__title">
        <h4>Additional Resources</h4>
      </div>
      {hasAccess ? (
        <Table rowData={additionalResource} columnDefs={columns} />
      ) : (
        <BuyCourse message="You are not enrolled in this course. Buy a package to access its resources." />
      )}
    </div>
  );
};

export default AdditionalResources;
