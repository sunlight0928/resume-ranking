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
import { PDFViewer, Document, Page, Text, View, StyleSheet,Image } from "@react-pdf/renderer";
import { FaDownload, FaPrint, FaSearch, FaCheckCircle, FaHourglassHalf } from "react-icons/fa";
import { jsPDF } from "jspdf";
import { Button } from "@/app/components/ui/Button";

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
    
        // Choose the appropriate icon
        const Icon = row.original.matching_status ? FaCheckCircle : FaHourglassHalf;
    
        return (
          <div
            className={`inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-semibold text-gray-100 ${statusClass}`}
          >
            {/* Add the icon */}
            <Icon className="text-sm" /> {/* Adjust size with `text-sm` */}
            {statusString}
          </div>
        );
      },
    }),
    columnHelper.display({
      header: "Action",
      cell: ({ row }: { row: Row<any> }) => {
        return (
          <div className="flex flex-row gap-3 justify-center">
            {/* <button
              className="p-2 mr-2 rounded-lg text-xs font-medium text-center text-white bg-green-500 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
              onClick={() => handleModifyFAQ(row.original._id)}
            >
              Update
            </button> */}
            <Button
              variant="ghost"
              size="icon"
              className="text-[#292D32] hover:text-[#292D32AA] dark:text-[#CDD1D6]"
              onClick={() => handleDetail(row.original.id, selectedJobId, row.original.candidate_name, row.original.candidate_phone, row.original.candidate_email)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.9999 16.3299C9.60992 16.3299 7.66992 14.3899 7.66992 11.9999C7.66992 9.60992 9.60992 7.66992 11.9999 7.66992C14.3899 7.66992 16.3299 9.60992 16.3299 11.9999C16.3299 14.3899 14.3899 16.3299 11.9999 16.3299ZM11.9999 9.16992C10.4399 9.16992 9.16992 10.4399 9.16992 11.9999C9.16992 13.5599 10.4399 14.8299 11.9999 14.8299C13.5599 14.8299 14.8299 13.5599 14.8299 11.9999C14.8299 10.4399 13.5599 9.16992 11.9999 9.16992Z" fill="currentColor"/>
                <path d="M12.0001 21.0205C8.24008 21.0205 4.69008 18.8205 2.25008 15.0005C1.19008 13.3505 1.19008 10.6605 2.25008 9.00047C4.70008 5.18047 8.25008 2.98047 12.0001 2.98047C15.7501 2.98047 19.3001 5.18047 21.7401 9.00047C22.8001 10.6505 22.8001 13.3405 21.7401 15.0005C19.3001 18.8205 15.7501 21.0205 12.0001 21.0205ZM12.0001 4.48047C8.77008 4.48047 5.68008 6.42047 3.52008 9.81047C2.77008 10.9805 2.77008 13.0205 3.52008 14.1905C5.68008 17.5805 8.77008 19.5205 12.0001 19.5205C15.2301 19.5205 18.3201 17.5805 20.4801 14.1905C21.2301 13.0205 21.2301 10.9805 20.4801 9.81047C18.3201 6.42047 15.2301 4.48047 12.0001 4.48047Z" fill="currentColor"/>
              </svg>

            </Button>
            <Button
              variant='secondary'
              size="lg"
              className="gap-2"
              onClick={() => handleOutput(row.original.id, selectedJobId, row.original.candidate_name, row.original.candidate_phone, row.original.candidate_email)}
            >
              Output 
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 11.834C5.93333 11.834 5.87333 11.8207 5.80667 11.794C5.62 11.7207 5.5 11.534 5.5 11.334V7.33398C5.5 7.06065 5.72667 6.83398 6 6.83398C6.27333 6.83398 6.5 7.06065 6.5 7.33398V10.1273L6.98 9.64732C7.17333 9.45398 7.49333 9.45398 7.68667 9.64732C7.88 9.84065 7.88 10.1607 7.68667 10.354L6.35333 11.6873C6.26 11.7807 6.12667 11.834 6 11.834Z" fill="currentColor"/>
                <path d="M6.00012 11.8336C5.87346 11.8336 5.74679 11.787 5.64679 11.687L4.31346 10.3536C4.12012 10.1603 4.12012 9.84029 4.31346 9.64695C4.50679 9.45362 4.82679 9.45362 5.02012 9.64695L6.35346 10.9803C6.54679 11.1736 6.54679 11.4936 6.35346 11.687C6.25346 11.787 6.12679 11.8336 6.00012 11.8336Z" fill="currentColor"/>
                <path d="M10.0002 15.1673H6.00016C2.38016 15.1673 0.833496 13.6207 0.833496 10.0007V6.00065C0.833496 2.38065 2.38016 0.833984 6.00016 0.833984H9.3335C9.60683 0.833984 9.8335 1.06065 9.8335 1.33398C9.8335 1.60732 9.60683 1.83398 9.3335 1.83398H6.00016C2.92683 1.83398 1.8335 2.92732 1.8335 6.00065V10.0007C1.8335 13.074 2.92683 14.1673 6.00016 14.1673H10.0002C13.0735 14.1673 14.1668 13.074 14.1668 10.0007V6.66732C14.1668 6.39398 14.3935 6.16732 14.6668 6.16732C14.9402 6.16732 15.1668 6.39398 15.1668 6.66732V10.0007C15.1668 13.6207 13.6202 15.1673 10.0002 15.1673Z" fill="currentColor"/>
                <path d="M14.6668 7.16633H12.0002C9.72016 7.16633 8.8335 6.27967 8.8335 3.99967V1.333C8.8335 1.133 8.9535 0.946334 9.14016 0.873C9.32683 0.793 9.54016 0.839667 9.68683 0.979667L15.0202 6.313C15.1602 6.453 15.2068 6.673 15.1268 6.85967C15.0468 7.04633 14.8668 7.16633 14.6668 7.16633ZM9.8335 2.53967V3.99967C9.8335 5.71967 10.2802 6.16633 12.0002 6.16633H13.4602L9.8335 2.53967Z" fill="currentColor"/>
              </svg>
            </Button>          
            {/* <FaRegFilePdf className="dark:text-white w-6 h-6 mr-2" /> */}
          </div>
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
            <Menu.Items className="absolute left-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
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

        <button
          type="button"
          className={`flex mb-4 px-3 py-2 text-sm font-medium text-center text-white rounded-lg focus:outline-none bg-[#7059F3] hover:bg-[#7059F3AA] ${
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
      </div>

      <br />
      {/* Table */}
      <UseTableTanStackSSR columns={columns} data={data.results} />

      {/* Pagination */}
      <TablePagination
        component="div"
        className="hidden" // Add a utility class to hide the element
        rowsPerPageOptions={[]} // Remove the "Rows per page" options
        count={data?.total_matching || 0} // Total number of filtered rows
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
            const totalPages = Math.ceil((data?.total_matching || 0) / pageSize); // Total number of pages
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
          onClick={() => setCurrentPage((prevPage) => Math.min(prevPage + 1, Math.ceil((data?.total_matching || 0) / pageSize) - 1))}
          disabled={currentPage === Math.ceil((data?.total_matching || 0) / pageSize) - 1} // Disable if already on the last page
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
        <div className="flex items-center p-2 justify-center bg-[#7059F3] text-white">
          <button onClick={() => handleDrawerClose()}>
            <IconArrowRight className="absolute left-2 top-1 h-8 w-8 hover:cursor-pointer rounded-full p-1 bg-[#7059F3] text-white hover:opacity-80" />
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
                            Candidate {detailCandidateName || "Candidate"}'s resume evaluation details for job posting "{candidateDetailQuery.data?.job_name || "Job"}"
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
