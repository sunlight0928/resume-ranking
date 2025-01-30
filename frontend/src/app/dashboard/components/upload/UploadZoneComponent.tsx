"use client";
import React, { ChangeEvent, useState } from "react";
import { FaRegFilePdf } from "react-icons/fa";
import Image from "next/image";
import { Button, Typography, CircularProgress, Box } from "@mui/material";
import { useUploadFileData } from "@/app/hooks/react-query/management/file/useFilesUploadData";
import { ToastContainer, toast } from "react-toastify";
import { MdOutlineCloudUpload, MdClear } from "react-icons/md";
import { useDebouncedCallback } from "use-debounce";

type Props = {
  refetch: () => void;
};

const UploadZoneComponent = (props: Props) => {
  const [file, setFile] = useState<File[] | []>([]);
  const [errorContent, setErrorContent] = useState<string | null>(null);
  const [isUpload, setIsUpload] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const { mutate: uploadFile } = useUploadFileData(setUploadProgress);
  const debouncedRefetch = useDebouncedCallback(props.refetch, 1000); // Wait 1 second before refetching

  // Submit upload
  const handleSubmitUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  
    if (file.length === 0) {
      toast.warning("No files selected to upload.");
      return;
    }
  
    setIsUpload(true);
    setUploadProgress(0);
  
    await uploadFile(
      { files: file }, // Pass files as part of the mutation arguments
      {
        onSuccess: async (response) => {
          setFile([]);
          props.refetch();
        
          // Display toast messages for each file
          toast.success("Upload file success");
        
          setIsUpload(false);
          setUploadProgress(0);
        },
        onError: (error: any) => {
          if (error.response) {
            console.log("Upload error:", error.response.status);
            if (error.response.status === 400) {
              setErrorContent("File is duplicate");
              toast.warning("File is duplicate");
            } else {
              setErrorContent("Upload file failed");
              toast.error("Upload file failed");
            }
          } else {
            console.error("Unknown error:", error);
            toast.error("An unexpected error occurred");
          }
          setIsUpload(false);
          setUploadProgress(0);
        },
      }
    );
  };


  const handleChangeUploadFile = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    const newFile = [...file];
  
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
  
    if (selectedFiles) {
      for (let i = 0; i < selectedFiles.length; i++) {
        const currentFile = selectedFiles[i];
  
        // Validate file type
        if (!["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(currentFile.type)) {
          toast.error(`File "${currentFile.name}" is not a valid PDF or DOCX file.`);
          continue;
        }
  
        // Validate file size
        if (currentFile.size > MAX_FILE_SIZE) {
          toast.error(`File "${currentFile.name}" exceeds the maximum size of 5 MB.`);
          continue;
        }
  
        // Prevent adding duplicate files
        if (!newFile.some((f) => f.name === currentFile.name && f.size === currentFile.size)) {
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
        if (!newFile.some((f) => f.name === currentFile.name && f.size === currentFile.size)) {
          newFile.push(currentFile);
        }
      }
      setFile(newFile);
    }
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
      <div id="upload-zone">
        <div className="bg-white dark:bg-gray-400 rounded w-full mx-auto">
          <div className="relative flex flex-col p-4 text-gray-400 border border-gray-200 rounded">
            <form onSubmit={handleSubmitUpload}>
              {isUpload ? (
                <div className="flex flex-col items-center justify-center">
                  <Box position="relative" display="inline-flex">
                    <CircularProgress
                      variant="determinate"
                      value={uploadProgress}
                      size={80}
                      thickness={4}
                      style={{ color: "#4A90E2" }}
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
                        style={{ color: "#4A90E2", fontWeight: "bold" }}
                      >
                        {`${Math.round(uploadProgress)}%`}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography
                    variant="body1"
                    className="text-center mt-4 text-gray-600"
                  >
                    {uploadProgress === 100
                      ? "Please wait a moment"
                      : "Uploading..."}
                  </Typography>
                </div>
              ) : (
                <>
                  <div 
                    className={`relative flex flex-col items-center justify-center p-0 border-2 ${
                      isDragging ? "border-blue-500 bg-blue-100" : "border-gray-300"
                    } border-dashed rounded-lg transition-all`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleFileDrop}>
                  <input
                    accept=".pdf,.docx"
                    type="file"
                    className="absolute inset-0 z-50 w-full h-full p-0 m-0 outline-none opacity-0 cursor-pointer"
                    onChange={handleChangeUploadFile}
                    id="file-input"
                    multiple // Ensures multiple files are accepted
                  />

                    <div className="flex flex-row items-center justify-center py-10 text-center z-10">
                    {file.length > 0 ? (
                      <div className="flex flex-wrap gap-4">
                        {file.map((file, index) => (
                          <div
                            key={index}
                            className="flex flex-col items-center justify-center border rounded-lg p-2 shadow-md w-40"
                          >
                            <Image
                              src="/media/svg/file-icon.svg"
                              alt="File Upload"
                              width={50}
                              height={50}
                            />
                            <Typography
                              variant="body2"
                              className="text-center mt-2 truncate w-full"
                            >
                              {file.name}
                            </Typography>
                            <Typography variant="caption" className="text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </Typography>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <FaRegFilePdf className="text-gray-500 w-8 h-8" />
                        <p className="text-gray-500 text-center">
                          Drag your files here or click this area to upload.
                        </p>
                      </div>
                    )}
                      <div className="text-center text-red-500 font-bold">
                        {errorContent}
                      </div>
                    </div>
                  </div>
                </>
              )}
              {file && !isUpload && (
                <div className="pt-4 flex justify-center items-start text-center">
                  <button
                    className="p-2 flex text-xs font-medium text-center text-white bg-green-500 rounded-lg hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:bg-green-600 dark:hover-bg-green-700 dark:focus:ring-green-800"
                    type="submit"
                  >
                    <MdOutlineCloudUpload
                      style={{ fontSize: "18px" }}
                      className="mr-2"
                    />{" "}
                    Upload
                  </button>
                  <button
                    className="p-2 flex text-xs font-medium text-center text-white bg-red-500 rounded-lg hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800 ml-4"
                    type="button"
                    onClick={clearFile}
                  >
                    <MdClear style={{ fontSize: "18px" }} className="mr-2" />{" "}
                    Clear
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default UploadZoneComponent;
