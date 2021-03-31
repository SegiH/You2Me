/*
     TODO:
     
     download status message is currently hidden - Find place to put it   
     Think about possibly adding progress bar. percent doesnt get added "evenly" to the DB  
     
     this.progressInterval = setInterval(() => {
      this.progressValue += 1;

      if (this.progressValue == 100)
           clearInterval(this.progressInterval);
    }, 1000);


     Dailymotion long videos time out without an error message. 5 minutes works. 15 minutes fails
     
     Before publishing:
          1. Make sure debugging is off!
          2. Make sure proxy.conf doesn't have my server address and make sure php doesn't have it either.

     URL for testing: https://www.youtube.com/watch?v=Wch3gJG2GJ4
     https://blog.logrocket.com/build-a-youtube-video-search-app-with-angular-and-rxjs/
*/
import { Component, Inject, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogModel, ConfirmDialogComponent } from '../confirmdialog/confirmdialog.component'
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { DataService } from '../core/data.service';
import { DownloadService } from '../core/download.service';
import { DOCUMENT } from '@angular/common';
import { MatStepper } from '@angular/material/stepper';
import { MatSort } from '@angular/material/sort';
import { interval } from "rxjs";
import { MatAccordion } from '@angular/material/expansion';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
     selector: 'app-y2m',
     templateUrl: './y2m.component.html',
     styleUrls: ['./y2m.component.css']
})

export class Y2MComponent implements OnInit {
     addFieldsVisible = false;
     readonly allowMoveToServer = true;
     apiLoaded = false;
     confirmDialogVisible = false;
     debugging = false; // This should never be true when running production build
     debuggingCheckboxVisible = false;
     moveToServer = false; // global movetoServer preference specified by URL param. Default is false  
     newFormat: string = "";
     newURL: string = ""; // Sample urls for testing: https://www.youtube.com/watch?v=Wch3gJG2GJ4"; //https://www.youtube.com/watch?v=f4xqnh2UPeQ";
     searchResults: {};
     searchTerm: string = "";
     searchYTCardVisible=false;
     statusCountClick = 0;
     supportedURLsDataSource: MatTableDataSource<any>;
     supportedURLsVisible = false;
     urlParams: {};

     @ViewChild('supportedURLsPaginator') supportedURLsPaginator: MatPaginator;
     @ViewChildren(MatStepper) steppers: QueryList<any>;
     @ViewChildren(MatAccordion) searchResultsExpansionPanels: QueryList<any>;
     @ViewChild(MatSort) sort: MatSort;

     constructor(public dialog: MatDialog, public snackBar: MatSnackBar, public dataService: DataService, private downloads: DownloadService, @Inject(DOCUMENT) private document: Document,private sanitizer: DomSanitizer) { }

     ngOnInit() {
          // If URL parameter MoveToServer was provided and is allowed, add Moving the file to new location as a step
          if (this.getURLParam('MoveToServer') === 'true' && this.allowMoveToServer) {
               this.moveToServer = true;
          } else {
               this.moveToServer = false;
               document.title = 'You2Me';
          }

          // Save current debugging value
          const currDebugging = this.debugging;

          // Enable debugging if Debugging was provided as URL parameter. Otherwise default to currDebugging
          this.debugging = (this.getURLParam("Debugging") != this.debugging && this.getURLParam("Debugging") ? this.getURLParam("Debugging") : currDebugging);

          // Make sure that there aren't any invalid URL parameters
          const queryString = "&" + window.location.search.slice(1); // first URL parameter always begins with a ?. This replaces it with & so we can call split() on it using & as the delimiter
          const split_params = queryString.split("&");

          for (let i = 0; i < split_params.length; i++) {
               if (split_params[i] !== '') {
                    const param = split_params[i].split("=")[0]; // URL is in the form Name=Value; Get Name part of the parameter

                    if (!this.dataService.getURLParameters().includes(param))
                         this.dataService.showSnackBarMessage('The URL parameter ' + param + ' is not a valid URL parameter');
               }
          }

          const URL=this.getURLParam('URL');
          const name=this.getURLParam('Name');
          const format=this.getURLParam('Format');
          
          if (URL !== null && name != null && format != null) {
               this.dataService.addLink(URL, format, false);

               this.dataService.links[0]['Fields']['Name'].Value=name;
          }

          // Load Youtube player API code
          if (!this.apiLoaded) {
               // This code loads the IFrame Player API code asynchronously, according to the instructions at https://developers.google.com/youtube/iframe_api_reference#Getting_Started
               const tag = document.createElement('script');
               tag.src = 'https://www.youtube.com/iframe_api';
               document.body.appendChild(tag);
               this.apiLoaded = true;
          }

          // DELETE ME LATER
          //this.addButtonClick();
          //this.addButtonClick();

          //this.dataService.links[0]["CurrentStep"] = 2;
          //this.dataService.links[0]['IsFinished'] = true;
          //this.dataService.links[0]['IsSubmitted'] = true;
          //this.dataService.links[0]['StatusMessage'] = 'Your file is ready to download or move to your server.';
          //this.dataService.links[0]['Fields']['Artist'].Value='a';
          //this.dataService.links[0]['Fields']['Name'].Value='a';
     }

