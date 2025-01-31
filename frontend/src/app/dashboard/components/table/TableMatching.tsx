"use client";
import React, { useState, useEffect } from "react";
import { IconArrowRight } from "@tabler/icons-react";
import { createColumnHelper, Row } from "@tanstack/react-table";
import { TablePagination, Drawer } from "@mui/material";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import UseTableTanStackSSR from "@/app/hooks/react-table/useTableTanStackSSR";
import { Menu, Dialog, Transition } from "@headlessui/react";
import {
  useMachingData,
  useFAQData,
  useMatchingPageData,
  useAllJobData,
  useDetailFAQData,
  useDeleteFAQData,
  useAddFAQData,
  useUpdateFAQData,
} from "@/app/hooks/react-query/logging/faq/useFAQData";
import { useMatchingDetailData } from "@/app/hooks/react-query/management/file/useFilesUploadData";

import { BsChevronDown } from "react-icons/bs";
import { MdLightbulbOutline, MdLightbulb } from "react-icons/md";
import { PDFViewer, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { FaDownload, FaPrint, FaSearch } from "react-icons/fa";
import { jsPDF } from "jspdf";

function classNames(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

type Props = {};

interface InputItem {
  documentname: string;
  page: number;
}

type FormModel = {
  job_name: string;
  job_description: string;
};

interface DataFormModel {
  _id?: number;
  job_name: string;
  job_description: string;
}

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

const TableFAQ = (props: Props) => {
  const [currentPage, setCurrentPage] = React.useState<number>(0);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [isOpenDrawer, setIsOpenDrawer] = React.useState<boolean>(false);
  const [isOpenModalDelete, setIsOpenModalDelete] =
    React.useState<boolean>(false);
  const [isOpenModalAdd, setIsOpenModalAdd] = React.useState<boolean>(false);
  const [isOpenModalUpdate, setIsOpenModalUpdate] =
    React.useState<boolean>(false);
  const [fetching, setIsFetching] = React.useState<boolean>(false);
  const [faqId, setFaqId] = React.useState<number>(-1);
  const [inputs, setInputs] = React.useState<InputItem[] | []>([]);
  const [CandidateId, setCandidateId] = React.useState<string>("id");
  const [selectedJobId, setSelectedJobId] = React.useState<string>("id");
  const [detailCandidateName, SetDetailCandidateName] = React.useState<string>("None");
  const [detailCandidatePhone, SetDetailCandidatePhone] = React.useState<string>("None");
  const [detailCandidateEmail, SetDetailCandidateEmail] = React.useState<string>("None");
  const candidateDetailQuery = useMatchingDetailData(
    CandidateId,
    selectedJobId
  );
  const [loadingMatching, setLoadingMatching] = React.useState<boolean>(false);
  const [isOutputModalOpen, setIsOutputModalOpen] = React.useState<boolean>(false);
  const [dataForm, setDataForm] = React.useState<DataFormModel>({
    job_name: "",
    job_description: "",
  });

  // const { data, isLoading, isError, isPreviousData, refetch } = useFAQData((currentPage + 1), pageSize);
  // const { data: detailFAQData, isLoading: isDetailFAQLoading, refetch: refetchDetailFAQData, isSuccess } = useDetailFAQData(faqId);
  const { data: detailAllJobData } = useAllJobData();

  const { mutate: deleteFAQ } = useDeleteFAQData(faqId);
  const { mutate: addFAQ } = useAddFAQData(dataForm);
  const { mutate: updateFAQ } = useUpdateFAQData(dataForm, faqId);

  // Define a state variable to store the selected job name
  const [selectedJobName, setSelectedJobName] =
    useState<string>("Position Name");
  const { mutate: processMatching } = useMachingData(selectedJobName);
  const { data, isLoading, isError, isPreviousData, refetch } =
    useMatchingPageData(selectedJobName, currentPage + 1, pageSize);

  // Handle item selection
  const handleMenuItemClick = async (jobId: string, jobName: string) => {
    await setSelectedJobId(jobId);
    await setSelectedJobName(jobName);

    // Call refetch to fetch data for the newly selected job
    refetch();
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormModel>({
    defaultValues: {},
  });

  const handlePageOnchange = (event: any, newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    setPageSize(event.target.value);
  };
  const handleDrawerClose = () => {
    setIsOpenDrawer(false);
  };

  const handleDetail = async (candidateId: string, jobId: string, candidateName: string, candidatePhone: string, email: string) => {
    if (selectedJobName != "Position Name")
    {
      await setCandidateId(candidateId);
      await setSelectedJobId(jobId);
      await SetDetailCandidateName(candidateName);
      await SetDetailCandidatePhone(candidatePhone);
      await SetDetailCandidateEmail(email);

      await candidateDetailQuery.refetch();

      if (candidateDetailQuery.isLoading) {
        setIsFetching(true);
      }
      setIsFetching(false);
      setIsOpenDrawer(true);
    }
  };

  // const columnHelper = createColumnHelper<FAQModel>();
  const columnHelper = createColumnHelper<JobMatchingModel>();
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
    columnHelper.display({
      header: "Candidate Name",
      cell: ({ row }: { row: Row<any> }) => {
        return <>{row.original.candidate_name}</>;
      },
    }),
    columnHelper.display({
      header: "Email Address",
      cell: ({ row }: { row: Row<any> }) => {
        return <>{row.original.candidate_email}</>;
      },
    }),
    columnHelper.accessor("comment", {
      header: "Phone Number",
      // cell: ({ row }: { row: Row<any> }) => {
      //   const [showFullContent, setShowFullContent] = React.useState(false);
      //   if (!row.original.summary_comment) {
      //     return null;
      //   }
      //   const content = showFullContent
      //     ? row.original.summary_comment
      //     : row.original.summary_comment.slice(0, 200);
      //   return (
      //     <>
      //       <div
      //         className="whitespace-pre-line text-left"
      //         id="answer"
      //         dangerouslySetInnerHTML={{ __html: content }}
      //       />
      //       {row.original.summary_comment.length > 200 && (
      //         <button
      //           className="text-blue-500 hover:underline focus:outline-none"
      //           onClick={() => setShowFullContent(!showFullContent)}
      //         >
      //           {showFullContent ? "Show less" : "Show more"}
      //         </button>
      //       )}
      //     </>
      //   );
      // },
      cell: ({ row }: { row: Row<any> }) => {
        return <>{row.original.candidate_phone}</>;
      },
    }),

    columnHelper.accessor("score", {
      header: "Matching Score",
      // cell: (props) => props.getValue(),

      cell: (props) => {
        const defaltscore = props.getValue();
        let textColor = "text-red-500"; // Default to red

        // Cast score to a number
        const score = Number(defaltscore);

        switch (true) {
          case score < 40:
            textColor = "text-red-500";
            break;
          case score >= 40 && score < 50:
            textColor = "text-orange-500";
            break;
          case score >= 50 && score < 60:
            textColor = "text-yellow-500";
            break;
          case score >= 60 && score < 70:
            textColor = "text-blue-500"; // You can choose a different color
            break;
          default:
            textColor = "text-green-500"; // Highest score is green
            break;
        }
        return (
          // <div className={`text-sm font-semibold ${textColor}`}>
          //   {score}%
          // </div>
          <div className={`text-sm font-semibold ${textColor}`}>
            {selectedJobName === "Position Name" ? null : `${score}%`}
          </div>
        );
      },
    }),
    columnHelper.display({
      header: "Status",
      cell: ({ row }: { row: Row<any> }) => {
        // Determine the CSS class based on the matching_status
        const statusClass = row.original.matching_status
          ? "bg-green-400"
          : "bg-red-400";
        // Convert matching_status to a string
        const statusString = row.original.matching_status
          ? "Matched"
          : "Pending";

        return (
          <div
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-gray-100 ${statusClass}`}
          >
            {statusString}
          </div>
        );
      },
    }),
    columnHelper.display({
      header: "Action",
      cell: ({ row }: { row: Row<any> }) => {
        return (
          <>
            {/* <button
              className="p-2 mr-2 rounded-lg text-xs font-medium text-center text-white bg-green-500 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
              onClick={() => handleModifyFAQ(row.original._id)}
            >
              Update
            </button> */}
            <button
              className="p-2 text-xs font-medium text-center text-white bg-blue-500 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              value={row.original.id}
              onClick={() => handleDetail(row.original.id, selectedJobId, row.original.candidate_name, row.original.candidate_phone, row.original.candidate_email)}
            >
              Detail
            </button>
            <button
              className="p-2 mx-2 rounded-lg text-xs font-medium text-center text-white bg-yellow-500 hover:bg-yellow-800 focus:ring-4 focus:outline-none focus:ring-yellow-300 dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:focus:ring-yellow-800"
              value={row.original.id}
              onClick={() => handleOutput(row.original.id, selectedJobId, row.original.candidate_name, row.original.candidate_phone, row.original.candidate_email)}
            >
              Output
            </button>            
            {/* <FaRegFilePdf className="dark:text-white w-6 h-6 mr-2" /> */}
          </>
        );
      },
    }),
  ];

  if (isLoading) {
    return (
      <div className="px-4 pt-6 mt-2">
        <div className="font-medium text-xl p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:text-white dark:border-gray-700 sm:p-6 dark:bg-gray-800">
          <h4 className="animate-pulse text-center text-blue-500">
            Loading ...
          </h4>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <h4 className="text-center text-red-500 font-medium text-xl">
        System Error Please Try Again Later !
      </h4>
    );
  }

  const handleMatchingCandidate = async () => {
    if (selectedJobName !== "Position Name") {
      setLoadingMatching(true);

      processMatching(
        {},
        {
          onError: (error: any) => {
            // console.log('Matching error:', error.response.status);
            setLoadingMatching(false);
            toast.error("Process Matching Candidate failed");
          },
          onSuccess: async () => {
            setLoadingMatching(false);
            setIsOpenModalAdd(false);
            setInputs([]);
            refetch();
            reset();
            toast.success("Process Matching Candidate success");
          },
        }
      );
    }
  };

  const confirmDeleteFAQ = () => {
    deleteFAQ(
      {},
      {
        onError: (error: any) => {
          console.log("Delete FAQ error:", error.response.status);
          setIsOpenModalDelete(false);
          toast.error("Delete FAQ Failed");
        },
        onSuccess: async () => {
          setIsOpenModalDelete(false);
          refetch();
          toast.success("Delete FAQ success");
        },
      }
    );
  };

  // if (isSuccess) {
  //   setValue2('job_name', detailFAQData.job_name)
  //   setValue2('job_description', detailFAQData.job_description)
  // }

  //Submit form add FAQ
  const confirmAddFAQ = async (data: FormModel): Promise<void> => {
    const params = {
      job_name: data.job_name,
      job_description: data.job_description,
    };

    if (
      Array.isArray(inputs) &&
      inputs.every((input) => input.documentname.trim().length > 0)
    ) {
      // params.documents = inputs.map((input) => ({
      //   page: input.page.toString(),
      //   document: input.documentname,
      // }));
      alert("oke");
    } else {
      alert("Document name is required.");
      return;
    }
    console.log(params);
    await setDataForm(params);

    addFAQ(
      {},
      {
        onError: (error: any) => {
          console.log("Matching error:", error.response.status);
          toast.error("Matching failed");
        },
        onSuccess: async () => {
          setIsOpenModalAdd(false);
          setInputs([]);
          refetch();
          reset();
          toast.success("Matching successfully");
        },
      }
    );
  };

  //Submit form update FAQ
  const confirmUpdateFAQ = async (data: FormModel) => {
    const params = {
      job_name: data.job_name,
      job_description: data.job_description,
    };

    await setDataForm(params);
    console.log(params);
    updateFAQ(
      {},
      {
        onError: (error: any) => {
          console.log("Update FAQ error:", error.response.status);
          toast.success("Update FAQ failed");
        },
        onSuccess: async () => {
          setIsOpenModalUpdate(false);
          setInputs([]);
          refetch();
          reset();
          toast.success("Update FAQ success");
        },
      }
    );
  };

  const handleDeleteFAQ = (faqId: number) => {
    setIsOpenModalDelete(true);
    setFaqId(faqId);
  };

  const closeModal = () => {
    setIsOpenModalDelete(false);
    setIsOpenModalAdd(false);
    setIsOpenModalUpdate(false);
    setInputs([]);
    reset();
  };

  const validateDocumentName = (documentname: string) => {
    return documentname.trim().length > 0;
  };

  const addInput = (): void => {
    setInputs([...inputs, { documentname: "", page: 0 }]);
  };

  const handleInputChange = (index: number, event: any) => {
    const { name, value } = event.target;
    const updatedInputs = [...inputs];
    updatedInputs[index] = { ...updatedInputs[index], [name]: value };
    setInputs(updatedInputs);
  };

  // Cast score to a number
  const score = Number(candidateDetailQuery.data?.score);
  let textColor = "text-red-500"; // Default to red
  switch (true) {
    case score < 40:
      textColor = "text-red-500";
      break;
    case score >= 40 && score < 50:
      textColor = "text-orange-500";
      break;
    case score >= 50 && score < 60:
      textColor = "text-yellow-500";
      break;
    case score >= 60 && score < 70:
      textColor = "text-blue-500"; // You can choose a different color
      break;
    default:
      textColor = "text-green-500"; // Highest score is green
      break;
  }

  const handleOutput = async (candidateId: string, jobId: string, candidateName: string, candidatePhone: string, email: string) => {
    if (selectedJobName != "Position Name")
      {
        await setCandidateId(candidateId);
        await setSelectedJobId(jobId);
        await SetDetailCandidateName(candidateName);
        await SetDetailCandidatePhone(candidatePhone);
        await SetDetailCandidateEmail(email);
  
        await candidateDetailQuery.refetch();
        if (candidateDetailQuery.isLoading) {
          setIsFetching(true);
        }
        setIsFetching(false);
        setIsOutputModalOpen(true);
      }
  };

  // Function to close the modal
  const closeOutputModal = () => {
    setIsOutputModalOpen(false);
  };

  // Function to handle PDF printing
  const handlePrintPDF = () => {
    if (!candidateDetailQuery.data) {
      toast.error("Resume evaluation details are not loaded yet.");
      return;
    }
  
    const doc = new jsPDF(); // Create a new jsPDF instance
  
    // Extract job details from `jobDetailQuery.data`
    const title = `Candidate ${detailCandidateName || "Candidate"}'s resume evaluation data for job posting '${candidateDetailQuery.data?.job_name || "Job"}'`;
    const candidateName = detailCandidateName || "Candidate";
    const candidatemail = detailCandidateEmail || " ";
    const candidatephone = detailCandidatePhone || " ";
    const jobName = candidateDetailQuery.data.job_name || "Job";
    const matchingScore = candidateDetailQuery.data.score || "0%";
    const summary = candidateDetailQuery.data.summary_comment || "None";
    const job_recommended = candidateDetailQuery.data.job_recommended || [];
    const educations = candidateDetailQuery.data.degree || [];
    const experiences = candidateDetailQuery.data.experience || [];
    const responsibilities = candidateDetailQuery.data.responsibility || [];
    const technicalSkills = candidateDetailQuery.data.technical_skill || [];
    const softSkills = candidateDetailQuery.data.soft_skill || [];
    const certificates = candidateDetailQuery.data.certificate || [];
  
    const pageWidth = doc.internal.pageSize.getWidth(); // Get the width of the page
    const pageHeight = doc.internal.pageSize.getHeight(); // Get the height of the page
  
    // Set job name title in blue, centered, and with a 30px gap from the top
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 255); // Set text color to blue (RGB)
    doc.text(title, pageWidth / 2, 30, { align: "center" }); // Center the text at 30px gap
  
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
  
    const educationStrings = [`Score: ${candidateDetailQuery.data.degree.score}`, `Comment: ${candidateDetailQuery.data.degree.comment}`];
    const experienceStrings = [`Score: ${candidateDetailQuery.data.degree.score}`, `Comment: ${candidateDetailQuery.data.degree.comment}`];
    const responsibilitieStrings = [`Score: ${candidateDetailQuery.data.degree.score}`, `Comment: ${candidateDetailQuery.data.degree.comment}`];
    const technicalSkillStrings = [`Score: ${candidateDetailQuery.data.degree.score}`, `Comment: ${candidateDetailQuery.data.degree.comment}`];
    const softSkillStrings = [`Score: ${candidateDetailQuery.data.degree.score}`, `Comment: ${candidateDetailQuery.data.degree.comment}`];
    const certificateStrings = [`Score: ${candidateDetailQuery.data.degree.score}`, `Comment: ${candidateDetailQuery.data.degree.comment}`];

    let yOffset = 40; // Start content below the candidate name
    yOffset = addSection("Candidate Name", [candidateName], yOffset);
    yOffset = addSection("Candidate Email", [candidatemail], yOffset);
    yOffset = addSection("Candidate Phone Number", [candidatephone], yOffset);
    yOffset = addSection("Job Name", [jobName], yOffset);
    yOffset = addSection("Matching Score", [matchingScore], yOffset);
    yOffset = addSection("Summary Analyse Candidate", [summary], yOffset);
    yOffset = addSection("Analyse Educations", educationStrings, yOffset);
    yOffset = addSection("Experiences", experienceStrings, yOffset);
    yOffset = addSection("Responsibilities", responsibilitieStrings, yOffset);
    yOffset = addSection("Technical Skills", technicalSkillStrings, yOffset);
    yOffset = addSection("Soft Skills", softSkillStrings, yOffset);
    yOffset = addSection("Certificates", certificateStrings, yOffset);
  
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
    // yOffset = addWrappedTextWithBullet(doc, createdAt, 15, yOffset, pageWidth - 30, 6);
  
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
    // if (!candidateDetailQuery.data) {
    //   toast.error("Candidate details are not loaded yet.");
    //   return;
    // }
  
    // const doc = new jsPDF(); // Create a new jsPDF instance
  
    // // Extract job details from `jobDetailQuery.data`
    // const candidateName = candidateDetailQuery.data.candidate_name || "Candidate";
    // const candidatemail = candidateDetailQuery.data.email || " ";
    // const candidatephone = candidateDetailQuery.data.phone_number || " ";
    // const summary = candidateDetailQuery.data.comment || " ";
    // const job_recommended = candidateDetailQuery.data.job_recommended || [];
    // const educations = candidateDetailQuery.data.degree || [];
    // const experiences = candidateDetailQuery.data.experience || [];
    // const responsibilities = candidateDetailQuery.data.responsibility || [];
    // const technicalSkills = candidateDetailQuery.data.technical_skill || [];
    // const softSkills = candidateDetailQuery.data.soft_skill || [];
    // const certificates = candidateDetailQuery.data.certificate || [];
    // const cv_name = candidateDetailQuery.data.cv_name || " ";
    // const createdAt = `Candidate Created Date: ${new Date(candidateDetailQuery.data.created_at).toLocaleDateString()}`;

    // const pageWidth = doc.internal.pageSize.getWidth(); // Get the width of the page
    // const pageHeight = doc.internal.pageSize.getHeight(); // Get the height of the page
  
    // // Set job name title in blue, centered, and with a 30px gap from the top
    // doc.setFont("helvetica", "bold");
    // doc.setFontSize(20);
    // doc.setTextColor(0, 0, 255); // Set text color to blue (RGB)
    // doc.text(candidateName, pageWidth / 2, 30, { align: "center" }); // Center the text at 30px gap
  
    // // Reset font styles for the rest of the content
    // doc.setFontSize(12);
    // doc.setFont("helvetica", "normal");
  
    // const bottomPadding = 10; // Padding at the bottom of the page
    // const usablePageHeight = pageHeight - bottomPadding; // Usable height for content

    // // Helper function to add text with proper line wrapping and page handling
    // const addWrappedTextWithBullet = (
    //   docInstance: any,
    //   text: string | string[],
    //   x: number,
    //   y: number,
    //   maxWidth: number,
    //   lineHeight: number
    // ): number => {
    //   const bullet = "• "; // Define the bullet point
    //   const lines = Array.isArray(text) ? text : docInstance.splitTextToSize(text, maxWidth - 10); // Adjust maxWidth for the bullet
    //   let currentY = y;
    //   lines.forEach((line: string, index: number) => {
    //     if (currentY + lineHeight > usablePageHeight) {
    //       docInstance.addPage(); // Add a new page when text exceeds the page height
    //       currentY = 20; // Reset `y` position on the new page
    //     }
    //     const prefix = index === 0 ? bullet : "   "; // Add bullet for the first line, and indent wrapped lines
    //     docInstance.text(prefix + line, x, currentY); // Add the bullet before the text
    //     currentY += lineHeight; // Increment `y` position for the next line
    //   });
    //   return currentY; // Return the updated `y` position
    // };

    // // Add sections with data
    // const addSection = (title: string, items: string[], yOffset: number): number => {
    //   if (items.length > 0) {
    //     // Check if there's enough space for the section title
    //     if (yOffset + 10 > usablePageHeight) { // 10 is for the title's height
    //       doc.addPage();
    //       yOffset = 20; // Reset yOffset on the new page
    //     }
    
    //     // Add section title in blue
    //     doc.setFont("helvetica", "bold");
    //     doc.setFontSize(14); // Slightly larger font for titles
    //     doc.setTextColor(0, 0, 255); // Set text color to blue
    //     doc.text(title, 10, yOffset + 4); // Add section title
    //     yOffset += 10; // Adjust yOffset for section content
    
    //     // Add the list items in normal font and black color
    //     doc.setFont("helvetica", "normal");
    //     doc.setFontSize(12);
    //     doc.setTextColor(0, 0, 0); // Reset text color to black
    //     items.forEach((item) => {
    //       yOffset = addWrappedTextWithBullet(doc, item, 15, yOffset, pageWidth - 30, 6); // Add wrapped text with bullet for each item
    //     });
    
    //     yOffset += 4; // Add extra space after the section
    //   }
    //   return yOffset;
    // };
  
    // let yOffset = 40; // Start content below the candidate name
    // yOffset = addSection("Candidate Email Address", [candidatemail], yOffset);
    // yOffset = addSection("Candidate Phone Number", [candidatephone], yOffset);
    // yOffset = addSection("Candidate Summary", [summary], yOffset);
    // yOffset = addSection("Recommended Jobs", job_recommended, yOffset);
    // yOffset = addSection("Educations", educations, yOffset);
    // yOffset = addSection("Experiences", experiences, yOffset);
    // yOffset = addSection("Responsibilities", responsibilities, yOffset);
    // yOffset = addSection("Technical Skills", technicalSkills, yOffset);
    // yOffset = addSection("Soft Skills", softSkills, yOffset);
    // yOffset = addSection("Certificates", certificates, yOffset);
    // yOffset = addSection("Candidate CV Name", [cv_name], yOffset);
  
    // doc.setFont("helvetica", "bold");
    // doc.setFontSize(14);
    // doc.setTextColor(0, 0, 255); // Blue color for the title
    // if (yOffset + 10 > usablePageHeight) { // Check if there's space for the title
    //   doc.addPage();
    //   yOffset = 20; // Reset yOffset on the new page
    // }
    // doc.text("Candidate Created Date", 10, yOffset + 4);
    // yOffset += 10; // Adjust yOffset for the content
    // doc.setFont("helvetica", "normal");
    // doc.setFontSize(12);
    // doc.setTextColor(0, 0, 0); // Black color for the content
    // yOffset = addWrappedTextWithBullet(doc, createdAt, 15, yOffset, pageWidth - 30, 6);
  
    // // Dynamically set the file name using the `jobName`
    // const fileName = `${candidateName}.pdf`;
    // doc.save(fileName);
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
      <div className="flex pr-20 justify-between">
        <button
          type="button"
          className={`flex mb-4 px-3 py-2 text-sm font-medium text-center text-white rounded-lg focus:outline-none ${
            loadingMatching
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          }`}
          onClick={() => handleMatchingCandidate()}
          disabled={loadingMatching}
        >
          {loadingMatching ? (
            <MdLightbulb style={{ fontSize: "18px" }} className="mr-2" />
          ) : (
            <MdLightbulbOutline style={{ fontSize: "18px" }} className="mr-2" />
          )}
          {loadingMatching ? "Matching..." : "Match"}
        </button>

        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
              {selectedJobName} {/* Display the selected job name */}
              <BsChevronDown
                className="-mr-1 h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </Menu.Button>
          </div>

          <Transition
            as={React.Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                {detailAllJobData?.map((item) => (
                  <Menu.Item key={item._id}>
                    {({ active }) => (
                      <a
                        href="#"
                        onClick={() =>
                          handleMenuItemClick(item._id, item.job_name)
                        } // Handle item click
                        className={classNames(
                          active
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-700",
                          "block px-4 py-2 text-sm"
                        )}
                      >
                        {item.job_name}
                      </a>
                    )}
                  </Menu.Item>
                ))}
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>

      <br />
      {/* Table */}
      <UseTableTanStackSSR columns={columns} data={data.results} />

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[10, 20, 30]}
        component="div"
        className="dark:text-white"
        count={data.total_matching}
        page={currentPage}
        onPageChange={handlePageOnchange}
        rowsPerPage={pageSize}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Modal delete */}
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
                      Are you sure you want to delete this job?
                    </p>
                  </div>

                  <div className="mt-8 text-end">
                    <button
                      type="button"
                      className="mr-2 inline-flex justify-center rounded-md border border-transparent bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => confirmDeleteFAQ()}
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

      {/* Modal Add FAQ */}
      <Transition appear show={isOpenModalAdd} as={React.Fragment}>
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
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-4 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-center text-lg font-medium leading-6 text-gray-900"
                  >
                    Create New Job
                  </Dialog.Title>
                  <form
                    className="w-full"
                    onSubmit={handleSubmit(confirmAddFAQ)}
                  >
                    <div className="grid gap-4 mb-4 sm:grid-cols-2 sm:gap-6 sm:mb-5 mt-8">
                      <div className="sm:col-span-2">
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                          Job Name
                        </label>
                        <input
                          type="text"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          {...register("job_name")}
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 mb-4 sm:grid-cols-2 sm:gap-6 sm:mb-5">
                      <div className="sm:col-span-2">
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                          Job Description
                        </label>
                        <input
                          type="text"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          {...register("job_description")}
                        />
                      </div>
                    </div>

                    <div className="mt-8 text-end">
                      <button
                        type="submit"
                        className="mr-2 inline-flex justify-center rounded-md border border-transparent bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
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
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Drawer */}
      <Drawer anchor="right" open={isOpenDrawer} onClose={handleDrawerClose}>
        <div className="flex items-center p-2 justify-center bg-blue-700 text-white">
          <button onClick={() => handleDrawerClose()}>
            <IconArrowRight className="absolute left-2 top-1 h-8 w-8 hover:cursor-pointer rounded-full p-1 bg-blue-500 text-white hover:opacity-80" />
          </button>
          <div className="text-base font-bold">
            Detail Analyse Matching Candidate
          </div>
          {/* <FaRegFilePdf className="dark:text-red w-6 h-6 mr-2" /> */}
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
                  {detailCandidateName
                    ? detailCandidateName
                    : "None"}
                </p>
              </div>

              {/* <div className="p-2">
                <div className="text-base font-semibold leading-7 text-gray-900">
                  Candidate Phone Number
                </div>
                <p className="text-sm leading-6 text-gray-60">
                  {detailCandidatePhone
                    ? detailCandidatePhone
                    : "None"}
                </p>
              </div> */}

              <div className="p-2">
                <div className="text-base font-semibold leading-7 text-gray-900">
                  Candidate Email
                </div>
                <p className="text-sm leading-6 text-gray-60">
                  {detailCandidateEmail
                    ? detailCandidateEmail
                    : "None"}
                </p>
              </div>

              <div className="p-2">
                <div className="text-base font-semibold leading-7 text-gray-900">
                  Candidate Phone Number
                </div>
                <p className="text-sm leading-6 text-gray-60">
                  {detailCandidatePhone
                    ? detailCandidatePhone
                    : "None"}
                </p>
              </div>

              <div className="p-2">
                <div className="text-base font-semibold leading-7 text-gray-900">
                  Job Name
                </div>
                <p className="text-sm leading-6 text-gray-60">
                  {candidateDetailQuery.data?.job_name
                    ? candidateDetailQuery.data?.job_name
                    : "None"}
                </p>
              </div>

              <div className="p-2">
                <div className="text-base font-semibold leading-7 text-gray-900">
                  Matching Score
                </div>
                <p className={`text-sm font-semibold leading-6 ${textColor}`}>
                  {candidateDetailQuery.data?.score
                    ? candidateDetailQuery.data?.score
                    : "0"}
                  %
                </p>
              </div>

              <div className="p-2">
                <div className="text-base font-semibold leading-7 text-gray-900">
                  Summary Analyse Candidate
                </div>
                <p className="text-sm leading-6 text-gray-60">
                  {candidateDetailQuery.data?.summary_comment
                    ? candidateDetailQuery.data?.summary_comment
                    : "None"}
                </p>
              </div>

              {/* <div className="p-2">
                <div className="text-base font-semibold leading-7 text-gray-900">
                  Recommended Jobs
                </div>
                <p className="text-sm leading-6 text-gray-60">
                  {candidateDetailQuery.data?.job_recommended
                    ? candidateDetailQuery.data?.job_recommended
                    : "None"}
                </p>
              </div> */}

              <div className="p-2">
                <div className="text-base font-semibold leading-7 text-gray-900">
                  Analyse Educations
                </div>
                <p className="px-2 text-sm leading-6 text-gray-60">
                  Comment:{" "}
                  {candidateDetailQuery.data?.degree.comment
                    ? candidateDetailQuery.data?.degree.comment
                    : "None"}
                </p>
                <p className="px-2 text-sm leading-6 text-gray-60">
                  Score:{" "}
                  {candidateDetailQuery.data?.degree.score
                    ? candidateDetailQuery.data?.degree.score
                    : "0"}
                </p>
              </div>

              <div className="p-2">
                <div className="text-base font-semibold leading-7 text-gray-900">
                  Experiences
                </div>
                <p className="px-2 text-sm leading-6 text-gray-60">
                  Comment:{" "}
                  {candidateDetailQuery.data?.experience.comment
                    ? candidateDetailQuery.data?.experience.comment
                    : "None"}
                </p>
                <p className="px-2 text-sm leading-6 text-gray-60">
                  Score:{" "}
                  {candidateDetailQuery.data?.experience.score
                    ? candidateDetailQuery.data?.experience.score
                    : "0"}
                </p>
              </div>

              <div className="p-2">
                <div className="text-base font-semibold leading-7 text-gray-900">
                  Responsibilities
                </div>
                <p className="px-2 text-sm leading-6 text-gray-60">
                  Comment:{" "}
                  {candidateDetailQuery.data?.responsibility.comment
                    ? candidateDetailQuery.data?.responsibility.comment
                    : "None"}
                </p>
                <p className="px-2 text-sm leading-6 text-gray-60">
                  Score:{" "}
                  {candidateDetailQuery.data?.responsibility.score
                    ? candidateDetailQuery.data?.responsibility.score
                    : "0"}
                </p>
              </div>

              <div className="p-2">
                <div className="text-base font-semibold leading-7 text-gray-900">
                  Technical Skills
                </div>
                <p className="px-2 text-sm leading-6 text-gray-60">
                  Comment:{" "}
                  {candidateDetailQuery.data?.technical_skill.comment
                    ? candidateDetailQuery.data?.technical_skill.comment
                    : "None"}
                </p>
                <p className="px-2 text-sm leading-6 text-gray-60">
                  Score:{" "}
                  {candidateDetailQuery.data?.technical_skill.score
                    ? candidateDetailQuery.data?.technical_skill.score
                    : "0"}
                </p>
              </div>

              <div className="p-2">
                <div className="text-base font-semibold leading-7 text-gray-900">
                  Soft Skills
                </div>
                <p className="px-2 text-sm leading-6 text-gray-60">
                  Comment:{" "}
                  {candidateDetailQuery.data?.soft_skill.comment
                    ? candidateDetailQuery.data?.soft_skill.comment
                    : "None"}
                </p>
                <p className="px-2 text-sm leading-6 text-gray-60">
                  Score:{" "}
                  {candidateDetailQuery.data?.soft_skill.score
                    ? candidateDetailQuery.data?.soft_skill.score
                    : "0"}
                </p>
              </div>

              <div className="p-2">
                <div className="text-base font-semibold leading-7 text-gray-900">
                  Certificates
                </div>
                <p className="px-2 text-sm leading-6 text-gray-60">
                  Comment:{" "}
                  {candidateDetailQuery.data?.certificate.comment
                    ? candidateDetailQuery.data?.certificate.comment
                    : "None"}
                </p>
                <p className="px-2 text-sm leading-6 text-gray-60">
                  Score:{" "}
                  {candidateDetailQuery.data?.certificate.score
                    ? candidateDetailQuery.data?.certificate.score
                    : "0"}
                </p>
              </div>
            </>
          )}
        </div>
      </Drawer>

      {/* Modal Update FAQ */}
      <Transition appear show={isOpenModalUpdate} as={React.Fragment}>
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
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-4 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-center text-lg font-medium leading-6 text-gray-900"
                  >
                    Update Job
                  </Dialog.Title>
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
                            Candidate {detailCandidateName || "Candidate"}'s resume evaluation data for job posting "{candidateDetailQuery.data?.job_name || "Job"}"
                          </Text>

                          {/* Sections */}
                          <PDFSection
                            title="Candidate Name"
                            items={[detailCandidateName
                              ? detailCandidateName
                              : "None"]}
                          />
                          <PDFSection
                            title="Candidate Email"
                            items={[detailCandidateEmail
                              ? detailCandidateEmail
                              : "None"]}
                          />
                          <PDFSection
                            title="Candidate Phone Number"
                            items={[detailCandidatePhone
                              ? detailCandidatePhone
                              : "None"]}
                          />
                          <PDFSection
                            title="Job Name"
                            items={[candidateDetailQuery.data?.job_name || "None"]}
                          />
                          <PDFSection
                            title="Matching Score"
                            items={[
                              candidateDetailQuery.data?.score !== undefined 
                                ? `${candidateDetailQuery.data.score}%` 
                                : "0"
                            ]}
                          />
                          <PDFSection
                            title="Summary Analyse Candidate"
                            items={[candidateDetailQuery.data?.summary_comment || "None"]}
                          />
                          <PDFSection
                            title="Analyse Educations"
                            items={[
                              `Comment: ${candidateDetailQuery.data?.degree?.comment || "None"}`,
                              `Score: ${candidateDetailQuery.data?.degree?.score || "0"}`
                            ]}
                          />
                          <PDFSection
                            title="Experiences"
                            items={[
                              `Comment: ${candidateDetailQuery.data?.experience?.comment || "None"}`,
                              `Score: ${candidateDetailQuery.data?.experience?.score || "0"}`
                            ]}
                          />
                          <PDFSection
                            title="Responsibilities"
                            items={[
                              `Comment: ${candidateDetailQuery.data?.responsibility?.comment || "None"}`,
                              `Score: ${candidateDetailQuery.data?.responsibility?.score || "0"}`
                            ]}
                          />
                          <PDFSection
                            title="Technical Skills"
                            items={[
                              `Comment: ${candidateDetailQuery.data?.technical_skill?.comment || "None"}`,
                              `Score: ${candidateDetailQuery.data?.technical_skill?.score || "0"}`
                            ]}
                          />
                          <PDFSection
                            title="Soft Skills"
                            items={[
                              `Comment: ${candidateDetailQuery.data?.soft_skill?.comment || "None"}`,
                              `Score: ${candidateDetailQuery.data?.soft_skill?.score || "0"}`
                            ]}
                          />
                          <PDFSection
                            title="Certificates"
                            items={[
                              `Comment: ${candidateDetailQuery.data?.certificate?.comment || "None"}`,
                              `Score: ${candidateDetailQuery.data?.certificate?.score || "0"}`
                            ]}
                          />
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
                      // onClick={handleDownloadPDF}
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

export default TableFAQ;
