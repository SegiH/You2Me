# You2Me

You2Me is an Angular web application that acts as a front-end for [youtube-dl](https://rg3.github.io/youtube-dl/) which lets you download audio or video from many web sites. 

The app can be set up so that the media file can either be downloaded or the file can be moved to a location that you specify on your media server if you have one. 

When you are generating an mp3 files, Python fingerprinting is used to automatically identify the artist and the song name which means that if you enter a URL for a popular song and select an MP3 format without entering any other information, this application will fill in the artist name and song name for you automatically.

The app supports searching Youtube directly and supports downloading multiple files at once.

### Screenshots

![Screenshot1](https://raw.githubusercontent.com/SegiH/You2Me/master/screenshots/Screenshot1.png)

![Screenshot2](https://raw.githubusercontent.com/SegiH/You2Me/master/screenshots/Screenshot2.png)

![Screenshot3](https://raw.githubusercontent.com/SegiH/You2Me/master/screenshots/Screenshot3.png)

![Screenshot4](https://raw.githubusercontent.com/SegiH/You2Me/master/screenshots/Screenshot4.png)

![Screenshot5](https://raw.githubusercontent.com/SegiH/You2Me/master/screenshots/Screenshot5.png)

![Screenshot6](https://raw.githubusercontent.com/SegiH/You2Me/master/screenshots/Screenshot6.png)

### Formats
This web app supports saving the file in multiple formats.

For audio, the supported formats are aac, flac, m4a, mp3 128k,mp3 192k,mp3 256k,mp3 320k,MP3 VBR, opus, vorbis and wav.
For video, the supported formats are original (don't re-encode the video which is fastest),avi, flv, mkv, mp4, ogg and webm.

### Sites
This web app supports over 1000 sites. The app has a searchable list of the sites supported by You2Me at 
the bottom by checking "Show Supported Sites".

Please see INSTALL.md for installation instructions.

#### Known Issues
When you try to download longer videos from non-YouTube sites, it may fail to download if you are downloading in a video format.