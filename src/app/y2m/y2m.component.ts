/*
     TODO:
     Before publishing make sure proxy.conf doesn't have my server address and make sure php doesn't have it either

     See if you can get more than artist & title from Python script

     CHANGES:

     Added missing downloadStarted=true in this.downloadLinkClicked()
     Rewrote logic in fieldIsHidden() to use array of fields that need to be hidden
     Did tslist check on this component
     Removed unused component property allowDeleting
     Updated README
*/

import { Component, OnInit } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { DataService } from '../core/data.service';

@Component({
     selector: 'app-y2m',
     templateUrl: './y2m.component.html',
     styleUrls: ['./y2m.component.css']
})

export class Y2mComponent implements OnInit {
     allowMoveToServer = true;
     currentFormat = '320k';
     currentStep = 0;
     downloadLink = '';
     downloadLinkVisible = false;
     downloadStarted = false;
     fields: any = {
          URL: { // This field shouldn't ever be disabled
               Required: true,
               Value: this.getParam('URL'),
          },
          Artist: {
               Required: true,
               Value: this.getParam('Artist'),
               Disabled: false
          },
          Album: {
               Required: false,
               Value: this.getParam('Album'),
               Disabled: false
          },
          Name: {
               Required: true,
               Value: this.getParam('Title'),
               Disabled: false
          },
          TrackNum: {
               Required: false,
               Value: this.getParam('TrackNum') || null,
               Disabled: false
          },
          Genre: {
               Required: false,
               Value: this.getParam('Genre'),
               Disabled: false
          },
          Year: {
               Required: false,
               Value: this.getParam('Year'),
               Disabled: false
          }
     };
     readonly fieldKeys = Object.keys(this.fields); // Used in HTML template
     fileName = '';
     formats: any = { 'Audio: aac' : 'aac',
                      'Audio: flac' : 'flac',
                      'Audio: m4a' : 'm4a',
                      'Audio: mp3 128k' : '128k',
                      'Audio: mp3 192k' : '192k',
                      'Audio: mp3 256k' : '256k',
                      'Audio: mp3 320k' : '320k',
                      'Audio: mp3 VBR 0 (Best)' : '0',
                      'Audio: mp3 VBR (5) (OK)' : '5',
                      'Audio: mp3 VBR (9) (Worst)' : '9',
                      'Audio: opus' : 'opus',
                      'Audio: vorbis' : 'vorbis',
                      'Audio: wav' : 'wav',
                      'Video: avi' : 'avi',
                      'Video: flv': 'flv',
                      'Video: mkv' : 'mkv',
                      'Video: mp4' : 'mp4',
                      'Video: ogg' : 'ogg',
                      'Video: webm' : 'webm'
                    };
     readonly formatKeys = Object.keys(this.formats);
     isFinished = false;
     isSubmitted = false;
     moveToServer = false;
     saveValues = false;
     stepperStepNames = ['Started download', 'Finished download', 'Writing ID3 Tags'];
     statusMessage = 'Fields marked with an * are required';
     readonly validFormatValues = Object.values(this.formats);

     constructor(public snackBar: MatSnackBar, public dataService: DataService) { }

     ngOnInit() {
          // Get URL parameter Format if it was provided
          const format = this.getParam('Format');

          if (format != null) {
               if (this.validFormatValues.indexOf(format) !== -1) {
                    this.currentFormat = format;
               } else {
                    alert(`Valid formats are ${this.validFormatValues}`);
               }
          }

          // If URL parameter MoveToServer was provided and is allowed, add Moving the file to new location
          if (this.getParam('MoveToServer') === 'true' && this.allowMoveToServer === true) {
               this.moveToServer = true;
               document.title = 'You2Me (Server)';
          }

          if (this.moveToServer === true) {
               this.stepperStepNames.push('Moving the file to new location');
          }
     }

     // Called by binding to Download button
     downloadLinkClicked() {
          if (this.downloadStarted === false) {
               window.location.href = this.downloadLink;

               this.downloadStarted = true;
          }
     }

