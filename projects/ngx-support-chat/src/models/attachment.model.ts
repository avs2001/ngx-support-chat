/**
 * Attachment interface for files being uploaded.
 */

/**
 * Represents a file attachment being prepared for sending.
 */
export interface Attachment {
  /** Unique identifier for this attachment */
  id: string;
  /** The file object */
  file: File;
  /** Preview URL for images (data URL or blob URL) */
  previewUrl?: string;
  /** Upload progress percentage (0-100) */
  uploadProgress?: number;
}
