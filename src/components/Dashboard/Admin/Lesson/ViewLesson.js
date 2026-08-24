import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ajaxCall from "../../../../helpers/ajaxCall";
import Loading from "../../../UI/Loading";
import Table from "../../../UI/Table";
import SmallModal from "../../../UI/Modal";
import EditLesson from "./EditLesson";
import SingleSelection from "../../../UI/SingleSelect";

const ViewLesson = ({ activeTab }) => {
  const [refresh, setRefresh] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lessonList, setLessonList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState({});
  const [categoryFilter, setCategoryFilter] = useState("");
  const authData = useSelector((state) => state.authStore);

  const ViewButton = ({ url }) =>
    url !== "-" ? (
      <button className="take-test" onClick={() => window.open(url)}>
        View
      </button>
    ) : (
      "-"
    );

  const openEditModal = (lesson) => {
    setSelectedLesson(lesson);
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (activeTab === "View Lesson") {
      setIsLoading(true);
      (async () => {
        try {
          let lessons = [];
          let page = 1;
          let hasNext = true;

          while (hasNext) {
            const params = categoryFilter
              ? `category=${categoryFilter}&page=${page}`
              : `page=${page}`;
            const response = await ajaxCall(
              `/lesson-get/?${params}`,
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
            if (response.status !== 200) break;

            const pageData = Array.isArray(response?.data)
              ? response.data
              : response?.data?.results || [];
            lessons = [...lessons, ...pageData];
            hasNext = Boolean(response?.data?.next);
            page += 1;
          }

          setLessonList(lessons);
        } catch (error) {
          console.log("error", error);
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [refresh, activeTab, authData?.accessToken, categoryFilter]);

  const columns = [
    {
      headerName: "Action",
      field: "id",
      filter: true,
      width: 150,
      cellRenderer: (params) => (
        <button
          className="take-test"
          onClick={() => openEditModal(params.data)}
        >
          Edit
        </button>
      ),
    },
    {
      headerName: "No.",
      field: "no",
      resizable: false,
      width: 60,
      cellRenderer: (params) => params.rowIndex + 1,
    },
    { headerName: "Lesson Title", field: "Lesson_Title", filter: true },
    { headerName: "Course Category", field: "category_name", filter: true },
    {
      headerName: "Lesson Description",
      field: "Lesson_Description",
      filter: true,
    },
    { headerName: "Lesson Duration", field: "Lesson_Duration", filter: true },
    { headerName: "Active", field: "active", filter: true },
    {
      headerName: "Lesson Video",
      field: "Lesson_Video",
      filter: true,
      cellRenderer: (params) => <ViewButton url={params.value} />,
    },
    {
      headerName: "No of Assignment",
      field: "lesson_assignment.length",
      filter: true,
    },
    {
      headerName: "No of Attachment",
      field: "lesson_attachments.length",
      filter: true,
    },
    {
      headerName: "No of Quiz",
      field: "quiz_questions.length",
      filter: true,
    },
  ];

  return (
    <>
      <div className="row">
        <div className="col-xl-6 col-lg-6 col-md-6 col-12 mb-4">
          <div className="dashboard__select__heading">
            <span>Course Category</span>
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
      ) : lessonList.length > 0 ? (
        <Table rowData={lessonList} columnDefs={columns} />
      ) : (
        <h5 className="text-center text-danger">No Lesson Available !!</h5>
      )}
      <SmallModal
        size="lg"
        centered
        title={selectedLesson?.Lesson_Title}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        {selectedLesson && (
          <EditLesson
            lesson={selectedLesson}
            setRefresh={setRefresh}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </SmallModal>
    </>
  );
};

export default ViewLesson;
