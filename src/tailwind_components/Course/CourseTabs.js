import React, { useState } from "react";
import { List, BookOpen, FileText, HelpCircle, Link2 } from "lucide-react";
import CourseDescriptionTab from "./tabs/CourseDescriptionTab";
import CourseCurriculumTab from "./tabs/CourseCurriculumTab";
import CourseMaterialsTab from "./tabs/CourseMaterialsTab";
import CourseFaqTab from "./tabs/CourseFaqTab";
import CourseResourcesTab from "./tabs/CourseResourcesTab";

const TABS = [
  { key: "description", label: "Course Description", icon: List },
  { key: "curriculum", label: "Curriculum", icon: BookOpen },
  { key: "materials", label: "Course Materials", icon: FileText },
  { key: "faq", label: "FAQ", icon: HelpCircle },
  { key: "resources", label: "Additional Resources", icon: Link2 },
];

const CourseTabs = ({ courseId, courseDetail }) => {
  const [activeTab, setActiveTab] = useState("description");

  return (
    <div className="bg-white rounded-2xl shadow-card border border-neutral-200 overflow-hidden mb-12">
      <div className="flex flex-wrap bg-neutral-50 border-b border-neutral-200">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-5 py-4 border-r border-neutral-200 border-t-2 text-sm font-semibold whitespace-nowrap transition-colors duration-200
              ${
                activeTab === key
                  ? "bg-white text-primary-600 border-t-primary-600"
                  : "text-neutral-500 border-t-transparent hover:bg-neutral-100 hover:text-primary-600"
              }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="p-7">
        {activeTab === "description" && (
          <CourseDescriptionTab description={courseDetail?.Description} />
        )}
        {activeTab === "curriculum" && (
          <CourseCurriculumTab
            sections={courseDetail?.section}
            requirements={courseDetail?.Requirements}
            outcomes={courseDetail?.Outcome}
            categoryId={courseDetail?.Category?.id}
          />
        )}
        {activeTab === "materials" && (
          <CourseMaterialsTab courseId={courseId} />
        )}
        {activeTab === "faq" && <CourseFaqTab faqs={courseDetail?.faqs} />}
        {activeTab === "resources" && (
          <CourseResourcesTab courseId={courseId} />
        )}
      </div>
    </div>
  );
};

export default CourseTabs;
