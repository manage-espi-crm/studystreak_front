import React, { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import ajaxCall from "../../../helpers/ajaxCall";

const CourseMaterialsTab = ({ courseId }) => {
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const loginInfo = JSON.parse(localStorage.getItem("loginInfo"));
        const response = await ajaxCall(
          `/course-materials/${courseId}/`,
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              ...(loginInfo?.accessToken && {
                Authorization: `Bearer ${loginInfo.accessToken}`,
              }),
            },
            method: "GET",
          },
          8000
        );
        if (response.status === 200) {
          setMaterials(response?.data?.data || []);
        }
      } catch (error) {
        console.log("error:", error);
      }
    })();
  }, [courseId]);

  if (!materials?.length) {
    return (
      <div className="text-center py-11 px-5 border border-dashed border-primary-200 rounded-xl bg-primary-50/30">
        <FileText className="w-12 h-12 text-primary-400 mx-auto mb-3" strokeWidth={1.5} />
        <h4 className="font-semibold text-neutral-800 mb-1">No materials yet</h4>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {materials.map((material, index) => (
        <div
          key={index}
          className="flex items-center gap-4 border border-neutral-200 rounded-xl px-4 py-3.5"
        >
          <span className="bg-primary-50 text-primary-600 p-2.5 rounded-lg flex-none">
            <FileText className="w-5 h-5" />
          </span>
          <span className="font-medium text-neutral-800">
            {material.material_name}
          </span>
        </div>
      ))}
    </div>
  );
};

export default CourseMaterialsTab;
