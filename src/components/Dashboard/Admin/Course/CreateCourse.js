import React, { useReducer, useState } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { Spinner } from "react-bootstrap";
import ajaxCall from "../../../../helpers/ajaxCall";
import slugify from "../../../../helpers/slugify";
import SingleSelection from "../../../UI/SingleSelect";
import SelectionBox from "../../../UI/SelectionBox";
import Tab from "../../../UI/Tab";

const initialCourseData = {
  Course_Title: "",
  slug: "",
  course_identifier: "",
  Short_Description: "",
  Description: "",
  Category: "",
  Level: "",
  Language: "",
  tutor: [],
  tutorId: [],
  EnrollmentStartDate: "",
  EnrollmentEndDate: "",
  max_enrollments: "",
  faqs: "",
  course_type: "PRIVATE",
  course_delivery: "SELF-STUDY",
  primary_instructor: "",
  Featured: false,
  Support_Available: false,
  is_additional_free_course: false,
  is_tcy_course: false,
  tcyCourse: "",
  is_active: false,
  Requirements: [],
  requirementId: [],
  Outcome: [],
  outcomeId: [],
  Course_Overview_Provider: "",
  Course_Overview_URL: "",
  Course_Thumbnail: "",
  course_banner: "",
  SEO_Meta_Keywords: [""],
  Meta_Description: [""],
  lessons: [],
  lessonsId: [],
};

const reducerCreateCourse = (state, action) => {
  if (action.type === "reset") {
    return action.payload || initialCourseData;
  }
  return { ...state, [action.type]: action.value };
};

const initialSubmit = { isError: false, errMsg: null, isSubmitting: false };

const tabs = [
  { name: "Course Details" },
  { name: "Requirements & Outcomes" },
  { name: "Course Media" },
  { name: "Course SEO" },
  { name: "Lessons" },
];

// Allowed characters for each SEO Meta Keywords / Meta Description item
const SLUG_PATTERN = /^[-a-zA-Z0-9_]+$/;

const validateForm = (createCourseData, setFormError) => {
  if (!createCourseData.Course_Title) {
    setFormError("Course Title is Required");
    return false;
  }
  if (!createCourseData.Short_Description) {
    setFormError("Short Description is Required");
    return false;
  }
  if (!createCourseData.Description) {
    setFormError("Description is Required");
    return false;
  }
  if (!createCourseData.Category) {
    setFormError("Category is Required");
    return false;
  }
  if (!createCourseData.Level) {
    setFormError("Level is Required");
    return false;
  }
  if (!createCourseData.Language) {
    setFormError("Language is Required");
    return false;
  }
  if (!createCourseData.EnrollmentStartDate) {
    setFormError("Enrollment Start Date is Required");
    return false;
  }
  if (!createCourseData.EnrollmentEndDate) {
    setFormError("Enrollment End Date is Required");
    return false;
  }
  if (!createCourseData.faqs) {
    setFormError("FAQs is Required");
    return false;
  }
  if (createCourseData.is_tcy_course && !createCourseData.tcyCourse) {
    setFormError("Select a TCY course.");
    return false;
  }
  if (createCourseData.requirementId.length === 0) {
    setFormError("Requirements is Required");
    return false;
  }
  if (createCourseData.outcomeId.length === 0) {
    setFormError("Outcomes is Required");
    return false;
  }
  if (!createCourseData.Course_Thumbnail) {
    setFormError("Course Thumbnail is Required");
    return false;
  }
  if (!createCourseData.course_banner) {
    setFormError("Course Banner is Required");
    return false;
  }
  // SEO fields optional; each filled item must match SLUG_PATTERN
  if (!createCourseData.SEO_Meta_Keywords.map((item) => item.trim()).filter(Boolean).every((item) => SLUG_PATTERN.test(item))) {
    setFormError("SEO Meta Keywords: use only letters, numbers, - and _ (no spaces)");
    return false;
  }
  if (!createCourseData.Meta_Description.map((item) => item.trim()).filter(Boolean).every((item) => SLUG_PATTERN.test(item))) {
    setFormError("Meta Description: use only letters, numbers, - and _ (no spaces)");
    return false;
  }
  return true;
};

