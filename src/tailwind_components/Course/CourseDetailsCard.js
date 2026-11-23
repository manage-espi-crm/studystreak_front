import React, { useState } from "react";
import moment from "moment";
import { User, BookOpen, Globe, Users, Clock, ChevronDown } from "lucide-react";

const COURSE_DELIVERY_LABELS = {
  TAUGHT: "Teacher Taught",
  "SELF-STUDY": "Self-Study",
};

const BatchAccordionItem = ({ batch, isOpen, onToggle }) => (
  <div
    className={`border rounded-xl bg-white overflow-hidden transition-colors duration-200 ${
      isOpen ? "border-primary-300" : "border-neutral-200"
    }`}
  >
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
    >
      <span
        className={`font-medium text-sm ${
          isOpen ? "text-primary-700" : "text-neutral-800"
        }`}
      >
        {batch.batch_name}
      </span>
      <ChevronDown
        className={`w-4 h-4 flex-none text-neutral-400 transition-transform duration-200 ${
          isOpen ? "rotate-180 text-primary-600" : ""
        }`}
      />
    </button>
    {isOpen && (
      <div className="px-4 pb-4">
        <span className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-3 py-1.5 rounded-full text-sm font-medium">
          <Clock className="w-3.5 h-3.5" />
          {moment(batch.batch_start_timing, "HH:mm:ss").format("hh:mm A")} -{" "}
          {moment(batch.batch_end_timing, "HH:mm:ss").format("hh:mm A")}
        </span>
      </div>
    )}
  </div>
);

const CourseDetailsCard = ({ courseDetail, batches }) => {
  const [openBatchIndex, setOpenBatchIndex] = useState(null);

  const metaItems = [
    {
      label: "Instructor",
      value: courseDetail?.primary_instructor?.username,
      icon: User,
      bg: "bg-primary-50",
      color: "text-primary-500",
    },
    {
      label: "Course Delivery",
      value: COURSE_DELIVERY_LABELS[courseDetail?.course_delivery],
      icon: courseDetail?.course_delivery === "SELF-STUDY" ? BookOpen : Users,
      bg: "bg-success-50",
      color: "text-success-500",
    },
    {
      label: "Course Level",
      value: courseDetail?.Level?.name,
      icon: BookOpen,
      bg: "bg-secondary-50",
      color: "text-secondary-500",
    },
    {
      label: "Language",
      value: courseDetail?.Language?.name,
      icon: Globe,
      bg: "bg-error-50",
      color: "text-error-500",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-card border border-neutral-200 p-8 mb-12">
      <h2 className="text-2xl font-bold text-neutral-800 mb-4">
        Course Details
      </h2>

      {courseDetail?.Short_Description && (
        <div
          className="border-l-4 border-primary-200 pl-4 leading-relaxed mb-6 [&_*]:!text-neutral-600 [&_*]:!bg-transparent"
          dangerouslySetInnerHTML={{ __html: courseDetail.Short_Description }}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metaItems.map(({ label, value, icon: Icon, bg, color }) => (
          <div
            key={label}
            className="flex items-center gap-3 bg-neutral-50 border border-neutral-200 rounded-xl p-4"
          >
            <div className={`${bg} p-2.5 rounded-lg flex-none`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-neutral-500">{label}</p>
              <p className="text-sm font-semibold text-neutral-800">
                {value || "-"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {batches?.length > 0 && (
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
            <Users className="w-3.5 h-3.5" />
            Batches &amp; Timings
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {batches.map((batch, index) => (
              <BatchAccordionItem
                key={batch.id ?? index}
                batch={batch}
                isOpen={openBatchIndex === index}
                onToggle={() =>
                  setOpenBatchIndex(openBatchIndex === index ? null : index)
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetailsCard;
