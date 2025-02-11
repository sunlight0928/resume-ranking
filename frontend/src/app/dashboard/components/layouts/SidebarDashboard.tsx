"use client";

import React, { useState, ReactNode, useEffect } from "react";
import { SidebarDataDashboard } from "../data/SidebarDataDashboard";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaCommentAlt } from "react-icons/fa";
import { Button } from "../../../components/ui/Button";
import { Avatar, AvatarFallback } from "../../../components/ui/Avatar";
import { ArrowRightFromLine } from "lucide-react";

const ActiveLink = ({
  href,
  icon,
  title,
}: {
  href: string;
  icon: ReactNode;
  title: string;
}) => {
  const routerPath = usePathname();
  const [isActive, setIsActive] = useState<boolean>(false);

  useEffect(() => {
    setIsActive(routerPath === href);
  }, [routerPath, href]);

  const classNameInActive =
    "bg-transparent text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700";
  const classNameActive =
    "bg-blue-normal text-white hover:bg-blue-hover dark:text-white dark:hover:bg-blue-dark-hover mr-2";

  return (
    <div className="gap-2.5 flex flex-row w-full items-center">
      {isActive && (
        <svg
          width="4"
          height="40"
          viewBox="0 0 4 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 0.5C2.20914 0.5 4 2.29086 4 4.5V35.5C4 37.7091 2.20914 39.5 0 39.5V0.5Z"
            fill="#7059F3"
          />
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
  const [isLocalStorageUpdated, setIsLocalStorageUpdated] =
    useState<boolean>(false);
  const [showSubMenu, setShowSubMenu] = useState(
    new Array(SidebarDataDashboard.length).fill(false)
  );

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
    const updatedSubMenuLS = JSON.parse(
      localStorage.getItem("updatedSubMenu") || "[]"
    );
    if (updatedSubMenuLS.length > 0) {
      setShowSubMenu(
        new Array(SidebarDataDashboard.length)
          .fill(false)
          .map((_, index) => updatedSubMenuLS.includes(index))
      );
      setUpdatedSubMenuLS(updatedSubMenuLS);
      setIsLocalStorageUpdated(true);
    }
  }, []);

  useEffect(() => {
    if (!isLocalStorageUpdated) {
      const updatedSubMenuLS = JSON.parse(
        localStorage.getItem("updatedSubMenu") || "[]"
      );
      setShowSubMenu(
        new Array(SidebarDataDashboard.length)
          .fill(false)
          .map((_, index) => updatedSubMenuLS.includes(index))
      );
    }
  }, [isLocalStorageUpdated]);

  return (
    <>
      <div>
        <aside
          id="sidebar"
          className={`fixed top-0 left-0 z-20 flex flex-col w-64 h-full pt-14 lg:pt-[90px] font-normal duration-75 lg:flex transition-width ${
            open ? "" : "hidden"
          }`}
        >
          <div className="flex flex-col flex-1 h-full bg-white border-r border-gray-200 dark:bg-[#13131A] dark:border-gray-700">
            <div className="flex-1 pt-5 pb-4 overflow-y-auto">
              <ul className="pb-2 space-y-2.5">
                {SidebarDataDashboard.map((item, index) => (
                  <React.Fragment key={index}>
                    {item.link && (
                      <li onClick={() => toggleSidebar(false)}>
                        <ActiveLink
                          href={item.link}
                          icon={item.icon}
                          title={item.title}
                        />
                      </li>
                    )}
                  </React.Fragment>
                ))}
              </ul>
            </div>

            {/* User Info Section */}
            <div className="space-y-4 px-1 mt-auto pb-4">
              <div className="flex items-center gap-3 px-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-[#7059f3]/10 text-[#7059f3]">
                    RC
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Roscoe Chambers</span>
                  <span className="text-sm text-gray-500">
                    roscoechambers@gmail.com
                  </span>
                </div>
              </div>
              <Button
                variant="destructive"
                className="w-1/2 bg-[#fc5a5a] text-white hover:bg-[#fc5a5a]/90 mx-3"
              >
                <svg
                  width="21"
                  height="20"
                  viewBox="0 0 21 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.06686 10.0577C7.06686 9.71602 7.3502 9.43268 7.69186 9.43268H12.2585V2.38268C12.2502 1.98268 11.9335 1.66602 11.5335 1.66602C6.6252 1.66602 3.2002 5.09102 3.2002 9.99935C3.2002 14.9077 6.6252 18.3327 11.5335 18.3327C11.9252 18.3327 12.2502 18.016 12.2502 17.616V10.6743H7.69186C7.34186 10.6827 7.06686 10.3993 7.06686 10.0577Z"
                    fill="currentColor"
                  />
                  <path
                    d="M17.6167 9.6168L15.25 7.2418C15.0083 7.00013 14.6083 7.00013 14.3667 7.2418C14.125 7.48346 14.125 7.88346 14.3667 8.12513L15.6667 9.42513H12.25V10.6751H15.6583L14.3583 11.9751C14.1167 12.2168 14.1167 12.6168 14.3583 12.8585C14.4833 12.9835 14.6417 13.0418 14.8 13.0418C14.9583 13.0418 15.1167 12.9835 15.2417 12.8585L17.6083 10.4835C17.8583 10.2501 17.8583 9.85846 17.6167 9.6168Z"
                    fill="currentColor"
                  />
                </svg>
                Logout
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
};

export default SidebarDashboard;
