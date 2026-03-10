import axios from "axios";

type ErrorBody = {
  message?: string;
  error?: string;
};

export const extractApiErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ErrorBody | string | undefined;
    if (typeof data === "string" && data.trim()) {
      return data;
    }
    if (data && typeof data === "object") {
      if (typeof data.message === "string" && data.message.trim()) {
        return data.message;
      }
      if (typeof data.error === "string" && data.error.trim()) {
        return data.error;
      }
    }
    if (error.message) {
      return error.message;
    }
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
};
