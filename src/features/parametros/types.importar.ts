export type PreviewRowStatus = "ok" | "warn" | "error";

export interface PreviewRow {
  rowNum: number;
  data: Record<string, string>;
  status: PreviewRowStatus;
  message?: string;
}

export interface PreviewSummary {
  total: number;
  ok: number;
  warn: number;
  error: number;
}

export interface ServerPreviewDTO {
  rows: Array<{ rowNum: number; status: PreviewRowStatus; message?: string; data: Record<string,string> }>;
  totals: PreviewSummary;
}
