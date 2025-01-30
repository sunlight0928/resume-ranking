import { ReactNode } from "react";
import { MdWork, MdPersonSearch, MdPeopleAlt, MdAssistantNavigation } from "react-icons/md";

interface Menu {
  title: string;
  link?: string;
  icon: ReactNode;
  subMenu?: SubMenu[];
}

interface SubMenu {
  title: string;
  link: string;
  icon: ReactNode;
}

export const SidebarDataDashboard: Menu[] = [
  {
    title: "Jobs",
    link: "/dashboard/jobs",
    icon: (
      <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M16.5002 22.7498H8.50023C3.88023 22.7498 3.02023 20.5998 2.80023 18.5098L2.05023 10.4998C1.94023 9.44977 1.91023 7.89977 2.95023 6.73977C3.85023 5.73977 5.34023 5.25977 7.50023 5.25977H17.5002C19.6702 5.25977 21.1602 5.74977 22.0502 6.73977C23.0902 7.89977 23.0602 9.44977 22.9502 10.5098L22.2002 18.4998C21.9802 20.5998 21.1202 22.7498 16.5002 22.7498ZM7.50023 6.74977C5.81023 6.74977 4.65023 7.07977 4.06023 7.73977C3.57023 8.27977 3.41023 9.10977 3.54023 10.3498L4.29023 18.3598C4.46023 19.9398 4.89023 21.2498 8.50023 21.2498H16.5002C20.1002 21.2498 20.5402 19.9398 20.7102 18.3498L21.4602 10.3598C21.5902 9.10977 21.4302 8.27977 20.9402 7.73977C20.3502 7.07977 19.1902 6.74977 17.5002 6.74977H7.50023Z"
          fill="currentColor"
        />
        <path
          d="M16.5 6.75C16.09 6.75 15.75 6.41 15.75 6V5.2C15.75 3.42 15.75 2.75 13.3 2.75H11.7C9.25 2.75 9.25 3.42 9.25 5.2V6C9.25 6.41 8.91 6.75 8.5 6.75C8.09 6.75 7.75 6.41 7.75 6V5.2C7.75 3.44 7.75 1.25 11.7 1.25H13.3C17.25 1.25 17.25 3.44 17.25 5.2V6C17.25 6.41 16.91 6.75 16.5 6.75Z"
          fill="currentColor"
        />
        <path
          d="M12.5 16.75C9.75 16.75 9.75 15.05 9.75 14.03V13C9.75 11.59 10.09 11.25 11.5 11.25H13.5C14.91 11.25 15.25 11.59 15.25 13V14C15.25 15.04 15.25 16.75 12.5 16.75ZM11.25 12.75C11.25 12.83 11.25 12.92 11.25 13V14.03C11.25 15.06 11.25 15.25 12.5 15.25C13.75 15.25 13.75 15.09 13.75 14.02V13C13.75 12.92 13.75 12.83 13.75 12.75C13.67 12.75 13.58 12.75 13.5 12.75H11.5C11.42 12.75 11.33 12.75 11.25 12.75Z"
          fill="currentColor"
        />
        <path
          d="M14.5 14.7702C14.13 14.7702 13.8 14.4902 13.76 14.1102C13.71 13.7002 14 13.3202 14.41 13.2702C17.05 12.9402 19.58 11.9402 21.71 10.3902C22.04 10.1402 22.51 10.2202 22.76 10.5602C23 10.8902 22.93 11.3602 22.59 11.6102C20.25 13.3102 17.49 14.4002 14.59 14.7702C14.56 14.7702 14.53 14.7702 14.5 14.7702Z"
          fill="currentColor"
        />
        <path
          d="M10.5002 14.7809C10.4702 14.7809 10.4402 14.7809 10.4102 14.7809C7.67023 14.4709 5.00023 13.4709 2.69023 11.8909C2.35023 11.6609 2.26023 11.1909 2.49023 10.8509C2.72023 10.5109 3.19023 10.4209 3.53023 10.6509C5.64023 12.0909 8.07023 13.0009 10.5702 13.2909C10.9802 13.3409 11.2802 13.7109 11.2302 14.1209C11.2002 14.5009 10.8802 14.7809 10.5002 14.7809Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    title: "Candidates",
    link: "/dashboard/candidates",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M9.15957 11.62C9.12957 11.62 9.10957 11.62 9.07957 11.62C9.02957 11.61 8.95957 11.61 8.89957 11.62C5.99957 11.53 3.80957 9.25 3.80957 6.44C3.80957 3.58 6.13957 1.25 8.99957 1.25C11.8596 1.25 14.1896 3.58 14.1896 6.44C14.1796 9.25 11.9796 11.53 9.18957 11.62C9.17957 11.62 9.16957 11.62 9.15957 11.62ZM8.99957 2.75C6.96957 2.75 5.30957 4.41 5.30957 6.44C5.30957 8.44 6.86957 10.05 8.85957 10.12C8.91957 10.11 9.04957 10.11 9.17957 10.12C11.1396 10.03 12.6796 8.42 12.6896 6.44C12.6896 4.41 11.0296 2.75 8.99957 2.75Z"
          fill="currentColor"
        />
        <path
          d="M16.5394 11.75C16.5094 11.75 16.4794 11.75 16.4494 11.74C16.0394 11.78 15.6194 11.49 15.5794 11.08C15.5394 10.67 15.7894 10.3 16.1994 10.25C16.3194 10.24 16.4494 10.24 16.5594 10.24C18.0194 10.16 19.1594 8.96 19.1594 7.49C19.1594 5.97 17.9294 4.74 16.4094 4.74C15.9994 4.75 15.6594 4.41 15.6594 4C15.6594 3.59 15.9994 3.25 16.4094 3.25C18.7494 3.25 20.6594 5.16 20.6594 7.5C20.6594 9.8 18.8594 11.66 16.5694 11.75C16.5594 11.75 16.5494 11.75 16.5394 11.75Z"
          fill="currentColor"
        />
        <path
          d="M9.16961 22.55C7.20961 22.55 5.23961 22.05 3.74961 21.05C2.35961 20.13 1.59961 18.87 1.59961 17.5C1.59961 16.13 2.35961 14.86 3.74961 13.93C6.74961 11.94 11.6096 11.94 14.5896 13.93C15.9696 14.85 16.7396 16.11 16.7396 17.48C16.7396 18.85 15.9796 20.12 14.5896 21.05C13.0896 22.05 11.1296 22.55 9.16961 22.55ZM4.57961 15.19C3.61961 15.83 3.09961 16.65 3.09961 17.51C3.09961 18.36 3.62961 19.18 4.57961 19.81C7.06961 21.48 11.2696 21.48 13.7596 19.81C14.7196 19.17 15.2396 18.35 15.2396 17.49C15.2396 16.64 14.7096 15.82 13.7596 15.19C11.2696 13.53 7.06961 13.53 4.57961 15.19Z"
          fill="currentColor"
        />
        <path
          d="M18.3397 20.75C17.9897 20.75 17.6797 20.51 17.6097 20.15C17.5297 19.74 17.7897 19.35 18.1897 19.26C18.8197 19.13 19.3997 18.88 19.8497 18.53C20.4197 18.1 20.7297 17.56 20.7297 16.99C20.7297 16.42 20.4197 15.88 19.8597 15.46C19.4197 15.12 18.8697 14.88 18.2197 14.73C17.8197 14.64 17.5597 14.24 17.6497 13.83C17.7397 13.43 18.1397 13.17 18.5497 13.26C19.4097 13.45 20.1597 13.79 20.7697 14.26C21.6997 14.96 22.2297 15.95 22.2297 16.99C22.2297 18.03 21.6897 19.02 20.7597 19.73C20.1397 20.21 19.3597 20.56 18.4997 20.73C18.4397 20.75 18.3897 20.75 18.3397 20.75Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    title: "Matching",
    link: "/dashboard/matching",
    icon: (
      <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M17.6 1.25H13.4C9.49 1.25 7.75 2.99 7.75 6.9V8C7.75 8.41 8.09 8.75 8.5 8.75H11.6C14.7 8.75 15.75 9.8 15.75 12.9V16C15.75 16.41 16.09 16.75 16.5 16.75H17.6C21.51 16.75 23.25 15.01 23.25 11.1V6.9C23.25 2.99 21.51 1.25 17.6 1.25ZM9.25 7.25V6.9C9.25 3.8 10.3 2.75 13.4 2.75H17.6C20.7 2.75 21.75 3.8 21.75 6.9V11.1C21.75 14.2 20.7 15.25 17.6 15.25H17.25V12.9C17.25 8.99 15.51 7.25 11.6 7.25H9.25Z"
          fill="currentColor"
        />
        <path
          d="M11.6 7.25H7.4C3.49 7.25 1.75 8.99 1.75 12.9V17.1C1.75 21.01 3.49 22.75 7.4 22.75H11.6C15.51 22.75 17.25 21.01 17.25 17.1V12.9C17.25 8.99 15.51 7.25 11.6 7.25ZM7.4 21.25C4.3 21.25 3.25 20.2 3.25 17.1V12.9C3.25 9.8 4.3 8.75 7.4 8.75H11.6C14.7 8.75 15.75 9.8 15.75 12.9V17.1C15.75 20.2 14.7 21.25 11.6 21.25H7.4Z"
          fill="currentColor"
        />
        <path
          d="M8.53002 17.7C8.34002 17.7 8.15002 17.63 8.00002 17.48L6.05002 15.53C5.76002 15.24 5.76002 14.76 6.05002 14.47C6.34002 14.18 6.82002 14.18 7.11002 14.47L8.53002 15.89L11.89 12.53C12.18 12.24 12.66 12.24 12.95 12.53C13.24 12.82 13.24 13.3 12.95 13.59L9.05002 17.48C8.91002 17.62 8.72002 17.7 8.53002 17.7Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    title: "AI assistant",
    link: "/dashboard/chatbot",
    icon: (
      <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M14.07 22.3801C13.84 22.3801 13.61 22.3401 13.39 22.2601C12.64 21.9801 12.16 21.2801 12.16 20.4801V14.0301H9.81997C9.05997 14.0301 8.39996 13.6001 8.08996 12.9101C7.77996 12.2201 7.89996 11.4401 8.39996 10.8701L15.97 2.27006C16.5 1.67006 17.32 1.46006 18.07 1.75006C18.82 2.03006 19.2999 2.73006 19.2999 3.53006V9.98006H21.64C22.4 9.98006 23.06 10.4101 23.37 11.1001C23.68 11.7901 23.56 12.5701 23.06 13.1401L15.49 21.7401C15.12 22.1601 14.6 22.3801 14.07 22.3801ZM17.38 3.12006C17.29 3.12006 17.18 3.15006 17.09 3.26006L9.51995 11.8701C9.35995 12.0501 9.41997 12.2301 9.44997 12.3001C9.47997 12.3701 9.57997 12.5401 9.81997 12.5401H12.91C13.32 12.5401 13.66 12.8801 13.66 13.2901V20.4901C13.66 20.7401 13.84 20.8401 13.92 20.8701C14 20.9001 14.1999 20.9501 14.3599 20.7601L21.93 12.1501C22.09 11.9701 22.03 11.7901 22 11.7201C21.97 11.6501 21.87 11.4801 21.63 11.4801H18.54C18.13 11.4801 17.79 11.1401 17.79 10.7301V3.53006C17.79 3.28006 17.61 3.18006 17.53 3.15006C17.5 3.13006 17.44 3.12006 17.38 3.12006Z"
          fill="currentColor"
        />
        <path
          d="M9 4.75H2C1.59 4.75 1.25 4.41 1.25 4C1.25 3.59 1.59 3.25 2 3.25H9C9.41 3.25 9.75 3.59 9.75 4C9.75 4.41 9.41 4.75 9 4.75Z"
          fill="currentColor"
        />
        <path
          d="M8 20.75H2C1.59 20.75 1.25 20.41 1.25 20C1.25 19.59 1.59 19.25 2 19.25H8C8.41 19.25 8.75 19.59 8.75 20C8.75 20.41 8.41 20.75 8 20.75Z"
          fill="currentColor"
        />
        <path
          d="M5 12.75H2C1.59 12.75 1.25 12.41 1.25 12C1.25 11.59 1.59 11.25 2 11.25H5C5.41 11.25 5.75 11.59 5.75 12C5.75 12.41 5.41 12.75 5 12.75Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
];
