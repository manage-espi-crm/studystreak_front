import React, { useState, useEffect } from "react";

const CourseBanner = ({ courseDetail }) => {
  const [screenType, setScreenType] = useState("desktop");

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      if (width <= 640) {
        setScreenType("mobile");
      } else if (width <= 1024) {
        setScreenType("tablet");
      } else {
        setScreenType("desktop");
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <section className="relative w-full">
      <div className="relative w-full overflow-hidden">
        <picture>
          <source
            media="(max-width: 1024px)"
            srcSet={courseDetail?.Course_Thumbnail}
          />
          <img
            src={courseDetail?.course_banner}
            alt={courseDetail?.Course_Title}
            className="w-full h-auto object-cover"
          />
        </picture>
        {/* {screenType === "desktop" && (
          <div>
            <div className="absolute inset-0 bg-gradient-to-t from-primary-900/90 to-primary-900/50"></div>
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-4">
                <div className="max-w-4xl">
                  <span className="text-xs font-semibold tracking-wide text-primary-800 inline-flex items-center bg-white rounded-full px-4 py-1.5">
                    {courseDetail?.Category?.name}
                  </span>
                  <h1 className="font-bold text-white mt-4 mb-6 text-5xl">
                    {courseDetail?.Course_Title}
                  </h1>
                </div>
              </div>
            </div>
          </div>
        )} */}
      </div>
    </section>
  );
};

export default CourseBanner;
