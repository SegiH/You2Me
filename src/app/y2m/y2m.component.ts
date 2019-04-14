/*
     TODO:
     See if you can get more than artist & title from Python script
     Fix logic in downloadLinkClicked() that deletes file 
     files are always named as mp3 no matter which format is chosen
*/

import { Component, OnInit } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';

@Component({
     selector: 'app-y2m',
     templateUrl: './y2m.component.html',
     styleUrls: ['./y2m.component.css']
})

export class Y2mComponent implements OnInit {
     allowDeleting = false;
     allowMoveToServer = true;
     currentFormat = '320k';
     formats: any = { 'aac' : 'aac' , 'flac' : 'flac' ,  'm4a' : 'm4a' , 'mp3 128k' : '128k', 'mp3 192k' : '192k', 'mp3 256k' : '256k', 'mp3 320k' : '320k', 'mp3 VBR 0 (Best)' : '0', 'mp3 VBR (5) (OK)' : '5', 'mp3 VBR (9) (Worst)' : '9' , 'opus' : 'opus' , 'video': 'video', 'vorbis' : 'vorbis' , 'wav' : 'wav' };
     readonly formatKeys = Object.keys(this.formats);
     currentStep = 0;
     downloadLink = '';
     downloadLinkVisible = false;
     downloadStarted = false;
     fields: any = {
          URL: { // This field shouldn't ever be disabled
               Required: true,
               Value: (this.getParam('URL') !== '' && typeof this.getParam('URL') !== 'undefined' ? this.getParam('URL') : ''),
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
     readonly fieldKeys = Object.keys(this.fields);
     isFinished = false;
     isSubmitted = false;
     keepValues = false;
     localFile = '';
     moveToServer = false;
     stepperStepNames = ['Started download', 'Finished download', 'Writing ID3 Tags', 'Renaming the file'];
     statusMessage = 'Fields marked with an * are required';

     constructor(public snackBar: MatSnackBar) {}

     ngOnInit() {
          if (this.getParam('MoveToServer') != null && this.allowMoveToServer === true) {
               this.moveToServer = true;
               document.title = 'You2Me (Server)';
          }

          if (this.moveToServer === true) {
               this.stepperStepNames.push('Moving the file to new location');
          }
     }

     // Event handler when download link is clicked
     downloadLinkClicked() {
          if (this.downloadStarted==false) {
               window.location.href = this.downloadLink;
          } /*else if (this.downloadStarted === true && this.allowDeleting === true) {
               // Run the AJAX request to delete the file
               fetch(`./php/serverTasks.php?DeleteFile&Filename=${this.localFile}`, {method: 'GET'}).then(response => response.json()).then((response) => {
               }).catch(error => {
                    console.log('request failed', error);
               });
          }*/
     }
     
     // Returns true if either condition is met
     fieldIsDisabled(key: string) {
          return this.isSubmitted || (key !== "format" && this.fieldKeys.indexOf(key) !== -1 && this.fields[key].Disabled) || key === "format"
          // Delete the line above and use this line once the format options work 
          // return this.isSubmitted || (this.fieldKeys.indexOf(key) !== -1 && this.fields[key].Disabled)
     }

     // Handle event when all tasks have finished running
     finished() {
          this.isSubmitted = true;

          // If there are 4 steps, then MoveToServer is NOT enabled so show the download link 
          if (this.stepperStepNames.length === 4) {
               this.downloadLinkVisible = true;
          }

          this.isFinished =  true;
     }

     // Format dropdown change event
     formatChanged() {
          if (this.currentFormat === 'video') {
               this.fields.Artist.Disabled = true;
               this.fields.Album.Disabled = true;
               this.fields.Name.Disabled = true;
               this.fields.TrackNum.Disabled = true;
               this.fields.Genre.Disabled = true;
               this.fields.Year.Disabled = true;
          }  else {
               this.fields.Artist.Disabled = false;
               this.fields.Album.Disabled = false;
               this.fields.Name.Disabled = false;
               this.fields.TrackNum.Disabled = false;
               this.fields.Genre.Disabled = false;
               this.fields.Year.Disabled = false;
          }

          if (this.currentFormat.indexOf('mp3') !== -1) {
               this.fields.Artist.Required = true;
               this.fields.Name.Required = true;
          } else {
               this.fields.Artist.Required = false;
               this.fields.Name.Required = false;
          }
     }

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

          // Add key/pair to object
          map1.map(x => params[x[0]] = x[1] + (x[2] != null ? '=' + x[2] : ''));
          
          // If there isn't a parameter value for the specified param
          if (typeof params[name] === 'undefined')
               return;
          
          switch(name) {
               case 'URL':
                    return decodeURI(params[name]);
               case 'Artist':
                    return (decodeURI(params[name]) || this.parseTitle('Artist'));     
               case 'Album':
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

     isMP3Format() {
          const format = this.getFormatKeyByValue();

          if (typeof format === 'string' && format.indexOf('mp3') !== -1) {
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
          let params = '';

          // Build fetch parameters
          switch (this.currentStep) {
               case 0: // Download the file
                    params = `?step=1` +
                             `&URL=${this.fields.URL.Value}` +
                             `&GetVideo=` + (this.currentFormat === 'video') +
                             (this.currentFormat !== 'video' ? `&AudioFormat=${this.currentFormat}` : '')
                    break;
               case 1: // Write tags if the file is MP3
                    // Skip this step if the the format isn't MP3
                    if (this.isMP3Format() === false) {
                         this.currentStep++;
                         this.processSteps();
                         return;
                    }

                    params = `?step=2` +
                         `&Filename=${this.localFile}` +
                         (this.fields.Artist.Value !== null ? `&Artist=${this.fields.Artist.Value}` : ``) +
                         (this.fields.Album.Value !== null ? `&Album=${this.fields.Album.Value}` : ``) +
                         (this.fields.Name.Value !== null ? `&TrackName=${this.fields.Name.Value}` : '') +
                         `&TrackNum=${this.fields.TrackNum.Value}` +
                         (this.fields.Genre.Value !== null ? `&Genre=${this.fields.Genre.Value}` : ``) +
                         (this.fields.Year.Value !== null ? `&Year=${this.fields.Year.Value}` : ``)  +
                         (this.currentFormat !== 'video' ? `&AudioFormat=${this.currentFormat}` : '');
                    break;
               case 2: // Rename the file
                    // Skip this step if the the format isn't video
                    /*if (this.currentFormat === 'video') {
                         this.currentStep++;
                         this.processSteps();
                    }*/

                    // Step count is included because if the file is downloaded, theres only steps 0-3. If the file is moved to a server, there's one extra step so the server side action has 1 more step if we need to move it to the server
                    params = `?step=3` +
                         (this.localFile !== null ? `&Filename=${this.localFile}` : ``) +
                         (this.fields.Artist.Value !== null ? `&Artist=${this.fields.Artist.Value}` : ``) +
                         (this.fields.Name.Value !== null ? `&TrackName=${this.fields.Name.Value}` : ``) +
                         (this.fields.TrackNum.Value !== null ? `&TrackNum=${this.fields.TrackNum.Value}` : ``) +
                         `&StepCount=${this.stepperStepNames.length}` +
                         `&isVideo=${this.currentFormat === 'video'}`;
                    break;
               case 3: // Move the file
                    params = `?step=4` +
                    (this.localFile !== null ? `&Filename=${encodeURI(this.localFile)}` : ``) +
                    (this.fields.Artist.Value !== null ? `&Artist=${this.fields.Artist.Value}&` : ``) +
                    (this.fields.Album.Value !== null ? `Album=${this.fields.Album.Value}` : ``) +
                    `&isVideo=${this.currentFormat === 'video'}`;
                    break;
          }

          // Run the AJAX request
          fetch('./php/serverTasks.php' + params, {method: 'GET'}).then(response => response.json()).then((response) => {
               if (response[0].indexOf('ERROR') !== -1) {
                    // write error status
                    this.updateStatus(`A fatal error occurred: ${response[0]}`);

                    // Set submitted status
                    this.isSubmitted = true;

                    this.isFinished = true;

                    return;
               }

               switch (this.currentStep) {
                    case 0: // Downloading the file
                         this.localFile = response[0];

                         if (response[1] !== null && response[1] != "") {
                              this.fields.Artist.Value = response[1];
                         }

                         if (response[2] !== null && response[2] != "") {
                              this.fields.Name.Value = response[2];
                         }

                         if (this.isMP3Format() && this.fields.Artist.Value == null) {
                              this.showSnackBarMessage('Please enter the artist');
                              return;
                         }

                         if (this.isMP3Format() && this.fields.Name.Value == null) {
                              this.showSnackBarMessage('Please enter the title');
                              return;
                         }

                         this.updateStatus('The file has been downloaded. Writing the ID3 tags');

                         // Update the status and continue on to the next step
                         this.currentStep++;

                         this.processSteps();

                         break;
                    case 1: // Writing the ID3 tags
                         this.updateStatus('The ID3 tags have been written. Renaming the file');

                         // Update the status and continue on to the next step
                         this.currentStep++;

                         this.processSteps();

                         break;
                    case 2: // Rename the file
                         // The response returns the local file including the path as well as the URL for the downloaded file. This is needed so we can delete the local file later
                         this.downloadLink = response[0];
                         this.localFile = response[1];

                         // If this is the last step, finalize everything
                         if (this.stepperStepNames.length === 4) {
                              this.updateStatus('Please click on the download button');
                              this.currentStep++;
                              this.finished();
                         } else {
                              this.currentStep++;
                              this.processSteps();
                         }

                          break;
                    case 3: // Move the file to the new location
                         this.updateStatus('The file has been moved to the new location');

                         this.currentStep++;

                         this.finished();

                         break;
                    default:
                         alert('Unknown AJAX status');
               }
          }).catch(error => {
               console.log('request failed', error);
          });
     }

     // Show snackbar message
     showSnackBarMessage(message: string) {
          const config = new MatSnackBarConfig();
          config.duration = 3000;
          this.snackBar.open(message, 'OK', config);
     }

     // submit button click event
     submitClick() {  
          // When the last step has been completed, the submit button changes to restart. When this button is clicked, its caption text is restart.
          // The form will reset itself and only keep the values if the keep values checkbox is checked
          if (this.isFinished === true) {
               if (this.keepValues === false) {
                    // Clear all of the field values
                    for (const key in this.fields) {
                         if (key != null) {
                              this.fields[key].Value = '';
                         }
                    }
               }

               // reset the stepper
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

          if (this.fields.Artist.Required === true && (this.fields.Artist.Value === null || this.fields.Artist.Value === '')) {
               this.showSnackBarMessage('Please enter the artist');
               return;
          }

          if (this.fields.Album.Required === true && (this.fields.Album.Value === null || this.fields.Album.Value === '')) {
               this.showSnackBarMessage('Please enter the album');
               return;
          }

          if (this.fields.Name.Required === true && (this.fields.Name.Value === null || this.fields.Name.Value === '')) {
               this.showSnackBarMessage('Please enter the track name');
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

          this.processSteps();
     }

     // Update the status message
     updateStatus(newStatus: string) {
          this.statusMessage = newStatus;
     }
}
