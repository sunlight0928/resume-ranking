import useAxios from "@/app/services/useAxios";

export const getListFileAxios = async (
  currentPage: number,
  pageSize: number
) => {
  const { data } = await useAxios.post("/list-candidate", {
    page_size: pageSize,
    page: currentPage,
  });
  return data;
};

export const getListFileDetailAxios = async (fileId: string) => {
  const { data } = await useAxios.get(`/candidate/${fileId}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return data;
};

export const getMatchingDetailAxios = async (
  candidateId: string,
  jobId: string
) => {
  const { data } = await useAxios.get(
    `/candidate/${candidateId}/job/${jobId}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return data;
};

export const uploadFileAxios = async (
  formData: FormData,
  setProgress: (progress: number) => void
) => {
  try {
    const { data } = await useAxios.post("/upload-cv", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        // Ensure progressEvent.total is not undefined
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted); // Update progress state
        } else {
          // Handle cases where total is undefined
          console.warn("progressEvent.total is undefined");
          setProgress(0); // Default to 0% or handle as needed
        }
      },
    });
    return data;
  } catch (error: any) {
    if (error.response) {
      // Backend responded with an error
      throw new Error(`Backend error: ${error.response.status}`);
    } else if (error.request) {
      // No response received from the server
      throw new Error("No response received from server.");
    } else {
      // Any other error
      throw new Error(`Unexpected error: ${error.message}`);
    }
  }
};

export const deleteFileAxios = async (fileId: string) => {
  const { data } = await useAxios.delete(`/candidate/${fileId}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return data;
};
