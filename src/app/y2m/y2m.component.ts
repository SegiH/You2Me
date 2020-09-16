/*
     TODO:
     Before publishing make sure proxy.conf doesn't have my server address and make sure php doesn't have it either

     URL for testing: https://www.youtube.com/watch?v=Wch3gJG2GJ4
*/
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DataService } from '../core/data.service';
import {interval} from "rxjs";
import { DownloadService } from '../core/download.service';
import { Download } from '../core/download';
import { Observable } from 'rxjs';
import { DOCUMENT } from '@angular/common';

@Component({
     selector: 'app-y2m',
     templateUrl: './y2m.component.html',
     styleUrls: ['./y2m.component.css']
})

export class Y2mComponent implements OnInit {
     allowMoveToServer = true;
     readonly audioFormats: any = {
          '' : null, // Needed to the user can unselect audio options
          'aac' : 'aac',
          'flac' : 'flac',
          'm4a' : 'm4a',
          'mp3 128k' : '128k',
          'mp3 192k' : '192k',
          'mp3 256k' : '256k',
          'mp3 320k' : '320k',
          'mp3 VBR 0 (Best)' : '0',
          'mp3 VBR (5) (OK)' : '5',
          'mp3 VBR (9) (Worst)' : '9',
          'opus' : 'opus',
          'vorbis' : 'vorbis',
          'wav' : 'wav',
     };
     currentAudioFormat = null; // MP3 320K is the default format
     currentVideoFormat = null;
     currentStep = 0;
     debugging = false; // This should never be true when running production build
     download$: Observable<Download>;
     downloadLink = '';
     downloadButtonVisible = false; // default false
     downloadStatus = ''; // displays youtube-dl output messages
     downloadProgressSubscription;
     readonly fields: any = {
          URL: { // This field shouldn't ever be disabled
               Required: true,
               Value: this.getURLParam('URL'),
          },
          Artist: {
               Required: true,
               Value: this.getURLParam('Artist'),
               Disabled: false
          },
          Album: {
               Required: false,
               Value: this.getURLParam('Album'),
               Disabled: false
          },
          Name: {
               Required: true,
               Value: this.getURLParam('Title'),
               Disabled: false
          },
          TrackNum: {
               Required: false,
               Value: this.getURLParam('TrackNum') || null,
               Disabled: false
          },
          Genre: {
               Required: false,
               Value: this.getURLParam('Genre'),
               Disabled: false
          },
          Year: {
               Required: false,
               Value: this.getURLParam('Year'),
               Disabled: false
          }
     };
     readonly fieldKeys = Object.keys(this.fields); // Used in HTML template
     fileName = '';
     isFinished = false; // default false
     isSubmitted = false; // default false
     moveToServer = false; // default false
     moveToServerButtonVisible = false; // default false
     saveValues = false;
     stepperStepNames = ['Started download', 'Finished download', 'Writing ID3 Tags'];
     statusMessage = 'Fields marked with an * are required';
     supportedURLsDataSource: MatTableDataSource<any>;
     supportedURLsVisible = false;
     urlParams: {};
     readonly videoFormats: any = {
          '' : null,
          'No conversion' : 'original',
          'Convert to avi' : 'avi',
          'Convert to flv': 'flv',
          'Convert to mkv' : 'mkv',
          'Convert to mp4' : 'mp4',
          'Convert to ogg' : 'ogg',
          'Convert to webm' : 'webm'
     }

     @ViewChild('supportedURLsPaginator') supportedURLsPaginator: MatPaginator;
     @ViewChild(MatSort) sort: MatSort;

     constructor(public snackBar: MatSnackBar, public dataService: DataService,private downloads: DownloadService, @Inject(DOCUMENT) private document: Document) { }

