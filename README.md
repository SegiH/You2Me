You2Me is an Angular web application that acts as a front-end for youtube-dl (https://rg3.github.io/youtube-dl/) which lets you download audio or video from many web sites. 

The app can be set up so that the media file can either be downloaded or the file can be moved to a location that you specify on your media server if you have one. 

This web app supports saving the file in multiple formats.

For audio, the supported formats are aac, flac, m4a, mp3 128k,mp3 192k,mp3 256k,mp3 320k,MP3 VBR, opus, vorbis and wav.
For video, the supported formats are original (don't re-encode the video which is fastest),avi, flv, mkv, mp4, ogg and webm.

This web app supports over 1000 sites.

You can supply default values for all of the fields by providing URL parameters.

All of the current URL parameters are as follows: URL, Artist, Album, Format, Genre, Name, TrackNum, Genre, Year, MoveToServer and Format. To provide a default artist name,add ?for the first parameter and & for the 2nd parameter and on followed by parameter=value. Ex. ?Artist=Beck  For audio or video formats, supply one of the values above such as Format=original for video without reencoding.

This application can be set up to run in one of 2 different modes. 

1. Client - A standalone version of this application which will present a download button for you to download the file to your computer or phone. (Default)
2. Server - A server version of this application which will automatically move the audio file to a specified location on your media server instead of showing a download button.             Add ?MoveToServer=true at the end of the URL to enable this dynamically.

You can run the application in one of 2 ways:

1. Docker - This is the easiest way to run You2Me as a standalone application. This will set up everything for you and let you run You2Me in your browser   
   - Install Docker if it isn't installed already. Windows 10 users should install Virtualbox first then install Docker Toolbox, unselecting Virtualbox in the Docker toolbox install options
   - Go to the main You2Me folder in terminal
   - Build a Docker image based on my script: sudo docker build docker/ -t you2me
   - Run the Docker image: sudo docker run -dit -p 8080:80 you2me If you want to change the port that it runs on, change the first 8080 so for example 80:80 to access You2Me on port 80 (The second 80 after the colon is the internal port used and should ALWAYS be 80).
   - Visit dockeripaddress:port in your browser. You can run docker-machine ip to find the IP address of your docker instance on Windows or docker inspect $(sudo docker ps -q) | grep \"IPAddress.
2. Run You2Me on your own web server (Tested with Apache and Nginx on Linux and Apache on Windows. WampServer (http://www.wampserver.com) would be easiest to set up on Windows.)
   - Install  PHP 7 (Not tested with PHP 5) 
   - Open source utility youtube-dl from https://rg3.github.io/youtube-dl/ which does NOT need root permissions. If you are using Linux, it should be available in your repo so you can install it by running apt-get install youtube-dl. A Windows binary is also available on the official site.
   - Install getid3 for PHP. Linux users can install it using apt-geti nstall php-getid3. If you are on Windows or its not available in your repo, download it from http://    getid3.sourceforge.net, extract the zip and copy the folder getid3 into the php folder
   - Instal ffpmeg apt-get install ffmpeg for Linux users or Windows users can dowlnoad it from https://ffmpeg.org/. 
   - Install npm 6+ which includes Node.js and npm.
   - Download the latest source for You2Me.
   - Edit package.json and find the line that begins with "build". Edit --base-href to match the relative path that the application will be hosted at. If your site is hosted at http://www.mysite.com/You2Me, your build line should look like this: "build": "ng build --base-href /You2Me/ --prod", Don't forget to add / at the beginning and end of the path.
   - Create a folder called media under the root of your web server where the file will be stored temporarily. Give this folder full write permissions chmod 777
   - Edit the file assets/php/serverTasks.php and set the following values: 
     - $destinationPath (Only needed if you are running in server mode) - The path where the media file will be moved to. This can be any path that is writable including a remote location such as a Samba mounted folder.
     - $sourcePath - The full path to the media folder on your web server that you created in step 3. Ex: /var/www/html/media/
     - $domain - no need to change unless you want to explicitly set the domain . You can change this to $domain ='https://mydomain.com/media/"- The full URL where this app      will be hosted. Ex: https://www.mysite.com/You2Me/
   - Edit src/app/y2m/y2m.component.ts 
     - If you want to always run the app in server mode only, find and change the line moveToServer = false; to moveToServer = true;. If you want to be able to choose how to run You2Me, leave this set to false. You can always add a URL parameter ?MoveToServer=true after the last slash in the URL to run in server mode. So if your site is hosted at http://www.mysite.com/You2Me, you can bookmark and use the URL http://www.mysite.com/You2Me/?MoveToServer=true to use the app in server mode. The title of the page will change to You2Me (Server) when running in server mode to distinguish client and server mode. Not putting this URL parameter will run the app in client mode by default.
     - If you do not want to allow the file from ever being moved to the server with a URL parameter, find and change the line allowMoveToServer = true; to allowMoveToServer = false;
   - Run npm install - This will install all of the missing dependencies.
   - Run npm run build - This will build You2Me.
   - Make a folder called php in dist and move assets/serverTasks.php into this folder. Give it 755 permissions on Linux. Create folder python in dist and move all files ending in py and pyc to this folder. The assets folder should be empty now. if it is you can delete it.   
   - If everything compiled correctly, copy the contents of the dist/You2Me-Angular folder to the folder on your web server where you are hosting it and you referred to in step (E.G. /You2Me)
   - On Windows, make sure you have the following files/folders in the php folder: getid3 folder (Extract latest getid3.zip and copy getid3 subfolder) youtube-dl.exe, ffmpeg.exe and ffprobe.exe from the latest ffmpeg zip file.
   - Client mode - Apache users will need to edit the Apache config file httpd.conf, find the lines LoadModule headers_module modules/mod_headers.so and LoadModule rewrite_module modules/mod_rewrite.so and make sure that there isn't a # before either of these 2 lines. If there is a # in front of either one, remove the # and restart Apache. This is needed when running in client mode so that when you download the file, you can create an .htaccess file in the next step that will force the browser to download the file instead of playing it in the browser (this is more of a Google Chrome issue).
   - Client mode - Created a file called .htaccess in the media folder created in step 3 and add these lines:
       Header set Content-Disposition "attachment"
       Header set Content-Type application/force-download

       This will force the server to download the media file instead of playing it in the browser.
   - Make sure that php/serverTasks.php has execute permission.

You2Me Bookmark:

You2Me supports a bookmark which will automatically load You2Me in a new tab with the URL of the site that were on. Create a bookmark in your browsers' toolbar with the name Send to You2Me and the following JavaScript code as the URL of the bookmark:

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