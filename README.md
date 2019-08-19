You2Me is a front and back end application for youtube-dl (https://rg3.github.io/youtube-dl/) that acts as an audio/video downloader and works with many different audio/video sites.

It consists of an Angular based front end web application as well as php and python scripts that need to run on a web server

The app can be set up so that the media file can either be downloaded or the file can be moved to a location that you specify on your media server if you have one. 

This web app supports saving the file in multiple formats.

For audio, the supported formats are aac, flac, m4a, mp3 128k,mp3 192k,mp3 256k,mp3 320k,MP3 VBR, opus, vorbis and wav.
For video, the supported formats are avi, flv, mkv, mp4, ogg and webm.

This app was originally written to only work with YouTube links but now supports over 1000 sites. Because of technical reasons, it isn't possible to list all of the sites that work with youtube-dl. If you want to easily know if a site is supported, try it out with a short video/song and see if it works.

When getting audio, the app will attempt to identify the artist and song name automatically using a Python application that does audio fingerprinting. There is no identifying information sent when this happens. A small audio sample is sent to the server then deleted. In addition to this, if the audio format is mp3, the ID3 tags will be written to the file.

After submitting the form, the save values checkbox will let you start over but keep all of the form values that you've already filled in. This can be useful if an error occurred and you want to try again. If this happens, it would be a good idea to update youtube-dl and restart while saving the values to try again.

You can supply default values for all of the fields by providing URL parameters.

All of the current URL parameters are as follows: URL, Artist, Album, Format, Genre, Name, TrackNum, Genre, Year, MoveToServer. To provide a default artist name,add &Artist=Beck at the end of the URL. 

Valid formats are currently: aac,flac,m4a,128k,192k,256k,320k,0,5,9,opus,vorbis,wav,avi,flv,mkv,mp4,ogg,webm and are also provided in the same format such as &Format=mp4. The formats 0, 5 and 9 formats are MP3 VBR rates where 0 is best, 5 is ok and 9 is worst.

Pre-requisites to run You2Me:
1. Web Server: Linux (tested with Apache and Nginx) or Windows (tested with Apache). WampServer (http://www.wampserver.com) would be easiest to set up on Windows.
2. PHP 7 (Not tested with PHP 5) 
3. Python 2.7 or 3.4+
4. Open source utility youtube-dl (https://rg3.github.io/youtube-dl/) which does NOT need root permissions. If you are using Linux, it should be available in your repo so you can install it by running apt-get install youtube-dl. A Windows binary is also available on the official site.
5. getid3 for php (http://getid3.sourceforge.net/) 
6. ffpmeg (https://npm startffmpeg.org/). 
7. Node.js and npm 6+.
8. Windows users: make sure to follow these additional steps after installing Python:
   a. pip install pyacoustid
   b. pip install chromaprint
   c. Download chromaprint-fpcalc from https://acoustid.org/chromaprint, extract the zip and place fpcalc.exe in the same folder as the Python scripts

This application can be set up to run in one of 2 different modes. 

1. Client - A standalone version of this application which will present a download button for you to download the file to your computer or phone.
2. Server - A server version of this application which will automatically move the audio file to a specified location on your media server instead of showing a download button.

Build instruction:
1. Download the source.
2. Edit package.json and find the line that begins with "build". Edit --base-href to match the relative path that the application will be hosted at. If     your site is hosted at http://www.mysite.com/You2Me, your build line should look like this: "build": "ng build --base-href /You2Me/ --prod", Don't       forget to add / at the beginning and end of the path!
3. Create a folder called media under the root of your web server where the file will be stored temporarily. Give this folder full write permissions 
4. Edit the file assets/php/serverTasks.php and set the following values: 
     a. $destinationPath (Only needed if you are running in server mode) - The path where the media file will be moved to. This can be any path that is     writable including a remote location such as a Samba mounted folder.
     b. $sourcePath - The full path to the media folder on your web server that you created in step 3. Ex: /var/www/html/media/
     c. $domain (Only needed if you are running in client mode) - The full URL where this app will be hosted. Ex: https://www.mysite.com/You2Me/
5. Edit src/app/y2m/y2m.component.ts 
     a. If you want to always run the app in server mode only, find and change the line moveToServer = false; to moveToServer = true;. If you    
        want to be able to choose how to run You2Me, leave this set to false. You can always add a URL parameter ?MoveToServer=true after the last slash in the URL to run in server mode. So if your site is hosted at http://www.mysite.com/You2Me, you can bookmark and use the URL http://www.mysite.com/You2Me/?MoveToServer=true to use the app in server mode. The title of the page will change to You2Me (Server) when running in server mode to distinguish client and server mode. Not putting this URL parameter will run the app in client mode by default.
     b. If you do not want to allow the file from ever being moved to the server with a URL parameter, find and change the line allowMoveToServer = true;   to allowMoveToServer = false;
6. Run npm install - This will install all of the missing dependencies
7. Run npm run build - This will build You2Me.
8. If everything compiled correctly, copy the contents of the dist/You2Me-Angular folder to the folder on your web server where you are hosting it and you referred to in step 2 (E.G. /You2Me)
9. On Windows, make sure you have the following files/folders in the php folder: getid3 folder (Extract latest getid3.zip and copy getid3 subfolder) youtube-dl.exe, ffmpeg.exe and ffprobe.exe from the latest ffmpeg zip file.
10. Client mode - Apache users will need to edit the Apache config file httpd.conf, find the lines LoadModule headers_module modules/mod_headers.so and      LoadModule rewrite_module modules/mod_rewrite.so and make sure that there isn't a # before either of these 2 lines. If there is a # in front of  
    either one, remove the # and restart Apache. This is needed when running in client mode so that when you download the file, you can create an .htaccess file in the next step that will force the browser to download the file instead of playing it in the browser (this is more of a Google Chrome issue).
11. Client mode - Created a file called .htaccess in the media folder created in step 3 and add these 2 lines:
    ForceType application/octet-stream
    Header set Content-Disposition "attachment"
    Header set Content-Type application/force-download

    This will force the server to download the media file instead of playing it in the browser.
12. Make sure that php/serverTasks.php and python/aidmatch.py have execute permission.
13. Make sure that the python files in Python/ are executable in Linux (chmod +X *.py)
YouToMe Bookmark:
YoutoMe supports a bookmark which will automatically load You2Me in a new tab with the URL of the site that were on. Create a bookmark in your browsers' toolbar with the name Send to You2Me and the following JavaScript code as the URL of the bookmark:

Client mode:

javascript:window.open('https://mysite.com/You2Me/?URL='+window.location.toString()+'&Title='+document.title,'_parent','');event.preventDefault();

Server mode:

javascript:window.open('https://mysite.com/You2Me/?MoveToServer=true&URL='+window.location.toString()+'&Title='+document.title,'_parent','');event.preventDefault();

Don't forget to replace mysite.com/You2Me with the full URL of your instance of You2Me. Now visit a supported site like YouTube and click on the bookmark. A new You2Me tab/window will open with the URL already filled in. 

Troubleshooting: 

If you get an error downloading the track, there are a few things that you can do to figure out what is causing the problem.

1. Make sure that youtube-dl is up to date. It gets updated fairly often and is usually the cause when this app stops working with the error Unable to      fetch media.
2. Make sure that youtube-dl has the right permissions by running sudo chmod a+rx /usr/local/bin/youtube-dl (Change the path if youtube-dl is located in    a different location)
3. Make sure that the php directory has write permissions.
4. Make sure that the media folder has write permissions. 
5. Run the following command in a terminal: youtube-dl URL -x --audio-format mp3 --audio-quality 320 where URL is the full URL of the site that you want    to download. Make sure that the command completes and generates an mp3.
6. If you get the error "ERROR: WARNING: unable to obtain file audio codec with ffprobe" when running the step above, make sure that ffprobe is working     correctly by running ffprobe -version. If you are using Plex and get this error, it is caused by the envirnment variable LD_LIBRARY_PATH=/usr/lib/       plexmediaserver. You can verify this by running the command export and looking for this variable. If you see this path, remove it by editing /etc/       environment and add # in front of this line.
7. Make sure that the youtube URL is in the format https://www.youtube.com/watch?v=<YOUTUBEID> where <YOUTUBEID> is random letters and number

Please contact me if you have any questons, run into any problems or would like to suggest new features. 