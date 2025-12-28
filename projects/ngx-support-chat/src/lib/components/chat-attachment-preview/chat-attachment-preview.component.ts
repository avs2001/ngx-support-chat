import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Attachment } from '../../../models/attachment.model';

/**
 * Displays a horizontal row of attachment preview chips.
 *
 * Shows image thumbnails for image files and file icons for other types.
 * Each chip displays the filename (truncated), upload progress if applicable,
 * and a remove button.
 *
 * @example
 * ```html
 * <ngx-chat-attachment-preview
 *   [attachments]="pendingAttachments()"
 *   (attachmentRemove)="onRemoveAttachment($event)"
 * />
 * ```
 */
@Component({
  selector: 'ngx-chat-attachment-preview',
  standalone: true,
  templateUrl: './chat-attachment-preview.component.html',
  styleUrl: './chat-attachment-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatAttachmentPreviewComponent {
  /** List of attachments to preview */
  readonly attachments = input.required<Attachment[]>();

  /** Emitted when the remove button is clicked for an attachment */
  readonly attachmentRemove = output<Attachment>();

  /**
   * Check if the attachment is an image based on file type.
   */
  isImage(attachment: Attachment): boolean {
    return attachment.file.type.startsWith('image/');
  }

  /**
   * Get an icon character based on file type.
   */
  getFileIcon(attachment: Attachment): string {
    const type = attachment.file.type;

    if (type.startsWith('video/')) {
      return '\uD83C\uDFA5'; // Video camera emoji
    }
    if (type.startsWith('audio/')) {
      return '\uD83C\uDFB5'; // Musical note emoji
    }
    if (type.includes('pdf')) {
      return '\uD83D\uDCC4'; // Document emoji
    }
    if (type.includes('zip') || type.includes('archive') || type.includes('compressed')) {
      return '\uD83D\uDCE6'; // Package emoji
    }
    if (type.includes('text') || type.includes('document')) {
      return '\uD83D\uDCC3'; // Document with text emoji
    }

    return '\uD83D\uDCCE'; // Paperclip emoji (default)
  }

  /**
   * Truncate filename to specified max length with ellipsis.
   */
  truncateFilename(filename: string, maxLength: number): string {
    if (filename.length <= maxLength) {
      return filename;
    }

    const extension = filename.lastIndexOf('.');
    if (extension > 0 && filename.length - extension <= 5) {
      // Preserve extension for short extensions (e.g., .pdf, .jpg)
      const ext = filename.slice(extension);
      const name = filename.slice(0, maxLength - ext.length - 3);
      return `${name}...${ext}`;
    }

    return filename.slice(0, maxLength - 3) + '...';
  }

  /**
   * Handle remove button click.
   */
  onRemove(attachment: Attachment): void {
    this.attachmentRemove.emit(attachment);
  }
}