     ngOnInit() {
          // Get URL parameter Format if it was provided
          const format = this.getURLParam('Format');
          
          if (format !== null) {
               if (Object.values(this.audioFormats).includes(format)) {
                    this.currentAudioFormat = format;
                    this.currentVideoFormat = null;
               } else if (Object.values(this.videoFormats).includes(format)) {
                    this.currentVideoFormat = format;
                    this.currentAudioFormat = null
               } else
                    alert(`Valid formats are ${Object.values(this.audioFormats).filter(format => format !== null)} for audio or ${Object.values(this.videoFormats).filter(format => format !== null)} for video`);          
          }
          

          // If URL parameter MoveToServer was provided and is allowed, add Moving the file to new location as a step
          if (this.getURLParam('MoveToServer') === 'true' && this.allowMoveToServer) {
               this.moveToServer = true;
               document.title = 'You2Me (Server)';
          }    

          if (this.moveToServer) {
               this.stepperStepNames.push('Moving the file to new location');
          }

          // Debugging default field values
          if (this.debugging) {
               this.fields.URL.Value="https://www.youtube.com/watch?v=Wch3gJG2GJ4";
               this.fields.Artist.Value="Monkeeys";
               //this.fields.Album.Value="Greatest Hits";
               this.fields.Name.Value="Goin Down";
               //this.fields.TrackNum.Value="13";
               this.fields.Genre.Value="60s";
              // this.fields.Year.Value="1994";
               this.currentAudioFormat='320k';
               this.currentVideoFormat=null;
               this.saveValues=true;
          }

          // Enable debugging if enabled at command line
          this.debugging = this.getURLParam("Debugging");
     }

     applyFilter(filterValue: string) {
          this.supportedURLsDataSource.filter = filterValue.trim().toLowerCase();
     }

     // Custom Material UI table filter function
     createSupportedURLsFilter() {
          let filterFunction = function (data: any, filter: string): boolean {
               let customSearch = () => {
                    if (data.toLowerCase().includes(filter.toLowerCase()))
                         return true;
               }

               return customSearch();
          }

          return filterFunction;
     }

     // Called by binding to Download button
     downloadLinkClicked() {
          const fileNameWithoutPath=this.downloadLink.substr(this.downloadLink.lastIndexOf("/")+1);

          // Subscribe to DL service and wait for the done response 
          this.downloads.download(this.downloadLink, fileNameWithoutPath).subscribe((response) => {
               //console.log("Response: " + response.state);

               if (response.state == "DONE") {
                    // Send request to delete the file
                    this.dataService.deleteDownloadFile(this.downloadLink).subscribe((response) => { 
                    },
                    error => {
                         console.log("An error occurred deleting the file from the server 1");
                    });
               }
          },
          error => {
               console.log("An error occurred deleting the file from the server 2");
          });

          this.downloadButtonVisible = false;

          // Hide moveToServer button to prevent subsequent clicks
          this.moveToServerButtonVisible = false;
     }

