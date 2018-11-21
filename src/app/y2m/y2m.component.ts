import { Component, OnInit } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';

@Component({
     selector: 'app-y2m',
     templateUrl: './y2m.component.html',
     styleUrls: ['./y2m.component.css']
})

export class Y2mComponent implements OnInit {
     currentStep = 0;
     downloadLink = '';
     downloadLinkVisible = false;
     fields: any = {
          URL: {
               Required: true,
               Value: (this.getParam('URL') !== '' && typeof this.getParam('URL') !== 'undefined' ? this.getParam('URL') : ''),
          },
          Artist: {
               Required: true,
               Value: this.parseTitle('artist'),
          },
          Album: {
               Required: false,
               Value: '',
          },
          Name: {
               Required: true,
               Value: this.parseTitle('title'),
          },
          'Track #': {
               Required: false,
               Value: '',
          },
          Genre: {
               Required: true,
               Value: '',
          },
          Year: {
               Required: false,
               Value: '',
          }
     };
     isFinished = false;
     isSubmitted = false;
     localFile = '';
     moveToServer = false;
     readonly objectKeys = Object.keys(this.fields);
     stepperStepNames = ['Started download', 'Finished download', 'Writing ID3 Tags', 'Renaming the file'];
     statusMessage = 'Fields marked with an * are required';

     constructor(public snackBar: MatSnackBar) {}

     ngOnInit() {
          if (this.getParam("MoveToServer") != null) {
               this.moveToServer = true;
          }

          if (this.moveToServer === true) {
               this.stepperStepNames.push('Moving the file to new location');
          }
     }

     // Event handler when download link is clicked
     downloadLinkClicked() {
          window.location.href = this.downloadLink;

          // Delete the file 5 seconds after presenting the download link
          /*setTimeout(function() {
               // Run the AJAX request to delete the file
               fetch(`./php/serverTasks.php?DeleteFile&Filename=${this.localFile}`, {method: 'GET'}).then(response => response.json()).then((response) => {
                    this.handleFetchResponse(response);
               }).catch(error => {
                    console.log('request failed', error);
               });
          }, 5000);*/
     }

     // Method called when all statuses have finished running
     finished() {
          this.isSubmitted = true;

          if (this.stepperStepNames.length === 4) {
               this.downloadLinkVisible = true;
          }

          this.isFinished =  true;
     }

     // Get URL parameter
     getParam(name: string) {
          const query = window.location.search.substr(1);

          if (query === '') {
               return;
          }

          const res = query.split('&');

          if (name === 'URL' && res[0] && res[0].indexOf("URL=") != -1) {
               const result = decodeURI(res[0].replace('URL=', ''));

               if (typeof result !== 'undefined' && result !== '') {
                    return result;
                } else {
                    return '';
                }
          } else if (name === 'Title' && res[0] && res[0].indexOf("Title=") != -1) {
               let title = res[1];
               title = title.replace('Title=', '');
               title = title.replace(' (HQ)', '');

               return decodeURI(title);
          } else if (name === 'MoveToServer' && res[0] && res[0].indexOf("MoveToServer=") != -1) {
               return res[0];
          } else {
               return '';
          }
     }

     // Parse title from URL
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

