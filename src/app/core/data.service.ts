import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpResponse, HttpProgressEvent } from '@angular/common/http';
import { throwError, Observable } from 'rxjs/';
import { catchError} from 'rxjs/operators';

export interface Download {
    state: 'PENDING' | 'IN_PROGRESS' | 'DONE'
    progress: number
    content: Blob | null
}

@Injectable()
export class DataService {
    constructor(private http: HttpClient) { }

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

    fetchFile(URL: string, fileName: string, movetoServer: boolean, isAudioFormat: boolean,  isMP3Format: boolean, currentFormat: string) {
        const params = `?DownloadFile` +
                       `&URL=${URL}` +
                       `&Filename=${fileName}` +
                       '&MoveToServer=' + (movetoServer == true ? "true" : "false") +
                       (isAudioFormat === true
                            ? `&IsAudioFormat=true` + (isMP3Format === true ? `&Bitrate=${currentFormat}` : ``) + `&AudioFormat=${currentFormat}`
                            : `&IsVideoFormat=true&VideoFormat=${currentFormat}`);

        return this.processStep(params);
    }

    getDownloadProgress() {
        return this.processStep(`?GetDownloadProgress=true`);
    }

    getSupportedURLs() {
        return this.processStep(`?GetSupportedURLs`);
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

    isHttpResponse<T>(event: HttpEvent<T>): event is HttpResponse<T> {
        return event.type === HttpEventType.Response
    }
      
    isHttpProgressEvent(event: HttpEvent<unknown>): event is HttpProgressEvent {
        return event.type === HttpEventType.DownloadProgress 
            || event.type === HttpEventType.UploadProgress
    }

    moveFile(localFile: string, isAudio: boolean, moveToServer: boolean, artist: string, album: string, currentFormat: string) {
        const params = `?MoveFile` +
                       `&MoveToServer=${moveToServer}`  +
                       `&Filename=${localFile}` +
                       `&Artist=${artist}` +
                       (isAudio === true
                       ? `&IsAudioFormat=true` + (album !== null ? `&Album=${album}` : '')
                       : `&IsVideoFormat=true`);

        return this.processStep(params);
    }

    processStep(params: String) {
        return this.http.get<any>('./php/serverTasks.php' + params)
            .pipe(
                catchError(this.handleError)
            );
    }

    writeID3Tags(localFile: string, artist: string, album: string, name: string, trackNum: string, genre: string, year: string) {
        const params = `?WriteID3Tags` +
                       `&Filename=${localFile}` +
                       (artist !== null ? `&Artist=${artist}` : ``) +
                       (album !== null ? `&Album=${album}` : ``) +
                       (name !== null ? `&TrackName=${name}` : '') +
                       (trackNum != null ? `&TrackNum=${trackNum}` : '') +
                       (genre !== null ? `&Genre=${genre}` : ``) +
                       (year !== null ? `&Year=${year}` : ``);

        return this.processStep(params);
    }
}