     // Called by binding to [class.hidden] of mat-form-field. Returns true if any condition is met
     fieldIsHidden(key: string) {
          // Specified values are the fields to hide
          const videoHideFields = ['Artist', 'Album', 'TrackNum', 'Genre', 'Year'];
          const nonMP3HideFields = ['TrackNum', 'Genre', 'Year'];

          return (
               // If the fields property is set to disabled this is the de-facto determiner whether this field is enabled or disabled
               Object.keys(this.fields).includes(key) && this.fields[key].Disabled)
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
     finished(isError=false) {
          this.isSubmitted = true;

          // If MoveToServer is NOT enabled, show the download link
          if (!this.moveToServer && !isError && this.currentStep <=2)
               this.downloadButtonVisible = true;
          else
               this.downloadButtonVisible = false;

          // If the user is allowed to move the file to the server but didn't provide MoveToServer parameter, show the MoveToServer button
          // so the user has the option of moving the file to the server. This is here in case you forgot to pass MoveToServe=true URL parameter but meant to
          if (!isError && this.allowMoveToServer && !this.moveToServerButtonVisible && this.currentStep <=2)
               this.moveToServerButtonVisible = true;
          else
               this.moveToServerButtonVisible = false;
          
          this.isFinished =  true;

          // Stop the REST service that gets the download status
          //if (!this.debugging)
          //     this.downloadProgressSubscription.unsubscribe();

          // Delete download progress temp db
          /*this.dataService.deleteDownloadProgress().subscribe((response) => {
          },
          error => {
               this.handleError(Response, error);
          });*/
     }

     // Get progress of youtube-dl
     getDownloadProgress() {
          if (this.debugging)
               return;

          this.downloadProgressSubscription = interval(50)
               .subscribe(()=>{
                    //Get progress status from the service every 100ms
                    this.dataService.getDownloadProgress()
                    .subscribe((jsonResult:any)=>{
                         if(!jsonResult[1]) {
                              //console.log(jsonResult[0]);
                              this.downloadStatus=jsonResult[0];
                         }
                    },
                    error => {
                         //show errors
                    }
               );
          });
     }

     // Return the key based on the value
     getFormatKeyByValue() {
          // Since there are 2 format dropdowns, either one of them has a selected value or neither has a selected value
          return (
               this.currentAudioFormat !== null 
                    ? Object.keys(this.audioFormats).find(key => this.audioFormats[key] === this.currentAudioFormat) 
                    : (this.currentVideoFormat !== null ? Object.keys(this.videoFormats).find(key => this.videoFormats[key] === this.currentVideoFormat) : null));
     }

     // Get URL parameter
     getURLParam(name: string) {
          // The first time this method gets called, this.urlParams will be undefined
          if (typeof this.urlParams === 'undefined')
               this.parseURLParameters();

          // If urlParams is still undefined, there are no url params
          if (typeof this.urlParams === 'undefined')
               return (name === "Debugging" ? false : null);
          
          // Make URL params upper case when checking so they aren't case sensitive
          name=name.toUpperCase();

          switch (name) {
               case 'URL':
                    return (typeof  this.urlParams[name] !== 'undefined' && this.urlParams[name] !== '' ? decodeURI(this.urlParams[name]) : null);
               case 'ARTIST':
                    return (typeof this.urlParams[name] !== 'undefined' && decodeURI(this.urlParams[name]) || this.parseTitle('Artist'));
               case 'ALBUM':
                    return (typeof this.urlParams[name] !== 'undefined' && decodeURI(this.urlParams[name]) || null);
               case 'FORMAT':
                    return (typeof this.urlParams[name] !== 'undefined' && decodeURI(this.urlParams[name]) || null);
               case 'GENRE':
                    return (typeof this.urlParams[name] !== 'undefined' && decodeURI(this.urlParams[name]) || null);
               case 'NAME': // Alias for title
                    return (typeof this.urlParams[name] !== 'undefined' && decodeURI(this.urlParams[name]) || this.parseTitle('title'));
               case 'TITLE':
                    if (typeof this.urlParams[name] === 'undefined')
                         return null;
                    
                    let title = this.urlParams[name];

                    title = title.replace('Title=', '');
                    title = title.replace(' (HQ)', '');

                    return decodeURI(title);
               case 'TRACKNUM':
                    return (typeof this.urlParams[name] !== 'undefined' && decodeURI(this.urlParams[name])  || null);
               case 'MOVETOSERVER':
                    return (typeof this.urlParams[name] !== 'undefined' ? this.urlParams[name] : null);
               case 'YEAR':
                    return (typeof this.urlParams[name] !== 'undefined' ? decodeURI(this.urlParams[name]) : null);
               case 'DEBUGGING':
                    return (typeof this.urlParams[name] !== 'undefined' ? true : false);
               default:
                    return null;
          }
     }

     // Handle errors returned by observable
     handleError(response, error) {
          // write error status
          this.updateStatus(`A fatal error occurred: ${response[0]}`);

          console.log(`An error occurred at step ${this.currentStep} with the error ${error}`);

          //if (this.debugging)
          //     this.downloadProgressSubscription.unsubscribe();

          this.finished(true);
     }

     // Is currently selected format an audio format
     isAudioFormat() {
          return this.currentAudioFormat !== null;
     }

     // Is currently selected format an mp3 format
     isMP3Format() {
          const format = this.getFormatKeyByValue();

          if (format != null && this.isAudioFormat() && format.includes('mp3'))
               return true;
          else
               return false;
     }

     // Event if the user clicks on the Move To Server button
     moveToServerClick() {
          // If we are able to move to server 
          if (this.allowMoveToServer)
               this.processSteps();
     }

     // Parse title URL param
     parseTitle(section: string) {
          // section can be artist name or song name
          let titleParam = this.getURLParam('Title');

          if (!titleParam)
               return null;

          // Remove these strings from the URL
          titleParam = titleParam.toString().replace(' - [HQ] - YouTube', '');
          titleParam = titleParam.replace(' - YouTube', '');

          // If no dash is in the title, assume that the title is the song name
          if (titleParam.includes('-') && section.toUpperCase() === 'TITLE')
               return titleParam;

          const res = titleParam.split('-');

          if (section === 'Artist' && res[0])
               return decodeURI(res[0].trim());
          else if (section === 'Title' && res[1])
               return decodeURI(res[1].trim());
     }

     // Parse and store all URL parameters in a key/pair value
     parseURLParameters() {
          const query = window.location.search.substr(1);

          if (query === '')
               return;

          const res = query.split('&');

          // Create object which contains split key value pairs so "URL=https://www.youtube.com/watch?v=Wch3gJG2GJ4" turns into ['URL','https://www.youtube.com/watch?v=Wch3gJG2GJ4']
          const map1 = res.map(x => x.split('='));
          
          this.urlParams = {};

          // Add key/pair to object so it can be accessed by doing params[keyname] to get the value
          //map1.map(x => params[x[0]] = x[1] + (x[2] !== null ? '=' + x[2] : ''));

          map1.map(x => 
               this.urlParams[decodeURI(x[0]).toUpperCase()] = decodeURI(x[1]) + (
                     typeof x[2] !== 'undefined' ? '=' + decodeURI(x[2]) : '')
                  );
     }

     processSteps() {
          // Normalize all text fields by encoding special characters so we don't run into issues passing them as URL parameters
          const URL=this.rfc3986EncodeURIComponent(this.fields.URL.Value);          
          let artist=this.rfc3986EncodeURIComponent(this.fields.Artist.Value);
          const album=this.rfc3986EncodeURIComponent(this.fields.Album.Value);
          let name=this.rfc3986EncodeURIComponent(this.fields.Name.Value);
          
          // Use tracknum if provided and pad with leading 0 if tracknum < 10
          const trackNum = (this.fields.TrackNum.Value !== null ? (parseInt(this.rfc3986EncodeURIComponent(this.fields.TrackNum.Value), 10) < 10 ? '0' : '') + this.rfc3986EncodeURIComponent(this.fields.TrackNum.Value) : null);
          const genre=this.rfc3986EncodeURIComponent(this.fields.Genre.Value);
          const year=this.rfc3986EncodeURIComponent(this.fields.Year.Value);

          // Call data service based on the current task
          switch (this.currentStep) {
               case 0: // Download the file

                    // Build file name without the extension (The youtube-dl command in the php script adds the extension based on the format). 
                    // If the format selected is an audio format and there's a track number, use it. Otherwise only use the Name field
                    const fileName = (this.isAudioFormat() && !isNaN(parseInt(trackNum)) ? (parseInt(trackNum) < 10 ? "0" : "") + trackNum + ' ' : '') + name;

                    // Start timer that gets download progress
                    //if (!this.debugging)
                    //     this.getDownloadProgress();

                    // Call data service to download the file
                    this.dataService.fetchFile(URL, fileName,this.moveToServer, this.isAudioFormat(), this.isMP3Format(),(this.currentAudioFormat ? this.currentAudioFormat : this.currentVideoFormat))
                    .subscribe((response) => {
                         // Stop the REST service that gets the download status
                         //if (!this.debugging)
                         //     this.downloadProgressSubscription.unsubscribe();

                         // Call REST service to delete download progress temp db
                         /*this.dataService.deleteDownloadProgress().subscribe((response) => {
                         },
                         error => {
                              this.handleError(Response, error);
                         });*/

                         // Trap server side errors
                         if (response[0].includes('Error:')) {
                              this.handleError(response, response);
                              return;
                         }

                         // First index will be filename
                         this.fileName = response[0];

                         // Disabled for now. Having Python issues with Docker, Python fingerprinting is broken

                         // Second index will be Artist if matched through Python script that does audio fingerprinting
                         /*if (response[1] !== null && response[1] !== '') {
                              artist = response[1];
                         }

                         // Third index will be Title if matched through Python script that does audio fingerprinting
                         if (response[2] !== null && response[2] !== '') {
                              name = response[2];
                         }*/

                         /* 
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

                         // When the format is MP3 write the ID3 tags
                         if (this.isMP3Format()) {
                              this.updateStatus('The file has been downloaded. Writing the ID3 tags');

                              this.currentStep++;

                              this.processSteps();
                         } else if (!this.isMP3Format() && !this.moveToServer) { // If the format is not MP3 and we aren't moving to the server so we are done
                              // The response returns the URL for the downloaded file
                              this.downloadLink = decodeURIComponent(response[0].replace(/\+/g, ' '));

                              this.finished();

                              return;
                         }
                    },
                    error => {
                         // Stop the REST service that gets the download status
                         //this.downloadProgressSubscription.unsubscribe();

                         // Call REST service to delete download progress temp db
                         /*this.dataService.deleteDownloadProgress().subscribe((response) => {
                         },
                         error => {
                              this.handleError(Response, error);
                         });*/
                         
                         this.handleError(Response, error);
                    });

                    break;
               case 1: // Write ID3 tags
                    // Call data service to write ID3 tags
                    this.dataService.writeID3Tags(this.fileName, artist, album, name, trackNum, genre, year)
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
                              // The response returns the URL for the downloaded file
                              this.downloadLink = decodeURIComponent(response[0].replace(/\+/g, ' '));

                              this.finished();

                              return;
                         } else { // Move To Server is enabled so process next step
                              this.processSteps();
                         }   
                    },
                    error => {
                         this.handleError(Response, error);
                    });

