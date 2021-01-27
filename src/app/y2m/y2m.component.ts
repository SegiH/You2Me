/*
     TODO:
     Dailymotion long videos time out without an error message. 5 minutes works. 15 minutes fails
     
     Before publishing:
          1. Make sure debugging is off!
          2. Make sure proxy.conf doesn't have my server address and make sure php doesn't have it either.

     URL for testing: https://www.youtube.com/watch?v=Wch3gJG2GJ4
*/
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DataService } from '../core/data.service';
import { interval } from "rxjs";
import { DownloadService } from '../core/download.service';
import { DOCUMENT } from '@angular/common';

@Component({
     selector: 'app-y2m',
     templateUrl: './y2m.component.html',
     styleUrls: ['./y2m.component.css']
})

export class Y2MComponent implements OnInit {
     readonly allowMoveToServer = true;
     currentStep = 0;
     debugging = false; // This should never be true when running production build
     debuggingCheckboxVisible = false;
     downloadLink = '';
     downloadButtonVisible = false; // default false
     downloadStatus = ''; // displays youtube-dl output messages
     downloadStatusVisible = true;
     downloadProgressSubscription;     
     fileName = '';
     formatOverride = false;
     isFinished = false; // default false
     isSubmitted = false; // default false
     moveToServer = false; // default false
     moveToServerButtonVisible = false; // default false
     saveValues = false;     
     statusCountClick = 0;
     statusMessage = 'Fields marked with an * are required';
     supportedURLsDataSource: MatTableDataSource<any>;
     supportedURLsVisible = false;
     urlParams: {};

     @ViewChild('supportedURLsPaginator') supportedURLsPaginator: MatPaginator;
     @ViewChild(MatSort) sort: MatSort;

     constructor(public snackBar: MatSnackBar, public dataService: DataService,private downloads: DownloadService, @Inject(DOCUMENT) private document: Document) {}

     ngOnInit() {
          const format = this.getURLParam('Format');
          
          // Set the current format without validating it first because formats object may not be populated yet
          if (format !== null)
               this.dataService.setCurrentFormat(format);

          // If URL parameter MoveToServer was provided and is allowed, add Moving the file to new location as a step
          if (this.getURLParam('MoveToServer') === 'true' && this.allowMoveToServer) {
               this.moveToServer = true;
               document.title = 'You2Me (Server)';
          } else {
               this.moveToServer = false;
               document.title = 'You2Me';
          }

          if (this.moveToServer)
               this.dataService.addStep('Moving the file to new location');
 
          // Save current debugging value
          const currDebugging=this.debugging;

          // Enable debugging if Debugging was provided as URL parameter. Otherwise default to currDebugging
          this.debugging = (this.getURLParam("Debugging") != this.debugging && this.getURLParam("Debugging") ? this.getURLParam("Debugging") : currDebugging);

          // Debugging default field values
          if (this.debugging) {
               /*this.fields.URL.Value="https://www.youtube.com/watch?v=Wch3gJG2GJ4";
               this.fields.Artist.Value="Monkeeys";
               this.fields.Album.Value="Greatest Hits";
               this.fields.Name.Value="Goin Down";
               this.fields.TrackNum.Value="13";
               this.fields.Genre.Value="60s";
               this.fields.Year.Value="1994";
               this.currentAudioFormat='320k';
               this.currentVideoFormat=null;
               this.saveValues=true;*/
          }
          
          // Remove Artist name from title if it exists. You can't do this in getURLParam because it ends up getting called recursively
          const artist=this.dataService.getFieldProperty('Artist','Value');
          
          if (artist !== null) {
               // Remove "artistname - " from name
               const newName=this.dataService.getFieldProperty('Name','Value').replace(artist + " - ","");
               this.dataService.setFieldProperty('Name','Value',newName);
          }

          // Load URL parameters
          this.dataService.getFieldKeys().forEach(key => {              
               console.log("Key="+key);
               if (this.getURLParam(key) !== null)
                    if ((key === 'TrackNum' || key === 'Year') && isNaN(parseInt(this.getURLParam(key))))
                         this.dataService.showSnackBarMessage('The URL parameter ' + key + ' has to be a number');
                    else
                         this.dataService.setFieldProperty(key,"Value",this.getURLParam(key));
          });
          
          // Make sure that there aren't any invalid URL parameters
          const queryString = "&" + window.location.search.slice(1); // first URL parameter always begins with a ?. This replaces it with & so we can call split() on it using & as the delimiter
          const split_params=queryString.split("&"); 
          
          for (let i=0;i<split_params.length;i++) {
               if (split_params[i] !== '') {
                    const param=split_params[i].split("=")[0]; // URL is in the form Name=Value; Get Name part of the parameter
                    
                    console.log("Param="+param);

                    if (!this.dataService.getURLParameters().includes(param))
                         this.dataService.showSnackBarMessage('The URL parameter ' + param + ' is not a valid URL parameter');                    
               }
          }
     }

