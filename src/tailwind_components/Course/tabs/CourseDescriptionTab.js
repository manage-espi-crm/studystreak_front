import React from "react";

const CourseDescriptionTab = ({ description }) => {
  return (
    <div>
      {description ? (
        <div
          className="prose max-w-none [&_*]:!text-neutral-700 [&_*]:!bg-transparent"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      ) : (
        <p className="text-neutral-500">No description available.</p>
      )}
    </div>
  );
};

export default CourseDescriptionTab;
