YouTube2MP3 is an Angular 6 based application that acts as a YouTube downloader which will download the audio from a YouTube URL as an mp3, writes the ID3 tags and can be set up to either present a download button or move the file to a location that you specify on your server if you have one.

Pre-requisites to run YouTube2MP3:
1. Web Server: Linux (tested with Apache and Nginx) or Windows (tested with Apache). WampServer (http://www.wampserver.com) would be easiest to set up on Windows.
2. PHP 7 (Not tested with PHP 5) 
3. Open source utility youtube-dl (https://rg3.github.io/youtube-dl/) which does NOT need root permissions. If you are using Linux, it should be available in your repo so you can install it by running apt-get install youtube-dl. A Windows binary is also available on the official site.
4. getid3 for php (http://getid3.sourceforge.net/) and ffpmeg (https://npm startffmpeg.org/). 
5. Node.js and npm 6+.
 
Please make sure to set up these applications first before trying to build YouTube2MP3.

This application can be set up to run in one of 2 different modes. 

1. Client - A standalone version of this application will present a download button for you to download an MP3 after the song has been downloaded and the id3 tags have been written.
2. Server - A server version of this application will automatically move the audio file to a specified location on your media server instead of presenting a download button.

Build instruction:

1. Edit package.json and change the line that begins with "build" and edit --base-href to match the relative path that the application will be hosted at. If your site is hosted at         http://www.mysite.com/YouTube2MP3, your build line should look like this: "build": "ng build --base-href /YouTube2MP3/ --prod", Don't forget to add / at the end of the path!
2. Create a folder called media under the root of your web server where the mp3s will be stored temporarily. Give this folder full write permissions 
3. Edit the file serverTasks.php and set the following values: 
     a. $destinationPath (Only needed if you are running in server mode) - The path where the mp3 will be moved to. This can be any path that is writable. 
     b. $sourcePath - The full path to the folder on your web server that you created in the previous step.
     c. $domain (Only needed if you are running in client mode) - The full URL where this app will be hosted. 
4. If you want to always run the app in server mode only, edit src/app/y2m/y2m.component.ts and change the line moveToServer = false; to moveToServer = true;. If you want to be able       to choose how to run YouTube2MP3, you don't need to do anything on this step. You can add a URL parameter ?MoveToServer=true after the last slash in the URL to run in server mode.
   So if your site is hosted at http://www.mysite.com/YouTube2MP3, you can bookmark and use the URL http://www.mysite.com/YouTube2MP3/?MoveToServer=true to use the app in server mode.
   The title will change to YouTube2MP3 (Server) when running in server mode. Not putting this URL parameter will run the app in client mode which is the default.
5. Run npm install - This will install all of the missing dependencies
6. Run npm run build - This will build YouTube2MP3.
7. Rename the assets folder to php. It should contain 1 file, serverTasks.php.
8. If everything compiled correctly, copy the contents of the dist/YouTube2MP3-Angular folder to the folder on your web server where you are hosting it and you referred to in step 3 (E.G. /YouTube2MP3)
9. On Windows, make sure you have the following files/folders in the php folder: getid3 folder (Extract latest getid3.zip and copy getid3 subfolder), youtube-dl.exe, ffmpeg.exe and ffprobe.exe from the latest ffmpeg zip file.
10. Apache user will need to edit the Apache config file httpd.conf, find the lines LoadModule headers_module modules/mod_headers.so and LoadModule rewrite_module modules/mod_rewrite.so and make sure that there isn't a # before either of the lines. If there is a # in front of either one, remove the # and restart Apache.
11. Client mode - Created a file called .htaccess in the media folder created in step 2 and add these 2 lines:
    ForceType application/octet-stream
    Header set Content-Disposition "attachment"
  
    This will force the server to download the mp3 instead of playing it in the browser.

YouToMe Bookmark:
YoutoMe also supports a URL parameter with the YouTube link. The easiest way to do this is to create a bookmark in your browsers' toolbar with the name Send to YouTube2MP3 and the following JavaScript code as the URL of the bookmark:

Client mode:

javascript:if(window.location.toString().indexOf('https://www.youtube.com')!=-1){window.open('https://mysite.com/YouTube2MP3/?URL='+window.location.toString()+'&Title='+document.title,'_parent','');event.preventDefault();}

Server mode:

javascript:if(window.location.toString().indexOf('https://www.youtube.com')!=-1){window.open('https://mysite.com/YouTube2MP3/?MoveToServer=true&URL='+window.location.toString()+'&Title='+document.title,'_parent','');event.preventDefault();}

Don't forget to replace mysite.com/YouTube2MP3 with the full URL where you access the application. Now visit a YouTube video and click on the bookmark. A new tab/window will open with YouTube2MP3 with the URL already filled in. YouTube2MP3 will also get the title of the YouTube video page and try to automatically determine the artist and song name. 

Troubleshooting: 

If you get an error downloading the track from YouTube, there are a few things that you can do to figure out what is causing the problem.

1. Make sure that youtube-dl is up to date. It gets updated fairly often and is most likely the cause when this app stops working with an Unable to fetch MP3 error.
2. Make sure that youtube-dl has the right permissions by running sudo chmod a+rx /usr/local/bin/youtube-dl (Change the path if youtube-dl is located in a different location)
3. Make sure that the php directory has 777 permissions.
4. Make sure that the media folder is up to date.
5. Run youtube-dl YOUTUBEURL -x --audio-format mp3 --audio-quality 320 where YOUTUBEURL is an actual YouTube link and make sure that the command completes and generates an mp3.
6. If you get the error "ERROR: WARNING: unable to obtain file audio codec with ffprobe" when running the step above, make sure that ffprobe is working correctly by running ffprobe -version. If you are using Plex and get a library error, this is caused by the envirnment variable LD_LIBRARY_PATH=/usr/lib/plexmediaserver. You can verify this by running the command export and looking for this variable. If you see this path, remove it by editing /etc/environment and add # in front of this line.

Please contact me if you have any questons, run into any problems or would like to suggest new features. 