     // apply filter for supported url search filters
     applyFilter(filterValue: string) {
          this.supportedURLsDataSource.filter = filterValue.trim().toLowerCase();
     }

     // Custom Material UI table filter function
     createSupportedURLsFilter() {
          const filterFunction = function (data: string, filter: string): boolean {
               const customSearch = () => {
                    if (data.toLowerCase().includes(filter.toLowerCase())) // case insensitive
                         return true;
               }

               return customSearch();
          }

          return filterFunction;
     }

     // Download file step
     downloadFile() {
          // Start timer that gets download progress
          if (!this.debugging)
               this.getDownloadProgress();

          // Call data service to download the file
          this.dataService.fetchFile(this.moveToServer, this.allowMoveToServer, this.debugging)
          .subscribe((response) => {
               // Stop the REST service that gets the download status
               if (!this.debugging) {
                    this.downloadProgressSubscription.unsubscribe();

                    this.downloadStatusVisible = false;

                    // Call REST service to delete download progress temp db
                    this.dataService.deleteDownloadProgress().subscribe((response) => {
                    },
                    error => {
                         this.handleError(Response, error);
                    });
               }

               // Trap server side errors
               if (response[0].includes('Error:')) {
                    this.handleError(response, response);
                    console.log(response[1]);
                    return;
               }

               // First index will be filename
               this.fileName = response[0];

               // Second index will be Artist if matched through Python script that does audio fingerprinting
               if (typeof response[1] !== 'undefined')
                    this.dataService.setFieldProperty('Artist','Value',response[1]);

               // Third index will be Title if matched through Python script that does audio fingerprinting
               if (typeof response[2] !== 'undefined')
                    this.dataService.setFieldProperty('Name','Value',response[2]);

               // If the selected format is MP3 format and the Python script tried but fails to get the artist and album
               // Make artist and name fields required
               if (this.dataService.isMP3Format()) {
                    if (this.dataService.getFieldProperty('Artist','Value') === "") {
                         this.dataService.setFieldProperty('Artist','Required',true);
                         this.dataService.showSnackBarMessage('Please enter the artist');
                         this.currentStep = 1;
                         this.formatOverride = true;
                         this.isSubmitted = false;

                         if (this.dataService.getFieldProperty('Name','Value') !== "")
                              return;
                    }

                    if (this.dataService.getFieldProperty('Name','Value') === "") {
                         this.dataService.setFieldProperty('Name','Required',true);
                         this.dataService.showSnackBarMessage('Please enter the name');
                         this.currentStep = 1;
                         this.formatOverride = true;
                         this.isSubmitted = false;
                         return;
                    }

                    this.updateStatus('The file has been downloaded. Writing the ID3 tags');

                    this.currentStep++;

                    this.processSteps();
               } else if (!this.dataService.isMP3Format() && !this.moveToServer) { // If the format is not MP3 and we aren't moving to the server we are done
                    // The response returns the URL for the downloaded file
                    this.downloadLink = decodeURIComponent(response[0].replace(/\+/g, ' '));

                    this.updateStatus('The file is ready for you to download or move to your server');

                    this.finished();

                    return;
               }
          },
          error => {
               // Stop the REST service that gets the download status
               if (!this.debugging) {
                    this.downloadProgressSubscription.unsubscribe();

                    // Call REST service to delete download progress temp db
                    this.dataService.deleteDownloadProgress().subscribe((response) => {
                    },
                    error => {
                         this.handleError(Response, error);
                    });
               }
          
               this.handleError(Response, error);
          });
     }

