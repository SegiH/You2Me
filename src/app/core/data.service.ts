import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class DataService {    
    constructor(private http: HttpClient) { }

    downloadSong(URL : string,currentFormat: string) {
        const params = `?step=1` +
                       `&URL=${URL}` +
                             `&GetVideo=` + (currentFormat === 'video') +
                             (currentFormat !== 'video' ? `&AudioFormat=${currentFormat}` : '');

        return this.processStep(params);
    }
    
    moveFile(localFile : string,artist: string, album: string,currentFormat: string) {
        const params = `?step=4` +
                       (localFile !== null ? `&Filename=${encodeURI(localFile)}` : ``) +
                       (artist !== null ? `&Artist=${artist}&` : ``) +
                       (album !== null ? `Album=${album}` : ``) +
                       `&isVideo=${currentFormat === 'video'}`;

        return this.processStep(params);
    }
    processStep(params: String) {
        return this.http.get<any>('./php/serverTasks.php' + params)
            .pipe(
                catchError(this.handleError)
            );
    }

    renameFile(localFile: string,artist: string,name: string,trackNum: string,stepCount: number,currentFormat: string) {
        const params = `?step=3` +
                       (localFile !== null ? `&Filename=${localFile}` : ``) +
                       (artist !== null ? `&Artist=${artist}` : ``) +
                       (name !== null ? `&TrackName=${name}` : ``) +
                       (trackNum !== null ? `&TrackNum=${trackNum}` : ``) +
                       `&StepCount=${stepCount}` +
                       `&isVideo=${currentFormat === 'video'}`;
        
        return this.processStep(params);
    }

    writeID3Tags(localFile : string,artist: string, album: string,name: string, trackNum: string,genre: string,year: string,currentFormat: string) {
        const params = `?step=2` +
                       `&Filename=${localFile}` +
                       (artist !== null ? `&Artist=${artist}` : ``) +
                       (album !== null ? `&Album=${album}` : ``) +
                       (name !== null ? `&TrackName=${name}` : '') +
                       (trackNum != null ? `&TrackNum=${trackNum}` : '') +
                       (genre !== null ? `&Genre=${genre}` : ``) +
                       (year !== null ? `&Year=${year}` : ``)  +
                       (currentFormat !== 'video' ? `&AudioFormat=${currentFormat}` : '');

        return this.processStep(params);
    }

    private handleError(error: Response | any) {
      console.error('server error:', error);
      if (error.error instanceof Error) {
          const errMessage = error.error.message;
          return Observable.throw(errMessage);
          // Use the following instead if using lite-server
          // return Observable.throw(err.text() || 'backend server error');
      }
      return Observable.throw(error || 'Node.js server error');
    }

}