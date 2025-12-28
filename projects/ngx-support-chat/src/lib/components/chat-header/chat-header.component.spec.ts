import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatHeaderComponent } from './chat-header.component';

describe('ChatHeaderComponent', () => {
  describe('Component Creation', () => {
    let component: ChatHeaderComponent;
    let fixture: ComponentFixture<ChatHeaderComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [ChatHeaderComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(ChatHeaderComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have display block', () => {
      const hostElement = fixture.nativeElement;
      const computedStyle = window.getComputedStyle(hostElement);
      expect(computedStyle.display).toBe('block');
    });
  });

  describe('Content Projection', () => {
    @Component({
      template: `
        <ngx-chat-header>
          <span class="test-content">Header Title</span>
        </ngx-chat-header>
      `,
      imports: [ChatHeaderComponent]
    })
    class TestHostComponent {}

    let hostFixture: ComponentFixture<TestHostComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TestHostComponent]
      }).compileComponents();

      hostFixture = TestBed.createComponent(TestHostComponent);
      hostFixture.detectChanges();
    });

    it('should project content', () => {
      const content = hostFixture.nativeElement.querySelector('.test-content');
      expect(content).toBeTruthy();
      expect(content.textContent).toBe('Header Title');
    });
  });
});
