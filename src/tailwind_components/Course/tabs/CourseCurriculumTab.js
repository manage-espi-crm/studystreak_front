import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  ClipboardList,
  Target,
} from "lucide-react";

const TickList = ({ items }) => (
  <ul className="space-y-3">
    {items.map((item, index) => (
      <li key={index} className="flex items-start gap-3 text-neutral-700">
        <CheckCircle className="w-5 h-5 text-success-500 flex-none mt-0.5" />
        <span>{item?.description}</span>
      </li>
    ))}
  </ul>
);

const CourseCurriculumTab = ({ sections, requirements, outcomes, categoryId }) => {
  const [openSection, setOpenSection] = useState("");

  const requirementsAndOutcomes = (
    <>
      {requirements?.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-primary-50 text-primary-600 p-2 rounded-lg">
              <ClipboardList className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-heading font-semibold text-neutral-800">
              Requirements
            </h3>
          </div>
          <TickList items={requirements} />
        </div>
      )}

      {outcomes?.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-primary-50 text-primary-600 p-2 rounded-lg">
              <Target className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-heading font-semibold text-neutral-800">
              Outcomes
            </h3>
          </div>
          <TickList items={outcomes} />
        </div>
      )}
    </>
  );

  const compareByName = (a, b) => {
    const nameA = a?.name?.toLowerCase();
    const nameB = b?.name?.toLowerCase();
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  };

  const visibleSections = (sections || [])
    // Legacy sections created before category was added have no
    // sectionItem.category — keep those instead of hiding them.
    .filter(
      (sectionItem) =>
        !categoryId ||
        sectionItem?.category == null ||
        sectionItem.category === categoryId
    )
    .slice()
    .sort((a, b) => {
      // Legacy sections predate the sequence field and were backfilled
      // with 0 — treat that as "no sequence" and fall back to the old
      // alphabetical ordering, same as when it's equal or missing.
      const seqA = a?.sequence || null;
      const seqB = b?.sequence || null;
      if (seqA == null || seqB == null || seqA === seqB) {
        return compareByName(a, b);
      }
      return seqA - seqB;
    });

  if (!visibleSections.length) {
    return (
      <div>
        {requirementsAndOutcomes}
      </div>
    );
  }

  return (
    <div>
      {requirementsAndOutcomes}
      <div className="border border-neutral-200 rounded-2xl overflow-hidden">
        {visibleSections
          .map((sectionItem, index) => (
            <div
              key={index}
              className="border-b border-neutral-200 last:border-b-0"
            >
              <button
                className="flex justify-between items-center w-full p-6 hover:bg-primary-50
                  transition-colors duration-300 text-left"
                onClick={() =>
                  setOpenSection(
                    openSection === sectionItem.name ? null : sectionItem.name
                  )
                }
              >
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-lg mr-4 flex items-center justify-center
              ${
                openSection === sectionItem.name
                  ? "bg-primary-100 text-primary-600"
                  : "bg-neutral-100 text-neutral-600"
              }`}
                  >
                    {index + 1}
                  </div>
                  <span className="font-medium text-neutral-800">
                    {sectionItem.name}
                  </span>
                </div>
                {openSection === sectionItem.name ? (
                  <ChevronUp className="w-5 h-5 text-primary-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-neutral-400" />
                )}
              </button>
              {openSection === sectionItem.name && (
                <div className="bg-neutral-50 px-6 py-4 border-t border-neutral-200">
                  <ul className="space-y-3">
                    {sectionItem.lessons
                      ?.slice()
                      .sort((a, b) => {
                        const lessonA = parseInt(
                          a?.Lesson_Title.match(/\d+/)?.[0]
                        );
                        const lessonB = parseInt(
                          b?.Lesson_Title.match(/\d+/)?.[0]
                        );
                        return lessonA - lessonB;
                      })
                      .map((lessonItem, i) => (
                        <li
                          key={i}
                          className="flex items-center text-neutral-600"
                        >
                          <div className="w-2 h-2 rounded-full bg-primary-300 mr-3" />
                          <span>{lessonItem.Lesson_Title}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default CourseCurriculumTab;
