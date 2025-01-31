"use client";

import React, { PropsWithChildren, useState } from "react";
import "./dashboard.css"; // Import CSS stylesheet for styling

import SidebarDashboard from "./components/layouts/SidebarDashboard";
import FooterDashboard from "./components/layouts/FooterDashboard";
import NavbarDashboard from "./components/layouts/NavbarDashboard";

const DashboardLayout = (props: PropsWithChildren) => {
  const [sidebarOpen, setSidebarOpen] = useState<Boolean>(false);

  function toggleSidebar(value?: boolean) {
    if (value === false || value === true) setSidebarOpen(value);
    else setSidebarOpen(!sidebarOpen);
  }

  return (
    <>
      {/* Display the top navbar */}
      <NavbarDashboard toggleSidebar={toggleSidebar} />

      {/* Main dashboard layout */}
      <div className="flex pt-14 lg:pt-[90px] overflow-hidden bg-gray-50 dark:bg-[#111111]">
        {/* Display the sidebar */}
        <SidebarDashboard open={sidebarOpen} toggleSidebar={toggleSidebar} />

        {/* Main content area */}
        <div id="main-content" className={`relative w-full h-full overflow-y-auto p-6 lg:p-10 lg:ml-64`}>
          <main>
            {props.children} {/* Render the children components */}
          </main>

          {/* Display the footer */}
          <FooterDashboard />
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;