     // Called by binding to [class.hidden] of mat-form-field. Returns true if any condition is met
     fieldIsHidden(key: string) {
          const videoHideFields = ['Artist', 'Album', 'TrackNum', 'Genre', 'Year'];
          const nonMP3HideFields = ['TrackNum', 'Genre', 'Year'];

          // Specified keys are the fields to hide
          return (
               // If the fields property is set to disabled this is the de-facto determiner whether this field is enabled or disabled
               this.fieldKeys.indexOf(key) !== -1 && this.fields[key].Disabled)
               || (
                    // If the format is a video format, hide these fields
                    (!this.isAudioFormat() && videoHideFields.includes(key))
                    ||
                    // If the format is an audio format but is not MP3, hide these fields
                    (this.isAudioFormat() && (!this.isMP3Format() && nonMP3HideFields.includes(key))
               )
             );
     }

     // Handle event when all tasks have finished running
     finished() {
          this.isSubmitted = true;

          // If MoveToServer is NOT enabled, show the download link
          if (!this.moveToServer) {
               this.downloadLinkVisible = true;
          }

          this.isFinished =  true;
     }

     // Return the key based on the value
     getFormatKeyByValue() {
          return Object.keys(this.formats).find(key => this.formats[key] === this.currentFormat);
     }

     // Get URL parameter
     getParam(name: string): string {
          const query = window.location.search.substr(1);

          if (query === '') {
               return;
          }

          const res = query.split('&');

          // Create object which contains split key value pairs so "URL=https://www.youtube.com/watch?v=Wch3gJG2GJ4" turns into ['URL','https://www.youtube.com/watch?v=Wch3gJG2GJ4']
          const map1 = res.map(x => x.split('='));

          const params: any = {};

          // Add key/pair to object so it can be accessed by doing params[keyname] to get the value
          map1.map(x => params[x[0]] = x[1] + (x[2] != null ? '=' + x[2] : ''));

          // If there isn't a parameter value for the specified param
          if (typeof params[name] === 'undefined') {
               return null;
          }

          switch (name) {
               case 'URL':
                    return (typeof params[name] !== 'undefined' && params[name] !== '' ? decodeURI(params[name]) : null);
               case 'Artist':
                    return (decodeURI(params[name]) || this.parseTitle('Artist'));
               case 'Album':
                    return (decodeURI(params[name]) || '');
               case 'Format':
                    return (decodeURI(params[name]) || '');
               case 'Genre':
                    return (decodeURI(params[name]) || '');
               case 'Name':
                    return (decodeURI(params[name]) || this.parseTitle('title'));
               case 'Title':
                    let title = params[name];

                    title = title.replace('Title=', '');
                    title = title.replace(' (HQ)', '');

                    return decodeURI(title);
               case 'TrackNum':
                    return (decodeURI(params[name])  || '');
               case 'MoveToServer':
                    return params[name];
               case 'Year':
                    return (decodeURI(params[name]) || '');
               default:
                    return '';
          }
     }

     // Handle errors returned by observable
     handleError(response, error) {
          // write error status
          this.updateStatus(`A fatal error occurred: ${response[0]}`);

          // Set submitted status
          this.isSubmitted = true;

          // If an error occurred, we're done
          this.isFinished = true;

          console.log(`An error occurred at step ${this.currentStep} with the error ${error}`);
     }

     // Is currently selected format an audio format
     isAudioFormat() {
          const format = this.getFormatKeyByValue();

          return (format.indexOf('Audio:') !== -1 ? true : false);
     }

     // Is currently selected format an mp3 format
     isMP3Format() {
          const format = this.getFormatKeyByValue();

          if (this.isAudioFormat() && format.indexOf('mp3') !== -1) {
               return true;
          } else {
               return false;
          }
     }

