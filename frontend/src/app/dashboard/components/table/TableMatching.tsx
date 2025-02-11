"use client";
import dynamic from "next/dynamic";
import React, { useState, useEffect, useMemo } from "react";
import { IconArrowRight } from "@tabler/icons-react";
import { createColumnHelper, Row } from "@tanstack/react-table";
import { TablePagination, Drawer } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
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
import {
  useMatchingDetailData,
  updateMatchingDetailData,
} from "@/app/hooks/react-query/management/file/useFilesUploadData";

import { BsChevronDown } from "react-icons/bs";
import { MdLightbulbOutline, MdLightbulb } from "react-icons/md";
import {
  PDFViewer,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { FaCheckCircle, FaHourglassHalf } from "react-icons/fa";
import { jsPDF } from "jspdf";
import { Button } from "@/app/components/ui/Button";

// Dynamically import ReactQuill (client-side only)
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

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

type UpdateModel = {
  summary_comment: string;
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
    fontWeight: "bold",
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
    <Text style={pdfStyles.sectionTitle}>{title}</Text>
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
  const [detailCandidateName, SetDetailCandidateName] =
    React.useState<string>("None");
  const [detailCandidatePhone, SetDetailCandidatePhone] =
    React.useState<string>("None");
  const [detailCandidateEmail, SetDetailCandidateEmail] =
    React.useState<string>("None");
  const candidateDetailQuery = useMatchingDetailData(
    CandidateId,
    selectedJobId
  );
  const [loadingMatching, setLoadingMatching] = React.useState<boolean>(false);
  const [isOutputModalOpen, setIsOutputModalOpen] =
    React.useState<boolean>(false);
  const [dataForm, setDataForm] = React.useState<DataFormModel>({
    job_name: "",
    job_description: "",
  });
  const [UpdateForm, setUpdateForm] = React.useState<UpdateModel>({
    summary_comment: "",
  });
  const ReactQuill = useMemo(
    () => dynamic(() => import("react-quill"), { ssr: false }),
    []
  );
  const { data: detailAllJobData } = useAllJobData();

  const { mutate: deleteFAQ } = useDeleteFAQData(faqId);
  const { mutate: addFAQ } = useAddFAQData(dataForm);
  const { mutate: updateFAQ } = updateMatchingDetailData();

  updateFAQ({
    formData: UpdateForm,
    candidateId: CandidateId,
    jobId: selectedJobId,
  });

  const [loading, setLoading] = React.useState<boolean>(false);
  // Define a state variable to store the selected job name
  const [selectedJobName, setSelectedJobName] =
    useState<string>("Position Name");
  const { mutate: processMatching } = useMachingData(selectedJobName);
  const { data, isLoading, isError, isPreviousData, refetch } =
    useMatchingPageData(selectedJobName, currentPage + 1, pageSize);
  const [isEditingSummary, setIsEditingSummary] = React.useState(false); // To toggle edit mode
  const [editedSummary, setEditedSummary] = React.useState("");
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
    setIsEditingSummary(false);
  };

  const closeOutputModal = () => {
    setIsOutputModalOpen(false);
  };

  const handleDetail = async (
    candidateId: string,
    jobId: string,
    candidateName: string,
    candidatePhone: string,
    email: string
  ) => {
    if (selectedJobName != "Position Name") {
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

  const handleUpdate = async (candidateId: string, jobId: string) => {
    if (selectedJobName != "Position Name") {
      await setCandidateId(candidateId);
      await setSelectedJobId(jobId);

      await candidateDetailQuery.refetch();

      if (candidateDetailQuery.isLoading) {
        setIsFetching(true);
      }
      setIsFetching(false);
      setIsOpenModalUpdate(true);
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
        const Icon = row.original.matching_status
          ? FaCheckCircle
          : FaHourglassHalf;

        return (
          <div
            className={`inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-semibold text-gray-100 ${statusClass}`}
          >
            <Icon className="text-sm" />
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
            <Button
              variant="ghost"
              size="icon"
              className="text-[#292D32] hover:text-[#292D32AA] dark:text-[#CDD1D6]"
              onClick={() =>
                handleDetail(
                  row.original.id,
                  selectedJobId,
                  row.original.candidate_name,
                  row.original.candidate_phone,
                  row.original.candidate_email
                )
              }
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.9999 16.3299C9.60992 16.3299 7.66992 14.3899 7.66992 11.9999C7.66992 9.60992 9.60992 7.66992 11.9999 7.66992C14.3899 7.66992 16.3299 9.60992 16.3299 11.9999C16.3299 14.3899 14.3899 16.3299 11.9999 16.3299ZM11.9999 9.16992C10.4399 9.16992 9.16992 10.4399 9.16992 11.9999C9.16992 13.5599 10.4399 14.8299 11.9999 14.8299C13.5599 14.8299 14.8299 13.5599 14.8299 11.9999C14.8299 10.4399 13.5599 9.16992 11.9999 9.16992Z"
                  fill="currentColor"
                />
                <path
                  d="M12.0001 21.0205C8.24008 21.0205 4.69008 18.8205 2.25008 15.0005C1.19008 13.3505 1.19008 10.6605 2.25008 9.00047C4.70008 5.18047 8.25008 2.98047 12.0001 2.98047C15.7501 2.98047 19.3001 5.18047 21.7401 9.00047C22.8001 10.6505 22.8001 13.3405 21.7401 15.0005C19.3001 18.8205 15.7501 21.0205 12.0001 21.0205ZM12.0001 4.48047C8.77008 4.48047 5.68008 6.42047 3.52008 9.81047C2.77008 10.9805 2.77008 13.0205 3.52008 14.1905C5.68008 17.5805 8.77008 19.5205 12.0001 19.5205C15.2301 19.5205 18.3201 17.5805 20.4801 14.1905C21.2301 13.0205 21.2301 10.9805 20.4801 9.81047C18.3201 6.42047 15.2301 4.48047 12.0001 4.48047Z"
                  fill="currentColor"
                />
              </svg>
            </Button>
            {/* <Button
              variant="ghost"
              size="icon"
              className="text-[#7059F3] hover:text-[#7059F3AA]"
              onClick={() => handleUpdate(row.original.id, selectedJobId)}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5.53999 19.5196C4.92999 19.5196 4.35999 19.3096 3.94999 18.9196C3.42999 18.4296 3.17999 17.6896 3.26999 16.8896L3.63999 13.6496C3.70999 13.0396 4.07999 12.2296 4.50999 11.7896L12.72 3.09956C14.77 0.929561 16.91 0.869561 19.08 2.91956C21.25 4.96956 21.31 7.10956 19.26 9.27956L11.05 17.9696C10.63 18.4196 9.84999 18.8396 9.23999 18.9396L6.01999 19.4896C5.84999 19.4996 5.69999 19.5196 5.53999 19.5196ZM15.93 2.90956C15.16 2.90956 14.49 3.38956 13.81 4.10956L5.59999 12.8096C5.39999 13.0196 5.16999 13.5196 5.12999 13.8096L4.75999 17.0496C4.71999 17.3796 4.79999 17.6496 4.97999 17.8196C5.15999 17.9896 5.42999 18.0496 5.75999 17.9996L8.97999 17.4496C9.26999 17.3996 9.74999 17.1396 9.94999 16.9296L18.16 8.23956C19.4 6.91956 19.85 5.69956 18.04 3.99956C17.24 3.22956 16.55 2.90956 15.93 2.90956Z"
                  fill="currentColor"
                />
                <path
                  d="M17.3404 10.9508C17.3204 10.9508 17.2904 10.9508 17.2704 10.9508C14.1504 10.6408 11.6404 8.27083 11.1604 5.17083C11.1004 4.76083 11.3804 4.38083 11.7904 4.31083C12.2004 4.25083 12.5804 4.53083 12.6504 4.94083C13.0304 7.36083 14.9904 9.22083 17.4304 9.46083C17.8404 9.50083 18.1404 9.87083 18.1004 10.2808C18.0504 10.6608 17.7204 10.9508 17.3404 10.9508Z"
                  fill="currentColor"
                />
                <path
                  d="M21 22.75H3C2.59 22.75 2.25 22.41 2.25 22C2.25 21.59 2.59 21.25 3 21.25H21C21.41 21.25 21.75 21.59 21.75 22C21.75 22.41 21.41 22.75 21 22.75Z"
                  fill="currentColor"
                />
              </svg>
            </Button> */}
            <Button
              variant="secondary"
              size="lg"
              className="gap-2"
              onClick={() =>
                handleOutput(
                  row.original.id,
                  selectedJobId,
                  row.original.candidate_name,
                  row.original.candidate_phone,
                  row.original.candidate_email
                )
              }
            >
              Output
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 11.834C5.93333 11.834 5.87333 11.8207 5.80667 11.794C5.62 11.7207 5.5 11.534 5.5 11.334V7.33398C5.5 7.06065 5.72667 6.83398 6 6.83398C6.27333 6.83398 6.5 7.06065 6.5 7.33398V10.1273L6.98 9.64732C7.17333 9.45398 7.49333 9.45398 7.68667 9.64732C7.88 9.84065 7.88 10.1607 7.68667 10.354L6.35333 11.6873C6.26 11.7807 6.12667 11.834 6 11.834Z"
                  fill="currentColor"
                />
                <path
                  d="M6.00012 11.8336C5.87346 11.8336 5.74679 11.787 5.64679 11.687L4.31346 10.3536C4.12012 10.1603 4.12012 9.84029 4.31346 9.64695C4.50679 9.45362 4.82679 9.45362 5.02012 9.64695L6.35346 10.9803C6.54679 11.1736 6.54679 11.4936 6.35346 11.687C6.25346 11.787 6.12679 11.8336 6.00012 11.8336Z"
                  fill="currentColor"
                />
                <path
                  d="M10.0002 15.1673H6.00016C2.38016 15.1673 0.833496 13.6207 0.833496 10.0007V6.00065C0.833496 2.38065 2.38016 0.833984 6.00016 0.833984H9.3335C9.60683 0.833984 9.8335 1.06065 9.8335 1.33398C9.8335 1.60732 9.60683 1.83398 9.3335 1.83398H6.00016C2.92683 1.83398 1.8335 2.92732 1.8335 6.00065V10.0007C1.8335 13.074 2.92683 14.1673 6.00016 14.1673H10.0002C13.0735 14.1673 14.1668 13.074 14.1668 10.0007V6.66732C14.1668 6.39398 14.3935 6.16732 14.6668 6.16732C14.9402 6.16732 15.1668 6.39398 15.1668 6.66732V10.0007C15.1668 13.6207 13.6202 15.1673 10.0002 15.1673Z"
                  fill="currentColor"
                />
                <path
                  d="M14.6668 7.16633H12.0002C9.72016 7.16633 8.8335 6.27967 8.8335 3.99967V1.333C8.8335 1.133 8.9535 0.946334 9.14016 0.873C9.32683 0.793 9.54016 0.839667 9.68683 0.979667L15.0202 6.313C15.1602 6.453 15.2068 6.673 15.1268 6.85967C15.0468 7.04633 14.8668 7.16633 14.6668 7.16633ZM9.8335 2.53967V3.99967C9.8335 5.71967 10.2802 6.16633 12.0002 6.16633H13.4602L9.8335 2.53967Z"
                  fill="currentColor"
                />
              </svg>
            </Button>
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

  const handleOutput = async (
    candidateId: string,
    jobId: string,
    candidateName: string,
    candidatePhone: string,
    email: string
  ) => {
    if (selectedJobName != "Position Name") {
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

  //Submit form update FAQ
  const confirmUpdateFAQ = async () => {
    setLoading(true);
    const params = {
      summary_comment: editedSummary,
    };

    await setUpdateForm(params);
    console.log(params);
    updateFAQ(
      {
        formData: params,
        candidateId: CandidateId,
        jobId: selectedJobId,
      },
      {
        onError: (error: any) => {
          setLoading(false);
          console.log(
            "Update FAQ error:",
            error.response?.status || error.message
          );
          toast.success("Update FAQ failed");
        },
        onSuccess: async () => {
          setLoading(false);
          setIsOpenModalUpdate(false);
          setInputs([]);
          refetch();
          reset();
          toast.success("Update FAQ success");
        },
      }
    );
  };

  const handleSaveSummary = () => {
    confirmUpdateFAQ();
    setIsEditingSummary(false); // Exit edit mode
  };

  const handleCancelEdit = () => {
    setIsEditingSummary(false); // Exit edit mode without saving
    setEditedSummary(""); // Reset the edited summary
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
        <Menu
          as="div"
          className="relative inline-block text-left text-[#7059F3]"
        >
          <div>
            <Menu.Button className="inline-flex w-full justify-center gap-x-3.5 rounded-[10px] bg-white px-3 py-2 text-md font-semibold  text-[#7059F3] shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-[#202938]">
              {selectedJobName}
              <BsChevronDown className="-mr-1 h-6 w-15" aria-hidden="true" />
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
          className={`flex px-3 py-2 text-md font-medium text-center text-white rounded-lg focus:outline-none bg-[#7059F3] hover:bg-[#7059F3AA] ${
            loadingMatching
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-[#7059F3] hover:bg-[#7059F3AA] focus:ring-4 focus:ring-blue-300 dark:bg-[#7059F3] dark:hover:bg-[#7059F3AA] dark:focus:ring-blue-800"
          }`}
          onClick={() => handleMatchingCandidate()}
          disabled={loadingMatching}
        >
          {loadingMatching ? (
            <MdLightbulb style={{ fontSize: "30px" }} className="mr-2" />
          ) : (
            <MdLightbulbOutline style={{ fontSize: "30px" }} className="mr-2" />
          )}
          {loadingMatching ? "Matching..." : "Match"}
        </button>
      </div>

      <br />
      <UseTableTanStackSSR columns={columns} data={data.results} />

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
          display: "none", // Hide the pagination completely
        }}
      />

      <div className="h-[88px] rounded-b-xl flex flex-row justify-between p-6">
        <Button
          variant="outline"
          onClick={() =>
            setCurrentPage((prevPage) => Math.max(prevPage - 1, 0))
          }
          disabled={currentPage === 0} // Disable if already on the first page
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
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

        <div className="flex flex-row gap-0.5">
          {(() => {
            const totalPages = Math.ceil(
              (data?.total_matching || 0) / pageSize
            ); // Total number of pages
            const maxVisiblePages = 3; // Number of pages to show on either side of the current page
            const pagination = []; // Array to store pagination elements

            // Helper function to add a page button
            const addPageButton = (pageIndex: number) => {
              pagination.push(
                <button
                  key={pageIndex}
                  className={`w-10 h-10 rounded-lg ${
                    pageIndex === currentPage
                      ? "text-blue-normal bg-blue-light"
                      : "text-black dark:text-white bg-transparent"
                  }`}
                  onClick={() => setCurrentPage(pageIndex)} // Set the current page when clicked
                >
                  {pageIndex + 1}
                </button>
              );
            };

            // Add the first page (always visible)
            addPageButton(0);

            // Add "..." if the range of pages is far from the beginning
            if (currentPage > maxVisiblePages) {
              pagination.push(
                <span
                  key="start-ellipsis"
                  className="w-10 h-10 flex items-center justify-center"
                >
                  ...
                </span>
              );
            }

            // Add pages around the current page
            const startPage = Math.max(1, currentPage - maxVisiblePages); // Start from the earlier page
            const endPage = Math.min(
              totalPages - 2,
              currentPage + maxVisiblePages
            ); // End before the last page
            for (let i = startPage; i <= endPage; i++) {
              addPageButton(i); // Add the buttons for pages in the range
            }

            // Add "..." if the range of pages is far from the end
            if (currentPage < totalPages - maxVisiblePages - 1) {
              pagination.push(
                <span
                  key="end-ellipsis"
                  className="w-10 h-10 flex items-center justify-center"
                >
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

        <Button
          variant="outline"
          onClick={() =>
            setCurrentPage((prevPage) =>
              Math.min(
                prevPage + 1,
                Math.ceil((data?.total_matching || 0) / pageSize) - 1
              )
            )
          }
          disabled={
            currentPage ===
            Math.ceil((data?.total_matching || 0) / pageSize) - 1
          } // Disable if already on the last page
        >
          Next
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
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

      <Drawer anchor="right" open={isOpenDrawer} onClose={handleDrawerClose}>
        <div className="flex items-center p-2 justify-center bg-[#7059F3] text-white">
          <button onClick={() => handleDrawerClose()}>
            <IconArrowRight className="absolute left-2 top-1 h-8 w-8 hover:cursor-pointer rounded-full p-1 bg-[#7059F3] text-white hover:opacity-80" />
          </button>
          <div className="text-base font-bold">
            Detail Analyse Matching Candidate
          </div>
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
                  {detailCandidateName ? detailCandidateName : "None"}
                </p>
              </div>

              <div className="p-2">
                <div className="text-base font-semibold leading-7 text-gray-900">
                  Candidate Email
                </div>
                <p className="text-sm leading-6 text-gray-60">
                  {detailCandidateEmail ? detailCandidateEmail : "None"}
                </p>
              </div>

              <div className="p-2">
                <div className="text-base font-semibold leading-7 text-gray-900">
                  Candidate Phone Number
                </div>
                <p className="text-sm leading-6 text-gray-60">
                  {detailCandidatePhone ? detailCandidatePhone : "None"}
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
                <div className="text-base font-semibold leading-7 text-gray-900 flex items-center justify-between">
                  <span>Summary Analyse Candidate</span>
                  <button
                    onClick={() => {
                      setEditedSummary(
                        candidateDetailQuery.data?.summary_comment || ""
                      ); // Set default value
                      setIsEditingSummary(true); // Enter edit mode
                    }}
                    className="hover:opacity-80"
                    aria-label="Edit Summary"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-gray-500 hover:text-gray-700"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.862 3.487a2.25 2.25 0 013.182 3.182l-10.5 10.5a4.5 4.5 0 01-1.697 1.07l-4.2 1.4 1.4-4.2a4.5 4.5 0 011.07-1.697l10.5-10.5z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 8.25L15.75 4.5"
                      />
                    </svg>
                  </button>
                </div>
                {isEditingSummary ? (
                  <div className="mt-2">
                    <textarea
                      value={editedSummary}
                      onChange={(e) => setEditedSummary(e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      rows={4}
                    />
                    <div className="flex justify-end mt-2 space-x-2">
                      <button
                        onClick={handleSaveSummary}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1 bg-gray-300 text-sm rounded-md hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm leading-6 text-gray-60">
                    {candidateDetailQuery.data?.summary_comment
                      ? candidateDetailQuery.data?.summary_comment
                      : "None"}
                  </p>
                )}
              </div>

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
                              alignSelf: "center",
                            }}
                          />
                          {/* Candidate Name */}
                          <Text style={pdfStyles.title}>
                            Candidate {detailCandidateName || "Candidate"}'s
                            resume evaluation details for job posting "
                            {candidateDetailQuery.data?.job_name || "Job"}"
                          </Text>

                          {/* Sections */}
                          <PDFSection
                            title="Candidate Name"
                            items={[
                              detailCandidateName
                                ? detailCandidateName
                                : "None",
                            ]}
                          />
                          <PDFSection
                            title="Candidate Email"
                            items={[
                              detailCandidateEmail
                                ? detailCandidateEmail
                                : "None",
                            ]}
                          />
                          <PDFSection
                            title="Candidate Phone Number"
                            items={[
                              detailCandidatePhone
                                ? detailCandidatePhone
                                : "None",
                            ]}
                          />
                          <PDFSection
                            title="Job Name"
                            items={[
                              candidateDetailQuery.data?.job_name || "None",
                            ]}
                          />
                          <PDFSection
                            title="Matching Score"
                            items={[
                              candidateDetailQuery.data?.score !== undefined
                                ? `${candidateDetailQuery.data.score}%`
                                : "0",
                            ]}
                          />
                          <PDFSection
                            title="Summary Analyse Candidate"
                            items={[
                              candidateDetailQuery.data?.summary_comment ||
                                "None",
                            ]}
                          />
                          <PDFSection
                            title="Analyse Educations"
                            items={[
                              `Comment: ${
                                candidateDetailQuery.data?.degree?.comment ||
                                "None"
                              }`,
                              `Score: ${
                                candidateDetailQuery.data?.degree?.score || "0"
                              }`,
                            ]}
                          />
                          <PDFSection
                            title="Experiences"
                            items={[
                              `Comment: ${
                                candidateDetailQuery.data?.experience
                                  ?.comment || "None"
                              }`,
                              `Score: ${
                                candidateDetailQuery.data?.experience?.score ||
                                "0"
                              }`,
                            ]}
                          />
                          <PDFSection
                            title="Responsibilities"
                            items={[
                              `Comment: ${
                                candidateDetailQuery.data?.responsibility
                                  ?.comment || "None"
                              }`,
                              `Score: ${
                                candidateDetailQuery.data?.responsibility
                                  ?.score || "0"
                              }`,
                            ]}
                          />
                          <PDFSection
                            title="Technical Skills"
                            items={[
                              `Comment: ${
                                candidateDetailQuery.data?.technical_skill
                                  ?.comment || "None"
                              }`,
                              `Score: ${
                                candidateDetailQuery.data?.technical_skill
                                  ?.score || "0"
                              }`,
                            ]}
                          />
                          <PDFSection
                            title="Soft Skills"
                            items={[
                              `Comment: ${
                                candidateDetailQuery.data?.soft_skill
                                  ?.comment || "None"
                              }`,
                              `Score: ${
                                candidateDetailQuery.data?.soft_skill?.score ||
                                "0"
                              }`,
                            ]}
                          />
                          <PDFSection
                            title="Certificates"
                            items={[
                              `Comment: ${
                                candidateDetailQuery.data?.certificate
                                  ?.comment || "None"
                              }`,
                              `Score: ${
                                candidateDetailQuery.data?.certificate?.score ||
                                "0"
                              }`,
                            ]}
                          />
                        </Page>
                      </Document>
                    </PDFViewer>
                  </div>
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
