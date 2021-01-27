import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { throwError, Observable } from 'rxjs/';
import { catchError} from 'rxjs/operators';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
@Injectable()
export class DataService {
     currentFormat = '';
     fields: any  = {
          'URL':  { 
               'Required':true,
               'Value': "",
               'Disabled': false
          },
          'Artist': {
               'Required':true,
               'Value': "",
               'Disabled': false
          },
          'Album': {
               'Required':false,
               'Value': "",
               'Disabled': false
          },
          'Name': {
               'Required':true,
               'Value': "",
               'Disabled': false
          },
          'TrackNum': {
               'Required':false,
               'Value': "",
               'Disabled': false
          },
          'Genre': {
               'Required':false,
               'Value': "",
               'Disabled': false
          },
          'Year': {
               'Required':false,
               'Value': "",
               'Disabled': false
          }
     };

     fieldKeys = Object.freeze(Object.keys(this.fields));

     formats: Object = {};
     formatKeys = [];
     readonly stepperStepNames = ['Started download', 'Finished download', 'Writing ID3 Tags'];
     readonly URLParameters = ['URL','Artist','Album','Format','Genre','Name','TrackNum','MoveToServer','Year','Debugging'];
    
     constructor(public snackBar: MatSnackBar, private http: HttpClient) {
          this.loadFormats().subscribe((response) => {
               if (response === null)
                    return Promise.reject('Null response when getting formats');

               response.map(x => this.formats[x.FormatName] = { FormatDisplayName : x.FormatDisplayName, FormatTypeName: x.FormatTypeName, IsMP3Format: (x.IsMP3Format == "1" ? true : false) } );
               Object.freeze(this.formats);
            
               response.map(x => this.formatKeys.push(x.FormatName));
               Object.freeze(this.formatKeys);            

               if (this.currentFormat !== '' && typeof this.formats[this.currentFormat] === 'undefined') {
                    this.showSnackBarMessage(`The format provided is not valid`);
                    this.currentFormat='';
               }
          },
         error => {
               const formats= [
                    {"FormatID":"1","0":"1","FormatDisplayName":"aac","1":"aac","FormatName":"aac","2":"aac","FormatTypeID":"1","3":"1","IsMP3Format":"0","4":"0","FormatTypeName":"Audio","5":"Audio"},
                    {"FormatID":"2","0":"2","FormatDisplayName":"flac","1":"flac","FormatName":"flac","2":"flac","FormatTypeID":"1","3":"1","IsMP3Format":"0","4":"0","FormatTypeName":"Audio","5":"Audio"},
                    {"FormatID":"3","0":"3","FormatDisplayName":"m4a","1":"m4a","FormatName":"m4a","2":"m4a","FormatTypeID":"1","3":"1","IsMP3Format":"0","4":"0","FormatTypeName":"Audio","5":"Audio"},
                    {"FormatID":"4","0":"4","FormatDisplayName":"mp3 128k","1":"mp3 128k","FormatName":"128k","2":"128k","FormatTypeID":"1","3":"1","IsMP3Format":"1","4":"1","FormatTypeName":"Audio","5":"Audio"},
                    {"FormatID":"5","0":"5","FormatDisplayName":"mp3 192k","1":"mp3 192k","FormatName":"192k","2":"192k","FormatTypeID":"1","3":"1","IsMP3Format":"1","4":"1","FormatTypeName":"Audio","5":"Audio"},
                    {"FormatID":"6","0":"6","FormatDisplayName":"mp3 256k","1":"mp3 256k","FormatName":"256k","2":"256k","FormatTypeID":"1","3":"1","IsMP3Format":"1","4":"1","FormatTypeName":"Audio","5":"Audio"},
                    {"FormatID":"7","0":"7","FormatDisplayName":"mp3 320k","1":"mp3 320k","FormatName":"320k","2":"320k","FormatTypeID":"1","3":"1","IsMP3Format":"1","4":"1","FormatTypeName":"Audio","5":"Audio"},
                    {"FormatID":"8","0":"8","FormatDisplayName":"mp3 VBR 0 (Best)","1":"mp3 VBR 0 (Best)","FormatName":"0","2":"0","FormatTypeID":"1","3":"1","IsMP3Format":"1","4":"1","FormatTypeName":"Audio","5":"Audio"},
                    {"FormatID":"9","0":"9","FormatDisplayName":"mp3 VBR (5) (OK)","1":"mp3 VBR (5) (OK)","FormatName":"5","2":"5","FormatTypeID":"1","3":"1","IsMP3Format":"1","4":"1","FormatTypeName":"Audio","5":"Audio"},
                    {"FormatID":"10","0":"10","FormatDisplayName":"mp3 VBR (9) (Worst)","1":"mp3 VBR (9) (Worst)","FormatName":"9","2":"9","FormatTypeID":"1","3":"1","IsMP3Format":"1","4":"1","FormatTypeName":"Audio","5":"Audio"},
                    {"FormatID":"11","0":"11","FormatDisplayName":"opus","1":"opus","FormatName":"opus","2":"opus","FormatTypeID":"1","3":"1","IsMP3Format":"0","4":"0","FormatTypeName":"Audio","5":"Audio"},
                    {"FormatID":"12","0":"12","FormatDisplayName":"vorbis","1":"vorbis","FormatName":"vorbis","2":"vorbis","FormatTypeID":"1","3":"1","IsMP3Format":"0","4":"0","FormatTypeName":"Audio","5":"Audio"},
                    {"FormatID":"13","0":"13","FormatDisplayName":"wav","1":"wav","FormatName":"wav","2":"wav","FormatTypeID":"1","3":"1","IsMP3Format":"0","4":"0","FormatTypeName":"Audio","5":"Audio"},
                    {"FormatID":"14","0":"14","FormatDisplayName":"No conversion","1":"No conversion","FormatName":"original","2":"original","FormatTypeID":"2","3":"2","IsMP3Format":"0","4":"0","FormatTypeName":"Video","5":"Video"},
                    {"FormatID":"15","0":"15","FormatDisplayName":"Convert to avi","1":"Convert to avi","FormatName":"avi","2":"avi","FormatTypeID":"2","3":"2","IsMP3Format":"0","4":"0","FormatTypeName":"Video","5":"Video"},
                    {"FormatID":"16","0":"16","FormatDisplayName":"Convert to flv","1":"Convert to flv","FormatName":"flv","2":"flv","FormatTypeID":"2","3":"2","IsMP3Format":"0","4":"0","FormatTypeName":"Video","5":"Video"},
                    {"FormatID":"17","0":"17","FormatDisplayName":"Convert to mkv","1":"Convert to mkv","FormatName":"mkv","2":"mkv","FormatTypeID":"2","3":"2","IsMP3Format":"0","4":"0","FormatTypeName":"Video","5":"Video"},
                    {"FormatID":"18","0":"18","FormatDisplayName":"Convert to mp4","1":"Convert to mp4","FormatName":"mp4","2":"mp4","FormatTypeID":"2","3":"2","IsMP3Format":"0","4":"0","FormatTypeName":"Video","5":"Video"},
                    {"FormatID":"19","0":"19","FormatDisplayName":"Convert to ogg","1":"Convert to ogg","FormatName":"ogg","2":"ogg","FormatTypeID":"2","3":"2","IsMP3Format":"0","4":"0","FormatTypeName":"Video","5":"Video"},
                    {"FormatID":"20","0":"20","FormatDisplayName":"Convert to webm","1":"Convert to webm","FormatName":"webm","2":"webm","FormatTypeID":"2","3":"2","IsMP3Format":"0","4":"0","FormatTypeName":"Video","5":"Video"}];

               formats.map(x => this.formats[x.FormatName] = { FormatDisplayName : x.FormatDisplayName, FormatTypeName: x.FormatTypeName, IsMP3Format: (x.IsMP3Format == "1" ? true : false) } );
               Object.freeze(this.formats);

               Object.keys(formats).map(x => this.formatKeys.push(formats[x].FormatName));
               Object.freeze(this.formatKeys);

               if (this.currentFormat !== '' && typeof this.formats[this.currentFormat] === 'undefined') {
                    this.showSnackBarMessage(`The format provided is not valid`);
                    this.currentFormat='';
               }
          });
     }
     
