import React from "react";

const CourseFaqTab = ({ faqs }) => {
  if (!faqs) {
    return (
      <div className="text-center text-neutral-600 py-6">
        No FAQs Available
      </div>
    );
  }

  return (
    <div
      className="prose max-w-none text-neutral-700"
      dangerouslySetInnerHTML={{ __html: faqs }}
    />
  );
};

export default CourseFaqTab;
