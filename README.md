YouTube2MP3 is an Angular based application that acts as a YouTube downloader which will download the audio from a YouTube URL as an mp3, write the ID3 tags and can be set up to either present a download button or move the file to a location that you specify on your server if you have one.

Pre-requisites to run YouTube2MP3:
1. Linux based server (tested with Apache and Nginx) or Windows based server (tested with Apache).
2. PHP 7 (Not tested with PHP 5) 
3. Open source utility youtube-dl (https://rg3.github.io/youtube-dl/) which does NOT need root permissions. If you are using Linux, it should be available in your repo so you can install it by running apt-get install youtube-dl. A Windows binary is also available on the official site.
4. getid3 for php (http://getid3.sourceforge.net/) and ffpmeg (https://ffmpeg.org/). 
5. Write access to a folder where you want the audio file to be copied to.
6. Node.js and npm 6+.
 
Please make sure to set up these applications first before trying to build YouTube2MP3.

The application can be set up to run in one of 2 different modes. 

1. Client - A standalone version of this application will present a download button for you to download an MP3 after the song has been downloaded and the id3 tags have been written.
2. Server - A server version of this application will automatically move the audio file to a specified location on your media server.

Build instruction:

1. Edit package.json and change the line that begins with "build" and edit --base-href to match the relative path that the application will be hosted at. If your site is hosted at         http://www.mysite.com/YouTube2MP3, your build line should look like this: "build": "ng build --base-href /YouTube2MP3/ --prod", Don't forget to add / at the end of the path!
2. Create a folder called media under the root of your web server where the mp3s will be stored temporarily. Give this folder full write permissions 
3. Rename the file serverTask-sample.php in assets to serverTasks.php and set the following values: 
     a. $destinationPath (Only needed if you are running in server mode) - The path where the mp3 will be moved to. This can be any path that is writable. 
     b. $sourcePath - The full path to the folder on your web server that you created in the previous step.
     c. $domain (Only needed if you are running in client mode) - The full URL where this app will be hosted. 
4. If you want to always run the app in server mode only, you can edit src/app/y2m/y2m.component.ts and change the line moveToServer = false; to moveToServer = true;. If you want to be    able to choose how to run YouTube2MP3, you can add a URL parameter ?MoveToServer=true after the last slash in the URL to run in server mode. The title will change to YouTube2MP3        (Server) when running in server mode. Not putting this URL parameter will run the app in client mode which is the default.
5. Run npm install - This will install all of the missing dependencies
6. Run npm run build - This will build YouTube2MP3.
7. Create a folder in dist/YouTube2MP3-Angular called php and copy assets/serverTasks.php to this folder
8. If everything compiled correctly, copy the contents of the dist/YouTube2MP3-Angular folder to the folder on your web server where you are hosting it and you referred to in step 3 (E.G. /YouTube2MP3)
9. On Windows, make sure you have the following files/folders in build/php: getid3 folder (Extract latest getid3.zip and copy getid3 subfolder), youtube-dl.exe, ffmpeg.exe and ffprobe.exe from the latest ffmpeg zip file.

YouToMe Bookmark:
YoutoMe also supports a URL parameter with the YouTube link. The easiest way to do this is to create a bookmark in your browsers' toolbar with the name Send to YouTube2MP3 and the following JavaScript code as the URL of the bookmark:

javascript:if(window.location.toString().indexOf('https://www.youtube.com')!=-1){window.open('https://mysite.com/YouTube2MP3/?URL='+window.location.toString()+'&Title='+document.title,'_parent','');event.preventDefault();}

If you want to run in server mode, use this code:

javascript:if(window.location.toString().indexOf('https://www.youtube.com')!=-1){window.open('https://mysite.com/YouTube2MP3/?MoveToServer=true&URL='+window.location.toString()+'&Title='+document.title,'_parent','');event.preventDefault();}

Don't forget to replace mysite.com/YouTube2MP3 with the full URL where you access the application. Now visit a YouTube video and click on the bookmark. A new tab/window will open with YouTube2MP3 with the URL already filled in. YouTube2MP3 will also get the title of the YouTube video page and try to determine the artist and song name. 

Troubleshooting: 

If you get an error downloading the track from YouTube, there are a few things that you can do to figure out what is causing the problem.

1. Make sure that the php directory has 777 permissions.
2. Make sure that youtube-dl is up to date. You can run the command sudo wget https://yt-dl.org/downloads/latest/youtube-dl -O /usr/local/bin/youtube-dl any time that you want to update youtube-dl. 
3. Make sure that youtube-dl has the right permissions by running sudo chmod a+rx /usr/local/bin/youtube-dl (Change the path if youtube-dl is located in a different location)
4. Run youtube-dl YOUTUBEURL -x --audio-format mp3 --audio-quality 320 where YOUTUBEURL is an actual YouTube link and make sure that the command completes and generates an mp3.
5. If you get the error "ERROR: WARNING: unable to obtain file audio codec with ffprobe" when running the step above, make sure that ffprobe is working correctly by running ffprobe -version. If you are using Plex and get a library error, this is caused by the envirnment variable LD_LIBRARY_PATH=/usr/lib/plexmediaserver. You can verify this by running the command export and looking for this variable. If you see this path, remove it by editing /etc/environment and add # in front of this line.

Please contact me if you have any questons, run into any problems or would like to suggest new features. 