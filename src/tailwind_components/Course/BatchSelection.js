import React, { useCallback, useEffect, useState } from "react";
import moment from "moment";
import { Users, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ajaxCall from "../../helpers/ajaxCall";

const WEEKDAY_LABELS = {
  MON: "Mon",
  TUE: "Tue",
  WED: "Wed",
  THU: "Thu",
  FRI: "Fri",
  SAT: "Sat",
  SUN: "Sun",
};

const formatTime = (value) => moment(value, "HH:mm:ss").format("hh:mm A");

const getScheduleOptions = (batch) => {
  const options = [];
  if (batch.batch_startdate && batch.batch_enddate) {
    options.push({
      type: "DATES",
      expired: moment(batch.batch_enddate).isBefore(moment(), "day"),
    });
  }
  if (batch.number_of_days) {
    options.push({ type: "SESSIONS", expired: false });
  }
  if (options.length === 0) {
    options.push({ type: null, expired: false });
  }
  return options;
};

const BatchSelection = ({
  open,
  onClose,
  packageId,
  courseType,
  courseName,
  packageName,
  packagePrice,
}) => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [selection, setSelection] = useState(null);

  const getCourseBatches = useCallback(async () => {
    if (!packageId) return;
    try {
      const response = await ajaxCall(
        `/filterbatches/${packageId}/`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          method: "GET",
        },
        8000
      );
      if (response.status === 200) {
        const list = Array.isArray(response.data)
          ? response.data
          : response.data?.results || [];
        setBatches(list);
      } else {
        console.log("error");
      }
    } catch (error) {
      console.log("error", error);
    }
  }, [packageId]);

  useEffect(() => {
    getCourseBatches();
  }, [getCourseBatches, packageId]);

  const handleEnrollButton = () => {
    navigate("/checkout", {
      state: {
        packageId,
        courseType,
        courseName,
        packageName,
        packagePrice,
        selectedBatch: selection?.batchId,
        selectedSchedule: selection?.type,
      },
    });
  };

  return (
    open && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-6 relative">
          <div className="flex items-center justify-between p-6 border-b border-neutral-200">
            <h2 className="text-2xl font-semibold text-neutral-800">
              {packageName}
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
          <div className="mt-4">
            {batches.length > 0 ? (
              <div className="space-y-4">
                {batches.map((batch) => {
                  const options = getScheduleOptions(batch);
                  const allExpired = options.every((option) => option.expired);
                  return (
                    <div
                      key={batch.id}
                      className={`border rounded-xl overflow-hidden ${
                        allExpired
                          ? "border-gray-200 bg-gray-50 opacity-60"
                          : "border-primary-200"
                      }`}
                    >
                      <div
                        className={`flex items-center gap-3 px-4 py-3 border-b ${
                          allExpired
                            ? "bg-gray-100 border-gray-200"
                            : "bg-primary-50 border-primary-100"
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg ${
                            allExpired
                              ? "bg-gray-200 text-gray-500"
                              : "bg-primary-100 text-primary-700"
                          }`}
                        >
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="m-0 text-xs font-medium uppercase tracking-wide text-primary-500">
                            Batch
                          </p>
                          <h3
                            className={`m-0 text-lg font-semibold leading-tight ${
                              allExpired ? "text-gray-600" : "text-primary-700"
                            }`}
                          >
                            {batch.batch_name}
                          </h3>
                        </div>
                      </div>
                      <div className="p-4 space-y-4">
                        {options.map((option) => (
                          <div
                            key={option.type || "default"}
                            className={`space-y-2 ${
                              option.expired ? "opacity-60" : ""
                            }`}
                          >
                          <label
                            className={`flex items-center gap-3 ${
                              option.expired
                                ? "cursor-not-allowed"
                                : "cursor-pointer"
                            }`}
                          >
                            <input
                              type="radio"
                              name="batch"
                              disabled={option.expired}
                              checked={
                                selection?.batchId === batch.id &&
                                selection?.type === option.type
                              }
                              onChange={() =>
                                setSelection({
                                  batchId: batch.id,
                                  type: option.type,
                                })
                              }
                              className="w-5 h-5 text-primary-600 rounded border-gray-300 disabled:cursor-not-allowed"
                            />
                            <span className="text-gray-600 flex items-center gap-2">
                              {option.type === "DATES" && (
                                <>
                                  <strong>Date:</strong>
                                  {`${moment(batch.batch_startdate).format(
                                    "DD-MM-YYYY"
                                  )} to ${moment(batch.batch_enddate).format(
                                    "DD-MM-YYYY"
                                  )}`}
                                </>
                              )}
                              {option.type === "SESSIONS" && (
                                <>
                                  <strong>Sessions:</strong>
                                  {`${batch.number_of_days} Classes`}
                                </>
                              )}
                              {option.type === null && batch.batch_name}
                              {option.expired && (
                                <span className="text-xs font-semibold text-red-500 border border-red-300 rounded-full px-2 py-0.5">
                                  Expired
                                </span>
                              )}
                            </span>
                          </label>
                          {batch.weekdays?.length > 0 && (
                            <div className="flex items-center gap-3">
                              <span className="w-5 h-5 shrink-0" />
                              <span className="text-gray-600 flex items-center gap-2">
                                <strong>Days:</strong>
                                {batch.weekdays
                                  .map((day) => WEEKDAY_LABELS[day] || day)
                                  .join(", ")}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-3">
                            <span className="w-5 h-5 shrink-0" />
                            <span className="text-gray-600 flex items-center gap-2">
                              <strong>Time:</strong>
                              {batch.batch_start_timing && batch.batch_end_timing
                                ? `${formatTime(
                                    batch.batch_start_timing
                                  )} to ${formatTime(batch.batch_end_timing)}`
                                : "N/A"}
                            </span>
                          </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-red-500 mt-4">
                No Batches Available!
              </p>
            )}
          </div>
          <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-full font-medium transition-colors duration-300"
            >
              Close
            </button>
            <button
              onClick={handleEnrollButton}
              disabled={!selection}
              className={`px-6 py-2 rounded-lg font-medium transition-colors duration-300 ${
                !selection
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-primary-600 hover:bg-primary-700 text-white"
              }`}
            >
              Proceed to Enroll
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default BatchSelection;
