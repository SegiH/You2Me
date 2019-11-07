import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { throwError } from 'rxjs/';
import { catchError} from 'rxjs/operators';

@Injectable()
export class DataService {
    constructor(private http: HttpClient) { }

    downloadFile(URL: string, fileName: string, isAudio: boolean,  isMP3Format: boolean, currentFormat: string) {
        const params = `?DownloadFile` +
                       `&URL=${URL}` +
                       `&Filename=${fileName}` +
                       (isAudio === true
                            ? `&IsAudioFormat=true` + (isMP3Format === true ? `&Bitrate=${currentFormat}` : ``) + `&AudioFormat=${currentFormat}`
                            : `&IsVideoFormat=true&VideoFormat=${currentFormat}`);

        return this.processStep(params);
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

    private handleError(error: Response | any) {
        if (error.error instanceof Error) {
            const errMessage = error.error.message;

            return throwError(errMessage);
            // Use the following instead if using lite-server
            // return Observable.throw(err.text() || 'backend server error');
        }

        return throwError(error || 'Node.js server error');
    }

}