     // Event when the user clicks on Add button
     addButtonClick() {
          if (!this.addFieldsVisible) {
               this.addFieldsVisible = true;
               return;
          }

          this.newURL = this.newURL.trim();

          if (this.newURL == "") {
               this.dataService.showSnackBarMessage("Please enter the URL");
               return;
          }

          if (!this.newURL.startsWith("http://") && !this.newURL.startsWith("https://")) {
               this.dataService.showSnackBarMessage("The URL must begin with http or https");
               return;
          }

          if (this.dataService.URLExists(this.newURL)) {
               this.dataService.showSnackBarMessage("You cannot add the same URL more than once");
               return;
          }

          if (this.newFormat == "") {
               this.dataService.showSnackBarMessage("Please select the format");
               return;
          }

          this.dataService.addLink(this.newURL, this.newFormat, this.moveToServer); // If moveToServer is true, an extra step is added

          this.newURL = "";
          this.newFormat = "";

          this.addFieldsVisible = false;
     }

     addSearchResult(currSearchResult) {
          debugger;
          this.dataService.addLink(currSearchResult.id.videoId, "320k", false);
     }

     // apply filter for supported url search filters
     applyFilter(filterValue: string) {
          this.supportedURLsDataSource.filter = filterValue.trim().toLowerCase();
     }

     // Event when the user clicks on the cancel button to canel adding a link
     cancelAddClick() {
          this.addFieldsVisible = false;
     }

