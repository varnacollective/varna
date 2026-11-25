/** Files a supplier list can come in. Shared by the upload page and its API. */

export const ACCEPTED_FILE = /\.(xlsx|xlsm|xls|ods|csv|tsv|txt|pdf|png|jpe?g|webp|heic|heif)$/i;

export const ACCEPT_ATTRIBUTE =
  ".xlsx,.xlsm,.xls,.ods,.csv,.tsv,.txt,.pdf,.png,.jpg,.jpeg,.webp,.heic,.heif";

export const MAX_FILES = 20;

/** The most the reader accepts for one file (the AI's limit for PDFs and photos). */
export const MAX_FILE_BYTES = 15 * 1024 * 1024;

/** Private storage bucket for the original files. */
export const UPLOAD_BUCKET = "list-uploads";
