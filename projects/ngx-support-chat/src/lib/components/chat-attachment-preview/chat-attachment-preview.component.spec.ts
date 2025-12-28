import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';

import { ChatAttachmentPreviewComponent } from './chat-attachment-preview.component';
import { Attachment } from '../../../models/attachment.model';

// Test host component for input binding
@Component({
  standalone: true,
  imports: [ChatAttachmentPreviewComponent],
  template: ` <ngx-chat-attachment-preview [attachments]="attachments()" (attachmentRemove)="onRemove($event)" /> `
})
class TestHostComponent {
  attachments = signal<Attachment[]>([]);
  removedAttachment: Attachment | null = null;

  onRemove(attachment: Attachment): void {
    this.removedAttachment = attachment;
  }
}

// Helper to create mock attachment
function createMockAttachment(overrides: Partial<Attachment> = {}): Attachment {
  const mockFile = new File(['test content'], 'test-file.txt', { type: 'text/plain' });
  return {
    id: 'attachment-1',
    file: mockFile,
    ...overrides
  };
}

function createMockImageAttachment(overrides: Partial<Attachment> = {}): Attachment {
  const mockFile = new File(['image data'], 'photo.jpg', { type: 'image/jpeg' });
  return {
    id: 'attachment-img',
    file: mockFile,
    previewUrl: 'data:image/jpeg;base64,test',
    ...overrides
  };
}

describe('ChatAttachmentPreviewComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('rendering', () => {
    it('should create the component', () => {
      expect(fixture.nativeElement.querySelector('ngx-chat-attachment-preview')).toBeTruthy();
    });

    it('should not render chips container when attachments is empty', () => {
      host.attachments.set([]);
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.attachment-chips');
      expect(container).toBeNull();
    });

    it('should render chips container when attachments exist', () => {
      host.attachments.set([createMockAttachment()]);
      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector('.attachment-chips');
      expect(container).toBeTruthy();
    });

    it('should render one chip per attachment', () => {
      host.attachments.set([
        createMockAttachment({ id: '1' }),
        createMockAttachment({ id: '2' }),
        createMockAttachment({ id: '3' })
      ]);
      fixture.detectChanges();

      const chips = fixture.nativeElement.querySelectorAll('.chip');
      expect(chips.length).toBe(3);
    });
  });

  describe('image previews', () => {
    it('should show image preview for image attachments', () => {
      host.attachments.set([createMockImageAttachment()]);
      fixture.detectChanges();

      const img = fixture.nativeElement.querySelector('.chip__preview');
      expect(img).toBeTruthy();
      expect(img.src).toContain('data:image/jpeg');
    });

    it('should set alt text to filename', () => {
      host.attachments.set([createMockImageAttachment()]);
      fixture.detectChanges();

      const img = fixture.nativeElement.querySelector('.chip__preview');
      expect(img.alt).toBe('photo.jpg');
    });

    it('should not show image preview when no previewUrl', () => {
      const imgFile = new File(['img'], 'photo.jpg', { type: 'image/jpeg' });
      host.attachments.set([{ id: '1', file: imgFile }]);
      fixture.detectChanges();

      const img = fixture.nativeElement.querySelector('.chip__preview');
      expect(img).toBeNull();
    });
  });

  describe('file icons', () => {
    it('should show icon for non-image files', () => {
      host.attachments.set([createMockAttachment()]);
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('.chip__icon');
      expect(icon).toBeTruthy();
    });

    it('should show video icon for video files', () => {
      const videoFile = new File(['video'], 'video.mp4', { type: 'video/mp4' });
      host.attachments.set([{ id: '1', file: videoFile }]);
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('.chip__icon');
      expect(icon.textContent).toBe('\uD83C\uDFA5');
    });

    it('should show audio icon for audio files', () => {
      const audioFile = new File(['audio'], 'song.mp3', { type: 'audio/mpeg' });
      host.attachments.set([{ id: '1', file: audioFile }]);
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('.chip__icon');
      expect(icon.textContent).toBe('\uD83C\uDFB5');
    });

    it('should show document icon for PDF files', () => {
      const pdfFile = new File(['pdf'], 'doc.pdf', { type: 'application/pdf' });
      host.attachments.set([{ id: '1', file: pdfFile }]);
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('.chip__icon');
      expect(icon.textContent).toBe('\uD83D\uDCC4');
    });

    it('should show package icon for zip files', () => {
      const zipFile = new File(['zip'], 'archive.zip', { type: 'application/zip' });
      host.attachments.set([{ id: '1', file: zipFile }]);
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('.chip__icon');
      expect(icon.textContent).toBe('\uD83D\uDCE6');
    });

    it('should show default icon for unknown file types', () => {
      const unknownFile = new File(['data'], 'file.xyz', { type: 'application/octet-stream' });
      host.attachments.set([{ id: '1', file: unknownFile }]);
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('.chip__icon');
      expect(icon.textContent).toBe('\uD83D\uDCCE');
    });
  });

  describe('filename display', () => {
    it('should display filename', () => {
      host.attachments.set([createMockAttachment()]);
      fixture.detectChanges();

      const filename = fixture.nativeElement.querySelector('.chip__filename');
      expect(filename.textContent).toBe('test-file.txt');
    });

    it('should truncate long filenames', () => {
      const longFile = new File(['data'], 'this-is-a-very-long-filename-that-should-be-truncated.pdf', {
        type: 'application/pdf'
      });
      host.attachments.set([{ id: '1', file: longFile }]);
      fixture.detectChanges();

      const filename = fixture.nativeElement.querySelector('.chip__filename');
      expect(filename.textContent.length).toBeLessThanOrEqual(20);
      expect(filename.textContent).toContain('...');
    });

    it('should preserve extension when truncating', () => {
      const longFile = new File(['data'], 'very-long-filename.pdf', { type: 'application/pdf' });
      host.attachments.set([{ id: '1', file: longFile }]);
      fixture.detectChanges();

      const filename = fixture.nativeElement.querySelector('.chip__filename');
      expect(filename.textContent).toContain('.pdf');
    });
  });

  describe('progress indicator', () => {
    it('should show progress bar when uploadProgress is defined and < 100', () => {
      host.attachments.set([createMockAttachment({ uploadProgress: 50 })]);
      fixture.detectChanges();

      const progress = fixture.nativeElement.querySelector('.chip__progress');
      expect(progress).toBeTruthy();
      expect(progress.value).toBe(50);
    });

    it('should not show progress bar when uploadProgress is 100', () => {
      host.attachments.set([createMockAttachment({ uploadProgress: 100 })]);
      fixture.detectChanges();

      const progress = fixture.nativeElement.querySelector('.chip__progress');
      expect(progress).toBeNull();
    });

    it('should not show progress bar when uploadProgress is undefined', () => {
      host.attachments.set([createMockAttachment()]);
      fixture.detectChanges();

      const progress = fixture.nativeElement.querySelector('.chip__progress');
      expect(progress).toBeNull();
    });

    it('should update progress bar value', () => {
      host.attachments.set([createMockAttachment({ id: '1', uploadProgress: 25 })]);
      fixture.detectChanges();

      let progress = fixture.nativeElement.querySelector('.chip__progress');
      expect(progress.value).toBe(25);

      host.attachments.set([createMockAttachment({ id: '1', uploadProgress: 75 })]);
      fixture.detectChanges();

      progress = fixture.nativeElement.querySelector('.chip__progress');
      expect(progress.value).toBe(75);
    });
  });

  describe('remove button', () => {
    it('should render remove button for each chip', () => {
      host.attachments.set([createMockAttachment()]);
      fixture.detectChanges();

      const removeBtn = fixture.nativeElement.querySelector('.chip__remove');
      expect(removeBtn).toBeTruthy();
    });

    it('should have accessible label', () => {
      host.attachments.set([createMockAttachment()]);
      fixture.detectChanges();

      const removeBtn = fixture.nativeElement.querySelector('.chip__remove');
      expect(removeBtn.getAttribute('aria-label')).toBe('Remove test-file.txt');
    });

    it('should emit attachmentRemove when clicked', () => {
      const attachment = createMockAttachment();
      host.attachments.set([attachment]);
      fixture.detectChanges();

      const removeBtn = fixture.nativeElement.querySelector('.chip__remove');
      removeBtn.click();

      expect(host.removedAttachment).toBe(attachment);
    });

    it('should emit correct attachment when multiple exist', () => {
      const attachment1 = createMockAttachment({ id: '1' });
      const attachment2 = createMockAttachment({ id: '2' });
      const attachment3 = createMockAttachment({ id: '3' });
      host.attachments.set([attachment1, attachment2, attachment3]);
      fixture.detectChanges();

      const removeBtns = fixture.nativeElement.querySelectorAll('.chip__remove');
      removeBtns[1].click(); // Click second attachment's remove button

      expect(host.removedAttachment).toBe(attachment2);
    });
  });

  describe('component methods', () => {
    let component: ChatAttachmentPreviewComponent;

    beforeEach(() => {
      const componentFixture = TestBed.createComponent(ChatAttachmentPreviewComponent);
      componentFixture.componentRef.setInput('attachments', []);
      component = componentFixture.componentInstance;
    });

    describe('isImage', () => {
      it('should return true for image/jpeg', () => {
        const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
        expect(component.isImage({ id: '1', file })).toBe(true);
      });

      it('should return true for image/png', () => {
        const file = new File([''], 'test.png', { type: 'image/png' });
        expect(component.isImage({ id: '1', file })).toBe(true);
      });

      it('should return true for image/gif', () => {
        const file = new File([''], 'test.gif', { type: 'image/gif' });
        expect(component.isImage({ id: '1', file })).toBe(true);
      });

      it('should return false for non-image types', () => {
        const file = new File([''], 'test.pdf', { type: 'application/pdf' });
        expect(component.isImage({ id: '1', file })).toBe(false);
      });
    });

    describe('truncateFilename', () => {
      it('should not truncate short filenames', () => {
        expect(component.truncateFilename('short.txt', 20)).toBe('short.txt');
      });

      it('should truncate long filenames with ellipsis', () => {
        const result = component.truncateFilename('this-is-a-very-long-filename.txt', 20);
        expect(result.length).toBeLessThanOrEqual(20);
        expect(result).toContain('...');
      });

      it('should preserve short extensions', () => {
        const result = component.truncateFilename('verylongfilename.pdf', 15);
        expect(result).toContain('.pdf');
      });

      it('should handle filenames without extension', () => {
        const result = component.truncateFilename('verylongfilenamewithnoextension', 20);
        expect(result.length).toBe(20);
        expect(result).toContain('...');
      });
    });
  });
});
