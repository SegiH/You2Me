import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { throwError, Observable } from 'rxjs/';
import { catchError} from 'rxjs/operators';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

let stepperIndex = 0;

@Injectable()
export class DataService {
     links: any = [];
     private API_TOKEN="";
     readonly API_URL='https://www.googleapis.com/youtube/v3/search';
     readonly fields: any  = {
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
     readonly fieldKeys = Object.freeze(Object.keys(this.fields));

     formats: Object = {};
     formatKeys = [];
     readonly stepperStepNames = ['Started download', 'Finished download', 'Writing ID3 Tags','Your file is ready'];
     
     readonly URLParameters = ['URL','Artist','Album','Format','Genre','Name','TrackNum','MoveToServer','Year','Debugging'];
    
     constructor(public snackBar: MatSnackBar, private http: HttpClient) {
          this.loadFormats().subscribe((response) => {
               if (response === null)
                    return Promise.reject('Null response when getting formats');

               response.map(x => this.formats[x.FormatName] = { FormatDisplayName : x.FormatDisplayName, FormatTypeName: x.FormatTypeName, IsMP3Format: (x.IsMP3Format == "1" ? true : false) } );
               Object.freeze(this.formats);
            
               response.map(x => this.formatKeys.push(x.FormatName));
               Object.freeze(this.formatKeys);
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

               /*if (this.currentFormat !== '' && typeof this.formats[this.currentFormat] === 'undefined') {
                    this.showSnackBarMessage(`The format provided is not valid`);
                    this.currentFormat='';
               }*/
          });

          this.getAPIKey().subscribe((response) => {
               this.API_TOKEN=response;
          },
          error => {
          });
     }
     
     addLink(newURL: string,newFormat: string,movetoServer: boolean = false) {
          this.links.push({
                           URL: newURL,
                           DownloadLink: '',
                           DownloadProgressSubscription: null,
                           DownloadStatusMessage: '',
                           DownloadStatusVisible: true,
                           CurrentStep: 0,
                           Fields: this.fields,
                           FieldKeys: this.fieldKeys,
                           Filename: "",
                           Format: newFormat,                           
                           IsFinished: false,
                           IsSubmitted: false,
                           SaveValues: false,
                           StatusMessage: "",
                           StepperIndex: stepperIndex,
                           ExpansionPanelOpen: false,
                           ThumbnailSmallDimension: 50,
                           ThumbnailLargeDimension: 200,
                         });

          this.getThumbnail(newURL,stepperIndex).subscribe((response) => {               
               this.links[parseInt(response[1])]["ThumbnailProcessingComplete"]=true;

               if (response !== null)
                    this.links[parseInt(response[1])]["Thumbnail"]=response[0];                    
          },
          error => {
          });

          if (!movetoServer)
               this.links[stepperIndex].StepperStepNames=this.stepperStepNames;
          else {
               const newStepperStepNames=this.stepperStepNames;
               newStepperStepNames.splice(this.stepperStepNames.length,0,'Moving the file to new location')

               this.links[stepperIndex].StepperStepNames=newStepperStepNames;
          }

          stepperIndex++;
     }

     anySubmittedLinks() {
          let retVal = false;

          Object.keys(this.links).forEach(key => {
               if (this.links[key]['IsSubmitted'] === true)
                   retVal=true;
          });
          
          return retVal;
     }

     clearFieldValues(currLink: object) {
          currLink['FieldKeys'].forEach(key => {
               currLink['Field'][key].Value = "";
          });
     }

     deleteDownloadFile(fileName: string) {
          const params = `?DeleteDownloadFile` +
                         `&Filename=${fileName}`
                       
          return this.processStep(params);
     }

     deleteLink(URL: string) {
          Object.keys(this.links).forEach(key => {
               if (this.links[key]['URL'] === URL)
                   this.links.splice(key, 1)
          });
     }

     fetchFile(currLink: object, allowMoveToServer: boolean, debugging: boolean) {
          const fileName: string = (this.isAudioFormat("") && !isNaN(parseInt(this.fields.TrackNum.Value)) ? this.fields.TrackNum.Value + " " : "" ) + (this.fields.Name.Value != "" ? this.fields.Name.Value : "Unknown");
          
          let linkKey="";

          // extra URL parameters in a Youtube link causes issues for youtube-dl
          Object.keys(this.links).forEach(key => {
               if (this.links[key]['URL'] === URL) {
                    linkKey=key;
                    return;
               }               
          });

          if (currLink['URL'].includes('youtube.com')) {
               const arr = currLink['URL'].split('&');

               currLink['URL']= arr[0];
          }

          const params = `?DownloadFile` +
                         `&URL=${currLink['URL']}` +
                         `&Filename=${this.rfc3986EncodeURIComponent(fileName)}` +
                         `&Debugging=${debugging}` +
                         '&MoveToServer=' + (allowMoveToServer ? "true" : "false") +
                         '&AllowMoveToServer=' + (allowMoveToServer ? "true" : "false") +
                         (this.isAudioFormat(currLink['Format'])
                              ? `&IsAudioFormat=true` + (this.isMP3Format(currLink['Format']) ? `&Bitrate=${currLink['Format']}` : ``) + `&AudioFormat=${currLink['Format']}`
                              : `&IsVideoFormat=true&VideoFormat=${currLink['Format']}`);

          return this.processStep(params);
     }

     fieldIsHidden(formatName: string, fieldName: string) {
          // Specified values are the fields to hide
          const videoHideFields = Object.freeze(['Artist', 'Album', 'TrackNum', 'Genre', 'Year']);
          const nonMP3HideFields = Object.freeze(['TrackNum', 'Genre', 'Year']);

          return (
               // If the format is a video format, hide these fields
               (!this.isAudioFormat(formatName) && videoHideFields.includes(fieldName))
               ||
               // If the format is an audio format but is not MP3, hide these fields
               (this.isAudioFormat(formatName) && !this.isMP3Format(formatName) && nonMP3HideFields.includes(fieldName))
          );
     }

     getAPIKey() {
          return this.processStep(`?GetAPIKey=true`);
     }

     getDownloadProgress(currLink: object) {
          return this.processStep(`?GetDownloadProgress=true&URL=${currLink['URL']}`);
     }

     getFormatKeys() {
          return this.formatKeys;
     }

     getLinks() {
          return this.links;
     }

     getLinkKey(currLink: object) {
          return currLink['StepperIndex'];
     }

     getSupportedURLs() {
          return this.processStep(`?GetSupportedURLs`);
     }

     getThumbnail(URL:string,stepperIndex: number) {
          return this.processStep(`?GetThumbnail&URL=${URL}&StepperIndex=${stepperIndex}`);
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

     isAudioFormat(format: string) {
          let isAudio = false;

          Object.keys(this.formats).forEach(key => {
               if (key === format && this.formats[key].FormatTypeName === 'Audio')
                    isAudio = true;              
          });

          return isAudio;
     }

     isMP3Format(format: string) {
          let isMP3 = false;

          Object.keys(this.formats).forEach(key => {
               if (key === format && this.formats[key].FormatTypeName === 'Audio' && this.formats[key].IsMP3Format)
                    isMP3=true; 
          });

          return isMP3;
     }

     loadFormats() {
          return this.processStep(`?GetFormats=true`);
     }

     moveFile(currLink: object) {
          const params = `?MoveFile` +
                         `&MoveToServer=true`  +
                         `&Filename=${currLink['Filename']}` +
                         `&Artist=${this.rfc3986EncodeURIComponent(currLink['Fields']['Artist'].Value)}` +
                         (this.isAudioFormat(currLink['format'])
                         ? `&IsAudioFormat=true` + (typeof currLink['Fields']['Album'].Value !== 'undefined' ? `&Album=${this.rfc3986EncodeURIComponent(currLink['Fields']['Album'].Value)}` : '')
                         : `&IsVideoFormat=true`);

          return this.processStep(params);
     } 

     processStep(params: String): Observable<any> {
          return this.http.get<any>('/php/serverTasks.php' + params)
               .pipe(
                    catchError(this.handleError)
               );
     }

     // Escapes all special characters so they can safely be passed as URL parameters
     private rfc3986EncodeURIComponent(str) {  
          return encodeURIComponent(str).replace(/[!'()*]/g, escape);  
     }

     searchVideos(query: string): Observable <any> {
          const url = `${this.API_URL}?q=${query}&key=${this.API_TOKEN}&part=snippet&type=video&maxResults=10`;
          return this.http.get(url)
            .pipe(
               catchError(this.handleError)
              //map((response: any) => response.items)
            );
     }

     setDownloadStatusMessage(currLink: object, newStatusMessage: string) {
          currLink['DownloadStatusMessage']=newStatusMessage;
     }

     setDownloadSubscription(currLink: object, downloadSubscription: any) {
          Object.keys(this.links).forEach(key => {
               if (this.links[key]['URL'] === currLink['URL']) {
                    this.links[key]['DownloadProgressSubscription']=downloadSubscription;
               }
          });
     }

     showSnackBarMessage(message: string) {
          const config = new MatSnackBarConfig();
          config.duration = 3000;
          this.snackBar.open(message, 'OK', config);
     }

     URLExists(URL: string) {
          let URLExists=false;

          Object.keys(this.links).forEach(key => {
               console.log("URL=*"+URL+"* and current item=*"+this.links[key]['URL'] + "*")
               if (this.links[key]['URL'] === URL) {
                    URLExists=true;
               }
          });

          return URLExists;
     }

     writeID3Tags(currLink: object) {
          if (currLink['Fields']['TrackNum'].Value !== null && !isNaN(parseInt(currLink['Fields']['TrackNum'].Value)) && parseInt(currLink['Fields']['TrackNum'].Value) < 10)
               currLink['Fields']['TrackNum'].Value = "0" + currLink['Fields']['TrackNum'].Value;

          const params = `?WriteID3Tags` +
                         `&Filename=${currLink['Filename']}` +
                         (currLink['Fields']['Artist'].Value !== null ? `&Artist=${currLink['Fields']['Artist'].Value}` : ``) +
                         (currLink['Fields']['Album'].Value !== null ? `&Album=${currLink['Fields']['Album'].Value}` : ``) +
                         (currLink['Fields']['Name'].Value !== null ? `&TrackName=${currLink['Fields']['Name'].Value}` : '') +
                         (currLink['Fields']['TrackNum'].Value !== null ? `&TrackNum=${currLink['Fields']['TrackNum'].Value}` : '') +
                         (currLink['Fields']['Genre'].Value !== null ? `&Genre=${currLink['Fields']['Genre'].Value}` : ``) +
                         (currLink['Fields']['Year'].Value !== null ? `&Year=${currLink['Fields']['Year'].Value}` : ``);

          return this.processStep(params);
     }
}