import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ErrorHandler, Injectable, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule, MatCardModule, MatCheckboxModule, MatGridListModule, MatInputModule, MatFormFieldModule, MatSelectModule, MatSnackBarModule, MatStepperModule, MatToolbarModule } from '@angular/material';
import { Y2mComponent } from './y2m/y2m.component';
import { CoreModule } from './core/core.module';
import * as Sentry from '@sentry/browser'
import { RewriteFrames } from '@sentry/integrations'

Sentry.init({
     dsn: 'https://a0af7c395e724a589e9a0aa85c3dd255@sentry.io/1797909',
     release: 'https://a0af7c395e724a589e9a0aa85c3dd255@sentry.io/1797909',
     integrations: [
       new RewriteFrames(),
     ],
   });
   
   @Injectable()
   export class SentryErrorHandler implements ErrorHandler {
     constructor() {}
     handleError(error) {
       Sentry.captureException(error.originalError || error);
       console.error(error)
     }
   }

@NgModule({
     declarations: [
          Y2mComponent
     ],
     imports: [
          BrowserModule,
          BrowserAnimationsModule,
          CoreModule,
          FormsModule,
          MatButtonModule,
          MatCardModule,
          MatCheckboxModule,
          MatFormFieldModule,
          MatGridListModule,
          MatInputModule,
          MatSelectModule,
          MatSnackBarModule,
          MatStepperModule,
          MatToolbarModule,
     ],
     providers: [{ provide: ErrorHandler, useClass: SentryErrorHandler }],
     bootstrap: [Y2mComponent]
})

export class AppModule { }
