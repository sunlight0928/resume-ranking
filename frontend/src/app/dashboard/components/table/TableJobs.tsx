"use client";
import dynamic from "next/dynamic";
import React, { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { Dialog, Transition } from "@headlessui/react";
import { jsPDF } from "jspdf";
import { PDFViewer, Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { FaDownload, FaPrint, FaSearch } from "react-icons/fa";
import { TablePagination, Drawer, Skeleton } from "@mui/material";
import { IconArrowRight } from "@tabler/icons-react";
import { createColumnHelper, Row } from "@tanstack/react-table";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-quill/dist/quill.snow.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Dynamically import ReactQuill (client-side only)
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

// Import custom hooks
import UseTableTanStackSSR from "@/app/hooks/react-table/useTableTanStackSSR";

import {
  useJobDetailData,
  useFAQData,
  useDetailFAQData,
  useDeleteFAQData,
  useAddFAQData,
  useUpdateFAQData,
} from "@/app/hooks/react-query/logging/faq/useFAQData";
import { Calendar, Plus, Search } from "lucide-react";
import { Button } from "@/app/components/ui/Button";

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
  _id?: string;
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

const TableJobs = (props: Props) => {
  const [jobId, setJobId] = React.useState<string>("id");
  const [isOpenModalView, setIsOpenModalView] = React.useState<boolean>(false); // Modal for "Show More"
  const [currentJobDescription, setCurrentJobDescription] = React.useState<string>(""); // Holds the current job description
  const jobDetailQuery = useJobDetailData(jobId);
  const [isOpenDrawer, setIsOpenDrawer] = React.useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = React.useState<number>(0);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [isOpenModalDelete, setIsOpenModalDelete] = React.useState<boolean>(false);
  const [isOutputModalOpen, setIsOutputModalOpen] = React.useState<boolean>(false);
  const [isOpenModalAdd, setIsOpenModalAdd] = React.useState<boolean>(false);
  const [isOpenModalUpdate, setIsOpenModalUpdate] = React.useState<boolean>(false);
  const [fetching, setIsFetching] = React.useState<boolean>(false);
  const [faqId, setFaqId] = React.useState<number>(-1);
  const [inputs, setInputs] = React.useState<InputItem[] | []>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [dataForm, setDataForm] = React.useState<DataFormModel>({
    job_name: "",
    job_description: "",
  });
  const ReactQuill = useMemo(() => dynamic(() => import("react-quill"), { ssr: false }), []);

  const { data, isLoading, isError, isPreviousData, refetch } = useFAQData(currentPage + 1, pageSize);
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
  const filteredData = useMemo(() => {
    if (!data?.results) return [];
  
    return data.results.filter((job) => {
      // Check if the job name includes the search term
      const matchesSearchTerm = job.job_name.toLowerCase().includes(searchTerm.toLowerCase());
  
      // Check if the job's created_at date is within the selected date range
      const jobDate = new Date(job.created_at);
      const matchesDateRange =
        (!startDate || jobDate >= startDate) && (!endDate || jobDate <= endDate);
  
      // Return true only if both conditions are met
      return matchesSearchTerm && matchesDateRange;
    });
  }, [data, searchTerm, startDate, endDate]);

  const {
    data: detailFAQData,
    isLoading: isDetailFAQLoading,
    refetch: refetchDetailFAQData,
    isSuccess,
  } = useDetailFAQData(faqId);

  const { mutate: deleteFAQ } = useDeleteFAQData(faqId);
  const { mutate: addFAQ } = useAddFAQData(dataForm);
  const { mutate: updateFAQ } = useUpdateFAQData(dataForm, faqId);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormModel>({
    defaultValues: {
      job_name: "",
      job_description: `<h2>Job Brief:</h2>
      <p>We're seeking an AI Engineer to develop and implement AI solutions. You'll work on cutting-edge projects, designing, training, and integrating machine learning models.</p>

      <h3>Responsibilities:</h3>
      <ol>
        <li>Develop and optimize AI algorithms/models.</li>
        <li>Collaborate on cross-functional projects.</li>
        <li>Implement and integrate AI solutions.</li>
        <li>Evaluate and experiment with AI technologies.</li>
        <li>Ensure system scalability and performance.</li>
        <li>Provide documentation and technical support.</li>
      </ol>

      <h3>Requirements:</h3>
      <ul>
        <li>Bachelor's degree in Computer Science or related field.</li>
        <li>1-3 years of AI/machine learning experience.</li>
        <li>Proficiency in Python or TensorFlow.</li>
        <li>Strong understanding of ML algorithms.</li>
        <li>Experience with deep learning frameworks.</li>
        <li>Knowledge of NLP and CV a plus.</li>
        <li>Problem-solving skills.</li>
        <li>Excellent communication and teamwork.</li>
      </ul>`,
    },
  });

  const {
    register: register2,
    handleSubmit: handleSubmit2,
    setValue: setValue2,
    control: control2,
    reset: reset2,
    formState: { errors: errors2 },
  } = useForm<FormModel>({
    defaultValues: { job_name: detailFAQData?.job_name },
  });

  const handlePageOnchange = (event: any, newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    setPageSize(event.target.value);
  };

  // const columnHelper = createColumnHelper<FAQModel>();
  const columnHelper = createColumnHelper<JobModel>();
  const columns = [
    columnHelper.display({
      header: "ID",
      cell: ({ row }: { row: Row<any> }) => {
        return <div>{currentPage !== 0 ? <>{currentPage * 10 + (row.index + 1)}</> : <>{row.index + 1}</>}</div>;
      },
    }),
    columnHelper.display({
      header: "Position Name",
      cell: ({ row }: { row: Row<any> }) => {
        return <>{row.original.job_name}</>;
      },
    }),
    columnHelper.accessor("job_description", {
      header: "Job Description",
      cell: ({ row }: { row: Row<any> }) => {
        if (!row.original.job_description) {
          return null;
        }
        const shortDescription = row.original.job_description.slice(0, 200); // Truncated description
        return (
          <>
            <div
              className="whitespace-pre-line text-left"
              id="answer"
              dangerouslySetInnerHTML={{ __html: shortDescription }}
            />
            {row.original.job_description.length > 200 && (
              <button
                className="text-blue-500 hover:underline focus:outline-none"
                onClick={() => {
                  setCurrentJobDescription(row.original.job_description); // Set the full job description
                  setIsOpenModalView(true); // Open the modal
                }}
              >
                Show more
              </button>
            )}
          </>
        );
      },
    }),
    columnHelper.accessor("created_at", {
      header: "Job Created Date",
      cell: (props) => props.getValue(),
    }),
    columnHelper.display({
      header: "Action",
      cell: ({ row }: { row: Row<any> }) => {
        return (
          <>
            <button
              className="p-2 mr-2 rounded-lg text-xs font-medium text-center text-white bg-blue-500 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              onClick={() => handleDetail(row.original._id)}
            >
              Detail
            </button>
            <button
              className="p-2 mr-2 rounded-lg text-xs font-medium text-center text-white bg-green-500 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
              onClick={() => handleModifyFAQ(row.original._id)}
            >
              Update
            </button>
            <button
              className="p-2 mr-2 rounded-lg text-xs font-medium text-center text-white bg-yellow-500 hover:bg-yellow-800 focus:ring-4 focus:outline-none focus:ring-yellow-300 dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:focus:ring-yellow-800"
              onClick={() => handleOutput(row.original._id)}
            >
              Output
            </button>
            <button
              className="p-2 mr-2 rounded-lg text-xs font-medium text-center text-white bg-red-500 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
              onClick={() => handleDeleteFAQ(row.original._id)}
            >
              Delete
            </button>
          </>
        );
      },
    }),
  ];

  const closeViewModal = () => {
    setIsOpenModalView(false);
    setCurrentJobDescription(""); // Reset the job description
  };

  if (isLoading) {
    return (
      <div className="px-4 pt-6 mt-2">
        <div className="font-medium text-xl p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:text-white dark:border-gray-700 sm:p-6 dark:bg-gray-800">
          <Skeleton variant="rectangular" width="100%" height={300} />
        </div>
      </div>
    );
  }

  if (isError) {
    return <h4 className="text-center text-red-500 font-medium text-xl">System Error Please Try Again Later !</h4>;
  }

  const handleModifyFAQ = async (faqId: number) => {
    await setFaqId(faqId);
    refetchDetailFAQData();
    try {
      setIsOpenModalUpdate(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddFAQ = () => {
    setIsOpenModalAdd(true);
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

  if (isSuccess) {
    setValue2("job_name", detailFAQData.job_name);
    setValue2("job_description", detailFAQData.job_description);
  }

  //Submit form add FAQ
  const confirmAddFAQ = async (data: FormModel): Promise<void> => {
    setLoading(true);
    const params = {
      job_name: data.job_name,
      job_description: data.job_description,
    };

    if (data.job_name.trim().length === 0) {
      alert("Job name is required!");
      return;
    }

    if (data.job_description.trim().length < 100) {
      alert("Job description is too short!");
      return;
    }
    console.log(params);
    await setDataForm(params);

    addFAQ(
      {},
      {
        // onSettled
        onError: (error: any) => {
          setLoading(false);
          console.log("Create New Job error:", error.response.status);
          toast.error("Create New Job failed");
        },
        onSuccess: async () => {
          setLoading(false);
          setIsOpenModalAdd(false);
          setInputs([]);
          refetch();
          reset();
          toast.success("Create New Job successfully");
        },
      }
    );
  };

  //Submit form update FAQ
  const confirmUpdateFAQ = async (data: FormModel) => {
    setLoading(true);
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
          setLoading(false);
          console.log("Update FAQ error:", error.response.status);
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

  const handleDrawerClose = () => {
    setIsOpenDrawer(false);
  };

  const handleDetail = async (jobId: string) => {
    await setJobId(jobId);
    await jobDetailQuery.refetch();
    if (jobDetailQuery.isLoading) {
      setIsFetching(true);
    }
    setIsFetching(false);
    setIsOpenDrawer(true);
  };
  // Function to handle the Output button click (opens the modal)
  const handleOutput = async (jobId: string) => {
    await setJobId(jobId);
    await jobDetailQuery.refetch();
    if (jobDetailQuery.isLoading) {
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
    if (!jobDetailQuery.data) {
      toast.error("Job details are not loaded yet.");
      return;
    }

    const doc = new jsPDF(); // Create a new jsPDF instance

    // Extract job details from `jobDetailQuery.data`
    const jobName = jobDetailQuery.data.job_name || "Job";
    const educations = jobDetailQuery.data.degree || [];
    const experiences = jobDetailQuery.data.experience || [];
    const responsibilities = jobDetailQuery.data.responsibility || [];
    const technicalSkills = jobDetailQuery.data.technical_skill || [];
    const softSkills = jobDetailQuery.data.soft_skill || [];
    const certificates = jobDetailQuery.data.certificate || [];
    const createdAt = `Job Created Date: ${new Date(jobDetailQuery.data.created_at).toLocaleDateString()}`;

    const pageWidth = doc.internal.pageSize.getWidth(); // Get the width of the page
    const pageHeight = doc.internal.pageSize.getHeight(); // Get the height of the page

    // Set job name title in blue, centered, and with a 30px gap from the top
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 255); // Set text color to blue (RGB)
    doc.text(jobName, pageWidth / 2, 30, { align: "center" }); // Center the text at 30px gap

    // Reset font styles for the rest of the content
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

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
        if (currentY + lineHeight > pageHeight) {
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
        // Add section title in blue
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14); // Slightly larger font for titles
        doc.setTextColor(0, 0, 255); // Set text color to blue
        if (yOffset + 10 > pageHeight) {
          doc.addPage();
          yOffset = 20; // Reset yOffset on the new page
        }
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

    let yOffset = 40; // Start content below the job name
    yOffset = addSection("Educations", educations, yOffset);
    yOffset = addSection("Experiences", experiences, yOffset);
    yOffset = addSection("Responsibilities", responsibilities, yOffset);
    yOffset = addSection("Technical Skills", technicalSkills, yOffset);
    yOffset = addSection("Soft Skills", softSkills, yOffset);
    yOffset = addSection("Certificates", certificates, yOffset);

    // Add "Job Created Date" with wrapping
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 255); // Blue color for the title
    if (yOffset + 10 > pageHeight) {
      doc.addPage();
      yOffset = 20; // Reset yOffset on the new page
    }
    doc.text("Job Created Date", 10, yOffset + 4);
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
    if (!jobDetailQuery.data) {
      toast.error("Job details are not loaded yet.");
      return;
    }

    const doc = new jsPDF(); // Create a new jsPDF instance

    // Extract job details from `jobDetailQuery.data`
    const jobName = jobDetailQuery.data.job_name || "Job";
    const educations = jobDetailQuery.data.degree || [];
    const experiences = jobDetailQuery.data.experience || [];
    const responsibilities = jobDetailQuery.data.responsibility || [];
    const technicalSkills = jobDetailQuery.data.technical_skill || [];
    const softSkills = jobDetailQuery.data.soft_skill || [];
    const certificates = jobDetailQuery.data.certificate || [];
    const createdAt = `Job Created Date: ${new Date(jobDetailQuery.data.created_at).toLocaleDateString()}`;

    const pageWidth = doc.internal.pageSize.getWidth(); // Get the width of the page
    const pageHeight = doc.internal.pageSize.getHeight(); // Get the height of the page

    // Set job name title in blue, centered, and with a 30px gap from the top
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 255); // Set text color to blue (RGB)
    doc.text(jobName, pageWidth / 2, 30, { align: "center" }); // Center the text at 30px gap

    // Reset font styles for the rest of the content
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

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
        if (currentY + lineHeight > pageHeight) {
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
        // Add section title in blue
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14); // Slightly larger font for titles
        doc.setTextColor(0, 0, 255); // Set text color to blue
        if (yOffset + 10 > pageHeight) {
          doc.addPage();
          yOffset = 20; // Reset yOffset on the new page
        }
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

    let yOffset = 40; // Start content below the job name
    yOffset = addSection("Educations", educations, yOffset);
    yOffset = addSection("Experiences", experiences, yOffset);
    yOffset = addSection("Responsibilities", responsibilities, yOffset);
    yOffset = addSection("Technical Skills", technicalSkills, yOffset);
    yOffset = addSection("Soft Skills", softSkills, yOffset);
    yOffset = addSection("Certificates", certificates, yOffset);

    // Add "Job Created Date" with wrapping
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 255); // Blue color for the title
    if (yOffset + 10 > pageHeight) {
      doc.addPage();
      yOffset = 20; // Reset yOffset on the new page
    }
    doc.text("Job Created Date", 10, yOffset + 4);
    yOffset += 10; // Adjust yOffset for the content
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Black color for the content
    yOffset = addWrappedTextWithBullet(doc, createdAt, 15, yOffset, pageWidth - 30, 6);

    // Dynamically set the file name using the `jobName`
    const fileName = `${jobName}.pdf`;
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
                <div className="absolute z-10 mt-2 bg-white border shadow-lg rounded-lg p-4">
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
            <Button variant="default" color="normal" onClick={() => handleAddFAQ()}>
              <span className="hidden lg:block">Create Job</span>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M10.1663 7.95312H5.33301C5.0853 7.95312 4.87988 7.74771 4.87988 7.5C4.87988 7.25229 5.0853 7.04688 5.33301 7.04688H10.1663C10.414 7.04688 10.6195 7.25229 10.6195 7.5C10.6195 7.74771 10.414 7.95312 10.1663 7.95312Z"
                  fill="currentColor"
                />
                <path
                  d="M7.75 10.3685C7.50229 10.3685 7.29688 10.1631 7.29688 9.91536V5.08203C7.29688 4.83432 7.50229 4.62891 7.75 4.62891C7.99771 4.62891 8.20312 4.83432 8.20312 5.08203V9.91536C8.20312 10.1631 7.99771 10.3685 7.75 10.3685Z"
                  fill="currentColor"
                />
                <path
                  d="M9.56217 13.9935H5.93717C2.65655 13.9935 1.25488 12.5918 1.25488 9.3112V5.6862C1.25488 2.40557 2.65655 1.00391 5.93717 1.00391H9.56217C12.8428 1.00391 14.2445 2.40557 14.2445 5.6862V9.3112C14.2445 12.5918 12.8428 13.9935 9.56217 13.9935ZM5.93717 1.91016C3.15197 1.91016 2.16113 2.90099 2.16113 5.6862V9.3112C2.16113 12.0964 3.15197 13.0872 5.93717 13.0872H9.56217C12.3474 13.0872 13.3382 12.0964 13.3382 9.3112V5.6862C13.3382 2.90099 12.3474 1.91016 9.56217 1.91016H5.93717Z"
                  fill="currentColor"
                />
              </svg>
            </Button>
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
        rowsPerPageOptions={[10, 20, 30]}
        component="div"
        className="dark:text-white"
        count={filteredData.length}
        page={currentPage}
        onPageChange={handlePageOnchange}
        rowsPerPage={pageSize}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      
      {/* Modal for "Show More" */}

      
      <Transition appear show={isOpenModalView} as={React.Fragment}>
        <Dialog as="div" className="relative z-20" onClose={closeViewModal}>
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
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                    Job description
                  </Dialog.Title>
                  <div className="w-full h-[500px] border">
                    {/* Scrollable Content */}
                    <div className="h-[500px] overflow-y-auto">
                      <div
                        className="prose max-w-none text-gray-700"
                        dangerouslySetInnerHTML={{ __html: currentJobDescription }}
                      />
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      {/* <div className="h-[88px] rounded-b-xl flex flex-row justify-between p-6">
        <Button variant="outline">
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
        <div className="flex flex-row gap-0.5">
          <button className="w-10 h-10 rounded-lg text-blue-normal bg-blue-light">1</button>
          <button className="w-10 h-10 rounded-lg text-black dark:text-white bg-transparent">2</button>
          <button className="w-10 h-10 rounded-lg text-black dark:text-white bg-transparent">3</button>
          <span className="text-black dark:text-white">&nbsp;...&nbsp;</span>
          <button className="w-10 h-10 rounded-lg text-black dark:text-white bg-transparent">8</button>
          <button className="w-10 h-10 rounded-lg text-black dark:text-white bg-transparent">9</button>
          <button className="w-10 h-10 rounded-lg text-black dark:text-white bg-transparent">10</button>
        </div>
        <Button variant="outline">
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
      </div> */}

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
                  <Dialog.Title as="h3" className="text-center text-lg font-medium leading-6 text-gray-900">
                    Notification
                  </Dialog.Title>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Are you sure you want to delete this job?</p>
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
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
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
                          {/* Job Name */}
                          <Text style={pdfStyles.title}>{jobDetailQuery.data?.job_name || "Job"}</Text>

                          {/* Sections */}
                          <PDFSection title="Educations" items={jobDetailQuery.data?.degree || []} />
                          <PDFSection title="Experiences" items={jobDetailQuery.data?.experience || []} />
                          <PDFSection title="Responsibilities" items={jobDetailQuery.data?.responsibility || []} />
                          <PDFSection title="Technical Skills" items={jobDetailQuery.data?.technical_skill || []} />
                          <PDFSection title="Soft Skills" items={jobDetailQuery.data?.soft_skill || []} />
                          <PDFSection title="Certificates" items={jobDetailQuery.data?.certificate || []} />

                          {/* Job Created Date */}
                          <Text style={pdfStyles.createdDate}>
                            Job Created Date: {new Date(jobDetailQuery.data?.created_at).toLocaleDateString()}
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

      {/* Drawer */}
      <Drawer anchor="right" open={isOpenDrawer} onClose={handleDrawerClose}>
        <div className="flex items-center p-2 justify-center bg-blue-700 text-white">
          <button onClick={() => handleDrawerClose()}>
            <IconArrowRight className="absolute left-2 top-1 h-8 w-8 hover:cursor-pointer rounded-full p-1 bg-blue-500 text-white hover:opacity-80" />
          </button>
          <div className="text-base font-bold">Detail Analyse Job Description</div>
        </div>
        <div className="w-[500px] text-sm">
          {fetching ? (
            <div className="text-center">Loading ...</div>
          ) : (
            <>
              <div className="p-2">
                <div className="text-base font-semibold leading-7 text-gray-900">Job Name</div>
                <p className="text-sm leading-6 text-gray-60">
                  {jobDetailQuery.data?.job_name ? jobDetailQuery.data?.job_name : "None"}
                </p>

                <div className="mt-2 text-base font-semibold leading-7 text-gray-900">Educations</div>
                <ul className="list-disc pl-6 text-sm leading-6 text-gray-600">
                  {(jobDetailQuery.data?.degree || []).length > 0 ? (
                    jobDetailQuery.data?.degree.map((edu, index) => <li key={index}>{edu}</li>)
                  ) : (
                    <li>None</li>
                  )}
                </ul>

                <div className="mt-2 text-base font-semibold leading-7 text-gray-900">Experiences</div>
                <ul className="list-disc pl-6 text-sm leading-6 text-gray-600">
                  {(jobDetailQuery.data?.experience || []).length > 0 ? (
                    jobDetailQuery.data?.experience.map((edu, index) => <li key={index}>{edu}</li>)
                  ) : (
                    <li>None</li>
                  )}
                </ul>

                <div className="mt-2 text-base font-semibold leading-7 text-gray-900">Responsibilities</div>
                <ul className="list-disc pl-6 text-sm leading-6 text-gray-600">
                  {(jobDetailQuery.data?.responsibility || []).length > 0 ? (
                    jobDetailQuery.data?.responsibility.map((edu, index) => <li key={index}>{edu}</li>)
                  ) : (
                    <li>None</li>
                  )}
                </ul>

                <div className="mt-2 text-base font-semibold leading-7 text-gray-900">Technical Skills</div>
                <div className="px-2 max-w-[500px]">
                  {(jobDetailQuery.data?.technical_skill || []).length > 0 ? (
                    <div className="flex flex-wrap">
                      {jobDetailQuery.data?.technical_skill.map((edu, index) => (
                        <span className="rounded-full bg-blue-500 text-white px-2 py-1 m-1" key={index}>
                          {edu.replace(/\s/g, "")}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div>None</div>
                  )}
                </div>

                <div className="mt-2 text-base font-semibold leading-7 text-gray-900">Soft Skills</div>
                <ul className="list-disc pl-6 text-sm leading-6 text-gray-600">
                  {(jobDetailQuery.data?.soft_skill || []).length > 0 ? (
                    jobDetailQuery.data?.soft_skill.map((edu, index) => <li key={index}>{edu}</li>)
                  ) : (
                    <li>None</li>
                  )}
                </ul>

                <div className="mt-2 text-base font-semibold leading-7 text-gray-900">Certificates</div>
                <ul className="list-disc pl-6 text-sm leading-6 text-gray-600">
                  {(jobDetailQuery.data?.certificate || []).length > 0 ? (
                    jobDetailQuery.data?.certificate.map((edu, index) => <li key={index}>{edu}</li>)
                  ) : (
                    <li>None</li>
                  )}
                </ul>

                <div className="mt-2 text-base font-semibold leading-7 text-gray-900">Job Created Date</div>
                <p className="text-sm leading-6 text-gray-60">
                  {new Date(jobDetailQuery.data?.created_at).toLocaleDateString()}
                </p>
              </div>
            </>
          )}
        </div>
      </Drawer>

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
                  <Dialog.Title as="h3" className="text-center text-lg font-medium leading-6 text-gray-900">
                    Create New Job
                  </Dialog.Title>
                  <form className="w-full" onSubmit={handleSubmit(confirmAddFAQ)}>
                    <div className="grid gap-4 mb-4 sm:grid-cols-2 sm:gap-6 sm:mb-5 mt-8">
                      <div className="sm:col-span-2">
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                          Position Name
                        </label>
                        <input
                          type="text"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          placeholder="AI Engineer"
                          {...register("job_name")}
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 mb-4 sm:grid-cols-2 sm:gap-6 sm:mb-5">
                      <div className="sm:col-span-2 h-72">
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                          Job Description
                        </label>

                        <Controller
                          name="job_description"
                          control={control}
                          render={({ field }) => (
                            <ReactQuill
                              {...field}
                              theme="snow"
                              scrollingContainer={"#list-faq"}
                              className="h-60 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 resize-none"
                              modules={{
                                toolbar: [
                                  ["bold", "italic", "underline", "strike"],
                                  [{ list: "ordered" }, { list: "bullet" }],
                                  ["link", "image"],
                                ],
                              }}
                              formats={["bold", "italic", "underline", "strike", "list", "bullet", "link", "image"]}
                            />
                          )}
                        />
                      </div>
                    </div>
                    <div className="mt-8 text-end">
                      {loading === false ? (
                        <>
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
                        </>
                      ) : (
                        <>
                          <button
                            disabled={true}
                            className="mr-2 inline-flex justify-center rounded-md border border-transparent bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-blue-500"
                          >
                            Yes
                          </button>

                          <button
                            type="button"
                            disabled={loading}
                            className="inline-flex justify-center rounded-md border border-transparent bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-red-500"
                            onClick={closeModal}
                          >
                            No
                          </button>
                        </>
                      )}
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

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
                  <Dialog.Title as="h3" className="text-center text-lg font-medium leading-6 text-gray-900">
                    Update Job
                  </Dialog.Title>
                  <form className="w-full" onSubmit={handleSubmit2(confirmUpdateFAQ)}>
                    <div className="grid gap-4 mb-4 sm:grid-cols-2 sm:gap-6 sm:mb-5 mt-8">
                      <div className="sm:col-span-2">
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                          Position Name
                        </label>
                        <input
                          type="text"
                          // name="job_name"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          {...register2("job_name")}
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 mb-4 sm:grid-cols-2 sm:gap-6 sm:mb-5">
                      <div className="sm:col-span-2">
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                          Job Description
                        </label>
                        <Controller
                          name="job_description"
                          control={control2}
                          defaultValue={detailFAQData?.job_description}
                          render={({ field }) => (
                            <ReactQuill
                              {...field}
                              theme="snow"
                              scrollingContainer={"#list-faq"}
                              className="h-60 bg-gray-50 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 resize-none"
                              modules={{
                                toolbar: [
                                  ["bold", "italic", "underline", "strike"],
                                  [{ list: "ordered" }, { list: "bullet" }],
                                  ["link", "image"],
                                ],
                              }}
                              formats={["bold", "italic", "underline", "strike", "list", "bullet", "link", "image"]}
                            />
                          )}
                        />
                      </div>
                    </div>
                    {/* <div className="grid gap-4 mb-4 sm:grid-cols-2 sm:gap-6 sm:mb-5">
                      <div className="sm:col-span-2">
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Category</label>
                        <input
                          type="text"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          value="FAQ Category 1"
                          disabled
                        />
                      </div>
                    </div> */}
                    <div className="grid gap-4 mb-4 sm:grid-cols-2 sm:gap-6 sm:mb-5">
                      <div className="sm:col-span-2">
                        {/* <label className="inline-block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                          Documents
                        </label>
                        <button
                          onClick={addInput}
                          type="button"
                          className="inline-block ml-2 px-3 py-2 text-xs font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                        >
                          +
                        </button> */}
                        <div>
                          {/* {inputs.map((input, index) => (
                            <div className="flex space-x-4 mt-2" key={index}>
                              <div className="w-3/4">
                                <input
                                  type="text"
                                  name="documentname"
                                  value={input.documentname}
                                  onChange={(event) => handleInputChange(index, event)}
                                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                />
                                {!validateDocumentName(input.documentname) && (
                                  <p className="error-message text-sm text-red-600">* Document name is required.</p>
                                )}
                              </div>
                              <div className="w-1/4">
                                <input
                                  type="number"
                                  name="page"
                                  value={input.page}
                                  onChange={(event) => handleInputChange(index, event)}
                                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                />
                              </div>
                            </div>
                          ))} */}
                        </div>
                      </div>
                    </div>
                    <div className="mt-8 text-end">
                      {loading === false ? (
                        <>
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
                        </>
                      ) : (
                        <>
                          <button
                            disabled={true}
                            className="mr-2 inline-flex justify-center rounded-md border border-transparent bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-blue-500"
                          >
                            Yes
                          </button>

                          <button
                            type="button"
                            disabled={true}
                            className="inline-flex justify-center rounded-md border border-transparent bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-red-500"
                            onClick={closeModal}
                          >
                            No
                          </button>
                        </>
                      )}
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default TableJobs;