          if (section === 'artist' && res[0]) {
               return res[0].trim();
          } else if (section === 'title' && res[1]) {
               return res[1].trim();
          }
     }

     processSteps() {
          let params = '';

          // Build fetch parameters
          switch (this.currentStep) {
               case 0:
                    params = `?step=1&URL=${this.fields['URL'].Value}`;
                    break;
               case 1:
                    params = `?step=2&Filename=${this.localFile}&Artist=${this.fields['Artist'].Value}&Album=${this.fields['Album'].Value}&TrackName=${this.fields['Name'].Value}&TrackNum=${this.fields['Track #'].Value}&Genre=${this.fields['Genre'].Value}&Year=${this.fields['Year'].Value}`;
                    break;
               case 2:
                    // Step count is included because if the file is downloaded, theres only steps 0-3. If the file is moved to a server, there's one extra step so the server side action has 1 more step if we need to move it to the server
                    params = `?step=3&Filename=${this.localFile}&TrackName=${this.fields['Name'].Value}&TrackNum=${this.fields['Track #'].Value}\&StepCount=${this.stepperStepNames.length}`;
                    break;
               case 3:
                    params = `?step=4&Filename=${encodeURI(this.localFile)}&Artist=${this.fields['Artist'].Value}&Album=${this.fields['Album'].Value}`;
                    break;
          }

          // Run the AJAX request
          fetch('./php/serverTasks.php' + params, {method: 'GET'}).then(response => response.json()).then((response) => {
               if (response[0].indexOf('ERROR') !== -1) {
                    // write error status
                    this.updateStatus(`A fatal error occurred: ${response[0]}`);

                    // Set submitted status
                    this.isSubmitted = true;

                    return;
               }

               switch (this.currentStep) {
                    case 0: // Downloading the file
                         this.localFile = response[0];

                           /*
                           if (response[1] !== '') {
                                let newfieldObj={...this.state.fieldObj};
                                newfieldObj['Artist'].Value=response[1];
                                this.setState({fieldObj : newfieldObj});
                           }

                           if (response.Value !== '') {
                                let newfieldObj={...this.state.fieldObj};
                                newfieldObj['Title'].Value=response.Value;
                                this.setState({fieldObj : newfieldObj});
                           }
                           */

                         this.updateStatus('The file has been downloaded. Writing the ID3 tags');

                         // Update the status and continue on to the next step
                         this.currentStep = 1;

                         this.processSteps();

                         break;
                    case 1: // Writing the ID3 tags
                         this.updateStatus('The ID3 tags have been written. Renaming the file');

                         // Update the status and continue on to the next step
                         this.currentStep = 2;

                         this.processSteps();

                         break;
                    case 2: // Rename the file
                         // The response returns the local file including the path as well as the URL for the downloaded file. This is needed so we can delete the local file later
                         this.downloadLink = response[0];
                         this.localFile = response[1];

                         // If this is the last step, finalize everything
                         if (this.stepperStepNames.length === 4) {
                              this.updateStatus('Please click on the download button');
                              this.currentStep = 3;
                              this.finished();
                         } else {
                              this.currentStep = 3;
                              this.processSteps();
                         }

                          break;
                    case 3: // Move the file to the new location
                         this.updateStatus('The file has been moved to the new location');

                         this.currentStep = 4;

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
          this.snackBar.open(message, '', config);
     }

     // submit button click event
     submitClick() {
          // When the last step has been completed, the submit button changes to restart. When clicked, the form will reset everything to the default
          if (this.isFinished === true) {
               // Clear all of the field values
               for (const key in this.fields) {
                    if (key != null) {
                         this.fields[key].Value = '';
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

               return;
          }

          // Validate the required fields
          if (this.fields['URL'].Value === '') {
               this.showSnackBarMessage('Please enter the URL');
               return;
          }

          if (!this.fields['URL'].Value.startsWith('http://') && !this.fields['URL'].Value.startsWith('https://')) {
               this.showSnackBarMessage('Please enter a valid URL beginning with http:// or https://');
               return;
          }

          if (this.fields['URL'].Value.indexOf('youtube.com') === -1 && this.fields['URL'].Value.indexOf('youtu.be') === -1) {
               this.showSnackBarMessage('Only YouTube URLs are allowed');
               return;
          }

          if (this.fields['Artist'].Value === null) {
               this.showSnackBarMessage('Please enter the artist');
               return;
          }

          if (this.fields['Album'].Required === true && this.fields['Album'].Value === null) {
               this.showSnackBarMessage('Please enter the album');
               return;
          }

          if (this.fields['Name'].Value === null) {
               this.showSnackBarMessage('Please enter the track name');
               return;
          }

          if (this.fields['Track #'].Required === true && this.fields['Track #'].Value === null) {
               this.showSnackBarMessage('Please enter the track #');
               return;
          }

          if (this.fields['Year'].Required === true && this.fields['Year'].Value === null) {
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
