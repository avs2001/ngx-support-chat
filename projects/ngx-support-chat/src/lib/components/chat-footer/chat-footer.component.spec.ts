import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatFooterComponent } from './chat-footer.component';
import { Attachment } from '../../../models/public-api';

describe('ChatFooterComponent', () => {
  describe('Component Creation', () => {
    let component: ChatFooterComponent;
    let fixture: ComponentFixture<ChatFooterComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [ChatFooterComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(ChatFooterComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('Inputs', () => {
    let component: ChatFooterComponent;
    let fixture: ComponentFixture<ChatFooterComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [ChatFooterComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(ChatFooterComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should have empty pendingAttachments by default', () => {
      expect(component.pendingAttachments()).toEqual([]);
    });

    it('should accept pendingAttachments input', () => {
      const attachments: Attachment[] = [
        { id: 'a1', file: new File([''], 'test.txt') },
      ];
      fixture.componentRef.setInput('pendingAttachments', attachments);
      fixture.detectChanges();
      expect(component.pendingAttachments()).toEqual(attachments);
    });

    it('should have empty inputValue by default', () => {
      expect(component.inputValue()).toBe('');
    });

    it('should accept inputValue input', () => {
      fixture.componentRef.setInput('inputValue', 'Hello');
      fixture.detectChanges();
      expect(component.inputValue()).toBe('Hello');
    });

    it('should allow setting inputValue programmatically', () => {
      component.inputValue.set('New message');
      expect(component.inputValue()).toBe('New message');
    });

    it('should have false disabled by default', () => {
      expect(component.disabled()).toBe(false);
    });

    it('should accept disabled input', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      expect(component.disabled()).toBe(true);
    });

    it('should have false hasContent by default', () => {
      expect(component.hasContent()).toBe(false);
    });

    it('should accept hasContent input', () => {
      fixture.componentRef.setInput('hasContent', true);
      fixture.detectChanges();
      expect(component.hasContent()).toBe(true);
    });
  });

  describe('Outputs', () => {
    let component: ChatFooterComponent;
    let fixture: ComponentFixture<ChatFooterComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [ChatFooterComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(ChatFooterComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should have messageSend output', () => {
      expect(component.messageSend).toBeDefined();
    });

    it('should have attachmentSelect output', () => {
      expect(component.attachmentSelect).toBeDefined();
    });

    it('should have attachmentRemove output', () => {
      expect(component.attachmentRemove).toBeDefined();
    });
  });

  describe('Content Projection', () => {
    @Component({
      template: `
        <ngx-chat-footer>
          <button chatFooterPrefix class="prefix-btn">Emoji</button>
          <button chatFooterActions class="action-btn">Send</button>
        </ngx-chat-footer>
      `,
      imports: [ChatFooterComponent],
    })
    class TestHostComponent {}

    let hostFixture: ComponentFixture<TestHostComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TestHostComponent],
      }).compileComponents();

      hostFixture = TestBed.createComponent(TestHostComponent);
      hostFixture.detectChanges();
    });

    it('should project chatFooterPrefix content', () => {
      const prefixBtn = hostFixture.nativeElement.querySelector('.prefix-btn');
      expect(prefixBtn).toBeTruthy();
      expect(prefixBtn.textContent).toBe('Emoji');
    });

    it('should project chatFooterActions content', () => {
      const actionBtn = hostFixture.nativeElement.querySelector('.action-btn');
      expect(actionBtn).toBeTruthy();
      expect(actionBtn.textContent).toBe('Send');
    });
  });

  describe('Layout Structure', () => {
    let fixture: ComponentFixture<ChatFooterComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [ChatFooterComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(ChatFooterComponent);
      fixture.detectChanges();
    });

    it('should have footer-container element', () => {
      const container = fixture.nativeElement.querySelector('.footer-container');
      expect(container).toBeTruthy();
    });

    it('should have footer-prefix element', () => {
      const prefix = fixture.nativeElement.querySelector('.footer-prefix');
      expect(prefix).toBeTruthy();
    });

    it('should have footer-content element', () => {
      const content = fixture.nativeElement.querySelector('.footer-content');
      expect(content).toBeTruthy();
    });

    it('should have footer-actions element', () => {
      const actions = fixture.nativeElement.querySelector('.footer-actions');
      expect(actions).toBeTruthy();
    });
  });

  describe('Attachment Previews', () => {
    let fixture: ComponentFixture<ChatFooterComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [ChatFooterComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(ChatFooterComponent);
      fixture.detectChanges();
    });

    it('should show attachment-previews when attachments exist', () => {
      const attachments: Attachment[] = [
        { id: 'a1', file: new File([''], 'test.txt') },
      ];
      fixture.componentRef.setInput('pendingAttachments', attachments);
      fixture.detectChanges();

      const previews = fixture.nativeElement.querySelector('.attachment-previews');
      expect(previews).toBeTruthy();
    });

    it('should not show attachment-previews when no attachments', () => {
      fixture.componentRef.setInput('pendingAttachments', []);
      fixture.detectChanges();

      const previews = fixture.nativeElement.querySelector('.attachment-previews');
      expect(previews).toBeFalsy();
    });
  });
});
