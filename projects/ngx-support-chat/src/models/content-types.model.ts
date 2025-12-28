/**
 * Content type interfaces for chat messages.
 * Each message type has its own content structure.
 */

/**
 * Text message content.
 * Supports plain text or markdown based on configuration.
 */
export interface TextContent {
  /** The text content, plain or markdown */
  text: string;
}

/**
 * Image message content.
 * Includes thumbnail for preview and full URL for viewing.
 */
export interface ImageContent {
  /** URL for thumbnail preview */
  thumbnailUrl: string;
  /** URL for full-size image */
  fullUrl: string;
  /** Alt text for accessibility */
  altText?: string;
  /** Image width in pixels */
  width?: number;
  /** Image height in pixels */
  height?: number;
}

/**
 * File attachment content.
 * For non-image file attachments.
 */
export interface FileContent {
  /** Original file name */
  fileName: string;
  /** File size in bytes */
  fileSize?: number;
  /** MIME type or file extension */
  fileType: string;
  /** URL to download the file */
  downloadUrl: string;
  /** Optional custom icon identifier */
  icon?: string;
}

/**
 * System message content.
 * For automated messages like "Chat started", "Agent joined".
 */
export interface SystemContent {
  /** System message text */
  text: string;
}

/**
 * Union type for all content types.
 */
export type MessageContent = TextContent | ImageContent | FileContent | SystemContent;
