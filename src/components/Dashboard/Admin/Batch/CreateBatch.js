import React, { useReducer, useState } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { Spinner } from "react-bootstrap";
import ajaxCall from "../../../../helpers/ajaxCall";
import SingleSelection from "../../../UI/SingleSelect";

const WEEKDAY_OPTIONS = [
  { value: "MON", label: "Mon" },
  { value: "TUE", label: "Tue" },
  { value: "WED", label: "Wed" },
  { value: "THU", label: "Thu" },
  { value: "FRI", label: "Fri" },
  { value: "SAT", label: "Sat" },
  { value: "SUN", label: "Sun" },
];

const SESSION_COUNT_PRESETS = ["30", "60", "90"];

// Class days guaranteed within the package validity, whichever weekday the
// student enrolls on. Mirrors batch.max_sessions_within on the backend.
const maxSessionsWithin = (validityInMonths, weekdays) => {
  const totalDays = validityInMonths * 30;
  const codes = WEEKDAY_OPTIONS.map((day) => day.value);
  const selected = new Set(weekdays.length ? weekdays : codes);
  let max = Infinity;
  for (let start = 0; start < 7; start++) {
    let count = 0;
    for (let offset = 0; offset < totalDays; offset++) {
      if (selected.has(codes[(start + offset) % 7])) count++;
    }
    max = Math.min(max, count);
  }
  return max;
};

const initialBatchData = {
  add_package: "",
  batch_name: "",
  batch_startdate: "",
  batch_enddate: "",
  batch_start_timing: "",
  batch_end_timing: "",
  number_of_days: "",
  weekdays: [],
};

const initialSubmit = { isError: false, errMsg: null, isSubmitting: false };

const reducerBatch = (state, action) => {
  switch (action.type) {
    case "reset":
      return action.payload || initialBatchData;
    default:
      return { ...state, [action.type]: action.value };
  }
};

const validateForm = (batchData, setFormError, maxSessions) => {
  if (!batchData.add_package) {
    setFormError("Package is Required");
    return false;
  }
  if (!batchData.batch_name) {
    setFormError("Batch Name is Required");
    return false;
  }
  if (!batchData.batch_start_timing) {
    setFormError("Start Time is Required");
    return false;
  }
  if (!batchData.batch_end_timing) {
    setFormError("End Time is Required");
    return false;
  }

  const hasFixedDates = batchData.batch_startdate && batchData.batch_enddate;

  if (
    (batchData.batch_startdate || batchData.batch_enddate) &&
    !hasFixedDates
  ) {
    setFormError("Start Date and End Date are both required together");
    return false;
  }
  if (hasFixedDates && batchData.batch_enddate < batchData.batch_startdate) {
    setFormError("End Date must be on or after Start Date");
    return false;
  }
  if (!hasFixedDates && !batchData.number_of_days) {
    setFormError(
      "Provide a Start Date & End Date, or a Number of Sessions (you may provide both)"
    );
    return false;
  }
  if (!batchData.weekdays?.length) {
    setFormError("Select at least one Day of Week");
    return false;
  }
  if (maxSessions !== null && Number(batchData.number_of_days) > maxSessions) {
    setFormError(
      `${batchData.number_of_days} sessions cannot fit in the package validity on the selected days. Maximum is ${maxSessions} sessions.`
    );
    return false;
  }
  return true;
};

