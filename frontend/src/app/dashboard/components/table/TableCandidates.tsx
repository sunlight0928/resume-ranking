"use client";
import React, { useMemo, useState } from "react";
import { IconArrowRight } from "@tabler/icons-react";
import { createColumnHelper, Row } from "@tanstack/react-table";
import UseTableTanStackSSR from "@/app/hooks/react-table/useTableTanStackSSR";
import {
  useDeleteFileData,
  useListCandidateData,
  useListFileDetailData,
} from "@/app/hooks/react-query/management/file/useFilesUploadData";
import { TablePagination, Drawer } from "@mui/material";
import { Dialog, Transition } from "@headlessui/react";
import { ToastContainer, toast } from "react-toastify";
import { PDFViewer, Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { FaDownload, FaPrint, FaSearch } from "react-icons/fa";
import { jsPDF } from "jspdf";
import { Calendar, Plus, Search } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type Props = {
  data: CandidateResponseModel;
  refetch: () => void;
};

const pdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    paddingTop: 10,
    fontSize: 12,
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    color: "#5443B6", // Blue color for the title
    marginBottom: 20,
    fontWeight: "bold"
  },
  sectionTitle: {
    fontSize: 14,
    color: "#5443B6", // Blue color for section titles
    marginBottom: 10,
    marginTop: 20,
  },
  bulletPoint: {
    flexDirection: "row",
    marginBottom: 6,
  },
  bulletText: {
    fontSize: 12,
    marginLeft: 5,
    flex: 1,
  },
  bulletSymbol: {
    fontSize: 12,
    marginRight: 5,
  },
  createdDate: {
    fontSize: 12,
    marginTop: 20,
    textAlign: "right",
  },
});

// Component to render a section with bullets
const PDFSection = ({ title, items }: { title: string; items: string[] }) => (
  <View>
    {/* Section Title */}
    <Text style={pdfStyles.sectionTitle}>{title}</Text>

    {/* List Items */}
    {items.length > 0 ? (
      items.map((item, index) => (
        <View style={pdfStyles.bulletPoint} key={index}>
          <Text style={pdfStyles.bulletSymbol}>•</Text>
          <Text style={pdfStyles.bulletText}>{item}</Text>
        </View>
      ))
    ) : (
      <Text style={pdfStyles.bulletText}>None</Text>
    )}
  </View>
);

