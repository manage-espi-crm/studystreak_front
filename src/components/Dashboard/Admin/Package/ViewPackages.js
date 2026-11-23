import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Table from "../../../UI/Table";
import Loading from "../../../UI/Loading";
import ajaxCall from "../../../../helpers/ajaxCall";
import SingleSelection from "../../../UI/SingleSelect";

const columns = [
  {
    headerName: "No.",
    field: "no",
    resizable: false,
    width: 80,
  },
  { headerName: "Name", field: "package_name", filter: true },
  { headerName: "Price", field: "package_price", filter: true },
  {
    headerName: "Type",
    field: "PackageType.name",
    filter: true,
  },
  {
    headerName: "Course",
    field: "select_course.Course_Title",
    filter: true,
  },
  {
    headerName: "Additional Courses",
    field: "additional_courses",
    filter: true,
    width: 280,
    cellRenderer: ({ data }) =>
      data.additional_courses?.map((item) => item.Course_Title).join(", ") ||
      "-",
  },
  { headerName: "Validity", field: "duration" },
  {
    headerName: "Total Full Length Test",
    field: "full_length_test_count",
    filter: true,
  },
  {
    headerName: "Total Practice Test",
    field: "practice_test_count",
    filter: true,
  },
  {
    headerName: "Speaking Test",
    field: "speaking_test_count",
    filter: true,
  },
  {
    headerName: "Total Writing Evaluation",
    field: "writing_evaluation_count",
    filter: true,
  },
  {
    headerName: "Total Group Doubt Solving",
    field: "group_doubt_solving_count",
    filter: true,
  },
  {
    headerName: "Total One To One Doubt Solving",
    field: "one_to_one_doubt_solving_count",
    filter: true,
  },
  {
    headerName: "Total Tutor Support Classes",
    field: "tutor_support_count",
    filter: true,
  },
  {
    headerName: "Total Webianr Classes",
    field: "webinar_count",
    filter: true,
  },
  {
    headerName: "Total Counselling Classes",
    field: "counselling_count",
    filter: true,
  },
];

const ViewPackages = ({ activeTab }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [packageList, setPackageList] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const authData = useSelector((state) => state.authStore);

  useEffect(() => {
    if (activeTab === "View Package") {
      setIsLoading(true);
      (async () => {
        try {
          const url = categoryFilter
            ? `/packagelistview/?category=${categoryFilter}`
            : "/packagelistview/";
          const response = await ajaxCall(
            url,
            {
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${authData?.accessToken}`,
              },
              method: "GET",
            },
            8000
          );
          if (response?.status === 200) {
            const list = Array.isArray(response?.data)
              ? response.data
              : response?.data?.results || [];
            const packageWithNumbers = list.map(
              (packageItem, index) => ({
                ...packageItem,
                no: index + 1,
              })
            );
            setPackageList(packageWithNumbers);
          }
        } catch (error) {
          console.log("error", error);
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [authData?.accessToken, activeTab, categoryFilter]);

  return (
    <>
      <div className="row">
        <div className="col-xl-6 col-lg-6 col-md-6 col-12 mb-4">
          <div className="dashboard__select__heading">
            <span>Category</span>
          </div>
          <div className="dashboard__selector">
            <SingleSelection
              value={categoryFilter}
              onChange={(val) => setCategoryFilter(val)}
              url="/categoryview/"
              objKey={["name"]}
              isSearch={true}
              withBlankOption={true}
            />
          </div>
        </div>
      </div>
      {isLoading ? (
        <Loading />
      ) : packageList.length > 0 ? (
        <Table rowData={packageList} columnDefs={columns} />
      ) : (
        <h5 className="text-center text-danger">No Packages Available !!</h5>
      )}
    </>
  );
};

export default ViewPackages;