     addStep(newStep) {
          this.stepperStepNames.push(newStep);
     }
     
     clearFieldValues() {
          this.fieldKeys.forEach(key => {
               this.fields[key].Value = "";
          });
     }

     deleteDownloadFile(fileName: string) {
          const params = `?DeleteDownloadFile` +
                         `&Filename=${fileName}`
                       
          return this.processStep(params);
     }

     deleteDownloadProgress() {
          return this.processStep(`?DeleteDownloadProgress=true`);
     }

     downloadFile(url: string): Observable<Blob> {
          return this.http.get(url, {
               responseType: 'blob'
          })
     }

     fetchFile(movetoServer: boolean, allowMoveToServer: boolean, debugging: boolean) {
          const fileName: string = (this.isAudioFormat() && !isNaN(parseInt(this.fields.TrackNum.Value)) ? this.fields.TrackNum.Value + " " : "" ) + (this.fields.Name.Value != "" ? this.fields.Name.Value : "Unknown");
          
          // Remove this step when you aren't generating an mp3
          if (!this.isMP3Format())
               this.stepperStepNames.splice(this.stepperStepNames.indexOf('Writing ID3 Tags'), 1);

          // extra URL parameters in a Youtube link causes issues for youtube-dl
          if (this.fields.URL.Value.includes('youtube.com')) {
               const arr = this.fields.URL.Value.split('&');

               this.fields.URL.Value = arr[0];
          }

          const params = `?DownloadFile` +
                         `&URL=${this.fields.URL.Value}` +
                         `&Filename=${this.rfc3986EncodeURIComponent(fileName)}` +
                         `&Debugging=${debugging}` +
                         '&MoveToServer=' + (movetoServer ? "true" : "false") +
                         '&AllowMoveToServer=' + (allowMoveToServer ? "true" : "false") +
                         (this.isAudioFormat()
                              ? `&IsAudioFormat=true` + (this.isMP3Format() ? `&Bitrate=${this.currentFormat}` : ``) + `&AudioFormat=${this.currentFormat}`
                              : `&IsVideoFormat=true&VideoFormat=${this.currentFormat}`);

          return this.processStep(params);
     }