const CreateBatch = ({ setActiveTab }) => {
  const [batchData, dispatchBatch] = useReducer(reducerBatch, initialBatchData);
  const [formStatus, setFormStatus] = useState(initialSubmit);
  const authData = useSelector((state) => state.authStore);

  const resetReducerForm = () => {
    dispatchBatch({ type: "reset" });
  };

  const setFormError = (errMsg) => {
    setFormStatus({ isError: true, errMsg, isSubmitting: false });
  };

  const [isCustomSessionCount, setIsCustomSessionCount] = useState(false);
  const [packageDurations, setPackageDurations] = useState({});

  const packageDuration = packageDurations[batchData.add_package];
  const maxSessions = packageDuration
    ? maxSessionsWithin(packageDuration, batchData.weekdays)
    : null;
  const exceedsMaxSessions =
    maxSessions !== null && Number(batchData.number_of_days) > maxSessions;

  const toggleWeekday = (dayValue) => {
    dispatchBatch({
      type: "weekdays",
      value: batchData.weekdays.includes(dayValue)
        ? batchData.weekdays.filter((d) => d !== dayValue)
        : [...batchData.weekdays, dayValue],
    });
  };

  const createBatch = async (e) => {
    e.preventDefault();
    if (!validateForm(batchData, setFormError, maxSessions)) return;
    setFormStatus({ isError: false, errMsg: null, isSubmitting: true });
    try {
      const payload = {
        ...batchData,
        batch_startdate: batchData.batch_startdate || null,
        batch_enddate: batchData.batch_enddate || null,
        number_of_days: batchData.number_of_days
          ? Number(batchData.number_of_days)
          : null,
      };
      const response = await ajaxCall(
        "/create-batch/",
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${authData?.accessToken}`,
          },
          method: "POST",
          body: JSON.stringify(payload),
        },
        8000
      );
      if (response.status === 201) {
        resetReducerForm();
        setActiveTab("View Batch");
        toast.success("Batch Created Successfully");
      } else if ([400, 404].includes(response.status)) {
        toast.error("Some Problem Occurred. Please try again.");
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

  return (
    <div className="row">
      <div className="col-xl-12">
        <div className="row">
          <div className="col-xl-6 col-lg-6 col-md-6 col-12">
            <div className="dashboard__select__heading">
              <span>Package</span>
            </div>
            <div className="dashboard__selector">
              <SingleSelection
                value={batchData?.batch}
                onChange={(val) => {
                  dispatchBatch({
                    type: "add_package",
                    value: val,
                  });
                }}
                isSearch={true}
                url="/packagelistview/"
                objKey={["package_name"]}
                onDataLoaded={(packages) =>
                  setPackageDurations(
                    Object.fromEntries(
                      packages.map((pkg) => [pkg.id, pkg.duration])
                    )
                  )
                }
              />
            </div>
          </div>
          <div className="col-xl-6 col-lg-6 col-md-6 col-12">
            <div className="dashboard__form__wraper">
              <div className="dashboard__form__input">
                <label>Batch Name</label>
                <input
                  type="text"
                  placeholder="Batch Name"
                  value={batchData?.batch_name}
                  onChange={(e) => {
                    dispatchBatch({
                      type: "batch_name",
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
                <label>Start Date</label>
                <input
                  type="date"
                  value={batchData?.batch_startdate}
                  onChange={(e) => {
                    dispatchBatch({
                      type: "batch_startdate",
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
                <label>Start Time</label>
                <input
                  type="time"
                  value={batchData?.batch_start_timing}
                  onChange={(e) => {
                    dispatchBatch({
                      type: "batch_start_timing",
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
                <label>End Date</label>
                <input
                  type="date"
                  value={batchData?.batch_enddate}
                  onChange={(e) => {
                    dispatchBatch({
                      type: "batch_enddate",
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
                <label>End Time</label>
                <input
                  type="time"
                  value={batchData?.batch_end_timing}
                  onChange={(e) => {
                    dispatchBatch({
                      type: "batch_end_timing",
                      value: e.target.value,
                    });
                  }}
                />
              </div>
            </div>
          </div>
          <div className="col-xl-12">
            <div className="dashboard__form__wraper">
              <div className="dashboard__form__input">
                <label>Days of Week</label>
                <div
                  className="d-flex"
                  style={{
                    gap: "10px",
                    flexWrap: "nowrap",
                    overflowX: "auto",
                    marginBottom: "15px",
                  }}
                >
                  {WEEKDAY_OPTIONS.map((day) => (
                    <label
                      key={day.value}
                      className="d-flex align-items-center mb-0"
                      style={{
                        fontWeight: "normal",
                        gap: "4px",
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={batchData.weekdays.includes(day.value)}
                        onChange={() => toggleWeekday(day.value)}
                        style={{
                          width: "18px",
                          height: "18px",
                          margin: 0,
                          cursor: "pointer",
                          accentColor: "#01579b",
                        }}
                      />
                      <span style={{ lineHeight: "18px" }}>{day.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-12">
            <hr />
          </div>
          <div className="col-xl-6 col-lg-6 col-md-6 col-12">
            <div className="dashboard__form__wraper">
              <div className="dashboard__form__input">
                <label>Number of Sessions</label>
                <select
                  value={
                    isCustomSessionCount ? "custom" : batchData?.number_of_days
                  }
                  style={{
                    width: "100%",
                    background: "transparent",
                    borderRadius: "6px",
                    lineHeight: "23px",
                    padding: "10px 20px",
                    fontSize: "14px",
                    color: "var(--contentColor)",
                    marginBottom: "15px",
                  }}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "custom") {
                      setIsCustomSessionCount(true);
                      dispatchBatch({ type: "number_of_days", value: "" });
                    } else {
                      setIsCustomSessionCount(false);
                      dispatchBatch({ type: "number_of_days", value: val });
                    }
                  }}
                >
                  <option value="">Select</option>
                  {SESSION_COUNT_PRESETS.map((count) => (
                    <option key={count} value={count}>
                      {count} Sessions
                    </option>
                  ))}
                  <option value="custom">Custom</option>
                </select>
                {isCustomSessionCount && (
                  <input
                    type="number"
                    min="1"
                    placeholder="Enter number of sessions"
                    value={batchData?.number_of_days}
                    style={{ marginTop: "-10px" }}
                    onChange={(e) => {
                      dispatchBatch({
                        type: "number_of_days",
                        value: e.target.value,
                      });
                    }}
                  />
                )}
                {maxSessions !== null && batchData.weekdays.length > 0 && (
                  <small
                    className={exceedsMaxSessions ? "text-danger" : "text-muted"}
                    style={{ display: "block", marginTop: "5px" }}
                  >
                    Max {maxSessions} sessions fit in this package's{" "}
                    {packageDuration}-month validity on the selected days
                  </small>
                )}
              </div>
            </div>
          </div>
          <div className="col-xl-12">
            <div className="dashboard__form__button text-center mt-4">
              {formStatus.isError && (
                <div className="text-danger mb-2">{formStatus.errMsg}</div>
              )}
              {formStatus.isSubmitting ? (
                <Spinner animation="border" style={{ color: "#01579b" }} />
              ) : (
                <button
                  className="default__button"
                  onClick={createBatch}
                  disabled={formStatus.isSubmitting}
                >
                  Create Batch
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBatch;
