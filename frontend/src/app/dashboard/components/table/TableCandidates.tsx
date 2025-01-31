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
import { PDFViewer, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { FaDownload, FaPrint, FaSearch } from "react-icons/fa";
import { jsPDF } from "jspdf";

type Props = {
  data: CandidateResponseModel;
  refetch: () => void;
};

const pdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    color: "#0000FF", // Blue color for the title
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 14,
    color: "#0000FF", // Blue color for section titles
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
      cell: (props) => props.getValue(),
    }),
    columnHelper.accessor("created_at", {
      header: "Candidate Created Date",
      cell: (props) => {
        return <div className="truncate">{props.getValue()}</div>;
      },
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
          <>
            <button
              className="p-2 text-xs font-medium text-center text-white bg-blue-500 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              value={row.original._id}
              onClick={handleDetail}
            >
              Detail
            </button>
            <button
              className="p-2 mx-2 rounded-lg text-xs font-medium text-center text-white bg-yellow-500 hover:bg-yellow-800 focus:ring-4 focus:outline-none focus:ring-yellow-300 dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:focus:ring-yellow-800"
              onClick={() => handleOutput(row.original._id)}
            >
              Output
            </button>
            <button
              className="p-2 text-xs font-medium text-center text-white bg-red-500 rounded-lg hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
              value={row.original._id}
              onClick={() =>
                showModalDelete(row.original._id, row.original.cv_name)
              }
            >
              Delete
            </button>
          </>
        );
      },
    }),
  ];

  // Filtered data based on search
  const filteredData = useMemo(() => {
    if (!data?.results) return [];
    if (!isSearchMode || searchTerm.trim() === "") {
      // If not in search mode, return all data
      return data.results;
    }
    return data.results.filter((candidate) =>
      candidate.candidate_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm, isSearchMode]);

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

  const handleDetail = async (event: any) => {
    await setFileId(event.target.value);
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

      {/* Title and Search Box */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold dark:text-white">
          List candidates uploaded
        </h1>
        <form className="flex items-center" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search"
            className="px-4 py-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-600 h-8 w-[300px] bg-gray-50 text-gray-900 border border-gray-300 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:border-gray-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} // Update search term state
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-blue-600"
          >
            <FaSearch />
          </button>
        </form>
      </div>

      <UseTableTanStackSSR columns={columns} data={filteredData} />

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[10, 20, 30]}
        component="div"
        className="dark:text-white"
        count={filteredData.length}
        page={currentPage}
        onPageChange={handlePageOnchange}
        rowsPerPage={pageSize}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Drawer */}
      <Drawer anchor="right" open={isOpenDrawer} onClose={handleDrawerClose}>
        <div className="flex items-center p-2 justify-center bg-blue-700 text-white">
          <button onClick={() => handleDrawerClose()}>
            <IconArrowRight className="absolute left-2 top-1 h-8 w-8 hover:cursor-pointer rounded-full p-1 bg-blue-500 text-white hover:opacity-80" />
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
                            className="rounded-full bg-blue-500 text-white px-2 py-1 m-1"
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