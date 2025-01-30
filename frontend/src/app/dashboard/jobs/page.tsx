import dynamic from "next/dynamic";

import React from "react";
import HeadMain from "@/app/components/HeadMain"; // Import the HeadMain component
import BreadcrumbDashboard from "../components/layouts/BreadcrumbDashboard"; // Import the BreadcrumbDashboard component
// import TableJobs from "../components/table/TableJobs"; // Import the TableFAQ component

const TableJobs = dynamic(() => import("../components/table/TableJobs"), { ssr: false });

type Props = {};

const FAQ = (props: Props) => {
  return (
    <>
      <HeadMain title="Job Management • ResumeGenie" description="Job Management • ResumeGenie" />
      <BreadcrumbDashboard title="Job Management" />
      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:text-white dark:border-gray-700 sm:p-6 dark:bg-gray-800">
        <div id="job-management" className="mt-4">
          <div className="flex flex-col mt-6">
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden shadow">
                  <TableJobs />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FAQ;