     // Download click button event
     downloadLinkClicked() {
          const fileNameWithoutPath=this.downloadLink.substr(this.downloadLink.lastIndexOf("/")+1);

          // Subscribe to DL service and wait for the done response 
          this.downloads.download(this.downloadLink, fileNameWithoutPath).subscribe((response) => {
               //console.log("Response: " + response.state);
               if (response.state === "DONE") {
                    if (!this.debugging) {
                         // Send request to delete the file
                         this.dataService.deleteDownloadFile(this.downloadLink).subscribe((response) => { 
                              //console.log(response)
                         },
                         error => {
                              console.log("An error " + error + " occurred deleting the file from the server 1");
                         });
                    }
               }
          },
          error => {
               console.log("An error " + error + " occurred deleting the file from the server 2");
          });

          this.downloadButtonVisible = false;

          // Hide moveToServer button to prevent subsequent clicks
          this.moveToServerButtonVisible = false;
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
          this.debuggingCheckboxVisible = false;

          // Stop the REST service that gets the download status
          if (!this.debugging) {
               this.downloadProgressSubscription.unsubscribe();

               // Delete download progress temp db
               this.dataService.deleteDownloadProgress().subscribe((response) => {
               },
               error => {
                    this.handleError(Response, error);
               });
          }
     }