     // Called by binding to [class.hidden] of mat-form-field.
     fieldIsHidden(key: string) {
          // Specified values are the fields to hide
          const videoHideFields = Object.freeze(['Artist', 'Album', 'TrackNum', 'Genre', 'Year']);
          const nonMP3HideFields = Object.freeze(['TrackNum', 'Genre', 'Year']);
        
          const thisField = this.getField(key);

          return (
               // If the fields property is set to disabled this is the de-facto determiner whether this field is enabled or disabled
               thisField !== null && thisField.Disabled)
               || (
                    // If the format is a video format, hide these fields
                    (!this.isAudioFormat() && videoHideFields.includes(key))
                    ||
                    // If the format is an audio format but is not MP3, hide these fields
                    (this.isAudioFormat() && (!this.isMP3Format() && nonMP3HideFields.includes(key))
               )
          );
     }

     getCurrentFormat() {
          return this.currentFormat;
     }

     getDownloadProgress() {
          return this.processStep(`?GetDownloadProgress=true`);
     }

     getField(fieldName: string) {
          if (typeof this.fields[fieldName] === 'undefined')
               return null;
          else
               return this.fields[fieldName];
     }

     getFieldKeys() {
          return this.fieldKeys;
     }

     getFieldProperty(fieldName: string,propertyName: string) {
          if (typeof this.fields[fieldName] === 'undefined')
               return null;
          else
               return this.fields[fieldName][propertyName];
     }

     getFormatKeys() {
          return this.formatKeys;
     }

     getSteps() {
          return this.stepperStepNames;
     }

     getSupportedURLs() {
          return this.processStep(`?GetSupportedURLs`);
     }

     getURLParameters() {
          return this.URLParameters;
     }

     private handleError(error: Response | any) {
          if (error.error instanceof Error) {
               const errMessage = error.error.message;

               return throwError(errMessage);
               // Use the following instead if using lite-server
               // return Observable.throw(err.text() || 'backend server error');
          }

          return throwError(error || 'Node.js server error');
     }

     // Is currently selected format an audio format
     isAudioFormat() {
          let isAudio = false;

          Object.keys(this.formats).forEach(key => {
               if (key === this.currentFormat && this.formats[key].FormatTypeName === 'Audio')
                    isAudio = true;              
          });

          return isAudio;
     }

