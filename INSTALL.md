# You2Me Installation

### URL Parameters
You can supply default values for all of the fields by providing URL parameters.

The URL parameters are as follows: URL, Artist, Album, Format, Genre, Name, TrackNum, Genre, Year, MoveToServer and Format. 

To add a URL parameter use "?" for the first URL parameter and "&" for every parameter after that in the format parametername=value. 

To specify Beck as the artist and Odelay as the album as a URL parameter use. http://www.example.com/You2Me?Artist=Beck&Album=Odelay For audio or video formats, supply one of the values above such as Format=original for video without reencoding or Format=320k for 320kbps mp3 audio.

### Usage
This application can be set up to run in one of 2 different modes. 

 - Client - A standalone version of this application which will display a download button for you to download the file to your computer or phone. (Default)
 - Server - A server version of this application which will automatically move the audio file to a specified location on your media server instead of showing a download button. Add ?MoveToServer=true at the end of the URL to enable this option.

There are 2 ways to run this application

1. Docker - This is the easiest way to run You2Me as a standalone application. The folder called docker contains a file called Dockerfile and a compiled version of this application in the dist folder. Copy this entire docker folder to your Docker host and start at step viii below. 
   #### Build a you2me Docker image (optional)
   1. Install Docker if it isn't installed already. If you have issues with regular Docker on Windows, try Docker Toolbox instead.
   2. Install npm 6+ which includes Node.js and npm.
   3. Go to the main You2Me folder in terminal or command prompt
   4. Edit package.json and find the line that begins with "build". Edit --base-href to match the relative path that the application will be hosted at. If your site is hosted at http://www.mysite.com/You2Me, your build line should look like this: "build": "ng build --base-href /You2Me/ --prod", Don't forget to add / at the beginning and end of the path.
   5. Run `npm install` - This will install all of the missing dependencies.
   6. Run `npm run build` - This will build You2Me.
   7. Move the entire dist folder into the docker folder
   8. Build a Docker image based on my you2me: `sudo docker build docker/ -t you2me`
   9. Run `sudo docker run -dit -p 8080:80 you2me` to create a new container based on the you2me image that you create above. If you want to change the port that it runs on, change the first number before the colon. So for example, it would be 80:80 to access You2Me on port 80 (The second 80 after the colon is the internal port used and should ALWAYS be 80).
   10. Visit https://dockeripaddress:port/You2Me/ in your browser. You can run docker-machine ip to find the IP address of your docker instance on Windows or docker inspect $(sudo docker ps -q) | grep \"IPAddress\".
