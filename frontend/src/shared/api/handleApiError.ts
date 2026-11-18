import { AxiosError } from 'axios';

interface FastApiValidationItem {
  msg: string;
}

interface FastApiErrorBody {
  detail?: string | FastApiValidationItem[];
}

export function handleApiError(error: unknown, fallback = 'Ocurrió un error inesperado'): string {
  if (error instanceof AxiosError) {
    const detail = (error.response?.data as FastApiErrorBody | undefined)?.detail;
    if (typeof detail === 'string') {
      return detail;
    }
    if (Array.isArray(detail) && detail.length > 0) {
      return detail.map((d) => d.msg).join(', ');
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}