                    break;
               case 2: // Call the data service to move the file to the media server
                    if (this.moveToServer || this.allowMoveToServer) {
                         this.dataService.moveFile(this.fileName, this.isAudioFormat(), this.moveToServer, artist, album,(this.currentAudioFormat ? this.currentAudioFormat : this.currentVideoFormat))
                         .subscribe((response) => {
                              // Trap server side errors
                              if (response[0].includes('Error:')) {
                                   this.handleError(response, response);
                                   return;
                              }

                              this.updateStatus('The file has been moved to the server');

                              this.currentStep++;

                              this.finished();
                         },
                         error => {
                              this.handleError(Response, error);
                         });
                    }

                    break;
          }
     }
     
     // Escapes all special characters so they can safely be passed as URL parameters
     rfc3986EncodeURIComponent(str) {  
          return encodeURIComponent(str).replace(/[!'()*]/g, escape);  
     }

     showSupportedSitesToggle() {
          if (this.supportedURLsVisible && typeof this.supportedURLsDataSource === 'undefined') {
               this.dataService.getSupportedURLs().subscribe((response) => {
                    const supportedURLs=response.reduce(function(result, item, index, array) {
                         result["URL" + index] = item;
                         return result;
                       }, {}) 
     
                    this.supportedURLsDataSource=new MatTableDataSource(response);
     
                     // Assign custom filter function
                     this.supportedURLsDataSource.filterPredicate = this.createSupportedURLsFilter();
     
                    this.supportedURLsDataSource.paginator = this.supportedURLsPaginator;
     
                    this.supportedURLsDataSource.sort=this.sort;
               },
     
               error => {
                    this.handleError(Response, error);
               });    
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
          // After the last step has completed, the submit button text changes to restart. When this button is clicked, 
          // the form will reset itself and only save the values if the save values checkbox is checked
          if (this.isFinished) {
               // If the Save Values checkbox is not checked
               if (!this.saveValues) {
                    // Clear all of the field values
                    for (const key in this.fields)
                         if (key !== null)
                              this.fields[key].Value = '';
               }

               // reset the stepper count
               this.currentStep = 0;

               // Set initial status message
               this.statusMessage = 'Fields marked with an * are required';

               // Reset submitted status
               this.isSubmitted = false;

               this.isFinished = false;

               this.downloadButtonVisible = false;

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

          if (!this.fieldIsHidden('Artist') && this.fields.Artist.Required && (this.fields.Artist.Value === null || this.fields.Artist.Value === '')) {
               this.showSnackBarMessage('Please enter the artist');
               return;
          }

          if (!this.fieldIsHidden('Album') && this.fields.Album.Required && (this.fields.Album.Value === null || this.fields.Album.Value === '')) {
               this.showSnackBarMessage('Please enter the album');
               return;
          }

          if (this.fields.Name.Required && (this.fields.Name.Value === null || this.fields.Name.Value === '')) {
               this.showSnackBarMessage('Please enter the name');
               return;
          }

          if (this.fields.TrackNum.Required && (this.fields.TrackNum.Value === null || this.fields.TrackNum.Value === '')) {
               this.showSnackBarMessage('Please enter the track #');
               return;
          }

          if (this.fields.Year.Required && (this.fields.Year.Value === null || this.fields.Year.Value === '')) {
               this.showSnackBarMessage('Please enter the year');
               return;
          }

          if (this.currentAudioFormat === null && this.currentVideoFormat === null) {
               this.showSnackBarMessage('Please select the audio or video format');
               return;
          }
          
          // Set initial status
          if (this.currentStep === 0)
               this.updateStatus('Starting the download');

          // Show steps
          this.isSubmitted = true;

          // Start the process
          this.processSteps();
     }

     // Update the status message
     updateStatus(newStatus: string) {
          this.statusMessage = newStatus;
     }
}