     // Get progress of youtube-dl
     getDownloadProgress() {
          if (this.debugging)
               return;

          this.downloadProgressSubscription = interval(50)
               .subscribe(()=>{
                    this.dataService.getDownloadProgress()
                    .subscribe((jsonResult:Object)=>{
                         if(jsonResult !== null && !jsonResult[1])
                              this.downloadStatus=jsonResult[0];
                    },
                    error => {
                         //show errors
                         console.log(error)
                    }
               );
          });
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
                    return (typeof this.urlParams[name] !== 'undefined' && decodeURI(this.urlParams[name]) || null);
               case 'ALBUM':
                    return (typeof this.urlParams[name] !== 'undefined' && decodeURI(this.urlParams[name]) || null);
               case 'FORMAT':
                    return (typeof this.urlParams[name] !== 'undefined' && decodeURI(this.urlParams[name]) || null);
               case 'GENRE':
                    return (typeof this.urlParams[name] !== 'undefined' && decodeURI(this.urlParams[name]) || null);
               case 'NAME':
                    if (typeof this.urlParams[name] === 'undefined')
                         return null;
                    
                    let title = this.urlParams[name];

                    title = title.replace('Title=', '');
                    title = title.replace(' (HQ)', '');
                    title = title.replace(' (Acoustic / Audio) - YouTube', '');
                    title = title.replace(' - YouTube', '');

                    return decodeURI(title);
               case 'TRACKNUM':
                    return (typeof this.urlParams[name] !== 'undefined' && decodeURI(this.urlParams[name])  || null);
               case 'MOVETOSERVER':
                    return (typeof this.urlParams[name] !== 'undefined' ? this.urlParams[name] : null);
               case 'YEAR':
                    return (typeof this.urlParams[name] !== 'undefined' ? decodeURI(this.urlParams[name]) : null);
               case 'DEBUGGING':
                    return (typeof this.urlParams[name] !== 'undefined' && this.urlParams[name] === 'true' ? true : null);
               default:
                    return null;
          }
     }

     // Handle errors returned by observable
     handleError(response, error) {
          // write error status
          this.updateStatus(`A fatal error occurred`  + (response[0] !== null ? `: ${response[0]}` : ``));

          console.log(`An error occurred at step ${this.currentStep} with the error ${error[0]}`);

          if (!this.debugging)
               this.downloadProgressSubscription.unsubscribe();

          this.finished(true);
     }

     // Move To Server Task
     moveFileToServer() {
          if (this.moveToServer || this.allowMoveToServer) {
               this.dataService.moveFile(this.fileName, this.dataService.isAudioFormat())
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
     }

     // Event if the user clicks on the Move To Server button
     moveToServerClick() {
          // If we are able to move to server 
          if (this.allowMoveToServer)
               this.moveFileToServer();
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
          // Call data service based on the current step
          switch (this.currentStep) {
               case 0: // Download the file                    
                    this.downloadFile();

                    break;
               case 1: // Write ID3 tags
                    this.writeID3Tags()

                    break;
               case 2: // Call the data service to move the file to the media server
                    this.moveFileToServer();

                    break;
          }
     }

     showSupportedSitesToggle() {
          if (this.supportedURLsVisible && typeof this.supportedURLsDataSource === 'undefined') {
               this.dataService.getSupportedURLs().subscribe((response) => {
                    this.supportedURLsDataSource=new MatTableDataSource(response);
     
                     // Assign custom filter function
                     this.supportedURLsDataSource.filterPredicate = this.createSupportedURLsFilter();
     
                    this.supportedURLsDataSource.paginator = this.supportedURLsPaginator;
     
                    this.supportedURLsDataSource.sort = this.sort;
               },     
               error => {
                    this.handleError(Response, error);
               });    
          }
     }
     
     // If you double click twice on the status message before submitting, it will show the checkbox to toggle the Debugging checkbox
     // so you can enable Debugging after loading the form but before submitting it
     statusDoubleClick() {
          if (this.isSubmitted)
               return;

          this.statusCountClick++;

          if (this.statusCountClick == 2) {
               this.debuggingCheckboxVisible = true;
               this.statusCountClick = 0;
          }
     }

     // Called by binding of click event of submit button
     submitClick() {
          // After the last step has completed, the submit button text changes to restart. When this button is clicked, 
          // the form will reset itself and only save the values if the save values checkbox is checked
          if (this.isFinished) {
               // If the Save Values checkbox is not checked
               if (!this.saveValues)                    
                    this.dataService.clearFieldValues(); // Clear all of the field values

               // reset the stepper count
               this.currentStep = 0;

               // Set initial status message
               this.statusMessage = 'Fields marked with an * are required';

               // Reset submitted status
               this.isSubmitted = false;

               this.isFinished = false;

               this.formatOverride = false;

               this.downloadButtonVisible = false;

               this.moveToServerButtonVisible = false;

               return;
          }

          // Since I use Python fingerprinting, you don't have to fill in the artist and name if an MP3 format is selected. formatOverride is set to true 
          // if python fingerprinting cannot identify the track in which case the artist and song name ARE required
          if (this.dataService.isMP3Format() && !this.formatOverride) {
               this.dataService.setFieldProperty('Artist','Required',false);
               this.dataService.setFieldProperty('Name','Required',false);               
          }

          // Validate the required fields
          const validateResult = this.dataService.validateFields();

          if (validateResult !== null) {
               this.dataService.showSnackBarMessage(validateResult);
               return;
          }
          
          // Set initial status
          if (this.currentStep === 0)
               this.updateStatus('Starting the download');

          this.formatOverride = false;

          // Show steps
          this.isSubmitted = true;

          // Start the process
          this.processSteps();
     }

     // Used to prevent the entire DOM tree from being re-rendered every time that there is a change
     trackByFn(index, item) {
          return index; // or item.id
     }

     // Update the status message
     updateStatus(newStatus: string) {
          this.statusMessage = newStatus;
     }

     // Write ID3 tags step
     writeID3Tags() {
          // Call data service to write ID3 tags
          this.dataService.writeID3Tags(this.fileName)
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
     }
}