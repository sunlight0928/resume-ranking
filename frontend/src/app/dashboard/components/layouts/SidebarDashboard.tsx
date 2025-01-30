"use client";

import React, { useState, ReactNode, useEffect } from "react";
import { SidebarDataDashboard } from "../data/SidebarDataDashboard";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaCommentAlt } from "react-icons/fa";

const ActiveLink = ({ href, icon, title }: { href: string; icon: ReactNode; title: string }) => {
  const routerPath = usePathname();
  const [isActive, setIsActive] = useState<boolean>(false);

  useEffect(() => {
    setIsActive(routerPath === href);
  }, [routerPath, href]);

  const classNameInActive = "bg-transparent text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700";
  const classNameActive =
    "bg-blue-normal text-white hover:bg-blue-hover dark:text-white dark:hover:bg-blue-dark-hover mr-2";

  return (
    <div className="gap-2.5 flex flex-row w-full items-center">
      {isActive && (
        <svg width="4" height="40" viewBox="0 0 4 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0.5C2.20914 0.5 4 2.29086 4 4.5V35.5C4 37.7091 2.20914 39.5 0 39.5V0.5Z" fill="#7059F3" />
        </svg>
      )}
      <Link
        href={href}
        className={`w-full flex items-center p-4 px-3.5 gap-2 font-outpit h-[52px] text-sm font-semibold rounded-lg group ${
          isActive ? classNameActive : classNameInActive
        }`}
      >
        {icon}
        <span>{title}</span>
      </Link>
    </div>
  );
};

const SidebarDashboard = ({
  open,
  toggleSidebar,
}: {
  open: Boolean;
  toggleSidebar: (value: boolean | undefined) => void;
}) => {
  const [updatedSubMenuLS, setUpdatedSubMenuLS] = useState<number[]>([]);
  const [isLocalStorageUpdated, setIsLocalStorageUpdated] = useState<boolean>(false);
  const [showSubMenu, setShowSubMenu] = useState(new Array(SidebarDataDashboard.length).fill(false));

  const setLocalStorage = (value: number[]) => {
    localStorage.setItem("updatedSubMenu", JSON.stringify(value));
    setUpdatedSubMenuLS(value);
  };

  const handleParentClick = async (index: number) => {
    const updatedSubMenu = [...showSubMenu];
    updatedSubMenu[index] = !updatedSubMenu[index];
    setShowSubMenu(updatedSubMenu);

    if (updatedSubMenu[index]) {
      setLocalStorage([...updatedSubMenuLS, index]);
    } else {
      setLocalStorage(updatedSubMenuLS.filter((i) => i !== index));
    }
  };

  useEffect(() => {
    const updatedSubMenuLS = JSON.parse(localStorage.getItem("updatedSubMenu") || "[]");
    if (updatedSubMenuLS.length > 0) {
      setShowSubMenu(
        new Array(SidebarDataDashboard.length).fill(false).map((_, index) => updatedSubMenuLS.includes(index))
      );
      setUpdatedSubMenuLS(updatedSubMenuLS);
      setIsLocalStorageUpdated(true);
    }
  }, []);

  useEffect(() => {
    if (!isLocalStorageUpdated) {
      const updatedSubMenuLS = JSON.parse(localStorage.getItem("updatedSubMenu") || "[]");
      setShowSubMenu(
        new Array(SidebarDataDashboard.length).fill(false).map((_, index) => updatedSubMenuLS.includes(index))
      );
    }
  }, [isLocalStorageUpdated]);

  return (
    <>
      <div>
        <aside
          id="sidebar"
          className={`fixed top-0 left-0 z-20  flex-col flex-shrink-0 w-64 h-full pt-14 lg:pt-[90px] font-normal duration-75 lg:flex transition-width ${
            open ? "" : "hidden"
          }`}
        >
          <div className="relative flex flex-col flex-1 h-full w-screen lg:w-auto min-h-0 pt-0 bg-white border-r border-gray-200 dark:bg-[#13131A] dark:border-gray-700">
            <div className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
              <div className="flex-1 space-y-1 bg-white divide-y divide-gray-200 dark:bg-[#13131A] dark:divide-gray-700">
                {/* Sidebar Menu */}
                <ul className="pb-2 space-y-2.5">
                  {SidebarDataDashboard.map((item, index) => (
                    <React.Fragment key={index}>
                      {item.link && (
                        <li onClick={() => toggleSidebar(false)}>
                          <ActiveLink href={item.link} icon={item.icon} title={item.title} />
                        </li>
                      )}
                    </React.Fragment>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
};

export default SidebarDashboard;