     // Is currently selected format an mp3 format
     isMP3Format() {
          let isMP3 = false;

          Object.keys(this.formats).forEach(key => {
               if (key === this.currentFormat && this.formats[key].FormatTypeName === 'Audio' && this.formats[key].IsMP3Format)
                    isMP3=true; 
          });

          return isMP3;
     }
    
     loadFormats() {
          return this.processStep(`?GetFormats=true`);
     }

     moveFile(localFile: string, isAudio: boolean) {
          const params = `?MoveFile` +
                         `&MoveToServer=true`  +
                         `&Filename=${localFile}` +
                         `&Artist=${this.rfc3986EncodeURIComponent(this.fields.Artist.Value)}` +
                         (isAudio
                         ? `&IsAudioFormat=true` + (typeof this.fields.Album.Value !== 'undefined' ? `&Album=${this.rfc3986EncodeURIComponent(this.fields.Album.Value)}` : '')
                         : `&IsVideoFormat=true`);

          return this.processStep(params);
     }

     processStep(params: String) {
          return this.http.get<any>('/php/serverTasks.php' + params)
               .pipe(
                    catchError(this.handleError)
               );
     }

     // Escapes all special characters so they can safely be passed as URL parameters
     private rfc3986EncodeURIComponent(str) {  
          return encodeURIComponent(str).replace(/[!'()*]/g, escape);  
     }

     setCurrentFormat(newformat: string) {
          this.currentFormat = newformat;
     }

     setFieldProperty(fieldName: string,propertyName: string, newValue: any) {
          if (typeof this.fields[fieldName] === 'undefined')
               return null;
          else
               this.fields[fieldName][propertyName] = newValue;
     }

     showSnackBarMessage(message: string) {
          const config = new MatSnackBarConfig();
          config.duration = 3000;
          this.snackBar.open(message, 'OK', config);
     }

     validateFields() {
          if (this.fields.URL.Value ===  null || this.fields.URL.Value === '')
               return 'Please enter the URL';
       
          if (this.fields.URL.Value !== null && this.fields.URL.Value !== '')
               if (!this.fields.URL.Value.startsWith('http://') && !this.fields.URL.Value.startsWith('https://'))
                    return 'Please enter a valid URL beginning with http:// or https://';
            
          if (!this.fieldIsHidden('Artist') && (this.fields.Artist.Required && (this.fields.Artist.Value === null || this.fields.Artist.Value === '')))
               return 'Please enter the artist';
        
          if (!this.fieldIsHidden('Album') && this.fields.Album.Required && (this.fields.Album.Value === null || this.fields.Album.Value === ''))
               return 'Please enter the album';
       
          if (this.fields.Name.Required && (this.fields.Name.Value === null || this.fields.Name.Value === ''))
               return 'Please enter the name';
            
          if (this.fields.TrackNum.Required && (this.fields.TrackNum.Value === null || this.fields.TrackNum.Value === ''))
               return 'Please enter the track #';

          if (this.fields.Year.Required && (this.fields.Year.Value === null || this.fields.Year.Value === ''))
               return 'Please enter the year';

          // Default album to Unknown if not provided
          if (!this.fieldIsHidden('Album') && this.fields.Album.Value === null)
               this.fields.Album.Value = 'Unknown';

          if (this.currentFormat === null || this.currentFormat === '')
               return 'Please select the format';

          return null;
     }

     writeID3Tags(localFile: string) {
          if (this.fields.TrackNum.Value !== null && !isNaN(parseInt(this.fields.TrackNum.Value)) && parseInt(this.fields.TrackNum.Value) < 10)
          this.fields.TrackNum.Value = "0" + this.fields.TrackNum.Value;

          const params = `?WriteID3Tags` +
                         `&Filename=${localFile}` +
                         (this.fields.Artist.Value !== null ? `&Artist=${this.fields.Artist.Value}` : ``) +
                         (this.fields.Album.Value !== null ? `&Album=${this.fields.Album.Value}` : ``) +
                         (this.fields.Name.Value !== null ? `&TrackName=${this.fields.Name.Value}` : '') +
                         (this.fields.TrackNum.Value !== null ? `&TrackNum=${this.fields.TrackNum.Value}` : '') +
                         (this.fields.Genre.Value !== null ? `&Genre=${this.fields.Genre.Value}` : ``) +
                         (this.fields.Year.Value !== null ? `&Year=${this.fields.Year.Value}` : ``);

          return this.processStep(params);
     }
}