1. Run You2Me on your own web server (Tested with Apache and Nginx on Linux and Apache on Windows. [WampServer](http://www.wampserver.com) would be easiest to set up on Windows.)
   - Install  PHP 7 (Not tested with PHP 5) 
   - Open source utility [youtube-dl](https://rg3.github.io/youtube-dl/) which does NOT need root permissions. If you are using Linux, it should be available in your repo so you can install it by running apt-get install youtube-dl. A Windows binary is also available on the official site.
   - Install getid3 for PHP. Linux users can install it using apt-get install php-getid3. If you are on Windows or its not available in your repo, download [getid3](http://getid3.sourceforge.net), extract the zip and copy the folder getid3 into the php folder
   - Install ffpmeg by running "apt-get install ffmpeg" on Linux or Windows users can download [ffmpeg](https://ffmpeg.org/).
   - Install npm 6+ which includes Node.js and npm.
   - Download the latest source for You2Me.
   - Edit package.json and find the line that begins with "build". Edit --base-href to match the relative path that the application will be hosted at. If your site is hosted at http://www.mysite.com/You2Me, your build line should look like this: "build": "ng build --base-href /You2Me/ --prod", Don't forget to add / at the beginning and end of the path.
   - Create a folder called media under the root of your web server where the file will be stored temporarily. Give this folder write permissions by running chmod 775
   - Edit the file assets/php/serverTasks.php and set the following values: 
   - $destinationPath (Only needed if you are running in server mode) - The path where the media file will be moved to. This can be any path that is writable including a remote location such as a Samba mounted folder.
   - $sourcePath - The full path to the media folder on your web server that you created in step 3. Ex: /var/www/html/media/
   - $domain - no need to change unless you want to explicitly set the domain . You can change this to $domain ='https://mydomain.com/media/"- The full URL where this app will be hosted. Ex: https://www.mysite.com/You2Me/
   - Edit src/app/y2m/y2m.component.ts 
   - If you want to always run the app in server mode only, find and change the line moveToServer = false; to moveToServer = true;. If you want to be able to choose whether to download the file or move it to your server, leave this set to false. You can always use the MoveToServer URL parameter to decide this when running the web app. The title of the page will change to You2Me (Server) when running in server mode to distinguish client and server mode. If you don't provide this URL parameter, the app  will run in client mode by default.
     - If you do not want to allow the file from ever being moved to the server with a URL parameter, find and change the line allowMoveToServer = true; to allowMoveToServer = false;
   - Run npm install - This will install all of the missing dependencies.
   - Run npm run build - This will build You2Me.
   - Make a folder called php in dist and move assets/serverTasks.php into this folder. Give it 755 permissions on Linux. Create folder python in dist and move all files ending in py and pyc to this folder. The assets folder should be empty now. if it is you can delete it.   
   - If everything compiled correctly, copy the contents of the dist/You2Me-Angular folder to the folder on your web server where you are hosting it and you referred to in step (E.G. /You2Me)
   - On Windows, make sure you have the following files/folders in the php folder: getid3 folder (Extract latest getid3.zip and copy getid3 subfolder) youtube-dl.exe, ffmpeg.exe and ffprobe.exe from the latest ffmpeg zip file.
   - Make sure that php/serverTasks.php has execute permission.

### You2Me Bookmark

You2Me supports a bookmark which will automatically load You2Me in a new tab with the URL of the site that were on. Create a bookmark in your browsers' toolbar with the name Send to You2Me and the following JavaScript code as the URL of the bookmark:

Client mode:

```
javascript:window.open('https://mysite.com/You2Me/?URL='+window.location.toString()+'&Title='+document.title,'_parent','');event.preventDefault();
```
Server mode:

```
javascript:window.open('https://mysite.com/You2Me/?MoveToServer=true&URL='+window.location.toString()+'&Title='+document.title,'_parent','');event.preventDefault();
```

Don't forget to replace mysite.com/You2Me with the full URL of your instance of You2Me. Now visit a supported site like YouTube and click on the bookmark. A new You2Me tab/window will open with the URL already filled in. 

Troubleshooting: 

If you get an error downloading the track, there are a few things that you can do to figure out what is causing the problem.

1. Make sure that youtube-dl is up to date. It gets updated fairly often and is usually the cause when this app stops working with the error Unable to fetch media.
1. Make sure that youtube-dl has the right permissions by running sudo chmod a+rx /usr/local/bin/youtube-dl (Change the path if youtube-dl is located in a different location)
1. Make sure that the php directory has write permissions.
1. Make sure that the media folder has write permissions. 
1. Run the following command in a terminal: youtube-dl URL -x --audio-format mp3 --audio-quality 320 where URL is the full URL of the site that you want to download. Make sure that the command completes and generates an mp3.
1. If you get the error "ERROR: WARNING: unable to obtain file audio codec with ffprobe" when running the step above, make sure that ffprobe is working     correctly by running ffprobe -version. If you are using Plex and get this error, it is caused by the envirnment variable LD_LIBRARY_PATH=/usr/lib/plexmediaserver. You can verify this by running the command export and looking for this variable. If you see this path, remove it by editing /etc/environment and add # in front of this line.
1. Make sure that the youtube URL is in the format https://www.youtube.com/watch?v=<YOUTUBEID> where <YOUTUBEID> is random letters and number

Please contact me if you have any questons, run into any problems or would like to suggest new features. 