     // Confirm dialog
     confirmDialog(currLink: object, message: string): void {
          const dialogData = new ConfirmDialogModel(`${currLink['URL']}`, message);

          const dialogRef = this.dialog.open(ConfirmDialogComponent, {
               maxWidth: "400px",
               data: dialogData
          });

          dialogRef.afterClosed().subscribe(dialogResult => {
               if (dialogResult)
                    this.dataService.deleteLink(currLink['URL']);
          });
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

     deleteButtonClick(currLink: object) {
          this.confirmDialog(currLink, "Are you sure you want to delete this link ?");
     }

     deleteSearchResultsButtonClick() {
          this.searchYTCardVisible=false;
     }

     // Download file step
     downloadFile(currLink: object) {
          // Start timer that gets download progress
          if (!this.debugging)
               this.getDownloadProgress(currLink);

          // Call data service to download the file
          this.dataService.fetchFile(currLink, this.allowMoveToServer, this.debugging)
               .subscribe((response) => {
                    // Stop the REST service that gets the download status
                    if (!this.debugging)
                         currLink['DownloadProgressSubscription'].unsubscribe();

                    // Trap server side errors
                    if (response[0].includes('Error:')) {
                         this.handleError(currLink, response, response);
                         console.log(response[1]);
                         return;
                    }

                    // First index will be filename
                    currLink['Filename'] = response[0];

                    if (this.dataService.isAudioFormat(currLink['Format'])) {
                         // Second index will be Artist if matched through Python script that does audio fingerprinting
                         if (typeof response[1] !== 'undefined' && response[1] !== "")
                              currLink['Fields']['Artist'].Value = response[1];

                         // Third index will be Title if matched through Python script that does audio fingerprinting
                         if (typeof response[2] !== 'undefined' && response[2] !== "")
                              currLink['Fields']['Name'].Value = response[2];

                         if (typeof response[3] !== 'undefined' && response[3] !== "")
                              currLink['ThumbnailImage'] = response[3];

                         if (currLink['Fields']['Artist'].Value == '') {
                              this.dataService.showSnackBarMessage("Please enter the artist name");
                              currLink['CurrentStep'] = 2;
                              currLink['IsSubmitted'] = false;
                              return;
                         }
                    } else {
                         if (typeof response[1] !== 'undefined' && response[1] !== "")
                              currLink['ThumbnailImage'] = response[1];
                    }

                    if (currLink['Fields']['Name'].Value == '') {
                         this.dataService.showSnackBarMessage("Please enter the name");
                         currLink['CurrentStep'] = 2;
                         currLink['IsSubmitted'] = false;
                         return;
                    }

                    currLink['CurrentStep']++;

                    this.steppers.forEach(
                         stepper => {
                              if (stepper._document.getElementsByClassName("Stepper" + currLink['StepperIndex']).length != 0)
                                   this.incrementStepper(currLink);
                         }
                    );

                    if (this.dataService.isMP3Format(currLink['Format'])) {
                         currLink['StatusMessage'] = 'The file has been downloaded';
                         this.writeID3Tags(currLink);
                    } else {
                         // The response returns the URL for the downloaded file
                         currLink['DownloadLink'] = decodeURIComponent(response[0].replace(/\+/g, ' '));

                         currLink['StatusMessage'] = 'Your file is ready for you to download or move to your server';

                         this.steppers.forEach(
                              stepper => {
                                   if (stepper._document.getElementsByClassName("Stepper" + currLink['StepperIndex']).length != 0) {
                                        // Do this twice to skip to the last step
                                        this.incrementStepper(currLink);
                                        this.incrementStepper(currLink);
                                        console.log("Skipping to last step");
                                   }
                              }
                         );

                         if (this.moveToServer) {
                              this.moveFileToServer(currLink);
                         } else
                              this.finished(currLink);
                    }
               },
               error => {
                    // Stop the REST service that gets the download status
                    if (!this.debugging)
                         currLink['DownloadProgressSubscription'].unsubscribe();

                    this.handleError(currLink, Response, error);
               });
     }

     // Download click button event
     downloadButtonClicked(currLink: object) {
          const fileNameWithoutPath = currLink['DownloadLink'].substr(currLink['DownloadLink'].lastIndexOf("/") + 1);

          currLink['DownloadButtonClicked'] = true;

          // Subscribe to DL service and wait for the done response 
          this.downloads.download(currLink['DownloadLink'], fileNameWithoutPath).subscribe((response) => {
               //console.log("Response: " + response.state);
               if (response.state === "DONE") {
                    if (!this.debugging) {
                         // Send request to delete the file
                         this.dataService.deleteDownloadFile(currLink['DownloadLink']).subscribe((response) => {
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
     }

     // Handle event when all tasks have finished running
     finished(currLink: object, isError = false) {
          this.debuggingCheckboxVisible = false;

          while (currLink["CurrentStep"] < currLink["StepperStepNames"].length - 1) {
               this.incrementStepper(currLink);
               currLink["CurrentStep"]++;
          }

          currLink['IsFinished'] = true;

          // Stop the REST service that gets the download status
          if (!this.debugging)
               currLink['DownloadProgressSubscription'].unsubscribe();
     }

     // Get progress of youtube-dl
     getDownloadProgress(currLink: object) {
          if (this.debugging)
               return;

          this.dataService.setDownloadSubscription(currLink
               , interval(50)
                    .subscribe(() => {
                         this.dataService.getDownloadProgress(currLink)
                              .subscribe((jsonResult: Object) => {
                                   if (jsonResult !== null && !jsonResult[1]) {
                                        this.dataService.setDownloadStatusMessage(currLink, jsonResult[0]);
                                   }
                              },
                                   error => {
                                        //show errors
                                        console.log(error)
                                   }
                              );
                    }));
     }

     // Returns class name based on currLink
     getStepperClass(currLink: object) {
          return "Stepper" + this.dataService.getLinkKey(currLink);
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
          name = name.toUpperCase();

          switch (name) {
               case 'URL':
                    return (typeof this.urlParams[name] !== 'undefined' && this.urlParams[name] !== '' ? decodeURI(this.urlParams[name]) : null);
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
                    return (typeof this.urlParams[name] !== 'undefined' && decodeURI(this.urlParams[name]) || null);
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

     // Event when the user clicks on the Go button to start the download
     goButtonClick(currLink: object) {
          if (currLink['CurrentStep'] == 0) {
               // Validate fields
               const name = currLink['Fields']['Name'].Value;
               const artist = currLink['Fields']['Artist'].Value;
               const album = currLink['Fields']['Album'].Value;

               if (this.dataService.isAudioFormat(currLink['Format']) && !this.dataService.isMP3Format(currLink['Format'])) {
                    if (artist === "") {
                         this.dataService.showSnackBarMessage("Please enter the artist");
                         return;
                    }

                    if (name === "") {
                         this.dataService.showSnackBarMessage("Please enter the name");
                         return;
                    }

                    if (album === "")
                         currLink['Fields']['Album'].Value = 'Unknown';
               } else if (!this.dataService.isAudioFormat(currLink['Format']) && name === "") {
                    this.dataService.showSnackBarMessage("Please enter the name");
                    return;
               }

               currLink['IsSubmitted'] = true;

               currLink['StatusMessage'] = "Starting the download";

               this.downloadFile(currLink);
          } else if (currLink['CurrentStep'] == 2) {
               if (currLink['Fields']['Artist'].Value === "") {
                    this.dataService.showSnackBarMessage("Please enter the artist");
                    return;
               }

               if (currLink['Fields']['Name'].Value === "") {
                    this.dataService.showSnackBarMessage("Please enter the name");
                    return;
               }

               currLink['IsSubmitted'] = true;

               currLink['StatusMessage'] = "Writing the ID3 tags";

               this.writeID3Tags(currLink)
          }
     }

     // Handle errors returned by observable
     handleError(currLink: object, response, error) {
          // write error status
          currLink['StatusMessage'] = `A fatal error occurred` + (response[0] !== null ? `: ${response[0]}` : ``);

          console.log(`An error occurred at step ${currLink['CurrentStep']} with the error ${error[0]}`);

          if (!this.debugging)
               currLink['DownloadProgressSubscription'].unsubscribe();

          this.finished(currLink, true);
     }

     // Increments stepper
     incrementStepper(currLink: object) {
          this.steppers.forEach(
               stepper => {
                    if (stepper._document.getElementsByClassName("Stepper" + currLink['StepperIndex']).length != 0) {
                         // Do this twice to skip to the last step
                         stepper.selected.completed = true;
                         stepper.selected.editable = false;
                         stepper.next();
                    }
               }
          );
     }

     // Move To Server Task
     moveFileToServer(currLink: object) {
          if (!this.allowMoveToServer)
               return;

          currLink['MoveToServerButtonClicked'] = true;

          if (this.moveToServer || this.allowMoveToServer) {
               this.dataService.moveFile(currLink)
                    .subscribe((response) => {
                         // Trap server side errors
                         if (response[0].includes('Error:')) {
                              this.handleError(currLink, response, response);
                              return;
                         }

                         currLink['StatusMessage'] = 'The file has been moved to the server';

                         currLink['CurrentStep']++;

                         this.finished(currLink);
                    },
                         error => {
                              this.handleError(null, Response, error);
                         });
          }
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

     searchYTClick() {
          if (this.searchTerm == "") {
               this.dataService.showSnackBarMessage("Please enter the search term");
               return;
          }

          // Call data service to download the file
          this.dataService.searchVideos(this.searchTerm)
          .subscribe((response) => {
               this.searchResults=response.items;
          },
          error => {
               this.dataService.showSnackBarMessage("An error occurred searching YouTube");            
          });
     }

     // Event when the user clicks on the Search YT button - Shows Search YT panel
     showSearchYTClick() {
          this.searchYTCardVisible=true;      
     }

     // Event when user toggles show supported URLs checkbox
     showSupportedSitesToggle() {
          if (this.supportedURLsVisible && typeof this.supportedURLsDataSource === 'undefined') {
               this.dataService.getSupportedURLs().subscribe((response) => {
                    this.supportedURLsDataSource = new MatTableDataSource(response);

                    // Assign custom filter function
                    this.supportedURLsDataSource.filterPredicate = this.createSupportedURLsFilter();

                    this.supportedURLsDataSource.paginator = this.supportedURLsPaginator;

                    this.supportedURLsDataSource.sort = this.sort;
               },
               error => {
                    this.handleError(null, Response, error);
               });
          }
     }

     // If you buttons dont click twice on the toolbar before submitting, it will show the checkbox to toggle the Debugging checkbox
     // so you can enable Debugging after loading the form but before submitting it
     toolbarDoubleClick() {
          // If any links have been submitted ignore
          if (this.dataService.anySubmittedLinks())
               return;

          this.statusCountClick++;

          if (this.statusCountClick == 2) {
               this.debuggingCheckboxVisible = true;
               this.statusCountClick = 0;
          } else
               this.debuggingCheckboxVisible = false;
     }

     // Used to prevent the entire DOM tree from being re-rendered every time that there is a change
     trackByFn(index, item) {
          return index; // or item.id
     }

     // Write ID3 tags step
     writeID3Tags(currLink: object) {
          this.incrementStepper(currLink);

          // Call data service to write ID3 tags
          this.dataService.writeID3Tags(currLink)
               .subscribe((response) => {
                    // Trap server side errors
                    if (response[0].includes('Error:')) {
                         this.handleError(currLink, response, response);
                         return;
                    }

                    currLink['StatusMessage'] = 'The ID3 tags have been written.';

                    // The response returns the URL for the downloaded file
                    currLink['DownloadLink'] = decodeURIComponent(response[0].replace(/\+/g, ' '));

                    currLink['StatusMessage'] = 'Your file is ready to download or move to your server.';

                    currLink['CurrentStep']++;

                    this.steppers.forEach(
                         stepper => {                          
                              if (stepper._document.getElementsByClassName("Stepper" + currLink['StepperIndex']).length != 0) {                                   
                                   stepper._selectedIndex++;
                                   stepper.next();
                                   this.incrementStepper(currLink);
                              }
                         }
                    )

                    this.finished(currLink);

                    return;
               },
               error => {
                    this.handleError(currLink, Response, error);
               });
     }
}