"use client";

import React from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Logo } from "@/app/components/Logo";
import { ThemeToggle } from "@/app/components/theme/ThemeToggle";
import { Button } from "../../../components/ui/Button";

const NavbarDashboard = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  return (
    <nav className="fixed z-30 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="h-14 lg:h-[90px] border-b border-[#e2e2ea] dark:border-[#1C1C28] px-[30px] flex items-center justify-between bg-white dark:bg-[#13131A]">
        <div
          className="flex flex-col items-center justify-center gap-0.5"
          onClick={toggleSidebar}
        >
          <Logo className="w-11 h-9" />
          <span className="font-sans font-bold text-lg lg:text-xl bg-gradient-to-b from-[#7059f3] to-[#41348d] bg-clip-text text-transparent flex-none order-1 self-stretch flex-grow-0 hidden lg:block">
            ResumeGenie
          </span>
        </div>
        <div className="flex items-center gap-4">
          {/* <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#92929d]" />
            <input
              type="search"
              placeholder="Find"
              className="w-[200px] pl-9 pr-4 py-2 rounded-lg border border-[#e2e2ea] dark:border-[#1C1C28] 
              bg-white dark:bg-[#1C1C28] text-[#171725] dark:text-white
              focus:outline-none focus:ring-2 focus:ring-[#7664ff] focus:border-transparent text-sm"
            />
          </div>
          <Button size="sm" variant="default">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline ml-1.5">New</span>
          </Button> */}
          <ThemeToggle />
          <div className="relative cursor-pointer text-[#292D32] dark:text-white">
            <span className="absolute bg-red-500 w-2 h-2 text-xs rounded-full right-1"></span>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.0199 20.53C9.68987 20.53 7.35987 20.16 5.14987 19.42C4.30987 19.13 3.66987 18.54 3.38987 17.77C3.09987 17 3.19987 16.15 3.65987 15.39L4.80987 13.48C5.04987 13.08 5.26987 12.28 5.26987 11.81V8.91998C5.26987 5.19998 8.29987 2.16998 12.0199 2.16998C15.7399 2.16998 18.7699 5.19998 18.7699 8.91998V11.81C18.7699 12.27 18.9899 13.08 19.2299 13.49L20.3699 15.39C20.7999 16.11 20.8799 16.98 20.5899 17.77C20.2999 18.56 19.6699 19.16 18.8799 19.42C16.6799 20.16 14.3499 20.53 12.0199 20.53ZM12.0199 3.66998C9.12987 3.66998 6.76987 6.01998 6.76987 8.91998V11.81C6.76987 12.54 6.46987 13.62 6.09987 14.25L4.94987 16.16C4.72987 16.53 4.66987 16.92 4.79987 17.25C4.91987 17.59 5.21987 17.85 5.62987 17.99C9.80987 19.39 14.2399 19.39 18.4199 17.99C18.7799 17.87 19.0599 17.6 19.1899 17.24C19.3199 16.88 19.2899 16.49 19.0899 16.16L17.9399 14.25C17.5599 13.6 17.2699 12.53 17.2699 11.8V8.91998C17.2699 6.01998 14.9199 3.66998 12.0199 3.66998Z"
                fill="currentColor"
              />
              <path
                d="M13.8796 3.93999C13.8096 3.93999 13.7396 3.92999 13.6696 3.90999C13.3796 3.82999 13.0996 3.76999 12.8296 3.72999C11.9796 3.61999 11.1596 3.67999 10.3896 3.90999C10.1096 3.99999 9.80963 3.90999 9.61963 3.69999C9.42963 3.48999 9.36963 3.18999 9.47963 2.91999C9.88963 1.86999 10.8896 1.17999 12.0296 1.17999C13.1696 1.17999 14.1696 1.85999 14.5796 2.91999C14.6796 3.18999 14.6296 3.48999 14.4396 3.69999C14.2896 3.85999 14.0796 3.93999 13.8796 3.93999Z"
                fill="currentColor"
              />
              <path
                d="M12.0195 22.81C11.0295 22.81 10.0695 22.41 9.36953 21.71C8.66953 21.01 8.26953 20.05 8.26953 19.06H9.76953C9.76953 19.65 10.0095 20.23 10.4295 20.65C10.8495 21.07 11.4295 21.31 12.0195 21.31C13.2595 21.31 14.2695 20.3 14.2695 19.06H15.7695C15.7695 21.13 14.0895 22.81 12.0195 22.81Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div className="flex flex-row items-center gap-2 justify-center h-9 mr-2">
            <img
              src="../assets/avatar.png"
              className="w-9 h-9 rounded-full bg-[#f1effe] dark:bg-[#1C1C28]"
            />
            {/* <div className="flex-col text-start h-9 hidden lg:flex">
              <span className="font-bold text-lg text-[#344054] h-6 dark:text-white-dark">Roscoe Chambers</span>
              <span className="font-normal text-xs ml-[4px] mt-[-1px] text-[#344054] dark:text-white-dark h-3 opacity-60">
                Primary User
              </span>
            </div> */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavbarDashboard;