     // Parse title URL param
     parseTitle(section: string) {
          // section can be artist name or song name
          let titleParam = this.getParam('Title');

          if (!titleParam) {
               return null;
          }

          // Remove these strings from the URL
          titleParam = titleParam.toString().replace(' - [HQ] - YouTube', '');
          titleParam = titleParam.replace(' - YouTube', '');

          // If no dash is in the title, I'm going to assume that the title is the song name
          if (titleParam.indexOf('-') === null && section === 'title') {
               return titleParam;
          }

          const res = titleParam.split('-');

          if (section === 'Artist' && res[0]) {
               return decodeURI(res[0].trim());
          } else if (section === 'Title' && res[1]) {
               return decodeURI(res[1].trim());
          }
     }

     processSteps() {
          // Call data service based on the current task
          switch (this.currentStep) {
               case 0: // Download the file
                    // Build file name

                    // Use tracknum if provided and pad with leading 0 if tracknum < 10
                    const trackNum = (this.fields.TrackNum.Value !== null ? (parseInt(this.fields.TrackNum.Value, 10) < 10 ? '0' : '') + this.fields.TrackNum.Value : null);

                    // If the format selected is an audio format and there's a track number, use it. Otherwise only use the Name field
                    const fileName = (this.isAudioFormat() === true && trackNum !== null ? trackNum + ' ' : '') + this.fields.Name.Value;

                    // Call data service to download the file
                    this.dataService.downloadFile(this.fields.URL.Value, fileName, this.isAudioFormat(), this.isMP3Format(), this.currentFormat)
                    .subscribe((response) => {
                         // Trap server side errors
                         if (response[0].includes('Error:')) {
                              this.handleError(response, response);
                              return;
                         }

                         // First index will be filename
                         this.fileName = response[0];

                         // Second index will be Artist if matched through Python script that does audio fingerprinting
                         if (response[1] !== null && response[1] !== '') {
                              this.fields.Artist.Value = response[1];
                         }

                         // Third index will be Title if matched through Python script that does audio fingerprinting
                         if (response[2] !== null && response[2] !== '') {
                              this.fields.Name.Value = response[2];
                         }

                         // This is only useful if the artist and album fields arent required and the Python script tried but fails to get the artist and album
                         // At the moment submitClick() requires the artist and album to be entered before you can start step 1
                         /*if (this.isMP3Format() && this.fields.Artist.Value === null) {
                              this.showSnackBarMessage('Please enter the artist');
                              return;
                         }

                         if (this.isMP3Format() && this.fields.Name.Value === null) {
                              this.showSnackBarMessage('Please enter the title');
                              return;
                         }*/

                         // When the format is MP3 write the ID3 tags, otherwise skip this step
                         if (this.isMP3Format()) {
                              this.updateStatus('The file has been downloaded. Writing the ID3 tags');
                         }

                         this.currentStep++;

                         this.processSteps();
                    },
                    error => {
                    });

                    break;
               case 1: // Write ID3 tags
                    // Only write tags when the format is MP3
                    if (!this.isMP3Format()) {
                         this.currentStep++;
                         this.processSteps();
                         return;
                    }

                    // Call data service to write ID3 tags
                    this.dataService.writeID3Tags(this.fileName, this.fields.Artist.Value, this.fields.Album.Value, this.fields.Name.Value, this.fields.TrackNum.Value, this.fields.Genre.Value, this.fields.Year.Value)
                    .subscribe((response) => {
                         // Trap server side errors
                         if (response[0].includes('Error:')) {
                              this.handleError(response, response);
                              return;
                         }

                         this.updateStatus('The ID3 tags have been written. Renaming the file');

                         // Update the status and continue on to the next step
                         this.currentStep++;

                         // If MoveToServer is NOT enabled, this is the last step
                         if (!this.moveToServer) {
                              // The response returns the local file including the path as well as the URL for the downloaded file. This is needed so we can delete the local file later
                              this.downloadLink = decodeURIComponent(response[0].replace(/\+/g, ' '));

                              this.finished();

                              return;
                         }

                         this.processSteps();
                    },
                    error => {
                         this.handleError(Response, error);
                    });

                    break;
               case 2: // Call the data service to move the file to the media server
                    this.dataService.moveFile(this.fileName, this.isAudioFormat(), this.moveToServer, this.fields.Artist.Value, this.fields.Album.Value, this.currentFormat)
                    .subscribe((response) => {
                         // Trap server side errors
                         if (response[0].includes('Error:')) {
                              this.handleError(response, response);
                              return;
                         }

                         // If MoveToServer is NOT enabled, this is the last step
                         if (!this.moveToServer) {
                              // The response returns the local file including the path as well as the URL for the downloaded file. This is needed so we can delete the local file later
                              this.downloadLink = decodeURIComponent(response[0].replace(/\+/g, ' '));

                              this.updateStatus('Please click on the download button');

                              this.finished();
                         } else {
                              this.updateStatus('The file has been moved to the server');

                              this.finished();
                         }
                    },
                    error => {
                    });

                    break;
          }
     }