const TableCandidates = (props2: Props) => {
  const [currentPage, setCurrentPage] = React.useState<number>(0);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [isOpenDrawer, setIsOpenDrawer] = React.useState<boolean>(false);
  const [fetching, setIsFetching] = React.useState<boolean>(false);
  const [fileId, setFileId] = React.useState<string>("id");
  const [fileName, setFileName] = React.useState<string>("");
  const [isOpenModalDelete, setIsOpenModalDelete] =
    React.useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>(""); // State for search term
  const [isSearchMode, setIsSearchMode] = useState<boolean>(false); // State to track if search mode is active
  const fileDetailQuery = useListFileDetailData(fileId);
  const { mutate: deleteFile } = useDeleteFileData(fileId);
  const [isOutputModalOpen, setIsOutputModalOpen] = React.useState<boolean>(false);
  const { data, isLoading, isError, refetch } = useListCandidateData(
    currentPage + 1,
    pageSize
  );
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]); // [startDate, endDate]
  const [startDate, endDate] = dateRange;

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    setDateRange(dates);
  };

  const onApplyFilter = () => {
    console.log("Selected Start Date:", startDate);
    console.log("Selected End Date:", endDate);
  
    // Close the date picker popover
    setIsDatePickerOpen(false);
  };

  const showModalDelete = async (fileId: string, fileName: string) => {
    await setFileId(fileId);
    await setFileName(fileName);
    setIsOpenModalDelete(true);
  };

  const closeModal = () => {
    setIsOpenModalDelete(false);
  };

  const handleDeleteFile = () => {
    deleteFile(
      {},
      {
        onError: async (error: any) => {
          console.log("Delete file error:", error.response.status);
          setIsOpenModalDelete(false);
          toast.error("Delete file failed");
        },
        onSuccess: async () => {
          setIsOpenModalDelete(false);
          props2.refetch();
          toast.success("Delete file success");
        },
      }
    );
  };

  const columnHelper = createColumnHelper<CandidateModel>();
  const columns = [
    columnHelper.display({
      header: "ID",
      cell: ({ row }: { row: Row<any> }) => {
        return (
          <div>
            {currentPage !== 0 ? (
              <>{currentPage * 10 + (row.index + 1)}</>
            ) : (
              <>{row.index + 1}</>
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor("candidate_name", {
      header: "Candidate Name",
      cell: (props) => props.getValue(),
    }),
    columnHelper.accessor("email", {
      header: "Email Address",
      cell: (props) => props.getValue(),
    }),
    columnHelper.accessor("phone_number", {
      header: "Phone Number",
      cell: (props) => props.getValue(),
    }),
    columnHelper.accessor("cv_name", {
      header: "Candidate CV Name",
      cell: (props) => (
        <div 
          style={{ display: "flex", flexDirection:"row", alignItems: "center", justifyContent:"center", width:"fit", left:"6px" }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M1.55555 0C0.696445 0 0 0.696446 0 1.55555V26.4444C0 27.3035 0.696446 28 1.55555 28H26.4444C27.3035 28 28 27.3035 28 26.4444V10.5L17.5 0H1.55555Z"
              fill="#F2F2F2"
            />
            <path d="M17.5 10.5L28 10.5L17.5 0L17.5 10.5Z" fill="#BDBDBD" />
            <rect
              x="1.75"
              y="14"
              width="24.5"
              height="11.375"
              rx="0.855575"
              fill="#EF4444"
            />
            <path
              d="M5.87646 22.9687V16.4062H8.29254C8.7875 16.4062 9.20276 16.5002 9.53832 16.6882C9.87599 16.8762 10.1308 17.1347 10.3028 17.4637C10.4769 17.7905 10.5639 18.1622 10.5639 18.5788C10.5639 18.9996 10.4769 19.3735 10.3028 19.7003C10.1287 20.0272 9.87179 20.2846 9.53203 20.4726C9.19227 20.6584 8.77386 20.7513 8.27681 20.7513H6.67553V19.774H8.11951C8.40894 19.774 8.64593 19.7227 8.83049 19.6202C9.01505 19.5177 9.15137 19.3767 9.23946 19.1972C9.32964 19.0178 9.37474 18.8116 9.37474 18.5788C9.37474 18.3459 9.32964 18.1409 9.23946 17.9636C9.15137 17.7863 9.014 17.6485 8.82734 17.5502C8.64278 17.4498 8.40474 17.3996 8.11322 17.3996H7.0436V22.9687H5.87646Z"
              fill="white"
            />
            <path
              d="M13.7609 22.9687H11.5777V16.4062H13.805C14.4447 16.4062 14.9941 16.5376 15.4535 16.8004C15.9149 17.061 16.2693 17.4359 16.5168 17.9251C16.7643 18.4143 16.888 18.9996 16.888 19.6811C16.888 20.3647 16.7632 20.9521 16.5136 21.4435C16.2661 21.9348 15.9086 22.3119 15.4409 22.5746C14.9753 22.8374 14.4153 22.9687 13.7609 22.9687ZM12.7448 21.9401H13.7043C14.1531 21.9401 14.5275 21.8568 14.8274 21.6902C15.1273 21.5214 15.3528 21.2704 15.5038 20.9372C15.6548 20.6018 15.7303 20.1831 15.7303 19.6811C15.7303 19.1791 15.6548 18.7625 15.5038 18.4314C15.3528 18.0981 15.1294 17.8493 14.8337 17.6848C14.5401 17.5182 14.1752 17.4348 13.7389 17.4348H12.7448V21.9401Z"
              fill="white"
            />
            <path
              d="M17.9969 22.9687V16.4062H22.1244V17.4028H19.1641V19.1844H21.8413V20.181H19.1641V22.9687H17.9969Z"
              fill="white"
            />
          </svg>
          <span style={{ marginLeft: "8px" }}>{props.getValue()}</span>
        </div>
      ),
    }),
    columnHelper.accessor("created_at", {
      header: "Candidate Created Date",
      // cell: (props) => {
      //   return <div className="truncate">{props.getValue()}</div>;
      // },
      cell: (props) => props.getValue(),
    }),
    // columnHelper.accessor("job_recommended", {
    //   header: "Recommended Jobs",
    //   cell: (props: any) => {
    //     const recommendedJobs = props.getValue();
    //     return (
    //       <div>
    //         {recommendedJobs.map((job: any, index: any) => (
    //           <span key={index}>
    //             {job}
    //             {index !== recommendedJobs.length - 1 ? ", " : ""}
    //           </span>
    //         ))}
    //       </div>
    //     );
    //   },
    // }),
    columnHelper.display({
      header: "Action",
      cell: ({ row }: { row: Row<any> }) => {
        return (
          <div className="flex flex-row gap-3 justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="text-[#292D32] hover:text-[#292D32AA] dark:text-[#CDD1D6]"
              onClick={() => handleDetail(row.original._id)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.9999 16.3299C9.60992 16.3299 7.66992 14.3899 7.66992 11.9999C7.66992 9.60992 9.60992 7.66992 11.9999 7.66992C14.3899 7.66992 16.3299 9.60992 16.3299 11.9999C16.3299 14.3899 14.3899 16.3299 11.9999 16.3299ZM11.9999 9.16992C10.4399 9.16992 9.16992 10.4399 9.16992 11.9999C9.16992 13.5599 10.4399 14.8299 11.9999 14.8299C13.5599 14.8299 14.8299 13.5599 14.8299 11.9999C14.8299 10.4399 13.5599 9.16992 11.9999 9.16992Z" fill="currentColor"/>
                <path d="M12.0001 21.0205C8.24008 21.0205 4.69008 18.8205 2.25008 15.0005C1.19008 13.3505 1.19008 10.6605 2.25008 9.00047C4.70008 5.18047 8.25008 2.98047 12.0001 2.98047C15.7501 2.98047 19.3001 5.18047 21.7401 9.00047C22.8001 10.6505 22.8001 13.3405 21.7401 15.0005C19.3001 18.8205 15.7501 21.0205 12.0001 21.0205ZM12.0001 4.48047C8.77008 4.48047 5.68008 6.42047 3.52008 9.81047C2.77008 10.9805 2.77008 13.0205 3.52008 14.1905C5.68008 17.5805 8.77008 19.5205 12.0001 19.5205C15.2301 19.5205 18.3201 17.5805 20.4801 14.1905C21.2301 13.0205 21.2301 10.9805 20.4801 9.81047C18.3201 6.42047 15.2301 4.48047 12.0001 4.48047Z" fill="currentColor"/>
              </svg>

            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-[#FF3B30] hover:text-[#FF3B30AA]"
              onClick={() => showModalDelete(row.original._id, row.original.cv_name)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.9997 6.73046C20.9797 6.73046 20.9497 6.73046 20.9197 6.73046C15.6297 6.20046 10.3497 6.00046 5.11967 6.53046L3.07967 6.73046C2.65967 6.77046 2.28967 6.47046 2.24967 6.05046C2.20967 5.63046 2.50967 5.27046 2.91967 5.23046L4.95967 5.03046C10.2797 4.49046 15.6697 4.70046 21.0697 5.23046C21.4797 5.27046 21.7797 5.64046 21.7397 6.05046C21.7097 6.44046 21.3797 6.73046 20.9997 6.73046Z" fill="currentColor"/>
                <path d="M8.49977 5.72C8.45977 5.72 8.41977 5.72 8.36977 5.71C7.96977 5.64 7.68977 5.25 7.75977 4.85L7.97977 3.54C8.13977 2.58 8.35977 1.25 10.6898 1.25H13.3098C15.6498 1.25 15.8698 2.63 16.0198 3.55L16.2398 4.85C16.3098 5.26 16.0298 5.65 15.6298 5.71C15.2198 5.78 14.8298 5.5 14.7698 5.1L14.5498 3.8C14.4098 2.93 14.3798 2.76 13.3198 2.76H10.6998C9.63977 2.76 9.61977 2.9 9.46977 3.79L9.23977 5.09C9.17977 5.46 8.85977 5.72 8.49977 5.72Z" fill="currentColor"/>
                <path d="M15.2104 22.7496H8.79039C5.30039 22.7496 5.16039 20.8196 5.05039 19.2596L4.40039 9.18959C4.37039 8.77959 4.69039 8.41959 5.10039 8.38959C5.52039 8.36959 5.87039 8.67959 5.90039 9.08959L6.55039 19.1596C6.66039 20.6796 6.70039 21.2496 8.79039 21.2496H15.2104C17.3104 21.2496 17.3504 20.6796 17.4504 19.1596L18.1004 9.08959C18.1304 8.67959 18.4904 8.36959 18.9004 8.38959C19.3104 8.41959 19.6304 8.76959 19.6004 9.18959L18.9504 19.2596C18.8404 20.8196 18.7004 22.7496 15.2104 22.7496Z" fill="currentColor"/>
                <path d="M13.6601 17.25H10.3301C9.92008 17.25 9.58008 16.91 9.58008 16.5C9.58008 16.09 9.92008 15.75 10.3301 15.75H13.6601C14.0701 15.75 14.4101 16.09 14.4101 16.5C14.4101 16.91 14.0701 17.25 13.6601 17.25Z" fill="currentColor"/>
                <path d="M14.5 13.25H9.5C9.09 13.25 8.75 12.91 8.75 12.5C8.75 12.09 9.09 11.75 9.5 11.75H14.5C14.91 11.75 15.25 12.09 15.25 12.5C15.25 12.91 14.91 13.25 14.5 13.25Z" fill="currentColor"/>
              </svg>
            </Button>
            <Button
              variant='secondary'
              size="lg"
              className="gap-2"
              onClick={() => handleOutput(row.original._id)}
            >
              Output 
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 11.834C5.93333 11.834 5.87333 11.8207 5.80667 11.794C5.62 11.7207 5.5 11.534 5.5 11.334V7.33398C5.5 7.06065 5.72667 6.83398 6 6.83398C6.27333 6.83398 6.5 7.06065 6.5 7.33398V10.1273L6.98 9.64732C7.17333 9.45398 7.49333 9.45398 7.68667 9.64732C7.88 9.84065 7.88 10.1607 7.68667 10.354L6.35333 11.6873C6.26 11.7807 6.12667 11.834 6 11.834Z" fill="currentColor"/>
                <path d="M6.00012 11.8336C5.87346 11.8336 5.74679 11.787 5.64679 11.687L4.31346 10.3536C4.12012 10.1603 4.12012 9.84029 4.31346 9.64695C4.50679 9.45362 4.82679 9.45362 5.02012 9.64695L6.35346 10.9803C6.54679 11.1736 6.54679 11.4936 6.35346 11.687C6.25346 11.787 6.12679 11.8336 6.00012 11.8336Z" fill="currentColor"/>
                <path d="M10.0002 15.1673H6.00016C2.38016 15.1673 0.833496 13.6207 0.833496 10.0007V6.00065C0.833496 2.38065 2.38016 0.833984 6.00016 0.833984H9.3335C9.60683 0.833984 9.8335 1.06065 9.8335 1.33398C9.8335 1.60732 9.60683 1.83398 9.3335 1.83398H6.00016C2.92683 1.83398 1.8335 2.92732 1.8335 6.00065V10.0007C1.8335 13.074 2.92683 14.1673 6.00016 14.1673H10.0002C13.0735 14.1673 14.1668 13.074 14.1668 10.0007V6.66732C14.1668 6.39398 14.3935 6.16732 14.6668 6.16732C14.9402 6.16732 15.1668 6.39398 15.1668 6.66732V10.0007C15.1668 13.6207 13.6202 15.1673 10.0002 15.1673Z" fill="currentColor"/>
                <path d="M14.6668 7.16633H12.0002C9.72016 7.16633 8.8335 6.27967 8.8335 3.99967V1.333C8.8335 1.133 8.9535 0.946334 9.14016 0.873C9.32683 0.793 9.54016 0.839667 9.68683 0.979667L15.0202 6.313C15.1602 6.453 15.2068 6.673 15.1268 6.85967C15.0468 7.04633 14.8668 7.16633 14.6668 7.16633ZM9.8335 2.53967V3.99967C9.8335 5.71967 10.2802 6.16633 12.0002 6.16633H13.4602L9.8335 2.53967Z" fill="currentColor"/>
              </svg>
            </Button>
          </div>
        );
      },
    }),
  ];

  // Filtered data based on search
  const filteredData = useMemo(() => {
    if (!data?.results) return [];
  
    return data.results.filter((candidate) => {
      // Check if the job name includes the search term
      const matchesSearchTerm = candidate.candidate_name.toLowerCase().includes(searchTerm.toLowerCase());
  
      // Check if the job's created_at date is within the selected date range
      const candidateDate = new Date(candidate.created_at);
      const matchesDateRange =
        (!startDate || candidateDate >= startDate) && (!endDate || candidateDate <= endDate);
  
      // Return true only if both conditions are met
      return matchesSearchTerm && matchesDateRange;
    });
  }, [data, searchTerm, startDate, endDate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (searchTerm.trim() === "") {
      // If the search term is empty, reset to initial state
      setIsSearchMode(false);
    } else {
      setIsSearchMode(true);
    }
  };

  const handleChangeRowsPerPage = (event: any) => {
    setPageSize(event.target.value);
  };

  const handlePageOnchange = (event: any, newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleDrawerClose = () => {
    setIsOpenDrawer(false);
  };

  const handleDetail = async (candidateId: string) => {
    await setFileId(candidateId);
    await fileDetailQuery.refetch();
    if (fileDetailQuery.isLoading) {
      setIsFetching(true);
    }
    setIsFetching(false);
    setIsOpenDrawer(true);
  };

  const handleOutput = async (jobId: string) => {
    await setFileId(jobId);
    await fileDetailQuery.refetch();
    if (fileDetailQuery.isLoading) {
      setIsFetching(true);
    }
    setIsFetching(false);
    setIsOutputModalOpen(true);
  };

  // Function to close the modal
  const closeOutputModal = () => {
    setIsOutputModalOpen(false);
  };

  // Function to handle PDF printing
  const handlePrintPDF = () => {
    if (!fileDetailQuery.data) {
      toast.error("Candidate details are not loaded yet.");
      return;
    }
  
    const doc = new jsPDF(); // Create a new jsPDF instance
  
    // Extract job details from `jobDetailQuery.data`
    const candidateName = fileDetailQuery.data.candidate_name || "Candidate";
    const candidatemail = fileDetailQuery.data.email || " ";
    const candidatephone = fileDetailQuery.data.phone_number || " ";
    const summary = fileDetailQuery.data.comment || " ";
    const job_recommended = fileDetailQuery.data.job_recommended || [];
    const educations = fileDetailQuery.data.degree || [];
    const experiences = fileDetailQuery.data.experience || [];
    const responsibilities = fileDetailQuery.data.responsibility || [];
    const technicalSkills = fileDetailQuery.data.technical_skill || [];
    const softSkills = fileDetailQuery.data.soft_skill || [];
    const certificates = fileDetailQuery.data.certificate || [];
    const cv_name = fileDetailQuery.data.cv_name || " ";
    const createdAt = `Candidate Created Date: ${new Date(fileDetailQuery.data.created_at).toLocaleDateString()}`;
  
    const pageWidth = doc.internal.pageSize.getWidth(); // Get the width of the page
    const pageHeight = doc.internal.pageSize.getHeight(); // Get the height of the page
  
    // Set job name title in blue, centered, and with a 30px gap from the top
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 255); // Set text color to blue (RGB)
    doc.text(candidateName, pageWidth / 2, 30, { align: "center" }); // Center the text at 30px gap
  
    // Reset font styles for the rest of the content
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
  
    const bottomPadding = 10; // Padding at the bottom of the page
    const usablePageHeight = pageHeight - bottomPadding; // Usable height for content

    // Helper function to add text with proper line wrapping and page handling
    const addWrappedTextWithBullet = (
      docInstance: any,
      text: string | string[],
      x: number,
      y: number,
      maxWidth: number,
      lineHeight: number
    ): number => {
      const bullet = "• "; // Define the bullet point
      const lines = Array.isArray(text) ? text : docInstance.splitTextToSize(text, maxWidth - 10); // Adjust maxWidth for the bullet
      let currentY = y;
      lines.forEach((line: string, index: number) => {
        if (currentY + lineHeight > usablePageHeight) {
          docInstance.addPage(); // Add a new page when text exceeds the page height
          currentY = 20; // Reset `y` position on the new page
        }
        const prefix = index === 0 ? bullet : "   "; // Add bullet for the first line, and indent wrapped lines
        docInstance.text(prefix + line, x, currentY); // Add the bullet before the text
        currentY += lineHeight; // Increment `y` position for the next line
      });
      return currentY; // Return the updated `y` position
    };
  
    // Add sections with data
    const addSection = (title: string, items: string[], yOffset: number): number => {
      if (items.length > 0) {
        // Check if there's enough space for the section title
        if (yOffset + 10 > usablePageHeight) { // 10 is for the title's height
          doc.addPage();
          yOffset = 20; // Reset yOffset on the new page
        }
    
        // Add section title in blue
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14); // Slightly larger font for titles
        doc.setTextColor(0, 0, 255); // Set text color to blue
        doc.text(title, 10, yOffset + 4); // Add section title
        yOffset += 10; // Adjust yOffset for section content
    
        // Add the list items in normal font and black color
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0); // Reset text color to black
        items.forEach((item) => {
          yOffset = addWrappedTextWithBullet(doc, item, 15, yOffset, pageWidth - 30, 6); // Add wrapped text with bullet for each item
        });
    
        yOffset += 4; // Add extra space after the section
      }
      return yOffset;
    };
  
    let yOffset = 40; // Start content below the candidate name
    yOffset = addSection("Candidate Email Address", [candidatemail], yOffset);
    yOffset = addSection("Candidate Phone Number", [candidatephone], yOffset);
    yOffset = addSection("Candidate Summary", [summary], yOffset);
    yOffset = addSection("Recommended Jobs", job_recommended, yOffset);
    yOffset = addSection("Educations", educations, yOffset);
    yOffset = addSection("Experiences", experiences, yOffset);
    yOffset = addSection("Responsibilities", responsibilities, yOffset);
    yOffset = addSection("Technical Skills", technicalSkills, yOffset);
    yOffset = addSection("Soft Skills", softSkills, yOffset);
    yOffset = addSection("Certificates", certificates, yOffset);
    yOffset = addSection("Candidate CV Name", [cv_name], yOffset);
  
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 255); // Blue color for the title
    if (yOffset + 10 > usablePageHeight) { // Check if there's space for the title
      doc.addPage();
      yOffset = 20; // Reset yOffset on the new page
    }
    doc.text("Candidate Created Date", 10, yOffset + 4);
    yOffset += 10; // Adjust yOffset for the content
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Black color for the content
    yOffset = addWrappedTextWithBullet(doc, createdAt, 15, yOffset, pageWidth - 30, 6);
  
    // Output the PDF as a blob for printing
    const pdfBlob = doc.output("blob"); // Get the PDF as a blob object
  
    // Create a new window and print the PDF
    const pdfURL = URL.createObjectURL(pdfBlob);
    const printWindow = window.open(pdfURL, "_blank");
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print(); // Trigger the print dialog
      };
    }
  };

  const handleDownloadPDF = () => {
    if (!fileDetailQuery.data) {
      toast.error("Candidate details are not loaded yet.");
      return;
    }
  
    const doc = new jsPDF(); // Create a new jsPDF instance
  
    // Extract job details from `jobDetailQuery.data`
    const candidateName = fileDetailQuery.data.candidate_name || "Candidate";
    const candidatemail = fileDetailQuery.data.email || " ";
    const candidatephone = fileDetailQuery.data.phone_number || " ";
    const summary = fileDetailQuery.data.comment || " ";
    const job_recommended = fileDetailQuery.data.job_recommended || [];
    const educations = fileDetailQuery.data.degree || [];
    const experiences = fileDetailQuery.data.experience || [];
    const responsibilities = fileDetailQuery.data.responsibility || [];
    const technicalSkills = fileDetailQuery.data.technical_skill || [];
    const softSkills = fileDetailQuery.data.soft_skill || [];
    const certificates = fileDetailQuery.data.certificate || [];
    const cv_name = fileDetailQuery.data.cv_name || " ";
    const createdAt = `Candidate Created Date: ${new Date(fileDetailQuery.data.created_at).toLocaleDateString()}`;

    const pageWidth = doc.internal.pageSize.getWidth(); // Get the width of the page
    const pageHeight = doc.internal.pageSize.getHeight(); // Get the height of the page
  
    // Set job name title in blue, centered, and with a 30px gap from the top
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 255); // Set text color to blue (RGB)
    doc.text(candidateName, pageWidth / 2, 30, { align: "center" }); // Center the text at 30px gap
  
    // Reset font styles for the rest of the content
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
  
    const bottomPadding = 10; // Padding at the bottom of the page
    const usablePageHeight = pageHeight - bottomPadding; // Usable height for content

    // Helper function to add text with proper line wrapping and page handling
    const addWrappedTextWithBullet = (
      docInstance: any,
      text: string | string[],
      x: number,
      y: number,
      maxWidth: number,
      lineHeight: number
    ): number => {
      const bullet = "• "; // Define the bullet point
      const lines = Array.isArray(text) ? text : docInstance.splitTextToSize(text, maxWidth - 10); // Adjust maxWidth for the bullet
      let currentY = y;
      lines.forEach((line: string, index: number) => {
        if (currentY + lineHeight > usablePageHeight) {
          docInstance.addPage(); // Add a new page when text exceeds the page height
          currentY = 20; // Reset `y` position on the new page
        }
        const prefix = index === 0 ? bullet : "   "; // Add bullet for the first line, and indent wrapped lines
        docInstance.text(prefix + line, x, currentY); // Add the bullet before the text
        currentY += lineHeight; // Increment `y` position for the next line
      });
      return currentY; // Return the updated `y` position
    };

    // Add sections with data
    const addSection = (title: string, items: string[], yOffset: number): number => {
      if (items.length > 0) {
        // Check if there's enough space for the section title
        if (yOffset + 10 > usablePageHeight) { // 10 is for the title's height
          doc.addPage();
          yOffset = 20; // Reset yOffset on the new page
        }
    
        // Add section title in blue
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14); // Slightly larger font for titles
        doc.setTextColor(0, 0, 255); // Set text color to blue
        doc.text(title, 10, yOffset + 4); // Add section title
        yOffset += 10; // Adjust yOffset for section content
    
        // Add the list items in normal font and black color
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0); // Reset text color to black
        items.forEach((item) => {
          yOffset = addWrappedTextWithBullet(doc, item, 15, yOffset, pageWidth - 30, 6); // Add wrapped text with bullet for each item
        });
    
        yOffset += 4; // Add extra space after the section
      }
      return yOffset;
    };
  
    let yOffset = 40; // Start content below the candidate name
    yOffset = addSection("Candidate Email Address", [candidatemail], yOffset);
    yOffset = addSection("Candidate Phone Number", [candidatephone], yOffset);
    yOffset = addSection("Candidate Summary", [summary], yOffset);
    yOffset = addSection("Recommended Jobs", job_recommended, yOffset);
    yOffset = addSection("Educations", educations, yOffset);
    yOffset = addSection("Experiences", experiences, yOffset);
    yOffset = addSection("Responsibilities", responsibilities, yOffset);
    yOffset = addSection("Technical Skills", technicalSkills, yOffset);
    yOffset = addSection("Soft Skills", softSkills, yOffset);
    yOffset = addSection("Certificates", certificates, yOffset);
    yOffset = addSection("Candidate CV Name", [cv_name], yOffset);
  
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 255); // Blue color for the title
    if (yOffset + 10 > usablePageHeight) { // Check if there's space for the title
      doc.addPage();
      yOffset = 20; // Reset yOffset on the new page
    }
    doc.text("Candidate Created Date", 10, yOffset + 4);
    yOffset += 10; // Adjust yOffset for the content
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Black color for the content
    yOffset = addWrappedTextWithBullet(doc, createdAt, 15, yOffset, pageWidth - 30, 6);
  
    // Dynamically set the file name using the `jobName`
    const fileName = `${candidateName}.pdf`;
    doc.save(fileName);
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        theme="dark"
      />

      <div className="flex items-center justify-start sm:justify-between flex-row gap-0 sm:gap-4 w-full h-[78px] px-6 py-4">
        <div className="relative w-[calc(100vw-120px)] sm:w-[calc(100vw-260px)] md:w-[427px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#92929d]" />
          <input
            type="search"
            placeholder="Search here..."
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-[#e2e2ea] bg-white px-9 py-2 text-[#171725] focus:border-[#e2e2ea] focus:outline-none dark:border-[#1C1C28] dark:bg-[#1C1C28] dark:text-white"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 bg-transparent">
            <svg width="43" height="25" viewBox="0 0 43 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0.5" y="0.5" width="42" height="24" rx="6" fill="#ECECEC" />
              <path
                d="M17.1663 9.83398H11.833V15.1673H17.1663V9.83398Z"
                stroke="#898E95"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9.83301 19.166C10.933 19.166 11.833 18.266 11.833 17.166V15.166H9.83301C8.73301 15.166 7.83301 16.066 7.83301 17.166C7.83301 18.266 8.73301 19.166 9.83301 19.166Z"
                stroke="#898E95"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9.83301 9.83398H11.833V7.83398C11.833 6.73398 10.933 5.83398 9.83301 5.83398C8.73301 5.83398 7.83301 6.73398 7.83301 7.83398C7.83301 8.93398 8.73301 9.83398 9.83301 9.83398Z"
                stroke="#898E95"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17.167 9.83398H19.167C20.267 9.83398 21.167 8.93398 21.167 7.83398C21.167 6.73398 20.267 5.83398 19.167 5.83398C18.067 5.83398 17.167 6.73398 17.167 7.83398V9.83398Z"
                stroke="#898E95"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19.167 19.166C20.267 19.166 21.167 18.266 21.167 17.166C21.167 16.066 20.267 15.166 19.167 15.166H17.167V17.166C17.167 18.266 18.067 19.166 19.167 19.166Z"
                stroke="#898E95"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M29.648 17.5V7.784H30.964V17.5H29.648ZM30.544 13.23V12.026H35.612V13.23H30.544ZM30.544 8.988V7.784H35.85V8.988H30.544Z"
                fill="#898E95"
              />
            </svg>
          </button>
        </div>
        <div className="flex gap-0.5 w-fit">
          <div className="flex-row gap-4 hidden sm:flex">
            <div className="relative inline-block">
              {/* Date Filter Button */}
              <Button
                variant="outline"
                color="normal"
                onClick={() => setIsDatePickerOpen((prev) => !prev)} // Toggle the date picker
              >
                <span className="hidden lg:block">Date filter</span>
                <svg
                  width="17"
                  height="19"
                  viewBox="0 0 17 19"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M11.6616 0.333984C12.0066 0.333984 12.2866 0.613984 12.2866 0.958984L12.287 1.66549C13.5037 1.74891 14.5143 2.16569 15.2295 2.8824C16.0103 3.66657 16.4212 4.79407 16.417 6.14657V13.7491C16.417 16.5257 14.6537 18.2507 11.8162 18.2507H4.76783C1.93033 18.2507 0.166992 16.5016 0.166992 13.6857V6.1449C0.166992 3.52589 1.73954 1.84477 4.30423 1.66578L4.30474 0.958984C4.30474 0.613984 4.58474 0.333984 4.92974 0.333984C5.27474 0.333984 5.55474 0.613984 5.55474 0.958984L5.55449 1.64982H11.0362L11.0366 0.958984C11.0366 0.613984 11.3166 0.333984 11.6616 0.333984ZM15.167 7.75398H1.41699V13.6857C1.41699 15.8241 2.60699 17.0007 4.76783 17.0007H11.8162C13.977 17.0007 15.167 15.8457 15.167 13.7491L15.167 7.75398ZM12.0013 12.9976C12.3463 12.9976 12.6263 13.2776 12.6263 13.6226C12.6263 13.9676 12.3463 14.2476 12.0013 14.2476C11.6563 14.2476 11.373 13.9676 11.373 13.6226C11.373 13.2776 11.6488 12.9976 11.9938 12.9976H12.0013ZM8.30341 12.9976C8.64841 12.9976 8.92841 13.2776 8.92841 13.6226C8.92841 13.9676 8.64841 14.2476 8.30341 14.2476C7.95841 14.2476 7.67508 13.9676 7.67508 13.6226C7.67508 13.2776 7.95091 12.9976 8.29591 12.9976H8.30341ZM4.59774 12.9976C4.94274 12.9976 5.22274 13.2776 5.22274 13.6226C5.22274 13.9676 4.94274 14.2476 4.59774 14.2476C4.25274 14.2476 3.96858 13.9676 3.96858 13.6226C3.96858 13.2776 4.24524 12.9976 4.59024 12.9976H4.59774ZM12.0013 9.75865C12.3463 9.75865 12.6263 10.0387 12.6263 10.3837C12.6263 10.7287 12.3463 11.0087 12.0013 11.0087C11.6563 11.0087 11.373 10.7287 11.373 10.3837C11.373 10.0387 11.6488 9.75865 11.9938 9.75865H12.0013ZM8.30341 9.75865C8.64841 9.75865 8.92841 10.0387 8.92841 10.3837C8.92841 10.7287 8.64841 11.0087 8.30341 11.0087C7.95841 11.0087 7.67508 10.7287 7.67508 10.3837C7.67508 10.0387 7.95091 9.75865 8.29591 9.75865H8.30341ZM4.59774 9.75865C4.94274 9.75865 5.22274 10.0387 5.22274 10.3837C5.22274 10.7287 4.94274 11.0087 4.59774 11.0087C4.25274 11.0087 3.96858 10.7287 3.96858 10.3837C3.96858 10.0387 4.24524 9.75865 4.59024 9.75865H4.59774ZM11.0362 2.89982H5.55449L5.55474 3.70148C5.55474 4.04648 5.27474 4.32648 4.92974 4.32648C4.58474 4.32648 4.30474 4.04648 4.30474 3.70148L4.3043 2.91874C2.43744 3.07556 1.41699 4.2072 1.41699 6.1449V6.50398H15.167L15.167 6.1449C15.1703 5.11573 14.8937 4.31573 14.3445 3.76573C13.8624 3.28224 13.1577 2.99349 12.2873 2.91914L12.2866 3.70148C12.2866 4.04648 12.0066 4.32648 11.6616 4.32648C11.3166 4.32648 11.0366 4.04648 11.0366 3.70148L11.0362 2.89982Z"
                    fill="currentColor"
                  />
                </svg>
              </Button>

              {/* Date Picker Popover */}
              {isDatePickerOpen && (
                <div className="absolute right-0 z-10 mt-2 bg-white border shadow-lg rounded-lg p-4">
                  <DatePicker
                    selected={startDate}
                    onChange={handleDateChange}
                    startDate={startDate}
                    endDate={endDate}
                    selectsRange
                    inline
                  />
                  <div className="mt-4 flex justify-end space-x-2">
                    <Button variant="outline" color="normal" onClick={() => setIsDatePickerOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="default" color="normal" onClick={onApplyFilter}>
                      Apply Filter
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* <Button variant="ghost" className="text-black dark:text-white">
            <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M9.99984 11.334C10.4601 11.334 10.8332 10.9609 10.8332 10.5007C10.8332 10.0404 10.4601 9.66732 9.99984 9.66732C9.5396 9.66732 9.1665 10.0404 9.1665 10.5007C9.1665 10.9609 9.5396 11.334 9.99984 11.334Z"
                stroke="currentColor"
                stroke-width="1.66667"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M9.99984 5.50065C10.4601 5.50065 10.8332 5.12755 10.8332 4.66732C10.8332 4.20708 10.4601 3.83398 9.99984 3.83398C9.5396 3.83398 9.1665 4.20708 9.1665 4.66732C9.1665 5.12755 9.5396 5.50065 9.99984 5.50065Z"
                stroke="currentColor"
                stroke-width="1.66667"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M9.99984 17.1673C10.4601 17.1673 10.8332 16.7942 10.8332 16.334C10.8332 15.8737 10.4601 15.5007 9.99984 15.5007C9.5396 15.5007 9.1665 15.8737 9.1665 16.334C9.1665 16.7942 9.5396 17.1673 9.99984 17.1673Z"
                stroke="currentColor"
                stroke-width="1.66667"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </Button> */}
        </div>
      </div>

      <UseTableTanStackSSR columns={columns} data={filteredData} />

      {/* Pagination */}
      <TablePagination
        component="div"
        className="hidden" // Add a utility class to hide the element
        rowsPerPageOptions={[]} // Remove the "Rows per page" options
        count={data?.total_file || 0} // Total number of filtered rows
        page={currentPage} // Current page
        onPageChange={handlePageOnchange} // Handle page changes
        rowsPerPage={pageSize} // Number of rows per page
        onRowsPerPageChange={handleChangeRowsPerPage} // Handle rows per page change (not needed if rowsPerPageOptions is empty)
        sx={{
          display: 'none', // Hide the pagination completely
        }}
      />

      <div className="h-[88px] rounded-b-xl flex flex-row justify-between p-6">
        {/* Preview Button */}
        <Button 
          variant="outline" 
          onClick={() => setCurrentPage((prevPage) => Math.max(prevPage - 1, 0))}
          disabled={currentPage === 0} // Disable if already on the first page
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12.8332 6.99984H1.1665M1.1665 6.99984L6.99984 12.8332M1.1665 6.99984L6.99984 1.1665"
              stroke="currentColor"
              stroke-width="1.67"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          Preview
        </Button>

        {/* Pagination Numbers */}
        <div className="flex flex-row gap-0.5">
          {(() => {
            const totalPages = Math.ceil((data?.total_file || 0) / pageSize); // Total number of pages
            const maxVisiblePages = 3; // Number of pages to show on either side of the current page
            const pagination = []; // Array to store pagination elements

            // Helper function to add a page button
            const addPageButton = (pageIndex: number) => {
              pagination.push(
                <button
                  key={pageIndex}
                  className={`w-10 h-10 rounded-lg ${
                    pageIndex === currentPage ? "text-blue-normal bg-blue-light" : "text-black dark:text-white bg-transparent"
                  }`}
                  onClick={() => setCurrentPage(pageIndex)} // Set the current page when clicked
                >
                  {pageIndex + 1} {/* Display 1-based page numbers */}
                </button>
              );
            };

            // Add the first page (always visible)
            addPageButton(0);

            // Add "..." if the range of pages is far from the beginning
            if (currentPage > maxVisiblePages) {
              pagination.push(
                <span key="start-ellipsis" className="w-10 h-10 flex items-center justify-center">
                  ...
                </span>
              );
            }

            // Add pages around the current page
            const startPage = Math.max(1, currentPage - maxVisiblePages); // Start from the earlier page
            const endPage = Math.min(totalPages - 2, currentPage + maxVisiblePages); // End before the last page
            for (let i = startPage; i <= endPage; i++) {
              addPageButton(i); // Add the buttons for pages in the range
            }

            // Add "..." if the range of pages is far from the end
            if (currentPage < totalPages - maxVisiblePages - 1) {
              pagination.push(
                <span key="end-ellipsis" className="w-10 h-10 flex items-center justify-center">
                  ...
                </span>
              );
            }

            // Add the last page (always visible)
            if (totalPages > 1) {
              addPageButton(totalPages - 1);
            }

            return pagination; // Return the pagination elements
          })()}
        </div>

        {/* Next Button */}
        <Button
          variant="outline"
          onClick={() => setCurrentPage((prevPage) => Math.min(prevPage + 1, Math.ceil((data?.total_file || 0) / pageSize) - 1))}
          disabled={currentPage === Math.ceil((data?.total_file || 0) / pageSize) - 1} // Disable if already on the last page
        >
          Next
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M1.1665 6.99984H12.8332M12.8332 6.99984L6.99984 1.1665M12.8332 6.99984L6.99984 12.8332"
              stroke="currentColor"
              stroke-width="1.67"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </Button>
      </div>
      {/* Drawer */}
      <Drawer anchor="right" open={isOpenDrawer} onClose={handleDrawerClose}>
        <div className="flex items-center p-2 justify-center bg-[#7059F3] text-white">
          <button onClick={() => handleDrawerClose()}>
            <IconArrowRight className="absolute left-2 top-1 h-8 w-8 hover:cursor-pointer rounded-full p-1 bg-[#7059F3] text-white hover:opacity-80" />
          </button>
          <div className="text-base font-bold">Detail Analyse Candidate</div>
        </div>
        <div className="w-[500px] text-sm">
          {fetching ? (
            <div className="text-center">Loading ...</div>
          ) : (
            <>
              <div className="p-2">
                <div className="text-base font-semibold leading-7 text-gray-900">
                  Candidate Name
                </div>
                <p className="text-sm leading-6 text-gray-60">
                  {fileDetailQuery.data?.candidate_name
                    ? fileDetailQuery.data?.candidate_name
                    : "None"}
                </p>

                <div className="mt-2 text-base font-semibold leading-7 text-gray-900">
                  Candidate Email Address
                </div>
                <p className="text-sm leading-6 text-gray-60">
                  {fileDetailQuery.data?.email
                    ? fileDetailQuery.data?.email
                    : "None"}
                </p>

                <div className="mt-2 text-base font-semibold leading-7 text-gray-900">
                  Candidate Phone Number
                </div>
                <p className="text-sm leading-6 text-gray-60">
                  {fileDetailQuery.data?.phone_number
                    ? fileDetailQuery.data?.phone_number
                    : "None"}
                </p>

                <div className="mt-2 text-base font-semibold leading-7 text-gray-900">
                  Candidate Summary
                </div>
                <p className="text-sm leading-6 text-gray-60">
                  {fileDetailQuery.data?.comment
                    ? fileDetailQuery.data?.comment
                    : "None"}
                </p>

                <div className="text-base font-semibold leading-7 text-gray-900">
                  Recommended Jobs
                </div>
                <p className="text-sm leading-6 text-gray-60">
                  {fileDetailQuery.data?.job_recommended
                    ? fileDetailQuery.data?.job_recommended.join(", ")
                    : "None"}
                </p>

                <div className="mt-2 text-base font-semibold leading-7 text-gray-900">
                  Educations
                </div>
                <ul className="list-disc pl-6 text-sm leading-6 text-gray-600">
                  {(fileDetailQuery.data?.degree || []).length > 0 ? (
                    fileDetailQuery.data?.degree.map((edu, index) => (
                      <li key={index}>{edu}</li>
                    ))
                  ) : (
                    <li>None</li>
                  )}
                </ul>

                <div className="mt-2 text-base font-semibold leading-7 text-gray-900">
                  Experiences
                </div>
                <ul className="list-disc pl-6 text-sm leading-6 text-gray-600">
                  {(fileDetailQuery.data?.experience || []).length > 0 ? (
                    fileDetailQuery.data?.experience.map((edu, index) => (
                      <li key={index}>{edu}</li>
                    ))
                  ) : (
                    <li>None</li>
                  )}
                </ul>

                <div className="mt-2 text-base font-semibold leading-7 text-gray-900">
                  Responsibilities
                </div>
                <ul className="list-disc pl-6 text-sm leading-6 text-gray-600">
                  {(fileDetailQuery.data?.responsibility || []).length > 0 ? (
                    fileDetailQuery.data?.responsibility.map((edu, index) => (
                      <li key={index}>{edu}</li>
                    ))
                  ) : (
                    <li>None</li>
                  )}
                </ul>

                <div className="mt-2 text-base font-semibold leading-7 text-gray-900">
                  Technical Skills
                </div>
                <div className="px-2 max-w-[500px]">
                  {(fileDetailQuery.data?.technical_skill || []).length > 0 ? (
                    <div className="flex flex-wrap">
                      {fileDetailQuery.data?.technical_skill.map(
                        (edu, index) => (
                          <span
                            className="rounded-full bg-[#7059F3] text-white px-2 py-1 m-1"
                            key={index}
                          >
                            {edu.replace(/\s/g, "")}
                          </span>
                        )
                      )}
                    </div>
                  ) : (
                    <div>None</div>
                  )}
                </div>

                <div className="mt-2 text-base font-semibold leading-7 text-gray-900">
                  Soft Skills
                </div>
                <ul className="list-disc pl-6 text-sm leading-6 text-gray-600">
                  {(fileDetailQuery.data?.soft_skill || []).length > 0 ? (
                    fileDetailQuery.data?.soft_skill.map((edu, index) => (
                      <li key={index}>{edu}</li>
                    ))
                  ) : (
                    <li>None</li>
                  )}
                </ul>

                <div className="mt-2 text-base font-semibold leading-7 text-gray-900">
                  Certificates
                </div>
                <ul className="list-disc pl-6 text-sm leading-6 text-gray-600">
                  {(fileDetailQuery.data?.certificate || []).length > 0 ? (
                    fileDetailQuery.data?.certificate.map((edu, index) => (
                      <li key={index}>{edu}</li>
                    ))
                  ) : (
                    <li>None</li>
                  )}
                </ul>

                <div className="mt-2 text-base font-semibold leading-7 text-gray-900">
                  Candidate CV Name
                </div>
                <p className="text-sm leading-6 text-gray-60">
                  {fileDetailQuery.data?.cv_name
                    ? fileDetailQuery.data?.cv_name
                    : "None"}
                </p>

                <div className="mt-2 text-base font-semibold leading-7 text-gray-900">
                  Candidate Created Date
                </div>
                <p className="text-sm leading-6 text-gray-60">
                  {fileDetailQuery.data?.created_at
                    ? fileDetailQuery.data?.created_at
                    : "None"}
                </p>
              </div>
            </>
          )}
        </div>
      </Drawer>

      {/* Modal confirm delete */}
      <Transition appear show={isOpenModalDelete} as={React.Fragment}>
        <Dialog as="div" className="relative z-20" onClose={closeModal}>
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-4 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-center text-lg font-medium leading-6 text-gray-900"
                  >
                    Notification
                  </Dialog.Title>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">
                      Are you sure delete file <strong>{fileName}</strong> ?
                    </p>
                  </div>

                  <div className="mt-8 text-end">
                    <button
                      type="button"
                      className="mr-2 inline-flex justify-center rounded-md border border-transparent bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => handleDeleteFile()}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={closeModal}
                    >
                      No
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Output Modal */}
      <Transition appear show={isOutputModalOpen} as={React.Fragment}>
        <Dialog as="div" className="relative z-20" onClose={closeOutputModal}>
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 mb-4"
                  >
                    PDF Output
                  </Dialog.Title>
                  <div className="w-full h-[500px] border">
                    {/* PDF Preview */}
                    <PDFViewer className="w-full h-full">
                      <Document>
                        <Page size="A4" style={pdfStyles.page}>
                          <Image 
                            src="/pdf-maker.png" // Replace with the actual path or URL to your image
                            style={{
                              width: 140, // Adjust the width as needed
                              height: 100, // Adjust the height as needed
                              alignSelf: 'center'
                            }}
                          />
                          {/* Candidate Name */}
                          <Text style={pdfStyles.title}>
                            {fileDetailQuery.data?.candidate_name || "Candidate"}
                          </Text>

                          {/* Sections */}
                          <PDFSection
                            title="Candidate Email Address"
                            items={[fileDetailQuery.data?.email || " "]}
                          />
                          <PDFSection
                            title="Candidate Phone Number"
                            items={[fileDetailQuery.data?.phone_number || " "]}
                          />
                          <PDFSection
                            title="Candidate Summary"
                            items={[fileDetailQuery.data?.comment || " "]}
                          />
                          <PDFSection
                            title="Recommended Jobs"
                            items={fileDetailQuery.data?.job_recommended || []}
                          />
                          <PDFSection
                            title="Educations"
                            items={fileDetailQuery.data?.degree || []}
                          />
                          <PDFSection
                            title="Experiences"
                            items={fileDetailQuery.data?.experience || []}
                          />
                          <PDFSection
                            title="Responsibilities"
                            items={fileDetailQuery.data?.responsibility || []}
                          />
                          <PDFSection
                            title="Technical Skills"
                            items={fileDetailQuery.data?.technical_skill || []}
                          />
                          <PDFSection
                            title="Soft Skills"
                            items={fileDetailQuery.data?.soft_skill || []}
                          />
                          <PDFSection
                            title="Certificates"
                            items={fileDetailQuery.data?.certificate || []}
                          />
                          <PDFSection
                            title="Candidate CV Name"
                            items={[fileDetailQuery.data?.cv_name || " "]}
                          />

                          {/* Job Created Date */}
                          <Text style={pdfStyles.createdDate}>
                            Job Created Date:{" "}
                            {new Date(
                              fileDetailQuery.data?.created_at
                            ).toLocaleDateString()}
                          </Text>
                        </Page>
                      </Document>
                    </PDFViewer>
                  </div>

                  {/* Modal Footer Buttons */}
                  {/* <div className="flex justify-end gap-4 mt-6">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      onClick={handlePrintPDF}
                    >
                      <FaPrint />
                      Print
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-500 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                      onClick={handleDownloadPDF}
                    >
                      <FaDownload />
                      Download
                    </button>
                    <button
                      type="button"
                      className="inline-flex px-4 py-2 text-sm font-medium text-white bg-red-500 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                      onClick={closeOutputModal}
                    >
                      Close
                    </button>
                  </div> */}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default TableCandidates;