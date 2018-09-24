import { Component } from '@angular/core';
import {MatSnackBar} from '@angular/material';

@Component({
    selector: 'y2m-root',
    templateUrl: './Y2M.component.html',
    styleUrls: ['./Y2M.component.css']
})

export class y2mComponent {
    currentStep = 0;
    downloadLinkVisible = false;
    fields: any [] = [
    {
         name: 'URL' ,
         required: true,
         value: 'https://www.youtube.com/watch?v=Wch3gJG2GJ4',
    },
    {
      name: 'Artist' ,
      required: true,
      value: 'a',
    },
    {
      name: 'Album' ,
      required: false,
      value: '',
    },
    {
      name: 'Name' ,
      required: true,
      value: 'a',
    },
    {
      name: 'Track number' ,
      required: false,
      value: '',
    },
    {
      name: 'Genre' ,
      required: true,
      value: 'Test',
    },
    {
      name: 'Year' ,
      required: false,
      value: '',
    },
    ];
    isFinished = false;
    isSubmitted = false;
    moveToServer = false;
    mp3File = '';
    statusMessage = 'Fields marked with an * are required';
    stepperStepNames: any [] = [
    {
      stepNum: 0,
      stepDesc: 'Started download'
    },
    {
      stepNum: 1,
      stepDesc: 'Finished download'
    },
    {
      stepNum: 2,
      stepDesc: 'Writing ID3 Tags'
    },
    {
      stepNum: 3,
      stepDesc: 'Renaming the file'
    }
  ];

    constructor(public snackBar: MatSnackBar) {
        if (this.moveToServer === true) {
          this.stepperStepNames.push({5: 'Moving the file to new location'});
        }
    }

    // Event handler when download link is clicked
    downloadLinkClick() {
        let fileName = this.mp3File;

        if (fileName.lastIndexOf('/') !== -1) {
              fileName = fileName.substring(fileName.lastIndexOf('/') + 1);
        }

        window.location.href = fileName;
    }

    // Method called when all status have finished
    finished() {
        this.isFinished = true;
        this.isSubmitted = true;
        this.downloadLinkVisible = true;
    }

    // Get URL parameter
    getParam(name) {
        const query = window.location.search.substr(1);

        if (query === '') {
            return;
        }

        const res = query.split('&');

        if (name === 'URL' && res[0]) {
        const result = decodeURI(res[0].replace('URL=', ''));

             if (typeof result !== 'undefined' && result !== '') {
                  return result;
             } else {
                  return '';
             }
        } else if (name === 'Title' && res[1]) {
             let title = res[1];
             title = title.replace('Title=', '');
             title = title.replace(' (HQ)', '');

             return decodeURI(title);
        } else {
             return '';
        }
    }

    // Parse title from URL
    parseTitle(section) {
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

    showSnackBarMessage(message: string) {
        this.snackBar.open(message, 'OK', {
          duration: 3000,
        });
    }

    // submit button click event
    submitClick() {
        const result = this.validateFields();

        if (result === 'Error') {
            return;
        }

        // Show steps
        this.isSubmitted = true;

        // Set initial status
        if (this.currentStep === 1) {
              this.statusMessage = 'Starting the download';
        }

        // When the last step has been completed, the submit button changes to restart. This will reset everything when restart is clicked
        if (this.isFinished === true) {
            // clear the value for all fields
            for (let i = 0; i < this.fields.length; i++) {
                this.fields[i].value = '';
            }

            return;
        }

        this.processSteps();
    }

    processSteps() {
        let param="";        

        // Build fetch parameters
        if (this.currentStep === 0) {
            param= `?step=1&URL=${this.fields[0].value}`;
        } else if (this.currentStep === 1) {
            param=`?step=2&Filename=${this.mp3File}
                          &Artist=${this.fields[1].value}
                          &Album=${this.fields[2].value}
                          &TrackName=${this.fields[3].value}
                          &TrackNum=${this.fields[4].value}
                          &Genre=${this.fields[5].value}
                          &Year=${this.fields[6].value}`;
        } else if (this.currentStep === 2) {
            param = `?step=3&Filename=${this.mp3File}
                            &Artist=${this.fields[1].value}
                            &Album=${this.fields[2].value}
                            &TrackName=${this.fields[3].value}
                            &TrackNum=${this.fields[4].value}
                            &Genre=${this.fields[5].value}
                            &Year=${this.fields[5].value}
                            &StepCount=${this.stepperStepNames.length}`;;
        } else if (this.currentStep === 3) {
            param = `?step=4&Filename=encodeURI(${this.mp3File})
                            &Artist=${this.fields[1].value}
                            &Album=${this.fields[2].value}`
        }

        // Run the AJAX request
        fetch('./php/serverTasks.php' + param, {method: 'GET', }).then(response => response.json()).then((response) => {
            if (response[0].indexOf("ERROR") !== -1) {
                // write error status
                this.statusMessage="A fatal error occurred: " + response[0];
  
                // Set submitted status            
                this.isSubmitted = true;
  
                return;
          }

          switch (this.currentStep) {
            case 1: 
                this.mp3File = response[0];

                this.statusMessage="The file has been downloaded. Writing the ID3 tags";
      
                // Update the status and continue on to the next step 
                this.currentStep = 2;
           
                this.processSteps();

                break;  
            case 2:
                this.statusMessage="The ID3 tags have been written. Renaming the file";
 
                // Update the status and continue on to the next step 
                this.currentStep = 3;
        
                this.processSteps();

                break;
            case 3:
                // save the new file name
                this.mp3File = response;

                // If this is the last step, finalize everything 
                if (this.stepperStepNames.length === 4) {          
                    this.statusMessage="Please click on the download button";
                    this.currentStep = 4;
                    this.finished();
                } else {
                    this.currentStep = 4;
            
                    this.processSteps();
                }

                break;
            case 4:
                this.statusMessage="The file has been moved to the new location";

                this.currentStep = 5;
              
                this.finished();

                break;
            default:
                alert("Unknown AJAX status");
          }
        }).catch(error => {
                console.log('request failed', error);
        });
    }

    // Validate all of the text fields
    validateFields() {
        for (let i = 0; i < this.fields.length; i++) {
              if (this.fields[i].required === true && this.fields[i].value === '') {
                  this.showSnackBarMessage('Please enter the ' + this.fields[i].name);
                  return 'Error';
              }

              if (this.fields[i].name === 'URL') {
                  if (!this.fields[i].value.startsWith('http://') && !this.fields[i].value.startsWith('https://')) {
                      this.showSnackBarMessage('Please enter a valid URL beginning with http:// or https://');
                      return 'Error';
                  }

                  if (this.fields[i].value.indexOf('youtube.com') !== -1 && this.fields[i].value.indexOf('youtu.be') !== -1 ) {
                      this.showSnackBarMessage('Only YouTube URLs are allowed');
                      return 'Error';
                  }
              }
          }
    }
}