const CreateCourse = ({ setMainTab }) => {
  const [createCourseData, dispatchCreateCourse] = useReducer(
    reducerCreateCourse,
    initialCourseData
  );
  const [formStatus, setFormStatus] = useState(initialSubmit);
  const [activeTab, setActiveTab] = useState("Course Details");
  // Once the admin edits the slug by hand we stop auto-syncing it from the title.
  const [slugEdited, setSlugEdited] = useState(false);
  // Select TCY Course options; empty list disables the TCY Course checkbox
  const [tcyList, setTcyList] = useState([]);
  const authData = useSelector((state) => state.authStore);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleTitleChange = (value) => {
    dispatchCreateCourse({ type: "Course_Title", value });
    if (!slugEdited) {
      dispatchCreateCourse({ type: "slug", value: slugify(value) });
    }
  };

  const handleSlugChange = (value) => {
    setSlugEdited(true);
    // Keep it permissive while typing (so a trailing "-" isn't eaten);
    // normalize fully on blur.
    dispatchCreateCourse({
      type: "slug",
      value: value.toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
    });
  };

  const handleSlugBlur = (value) => {
    dispatchCreateCourse({ type: "slug", value: slugify(value) });
  };

  const resetReducerForm = () => {
    dispatchCreateCourse({ type: "reset" });
    setSlugEdited(false);
  };

  const setFormError = (errMsg) => {
    setFormStatus({ isError: true, errMsg, isSubmitting: false });
  };

  const createCourse = async (e) => {
    e.preventDefault();
    if (!validateForm(createCourseData, setFormError)) return;
    setFormStatus({ isError: false, errMsg: null, isSubmitting: true });
    try {
      const formData = new FormData();
      formData.append("Course_Title", createCourseData.Course_Title);
      formData.append("slug", createCourseData.slug);
      if (createCourseData.course_identifier) {
        formData.append("course_identifier", createCourseData.course_identifier);
      }
      formData.append("Short_Description", createCourseData.Short_Description);
      formData.append("Description", createCourseData.Description);
      formData.append("Category", createCourseData.Category);
      formData.append("Level", createCourseData.Level);
      formData.append("Language", createCourseData.Language);
      createCourseData.tutorId.forEach((id) => {
        formData.append(`tutor`, id);
      });
      formData.append(
        "EnrollmentStartDate",
        createCourseData.EnrollmentStartDate
      );
      formData.append("EnrollmentEndDate", createCourseData.EnrollmentEndDate);
      formData.append("max_enrollments", createCourseData.max_enrollments);
      formData.append("faqs", createCourseData.faqs);
      formData.append("course_type", createCourseData.course_type);
      formData.append("course_delivery", createCourseData.course_delivery);
      formData.append(
        "primary_instructor",
        createCourseData.primary_instructor
      );
      formData.append("Featured", createCourseData.Featured);
      formData.append("Support_Available", createCourseData.Support_Available);
      formData.append("is_active", createCourseData.is_active);
      formData.append(
        "is_additional_free_course",
        createCourseData.is_additional_free_course
      );
      formData.append("is_tcy_course", createCourseData.is_tcy_course);
      if (createCourseData.is_tcy_course) {
        formData.append("tcy_course", createCourseData.tcyCourse);
      }
      createCourseData.requirementId.forEach((id) => {
        formData.append(`Requirements`, id);
      });
      createCourseData.outcomeId.forEach((id) => {
        formData.append(`Outcome`, id);
      });
      formData.append(
        "Course_Overview_Provider",
        createCourseData.Course_Overview_Provider
      );
      formData.append(
        "Course_Overview_URL",
        createCourseData.Course_Overview_URL
      );
      formData.append("Course_Thumbnail", createCourseData.Course_Thumbnail);
      formData.append("course_banner", createCourseData.course_banner);
      createCourseData.SEO_Meta_Keywords.map((item) => item.trim()).filter(Boolean).forEach((item, index) => {
        formData.append(`SEO_Meta_Keywords[${index}]`, item);
      });
      createCourseData.Meta_Description.map((item) => item.trim()).filter(Boolean).forEach((item, index) => {
        formData.append(`Meta_Description[${index}]`, item);
      });
      createCourseData.lessonsId.forEach((id) => {
        formData.append(`lessons`, id);
      });

      const response = await ajaxCall(
        "/courselistview/",
        {
          headers: {
            Authorization: `Bearer ${authData?.accessToken}`,
          },
          method: "POST",
          body: formData,
        },
        8000
      );
      if (response.status === 201) {
        resetReducerForm();
        setMainTab("View Course");
        toast.success("Course Created Successfully");
      } else if ([400, 404].includes(response.status)) {
        const data = response.data || {};
        if (data.slug) {
          toast.error("Course Slug should be unique");
        } else if (data.course_identifier) {
          toast.error("Course Identifier should be unique");
        } else {
          toast.error("Some Problem Occurred. Please try again.");
        }
      }
    } catch (error) {
      setFormStatus({
        isError: true,
        errMsg: "Some Problem Occurred. Please try again.",
        isSubmitting: false,
      });
    } finally {
      setFormStatus({ isError: false, errMsg: null, isSubmitting: false });
    }
  };

  const addedSelectVal = (fieldName, proFieldName, isSingle, val) => {
    if (isSingle) {
      dispatchCreateCourse({
        type: fieldName,
        value: val,
      });
      dispatchCreateCourse({
        type: proFieldName,
        value: +val[0]?.id,
      });
      return;
    }
    const newValIds = val.map((ids) => ids.id);
    dispatchCreateCourse({
      type: fieldName,
      value: val,
    });
    dispatchCreateCourse({
      type: proFieldName,
      value: newValIds,
    });
  };

  return (
    <>
      <Tab
        tabs={tabs}
        activeTab={activeTab}
        handleTabChange={handleTabChange}
      />
      <div className="tab-content tab__content__wrapper aos-init aos-animate">
        <div
          className={`tab-pane fade ${
            activeTab === "Course Details" ? "show active" : ""
          }`}
        >
          <div className="row">
            <div className="col-xl-6 col-lg-6 col-md-6 col-12">
              <div className="d-flex flex-wrap gap-4 mt-4">
                <div className="form__check">
                  <input
                    type="checkbox"
                    value={createCourseData.is_additional_free_course}
                    checked={createCourseData.is_additional_free_course}
                    onChange={(e) => {
                      dispatchCreateCourse({
                        type: "is_additional_free_course",
                        value: e.target.checked,
                      });
                      // Ticking Additional Free Course unticks TCY Course
                      if (e.target.checked) {
                        dispatchCreateCourse({ type: "is_tcy_course", value: false });
                        dispatchCreateCourse({ type: "tcyCourse", value: "" });
                      }
                    }}
                  />{" "}
                  <label
                    title="Free course bundled with packages. Not sold separately and hidden from course listings."
                  >
                    Additional Free Course
                  </label>
                </div>
                <div className="form__check">
                  <input
                    type="checkbox"
                    value={createCourseData.is_tcy_course}
                    checked={createCourseData.is_tcy_course}
                    disabled={tcyList.length === 0}
                    onChange={(e) => {
                      dispatchCreateCourse({
                        type: "is_tcy_course",
                        value: e.target.checked,
                      });
                      if (e.target.checked) {
                        dispatchCreateCourse({
                          type: "is_additional_free_course",
                          value: false,
                        });
                        dispatchCreateCourse({ type: "lessons", value: [] });
                        dispatchCreateCourse({ type: "lessonsId", value: [] });
                      } else {
                        dispatchCreateCourse({ type: "tcyCourse", value: "" });
                      }
                    }}
                  />{" "}
                  <label>TCY Course</label>
                </div>
              </div>
            </div>
            {/* Shown only when TCY Course is ticked */}
            <div
              className="col-xl-6 col-lg-6 col-md-6 col-12 mb-4"
              style={{
                visibility: createCourseData.is_tcy_course ? "visible" : "hidden",
              }}
            >
              <div className="dashboard__select__heading">
                <span>Select TCY Course <span className="text-danger" style={{ display: "inline" }}>*</span></span>
              </div>
              <div className="dashboard__selector">
                <SingleSelection
                  value={createCourseData.tcyCourse}
                  onChange={(val) => {
                    dispatchCreateCourse({ type: "tcyCourse", value: val });
                  }}
                  isSearch={true}
                  url="/tcycourseview/"
                  objKey={["label"]}
                  onDataLoaded={setTcyList}
                />
              </div>
            </div>
            <div className="col-xl-6 col-lg-6 col-md-6 col-12">
              <div className="dashboard__form__wraper">
                <div className="dashboard__form__input">
                  <label>Course Title <span className="text-danger" style={{ display: "inline" }}>*</span></label>
                  <input
                    type="text"
                    placeholder="Course Title"
                    value={createCourseData.Course_Title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="col-xl-6 col-lg-6 col-md-6 col-12">
              <div className="dashboard__form__wraper">
                <div className="dashboard__form__input">
                  <label>Course Slug</label>
                  <input
                    type="text"
                    placeholder="course-url-slug"
                    value={createCourseData.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    onBlur={(e) => handleSlugBlur(e.target.value)}
                  />
                  <small
                    className="text-muted d-block"
                    style={{ marginTop: "-12px", marginBottom: "8px" }}
                  >
                    Used in the public course URL: /course/
                    {createCourseData.slug || "your-course-slug"}
                  </small>
                </div>
              </div>
            </div>
            <div className="col-xl-6 col-lg-6 col-md-6 col-12">
              <div className="dashboard__form__wraper">
                <div className="dashboard__form__input">
                  <label>Course Identifire</label>
                  <input
                    type="text"
                    placeholder="Course Identifire"
                    value={createCourseData.course_identifier}
                    onChange={(e) => {
                      dispatchCreateCourse({
                        type: "course_identifier",
                        value: e.target.value,
                      });
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="col-xl-6 col-lg-6 col-md-6 col-12 mb-4">
              <div className="dashboard__select__heading">
                <span>Category <span className="text-danger" style={{ display: "inline" }}>*</span></span>
              </div>
              <div className="dashboard__selector">
                <SingleSelection
                  value={createCourseData.Category}
                  onChange={(val) => {
                    dispatchCreateCourse({
                      type: "Category",
                      value: val,
                    });
                    dispatchCreateCourse({
                      type: "lessons",
                      value: [],
                    });
                    dispatchCreateCourse({
                      type: "lessonsId",
                      value: [],
                    });
                  }}
                  isSearch={true}
                  url="/categoryview/"
                  objKey={["name"]}
                  withBlankOption={true}
                />
              </div>
            </div>
            <div className="col-xl-6 col-lg-6 col-md-6 col-12">
              <div className="dashboard__form__wraper">
                <div className="dashboard__form__input">
                  <label>Short Description <span className="text-danger" style={{ display: "inline" }}>*</span></label>
                  <textarea
                    type="text"
                    placeholder="Short Description"
                    value={createCourseData.Short_Description}
                    onChange={(e) => {
                      dispatchCreateCourse({
                        type: "Short_Description",
                        value: e.target.value,
                      });
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="col-xl-6 col-lg-6 col-md-6 col-12">
              <div className="dashboard__form__wraper">
                <div className="dashboard__form__input">
                  <label>Description <span className="text-danger" style={{ display: "inline" }}>*</span></label>
                  <textarea
                    type="text"
                    placeholder="Description"
                    value={createCourseData.Description}
                    onChange={(e) => {
                      dispatchCreateCourse({
                        type: "Description",
                        value: e.target.value,
                      });
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="col-xl-6 col-lg-6 col-md-6 col-12 mb-4">
              <div className="dashboard__select__heading">
                <span>Level <span className="text-danger" style={{ display: "inline" }}>*</span></span>
              </div>
              <div className="dashboard__selector">
                <SingleSelection
                  value={createCourseData.Level}
                  onChange={(val) => {
                    dispatchCreateCourse({
                      type: "Level",
                      value: val,
                    });
                  }}
                  isSearch={true}
                  url="/levelView/"
                  objKey={["name"]}
                />
              </div>
            </div>
            <div className="col-xl-6 col-lg-6 col-md-6 col-12 mb-4">
              <div className="dashboard__select__heading">
                <span>Language <span className="text-danger" style={{ display: "inline" }}>*</span></span>
              </div>
              <div className="dashboard__selector">
                <SingleSelection
                  value={createCourseData.Language}
                  onChange={(val) => {
                    dispatchCreateCourse({
                      type: "Language",
                      value: val,
                    });
                  }}
                  isSearch={true}
                  url="/languageview/"
                  objKey={["name"]}
                />
              </div>
            </div>
            <div className="col-xl-6 col-lg-6 col-md-6 col-12 mb-4">
              <div className="dashboard__select__heading">
                <span>Tutor</span>
              </div>
              <div className="dashboard__selector">
                <SelectionBox
                  value={createCourseData.tutor}
                  onSelect={addedSelectVal.bind(
                    null,
                    "tutor",
                    "tutorId",
                    false
                  )}
                  url="/tutorcourses/"
                  name="username"
                  objKey={["username"]}
                  isSearch={true}
                  multiple={true}
                />
              </div>
            </div>
            <div className="col-xl-6 col-lg-6 col-md-6 col-12">
              <div className="dashboard__form__wraper">
                <div className="dashboard__form__input">
                  <label>Max Enrollments</label>
                  <input
                    type="number"
                    value={createCourseData.max_enrollments}
                    onChange={(e) => {
                      dispatchCreateCourse({
                        type: "max_enrollments",
                        value: e.target.value,
                      });
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="col-xl-6 col-lg-6 col-md-6 col-12">
              <div className="dashboard__form__wraper">
                <div className="dashboard__form__input">
                  <label>Enrollment StartDate <span className="text-danger" style={{ display: "inline" }}>*</span></label>
                  <input
                    type="date"
                    value={createCourseData.EnrollmentStartDate}
                    onChange={(e) => {
                      dispatchCreateCourse({
                        type: "EnrollmentStartDate",
                        value: e.target.value,
                      });
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="col-xl-6 col-lg-6 col-md-6 col-12">
              <div className="dashboard__form__wraper">
                <div className="dashboard__form__input">
                  <label>Enrollment EndDate <span className="text-danger" style={{ display: "inline" }}>*</span></label>
                  <input
                    type="date"
                    value={createCourseData.EnrollmentEndDate}
                    onChange={(e) => {
                      dispatchCreateCourse({
                        type: "EnrollmentEndDate",
                        value: e.target.value,
                      });
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="col-xl-6 col-lg-6 col-md-6 col-12">
              <div className="dashboard__form__wraper">
                <div className="dashboard__form__input">
                  <label>FAQS <span className="text-danger" style={{ display: "inline" }}>*</span></label>
                  <textarea
                    type="text"
                    value={createCourseData.faqs}
                    onChange={(e) =>
                      dispatchCreateCourse({
                        type: "faqs",
                        value: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
            <div className="col-xl-6 col-lg-6 col-md-6 col-12 mb-4">
              <div className="dashboard__select__heading">
                <span>Course Type</span>
              </div>
              <div className="dashboard__selector">
                <SingleSelection
                  value={createCourseData.course_type}
                  onChange={(val) => {
                    dispatchCreateCourse({
                      type: "course_type",
                      value: val,
                    });
                  }}
                  isStatic={true}
                  cols={[
                    { value: "PRIVATE", name: "Private" },
                    { value: "PUBLIC", name: "Public" },
                  ]}
                />
              </div>
            </div>
            <div className="col-xl-6 col-lg-6 col-md-6 col-12 mb-4">
              <div className="dashboard__select__heading">
                <span>Course Delivery</span>
              </div>
              <div className="dashboard__selector">
                <SingleSelection
                  value={createCourseData.course_delivery}
                  onChange={(val) => {
                    dispatchCreateCourse({
                      type: "course_delivery",
                      value: val,
                    });
                  }}
                  isStatic={true}
                  cols={[
                    { value: "SELF-STUDY", name: "Self-Study Course" },
                    { value: "TAUGHT", name: "Taught Course" },
                  ]}
                />
              </div>
            </div>
            <div className="col-xl-6 col-lg-6 col-md-6 col-12">
              <div className="dashboard__select__heading">
                <span>Primary Instructor</span>
              </div>
              <div className="dashboard__selector">
                <SingleSelection
                  value={createCourseData.primary_instructor}
                  onChange={(val) => {
                    dispatchCreateCourse({
                      type: "primary_instructor",
                      value: val,
                    });
                  }}
                  isSearch={true}
                  url="/instructorcourses/"
                  objKey={["username"]}
                />
              </div>
            </div>
            <div className="d-flex flex-wrap gap-4 mt-4">
              <div className="form__check">
                <input
                  type="checkbox"
                  value={createCourseData.Featured}
                  onChange={(e) => {
                    dispatchCreateCourse({
                      type: "Featured",
                      value: e.target.checked,
                    });
                  }}
                />{" "}
                <label>Featured</label>
              </div>
              <div className="form__check">
                <input
                  type="checkbox"
                  value={createCourseData.Support_Available}
                  onChange={(e) => {
                    dispatchCreateCourse({
                      type: "Support_Available",
                      value: e.target.checked,
                    });
                  }}
                />{" "}
                <label>Support Available</label>
              </div>
              <div className="form__check">
                <input
                  type="checkbox"
                  value={createCourseData.is_active}
                  onChange={(e) => {
                    dispatchCreateCourse({
                      type: "is_active",
                      value: e.target.checked,
                    });
                  }}
                />{" "}
                <label>Is Active</label>
              </div>
            </div>
          </div>
        </div>
        <div
          className={`tab-pane fade ${
            activeTab === "Requirements & Outcomes" ? "show active" : ""
          }`}
        >
          <div className="row">
            <div className="col-xl-6 col-lg-6 col-md-6 col-12">
              <div className="dashboard__select__heading">
                <span>Requirements <span className="text-danger" style={{ display: "inline" }}>*</span></span>
              </div>
              <div className="dashboard__selector">
                <SelectionBox
                  value={createCourseData.Requirements}
                  onSelect={addedSelectVal.bind(
                    null,
                    "Requirements",
                    "requirementId",
                    false
                  )}
                  url="/requirementsview/"
                  name="description"
                  objKey={["description"]}
                  isSearch={true}
                  multiple={true}
                />
              </div>
            </div>
            <div className="col-xl-6 col-lg-6 col-md-6 col-12">
              <div className="dashboard__select__heading">
                <span>Outcome <span className="text-danger" style={{ display: "inline" }}>*</span></span>
              </div>
              <div className="dashboard__selector">
                <SelectionBox
                  value={createCourseData.Outcome}
                  onSelect={addedSelectVal.bind(
                    null,
                    "Outcome",
                    "outcomeId",
                    false
                  )}
                  url="/outcomesview/"
                  name="description"
                  objKey={["description"]}
                  isSearch={true}
                  multiple={true}
                />
              </div>
            </div>
          </div>
        </div>
        <div
          className={`tab-pane fade ${
            activeTab === "Course Media" ? "show active" : ""
          }`}
        >
          <div className="row">
            <div className="col-xl-6 col-lg-6 col-md-6 col-12">
              <div className="dashboard__form__wraper">
                <div className="dashboard__form__input">
                  <label>Course Overview Provider</label>
                  <input
                    type="text"
                    placeholder="Course Overview Provider"
                    value={createCourseData.Course_Overview_Provider}
                    onChange={(e) => {
                      dispatchCreateCourse({
                        type: "Course_Overview_Provider",
                        value: e.target.value,
                      });
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="col-xl-6 col-lg-6 col-md-6 col-12">
              <div className="dashboard__form__wraper">
                <div className="dashboard__form__input">
                  <label>Course Overview URL</label>
                  <input
                    type="text"
                    placeholder="Course Overview URL"
                    value={createCourseData.Course_Overview_URL}
                    onChange={(e) => {
                      dispatchCreateCourse({
                        type: "Course_Overview_URL",
                        value: e.target.value,
                      });
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="col-xl-6 col-lg-6 col-md-6 col-12">
              <div className="dashboard__form__wraper">
                <div className="dashboard__form__input">
                  <label>Course Thumbnail (1483 pixels x 800 pixels) <span className="text-danger" style={{ display: "inline" }}>*</span></label>
                  <input
                    type="file"
                    onChange={(e) => {
                      dispatchCreateCourse({
                        type: "Course_Thumbnail",
                        value: e.target.files[0],
                      });
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="col-xl-6 col-lg-6 col-md-6 col-12">
              <div className="dashboard__form__wraper">
                <div className="dashboard__form__input">
                  <label>Course Banner (2000 pixels x 477 pixels) <span className="text-danger" style={{ display: "inline" }}>*</span></label>
                  <input
                    type="file"
                    placeholder=""
                    onChange={(e) => {
                      dispatchCreateCourse({
                        type: "course_banner",
                        value: e.target.files[0],
                      });
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className={`tab-pane fade ${
            activeTab === "Course SEO" ? "show active" : ""
          }`}
        >
          <div className="row">
            <div className="col-xl-6 col-lg-6 col-md-6 col-12">
              <div className="dashboard__form__wraper">
                <div className="dashboard__form__input">
                  <label>SEO Meta Keywords</label>
                  <input
                    type="text"
                    placeholder="SEO Meta Keywords"
                    // Not trimmed while typing (trimmed on save), so Backspace can remove a comma
                    value={createCourseData.SEO_Meta_Keywords.join(",")}
                    onChange={(e) => {
                      dispatchCreateCourse({
                        type: "SEO_Meta_Keywords",
                        value: e.target.value.split(","),
                      });
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="col-xl-6 col-lg-6 col-md-6 col-12">
              <div className="dashboard__form__wraper">
                <div className="dashboard__form__input">
                  <label>Meta Description</label>
                  <input
                    type="text"
                    placeholder="Meta Description"
                    // Not trimmed while typing (trimmed on save), so Backspace can remove a comma
                    value={createCourseData.Meta_Description.join(",")}
                    onChange={(e) => {
                      dispatchCreateCourse({
                        type: "Meta_Description",
                        value: e.target.value.split(","),
                      });
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className={`tab-pane fade ${
            activeTab === "Lessons" ? "show active" : ""
          }`}
        >
          <div className="row">
            <div className="col-xl-6 col-lg-6 col-md-6 col-12">
              <div className="dashboard__select__heading">
                <span>Lessons</span>
              </div>
              <div className="dashboard__selector">
                <SelectionBox
                  value={createCourseData.lessons}
                  onSelect={addedSelectVal.bind(
                    null,
                    "lessons",
                    "lessonsId",
                    false
                  )}
                  url={
                    createCourseData.Category
                      ? `/lessonview/?category=${createCourseData.Category}`
                      : "/lessonview/"
                  }
                  name="Lesson_Title"
                  objKey={["Lesson_Title"]}
                  isSearch={true}
                  multiple={true}
                  // Disabled for a TCY course (no lessons)
                  disabled={createCourseData.is_tcy_course}
                />
              </div>
            </div>
            <div className="create__course__bottom__button text-center mt-4">
              {formStatus.isError && (
                <div className="text-danger mb-2">{formStatus.errMsg}</div>
              )}
              {formStatus.isSubmitting ? (
                <Spinner animation="border" style={{ color: "#01579b" }} />
              ) : (
                <button
                  className="default__button"
                  onClick={createCourse}
                  disabled={formStatus.isSubmitting}
                >
                  Create Course
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateCourse;
