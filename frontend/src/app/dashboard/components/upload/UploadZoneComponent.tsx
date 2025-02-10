"use client";
import React, { ChangeEvent, useState } from "react";
import { FaRegFilePdf } from "react-icons/fa";
import Image from "next/image";
import { Typography, CircularProgress, Box } from "@mui/material";
import { useUploadFileData } from "@/app/hooks/react-query/management/file/useFilesUploadData";
import { ToastContainer, toast } from "react-toastify";
import { MdOutlineCloudUpload, MdClear } from "react-icons/md";

type Props = {
  refetch: () => void;
};

const UploadZoneComponent = (props: Props) => {
  const [file, setFile] = useState<File[]>([]);
  const [errorContent, setErrorContent] = useState<string | null>(null);
  const [isUpload, setIsUpload] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [processContent, setProcessContent] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentUploadingFileIndex, setCurrentUploadingFileIndex] =
    useState<number>(0);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const { mutate: uploadFile } = useUploadFileData(setUploadProgress);

  const handleSubmitUpload = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (file.length === 0) {
      toast.warning("No files selected to upload.");
      return;
    }

    const totalFiles = file.length;
    let successFiles = 0;

    setIsUpload(true);
    setUploadProgress(0);

    // Process each file upload one by one
    for (let i = 0; i < totalFiles; i++) {
      setCurrentUploadingFileIndex(i + 1); // Update the current uploading file index (1-based)

      try {
        // Upload the file and track progress
        await new Promise<void>((resolve, reject) => {
          uploadFile(
            { files: [file[i]], refetch: props.refetch },
            {
              onSuccess: (response) => {
                successFiles++;
                resolve();
              },
              onError: (error: any) => {
                if (error.response) {
                  console.log("Upload error:", error.response.status);
                  if (error.response.status === 400) {
                    setErrorContent("File is duplicate");
                    toast.warning(`File "${file[i].name}" is duplicate.`);
                  } else {
                    setErrorContent("Upload file failed");
                    toast.error(`Failed to upload "${file[i].name}".`);
                  }
                } else {
                  console.error("Unknown error:", error);
                  toast.error(`Failed to upload "${file[i].name}".`);
                }
                reject(error); // Mark this upload as failed
              },
            }
          );
        });
      } catch (error) {
        console.error(`Error uploading file ${file[i].name}:`, error);
        // Continue to the next file even if the current one fails
      }
    }

    // Final cleanup after all uploads are processed
    setIsUpload(false);
    setUploadProgress(100);
    setFile([]); // Clear file list
    if (successFiles === totalFiles) {
      toast.success("All files uploaded successfully!");
    } else {
      toast.warning(
        `${successFiles} out of ${totalFiles} files uploaded successfully.`
      );
    }
  };

  const handleChangeUploadFile = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    const newFile = [...file];

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

    if (selectedFiles) {
      for (let i = 0; i < selectedFiles.length; i++) {
        const currentFile = selectedFiles[i];

        // Validate file type
        if (
          ![
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ].includes(currentFile.type)
        ) {
          toast.error(
            `File "${currentFile.name}" is not a valid PDF or DOCX file.`
          );
          continue;
        }

        // Validate file size
        if (currentFile.size > MAX_FILE_SIZE) {
          toast.error(
            `File "${currentFile.name}" exceeds the maximum size of 5 MB.`
          );
          continue;
        }

        // Prevent adding duplicate files
        if (
          !newFile.some(
            (f) => f.name === currentFile.name && f.size === currentFile.size
          )
        ) {
          newFile.push(currentFile);
        } else {
          toast.warning(`File "${currentFile.name}" is already added.`);
        }
      }
      setFile(newFile);
    }
  };

  const clearFile = () => {
    setFile([]);
  };

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(false);

    const droppedFiles = event.dataTransfer.files;
    const newFile = [...file];

    if (droppedFiles) {
      for (let i = 0; i < droppedFiles.length; i++) {
        const currentFile = droppedFiles[i];
        if (
          !newFile.some(
            (f) => f.name === currentFile.name && f.size === currentFile.size
          )
        ) {
          newFile.push(currentFile);
        }
      }
      setFile(newFile);
    }
  };

  const getTotalFileSize = () => {
    return file.reduce((total, file) => total + file.size, 0) / (1024 * 1024); // Convert bytes to MB
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
      <div id="upload-zone" className="h-[187px] w-full">
        <div className="bg-white dark:bg-[#202938] mx-auto rounded-[13px] h-full w-full">
          <div className="flex items-start justify-between flex-row p-4 text-gray-400 border border-gray-200 rounded-[13px] dark:border-[#202938] h-full">
            <form onSubmit={handleSubmitUpload} className="h-full">
              {isUpload ? (
                <div className="flex items-center justify-center space-x-4 h-full pl-2">
                  <Box position="relative" display="inline-flex">
                    <CircularProgress
                      variant="determinate"
                      value={uploadProgress}
                      size={130}
                      thickness={4}
                      style={{ color: "#7059F3" }}
                    />
                    <Box
                      top={0}
                      left={0}
                      bottom={0}
                      right={0}
                      position="absolute"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Typography
                        variant="h6"
                        component="div"
                        style={{ color: "#7059F3", fontWeight: "bold" }}
                      >
                        {`${Math.round(uploadProgress)}%`}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography
                    variant="h5"
                    className="pl-6 text-center mt-0 text-[#7059F3] dark:text-[#7059F3]"
                  >
                    {`Uploading ${currentUploadingFileIndex}/${file.length} file...`}
                  </Typography>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-4 h-full pl-2">
                  <div
                    className={`relative flex flex-col items-center justify-center p-0 border-2 ${
                      isDragging
                        ? "border-blue-500 bg-blue-100"
                        : "border-gray-300"
                    } border-dashed rounded-full transition-all w-32 h-32`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleFileDrop}
                  >
                    <input
                      accept=".pdf,.docx"
                      type="file"
                      className="absolute inset-0 z-50 p-0 m-0 outline-none opacity-0 cursor-pointer"
                      onChange={handleChangeUploadFile}
                      id="file-input"
                      multiple
                    />
                    <div className="flex flex-col items-center justify-center text-center z-10">
                      <svg
                        width="40"
                        height="45"
                        viewBox="0 0 40 45"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <svg
                          width="40"
                          height="45"
                          viewBox="0 0 40 45"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M1.55555 0C0.696445 0 0 0.696444 0 1.55555V43.4444C0 44.3036 0.696444 45 1.55555 45H38.4444C39.3036 45 40 44.3036 40 43.4444V16.8756L25.0001 0.0006309L40 0.000629425V0H1.55555Z"
                            fill="#F2F2F2"
                          />
                          <path
                            d="M25 16.875L40 16.875L25 0L25 16.875Z"
                            fill="#BDBDBD"
                          />
                          <rect
                            x="2.5"
                            y="22.5"
                            width="35"
                            height="18.2812"
                            rx="0.855575"
                            fill="#EF4444"
                          />
                          <path
                            d="M8.39453 36.9141V26.3672H11.8461C12.5532 26.3672 13.1464 26.5182 13.6258 26.8204C14.1081 27.1225 14.4722 27.5379 14.7179 28.0666C14.9665 28.5919 15.0909 29.1893 15.0909 29.8588C15.0909 30.5351 14.9665 31.1359 14.7179 31.6612C14.4692 32.1865 14.1021 32.6002 13.6168 32.9023C13.1314 33.201 12.5337 33.3504 11.8236 33.3504H9.53605V31.7797H11.5989C12.0124 31.7797 12.3509 31.6973 12.6146 31.5325C12.8782 31.3677 13.073 31.1411 13.1988 30.8527C13.3277 30.5643 13.3921 30.233 13.3921 29.8588C13.3921 29.4846 13.3277 29.155 13.1988 28.87C13.073 28.5851 12.8767 28.3636 12.6101 28.2057C12.3464 28.0443 12.0064 27.9636 11.5899 27.9636H10.0619V36.9141H8.39453Z"
                            fill="white"
                          />
                          <path
                            d="M19.6581 36.9141H16.5391V26.3672H19.721C20.6348 26.3672 21.4198 26.5783 22.076 27.0006C22.7351 27.4195 23.2415 28.022 23.595 28.8082C23.9485 29.5944 24.1253 30.5351 24.1253 31.6303C24.1253 32.729 23.947 33.6731 23.5905 34.4627C23.237 35.2524 22.7261 35.8583 22.058 36.2806C21.3928 36.7029 20.5929 36.9141 19.6581 36.9141ZM18.2065 35.261H19.5772C20.2184 35.261 20.7532 35.1271 21.1816 34.8593C21.6101 34.5881 21.9321 34.1846 22.1479 33.6491C22.3636 33.11 22.4714 32.4371 22.4714 31.6303C22.4714 30.8235 22.3636 30.154 22.1479 29.6219C21.9321 29.0863 21.6131 28.6863 21.1906 28.422C20.7711 28.1542 20.2498 28.0203 19.6266 28.0203H18.2065V35.261Z"
                            fill="white"
                          />
                          <path
                            d="M25.7095 36.9141V26.3672H31.6059V27.9688H27.3769V30.8321H31.2014V32.4337H27.3769V36.9141H25.7095Z"
                            fill="white"
                          />
                          <path
                            d="M8.39453 36.9141V26.3672H11.8461C12.5532 26.3672 13.1464 26.5182 13.6258 26.8204C14.1081 27.1225 14.4722 27.5379 14.7179 28.0666C14.9665 28.5919 15.0909 29.1893 15.0909 29.8588C15.0909 30.5351 14.9665 31.1359 14.7179 31.6612C14.4692 32.1865 14.1021 32.6002 13.6168 32.9023C13.1314 33.201 12.5337 33.3504 11.8236 33.3504H9.53605V31.7797H11.5989C12.0124 31.7797 12.3509 31.6973 12.6146 31.5325C12.8782 31.3677 13.073 31.1411 13.1988 30.8527C13.3277 30.5643 13.3921 30.233 13.3921 29.8588C13.3921 29.4846 13.3277 29.155 13.1988 28.87C13.073 28.5851 12.8767 28.3636 12.6101 28.2057C12.3464 28.0443 12.0064 27.9636 11.5899 27.9636H10.0619V36.9141H8.39453Z"
                            stroke="white"
                            stroke-width="0.388888"
                          />
                          <path
                            d="M19.6581 36.9141H16.5391V26.3672H19.721C20.6348 26.3672 21.4198 26.5783 22.076 27.0006C22.7351 27.4195 23.2415 28.022 23.595 28.8082C23.9485 29.5944 24.1253 30.5351 24.1253 31.6303C24.1253 32.729 23.947 33.6731 23.5905 34.4627C23.237 35.2524 22.7261 35.8583 22.058 36.2806C21.3928 36.7029 20.5929 36.9141 19.6581 36.9141ZM18.2065 35.261H19.5772C20.2184 35.261 20.7532 35.1271 21.1816 34.8593C21.6101 34.5881 21.9321 34.1846 22.1479 33.6491C22.3636 33.11 22.4714 32.4371 22.4714 31.6303C22.4714 30.8235 22.3636 30.154 22.1479 29.6219C21.9321 29.0863 21.6131 28.6863 21.1906 28.422C20.7711 28.1542 20.2498 28.0203 19.6266 28.0203H18.2065V35.261Z"
                            stroke="white"
                            stroke-width="0.388888"
                          />
                          <path
                            d="M25.7095 36.9141V26.3672H31.6059V27.9688H27.3769V30.8321H31.2014V32.4337H27.3769V36.9141H25.7095Z"
                            stroke="white"
                            stroke-width="0.388888"
                          />
                        </svg>
                      </svg>
                      <div className="text-center text-red-500 font-bold">
                        {errorContent}
                      </div>
                    </div>
                  </div>

                  {/* File Status */}
                  <div className="flex flex-col h-full justify-between py-6">
                    <p className="text-black text-left dark:text-white">
                      {file.length > 0
                        ? `${
                            file.length
                          } files selected, Total size: ${getTotalFileSize().toFixed(
                            2
                          )} MB`
                        : "Drag your files here or click this area to upload."}
                    </p>
                    {file && !isUpload && (
                      <div className="flex justify-center items-start text-center">
                        <button
                          className="p-2 flex text-xs font-medium text-center text-white bg-[#7059F3] rounded-lg hover:bg-[#7059F3AA] focus:ring-4 focus:outline-none focus:ring-green-300"
                          type="submit"
                        >
                          <MdOutlineCloudUpload
                            style={{ fontSize: "18px" }}
                            className="mr-2"
                          />{" "}
                          Analyze
                        </button>
                        <button
                          className="p-2 flex text-xs font-medium text-center text-[#7059F3] bg-white border border-[#7059F3] rounded-lg hover:text-[#7059F3AA] hover:border-[#7059F3AA] focus:ring-4 focus:outline-none focus:ring-[#7059F3] ml-4 dark:bg-[#202938]"
                          type="button"
                          onClick={clearFile}
                        >
                          <MdClear
                            style={{ fontSize: "18px" }}
                            className="mr-2"
                          />{" "}
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </form>
            <div className="xl:flex justify-center hidden">
              <img
                src="/candidate_img.png"
                alt="Updated Image"
                className="max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UploadZoneComponent;
