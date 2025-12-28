import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideChatConfig } from 'ngx-support-chat';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideChatConfig({
      markdown: {
        enabled: true,
        displayMode: true,
        inputMode: true
      },
      dateFormat: 'MMM d, yyyy'
    })
  ]
};
