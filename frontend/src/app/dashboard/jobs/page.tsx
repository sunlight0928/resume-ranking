import dynamic from "next/dynamic";

import React from "react";
import HeadMain from "@/app/components/HeadMain"; // Import the HeadMain component
import BreadcrumbDashboard from "../components/layouts/BreadcrumbDashboard"; // Import the BreadcrumbDashboard component
// import TableJobs from "../components/table/TableJobs"; // Import the TableFAQ component

const TableJobs = dynamic(() => import("../components/table/TableJobs"), { ssr: false });

type Props = {};

const JobManagementPage = (props: Props) => {
  return (
    <>
      <HeadMain title="Job Management • ResumeGenie" description="Job Management • ResumeGenie" />
      <BreadcrumbDashboard title="Job Management" />
      <div className="bg-white rounded-xl shadow-sm dark:text-white dark:bg-gray-900">
        <div className="flex flex-col" id="job-management">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden shadow">
                <TableJobs />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default JobManagementPage;
