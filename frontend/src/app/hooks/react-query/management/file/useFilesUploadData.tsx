import {
  useQuery,
  UseQueryResult,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import {
  getListFileAxios,
  getMatchingDetailAxios,
  uploadFileAxios,
  getListFileDetailAxios,
  deleteFileAxios,
} from "@/app/services/dashboard/managements/files/filesService";

export function useListCandidateData(
  currentPage: number,
  pageSize: number
): UseQueryResult<CandidateResponseModel> {
  return useQuery(
    ["list-candidate-data", currentPage, pageSize],
    () => getListFileAxios(currentPage, pageSize),
    { keepPreviousData: true }
  );
}

export function useUploadFileData(setProgress: (progress: number) => void) {
  return useMutation(({ files }: { files: File[] }) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("file_upload", file);
    });

    return uploadFileAxios(formData, setProgress); // Pass formData and setProgress correctly
  });
}

export function useListFileDetailData(
  fileId: string
): UseQueryResult<CandidateDetailModel> {
  return useQuery(
    ["list-candidate-detail"],
    () => getListFileDetailAxios(fileId),
    { enabled: false }
  );
}

export function useMatchingDetailData(
  candidateId: string,
  jobId: string
): UseQueryResult<MatchingDetailModel> {
  return useQuery(
    ["matching-detail"],
    () => getMatchingDetailAxios(candidateId, jobId),
    { enabled: false }
  );
}

export function useDeleteFileData(fileId: string): UseMutationResult<any> {
  return useMutation(["files-delete"], () => deleteFileAxios(fileId));
}
