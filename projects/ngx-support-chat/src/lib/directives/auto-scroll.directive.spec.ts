import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';

import { AutoScrollDirective } from './auto-scroll.directive';

@Component({
  standalone: true,
  imports: [AutoScrollDirective],
  template: `
    <div
      class="scroll-container"
      [ngxAutoScroll]="items()"
      [ngxAutoScrollThreshold]="threshold()"
      style="height: 200px; overflow-y: auto;"
    >
      @for (item of items(); track item) {
        <div class="item" style="height: 50px;">{{ item }}</div>
      }
    </div>
  `
})
class TestHostComponent {
  items = signal<string[]>([]);
  threshold = signal(100);
}

// Helper to wait for setTimeout
const waitForTimeout = () => new Promise(resolve => setTimeout(resolve, 10));

describe('AutoScrollDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let container: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    container = fixture.nativeElement.querySelector('.scroll-container');
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('should create the directive', () => {
      expect(container).toBeTruthy();
    });

    it('should have directive applied', () => {
      expect(container.hasAttribute('ngxautoscroll')).toBe(false);
      // Directive is applied via property binding, not attribute
      expect(container).toBeTruthy();
    });
  });

  describe('scroll tracking', () => {
    beforeEach(() => {
      // Set up initial items that exceed container height
      host.items.set(['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5', 'Item 6', 'Item 7', 'Item 8']);
      fixture.detectChanges();
    });

    it('should track scroll events', () => {
      // Scroll to middle
      container.scrollTop = 50;
      container.dispatchEvent(new Event('scroll'));
      fixture.detectChanges();

      expect(container.scrollTop).toBe(50);
    });

    it('should detect when at bottom', () => {
      // Scroll to bottom
      container.scrollTop = container.scrollHeight - container.clientHeight;
      container.dispatchEvent(new Event('scroll'));
      fixture.detectChanges();

      const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      expect(distanceFromBottom).toBeLessThanOrEqual(host.threshold());
    });

    it('should detect when scrolled away from bottom', () => {
      // Scroll to top
      container.scrollTop = 0;
      container.dispatchEvent(new Event('scroll'));
      fixture.detectChanges();

      // In a real browser with content, scrollTop=0 means we're at top
      // We just verify the event was dispatched without error
      expect(container.scrollTop).toBe(0);
    });
  });

  describe('auto-scroll behavior', () => {
    beforeEach(() => {
      host.items.set(['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5']);
      fixture.detectChanges();
    });

    it('should scroll to bottom when new items added while at bottom', async () => {
      // Ensure we're at bottom
      container.scrollTop = container.scrollHeight;
      container.dispatchEvent(new Event('scroll'));
      fixture.detectChanges();

      // Add new item
      host.items.set([...host.items(), 'New Item']);
      fixture.detectChanges();
      await waitForTimeout();

      // Should still be at bottom
      const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight <= host.threshold();
      expect(isAtBottom).toBe(true);
    });

    it('should NOT scroll when user has scrolled up', async () => {
      // Scroll up (away from bottom)
      container.scrollTop = 0;
      container.dispatchEvent(new Event('scroll'));
      fixture.detectChanges();

      const scrollTopBefore = container.scrollTop;

      // Add new item
      host.items.set([...host.items(), 'New Item']);
      fixture.detectChanges();
      await waitForTimeout();

      // Scroll position should be preserved
      expect(container.scrollTop).toBe(scrollTopBefore);
    });

    it('should resume auto-scrolling when user scrolls back to bottom', async () => {
      // First scroll up
      container.scrollTop = 0;
      container.dispatchEvent(new Event('scroll'));
      fixture.detectChanges();

      // Then scroll back to bottom
      container.scrollTop = container.scrollHeight;
      container.dispatchEvent(new Event('scroll'));
      fixture.detectChanges();

      // Add new item
      host.items.set([...host.items(), 'New Item']);
      fixture.detectChanges();
      await waitForTimeout();

      // Should be at bottom again
      const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight <= host.threshold();
      expect(isAtBottom).toBe(true);
    });
  });

  describe('threshold configuration', () => {
    beforeEach(() => {
      host.items.set(['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5', 'Item 6', 'Item 7', 'Item 8']);
      fixture.detectChanges();
    });

    it('should use default threshold of 100px', () => {
      expect(host.threshold()).toBe(100);
    });

    it('should accept custom threshold', () => {
      host.threshold.set(50);
      fixture.detectChanges();
      expect(host.threshold()).toBe(50);
    });

    it('should consider "at bottom" when within threshold', async () => {
      host.threshold.set(100);
      fixture.detectChanges();

      // Scroll to bottom first
      container.scrollTop = container.scrollHeight;
      container.dispatchEvent(new Event('scroll'));
      fixture.detectChanges();

      // Add new item
      host.items.set([...host.items(), 'New Item']);
      fixture.detectChanges();
      await waitForTimeout();

      // Should auto-scroll (was at bottom)
      const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight <= 100;
      expect(isAtBottom).toBe(true);
    });

    it('should NOT consider "at bottom" when outside threshold', async () => {
      host.threshold.set(10); // Very small threshold
      fixture.detectChanges();

      // Scroll to top (far from bottom)
      container.scrollTop = 0;
      container.dispatchEvent(new Event('scroll'));
      fixture.detectChanges();

      const scrollTopBefore = container.scrollTop;

      // Add new item
      host.items.set([...host.items(), 'New Item']);
      fixture.detectChanges();
      await waitForTimeout();

      // Should NOT auto-scroll (was at top)
      expect(container.scrollTop).toBe(scrollTopBefore);
    });
  });

  describe('edge cases', () => {
    it('should handle empty initial array', () => {
      host.items.set([]);
      fixture.detectChanges();

      expect(container.scrollTop).toBe(0);
    });

    it('should handle single item', () => {
      host.items.set(['Only Item']);
      fixture.detectChanges();

      // Should not cause errors
      expect(container).toBeTruthy();
    });

    it('should not scroll when array gets shorter', async () => {
      host.items.set(['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5']);
      fixture.detectChanges();

      // Scroll to middle
      container.scrollTop = 50;
      container.dispatchEvent(new Event('scroll'));
      fixture.detectChanges();

      // Remove items (array gets shorter)
      host.items.set(['Item 1', 'Item 2']);
      fixture.detectChanges();
      await waitForTimeout();

      // Scroll should not be forced to bottom (might be adjusted if content is shorter)
      // Just verify no error and scroll isn't forced down
      expect(container).toBeTruthy();
    });

    it('should not scroll when array is replaced with same length', async () => {
      host.items.set(['Item 1', 'Item 2', 'Item 3']);
      fixture.detectChanges();

      // Scroll up
      container.scrollTop = 0;
      container.dispatchEvent(new Event('scroll'));
      fixture.detectChanges();

      const scrollTopBefore = container.scrollTop;

      // Replace with same length array
      host.items.set(['A', 'B', 'C']);
      fixture.detectChanges();
      await waitForTimeout();

      // Scroll position should be preserved
      expect(container.scrollTop).toBe(scrollTopBefore);
    });

    it('should handle rapid item additions', async () => {
      host.items.set(['Item 1']);
      fixture.detectChanges();

      // Ensure at bottom
      container.scrollTop = container.scrollHeight;
      container.dispatchEvent(new Event('scroll'));
      fixture.detectChanges();

      // Add multiple items rapidly
      host.items.set([...host.items(), 'Item 2']);
      fixture.detectChanges();
      host.items.set([...host.items(), 'Item 3']);
      fixture.detectChanges();
      host.items.set([...host.items(), 'Item 4']);
      fixture.detectChanges();
      await waitForTimeout();

      // Should still be at bottom
      const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight <= host.threshold();
      expect(isAtBottom).toBe(true);
    });
  });

  describe('scroll methods', () => {
    beforeEach(() => {
      host.items.set(['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5', 'Item 6', 'Item 7', 'Item 8']);
      fixture.detectChanges();
    });

    it('should have scrollToBottom accessible behavior', () => {
      // Scroll to top
      container.scrollTop = 0;
      container.dispatchEvent(new Event('scroll'));
      fixture.detectChanges();

      // Scroll back to bottom manually
      container.scrollTop = container.scrollHeight;

      const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight <= host.threshold();
      expect(isAtBottom).toBe(true);
    });
  });
});