     // Show snackbar message
     showSnackBarMessage(message: string) {
          const config = new MatSnackBarConfig();
          config.duration = 3000;
          this.snackBar.open(message, 'OK', config);
     }

     // Called by binding of click event of submit button
     submitClick() {
          // When the last step has been completed, the submit button changes to restart. When this button is clicked, its caption text is set to restart.
          // The form will reset itself and only save the values if the save values checkbox is checked
          if (this.isFinished === true) {
               // If the Save Values checkbox is not checked
               if (this.saveValues === false) {
                    // Clear all of the field values
                    for (const key in this.fields) {
                         if (key !== null) {
                              this.fields[key].Value = '';
                         }
                    }
               }

               // reset the stepper count
               this.currentStep = 0;

               // Set initial status message
               this.statusMessage = 'Fields marked with an * are required';

               // Reset submitted status
               this.isSubmitted = false;

               this.isFinished = false;

               this.downloadLinkVisible = false;

               this.downloadStarted = false;

               return;
          }

          // Validate the required fields
          if (this.fields.URL.Value === '') {
               this.showSnackBarMessage('Please enter the URL');
               return;
          }

          if (!this.fields.URL.Value.startsWith('http://') && !this.fields.URL.Value.startsWith('https://')) {
               this.showSnackBarMessage('Please enter a valid URL beginning with http:// or https://');
               return;
          }

          if (this.fieldIsHidden('Artist') === false && this.fields.Artist.Required === true && (this.fields.Artist.Value === null || this.fields.Artist.Value === '')) {
               this.showSnackBarMessage('Please enter the artist');
               return;
          }

          if (this.fieldIsHidden('Album') === false && this.fields.Album.Required === true && (this.fields.Album.Value === null || this.fields.Album.Value === '')) {
               this.showSnackBarMessage('Please enter the album');
               return;
          }

          if (this.fields.Name.Required === true && (this.fields.Name.Value === null || this.fields.Name.Value === '')) {
               this.showSnackBarMessage('Please enter the name');
               return;
          }

          if (this.fields.TrackNum.Required === true && (this.fields.TrackNum.Value === null || this.fields.TrackNum.Value === '')) {
               this.showSnackBarMessage('Please enter the track #');
               return;
          }

          if (this.fields.Year.Required === true && (this.fields.Year.Value === null || this.fields.Year.Value === '')) {
               this.showSnackBarMessage('Please enter the year');
               return;
          }

          // Set initial status
          if (this.currentStep === 0) {
               this.updateStatus('Starting the download');
          }

          // Show steps
          this.isSubmitted = true;

          // If the current format is not MP3, skip the write ID3 tag step
          if (!this.isMP3Format()) {
               this.stepperStepNames.splice(2, 1);

               // When we aren't creating an mp3, we aren't writing ID3 tags. When this happens, we need to add this step when
               // downloading a file (MoveToServer=false) otherwise processSteps will reference a step index that doesn't exist
               // since we've deleted writing ID3 tags
               if (!this.moveToServer) {
                    this.stepperStepNames.push('Preparing file download');
               }
          }

          this.processSteps();
     }

     // Update the status message
     updateStatus(newStatus: string) {
          this.statusMessage = newStatus;
     }
}
