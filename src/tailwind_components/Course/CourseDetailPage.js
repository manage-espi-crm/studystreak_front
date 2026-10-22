import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import ajaxCall from "../../helpers/ajaxCall";
import { useCheckAuth } from "../../hooks/useCheckAuth";
import PackageDetails from "./PackageDetails";
import CourseBanner from "./CourseBanner";
import CourseDetailsCard from "./CourseDetailsCard";
import CourseTabs from "./CourseTabs";

const CourseDetailPage = () => {
  // `courseParam` is either a numeric id (legacy links) or an SEO slug.
  const { courseId: courseParam } = useParams();
  const navigate = useNavigate();
  const { checkAuth } = useCheckAuth();

  const [batchData, setBatchData] = useState([]);
  const [courseDetail, setCourseDetail] = useState();
  const [coursePackages, setCoursePackages] = useState();

  // Numeric id resolved from the course response; every dependent API
  // (packages, materials, resources) is keyed on this, not the URL param.
  const resolvedCourseId = courseDetail?.id;

  const authData = useSelector((state) => state.authStore);

  const packageIds = coursePackages?.packages?.map((item) => item?.package_id);

  const batches = (Array.isArray(batchData) ? batchData : []).filter((batch) =>
    packageIds?.includes(batch?.add_package?.id)
  );

  useEffect(() => {
    checkAuth();
  }, [authData, checkAuth]);

  useEffect(() => {
    (async () => {
      try {
        const response = await ajaxCall(
          `/courseretupddel/${courseParam}/`,
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
          const section = [];
          response.data?.lessons?.forEach((lesson) => {
            const isSessionExist = section.find(
              (item) => item.id === lesson?.section.id
            );
            if (!isSessionExist) {
              section.push(lesson?.section);
            }
          });
          const updatedData = {
            ...response.data,
            section,
          };
          section.forEach((sectionItem) => {
            const lessons = response.data?.lessons?.filter(
              (lesson) => lesson?.section.id === sectionItem.id
            );
            sectionItem.lessons = lessons;
          });
          setCourseDetail(updatedData);
        } else {
          console.log("error");
        }
      } catch (error) {
        console.log("error", error);
      }
    })();
  }, [courseParam]);

  // Once the course is resolved, redirect legacy /course/<id> URLs to the
  // canonical /course/<slug> form for SEO (only when a slug exists).
  useEffect(() => {
    if (courseDetail?.slug && courseParam !== courseDetail.slug) {
      navigate(`/course/${courseDetail.slug}`, { replace: true });
    }
  }, [courseDetail?.slug, courseParam, navigate]);

  useEffect(() => {
    if (!resolvedCourseId) return;
    (async () => {
      try {
        const response = await ajaxCall(
          `/course/${resolvedCourseId}/packages/`,
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
          setCoursePackages({
            ...response.data,
            packages: response.data?.packages || [],
          });
        } else {
          console.log("error");
        }
      } catch (error) {
        console.log("error", error);
      }
    })();
  }, [resolvedCourseId]);

  useEffect(() => {
    (async () => {
      try {
        const response = await ajaxCall(
          "/batchview/",
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            method: "GET",
          },
          8000
        );

        if (response?.status === 200) {
          const data = response?.data;
          setBatchData(Array.isArray(data) ? data : data?.results || []);
        } else {
          console.log("error");
        }
      } catch (error) {
        console.log("error", error);
      }
    })();
  }, []);

  const metaDescription =
    (Array.isArray(courseDetail?.Meta_Description)
      ? courseDetail.Meta_Description.join(" ")
      : courseDetail?.Meta_Description) ||
    courseDetail?.Short_Description?.replace(/<[^>]*>/g, "").trim() ||
    "";
  const metaKeywords = Array.isArray(courseDetail?.SEO_Meta_Keywords)
    ? courseDetail.SEO_Meta_Keywords.join(", ")
    : courseDetail?.SEO_Meta_Keywords || "";
  const canonicalUrl = `https://www.studystreak.in/course/${
    courseDetail?.slug || courseParam
  }`;

  return (
    <div className="bg-neutral-50 min-h-screen relative">
      {courseDetail?.Course_Title && (
        <Helmet>
          <title>{`${courseDetail.Course_Title} | StudyStreak`}</title>
          {metaDescription && (
            <meta name="description" content={metaDescription} />
          )}
          {metaKeywords && <meta name="keywords" content={metaKeywords} />}
          <link rel="canonical" href={canonicalUrl} />
          <meta
            property="og:title"
            content={`${courseDetail.Course_Title} | StudyStreak`}
          />
          {metaDescription && (
            <meta property="og:description" content={metaDescription} />
          )}
          <meta property="og:url" content={canonicalUrl} />
        </Helmet>
      )}
      <CourseBanner courseDetail={courseDetail} />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl flex flex-wrap items-end gap-3 mb-6">
          <h1 className="text-3xl font-heading font-bold text-neutral-800">
            {courseDetail?.Course_Title}
          </h1>
          <span
            className="text-xs font-semibold tracking-wide text-primary-700 inline-flex items-center bg-primary-100 rounded-full px-4 py-1.5"
            style={{ marginBottom: "23px" }}
          >
            {courseDetail?.Category?.name}
          </span>
        </div>
        <CourseDetailsCard courseDetail={courseDetail} batches={batches} />
        {/* A free course is bundled with packages, so it has nothing to sell
        here and shows no package section at all. */}
        {!courseDetail?.is_additional_free_course &&
          (coursePackages?.packages?.length >= 1 ? (
            <PackageDetails
              packages={coursePackages?.packages}
              courseName={courseDetail?.Course_Title}
              courseType={courseDetail?.course_delivery}
            />
          ) : (
            <div>
              <h5 className="text-danger sp_20 col--30">
                No Packages Available For This Course !!
              </h5>
            </div>
          ))}
        <CourseTabs courseId={resolvedCourseId} courseDetail={courseDetail} />
      </div>
    </div>
  );
};

export default CourseDetailPage;
