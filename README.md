YouTube2MP3 is an Angular based application that is a YouTube downloader which will download the audio from a YouTube URL as an mp3, write the ID3 tags and will either present a download button or move the file to a location that you specify.

Pre-requisites to run YouTube2MP3:
1. Linux based server (tested with Apache and Nginx) or Windows based server (tested with Apache).
2. PHP 7 (Not tested with PHP 5) 
3. Open source utility youtube-dl (https://rg3.github.io/youtube-dl/) which does NOT need root permissions. If you are using Linux, it should be available in your repo so you can do apt-get install youtube-dl. A Windows binary is also available on the official site.
4. getid3 for php (http://getid3.sourceforge.net/) and ffpmeg (https://ffmpeg.org/). 
5. Write access to a folder where you want the audio file to be copied to.
6. Node.js and npm.
 
Please make sure to set up these applications first.

The application can be set up to run in one of 2 different ways. 

1. Standalone - A standalone installation of this application will present a download button for you to download the song after it has been downloaded and the id3 tags have been written.
2. Server - A media server installation application will automatically move the audio file to a specified location on your media server.

The installation instructions below will refer to specific steps that need to be followed for either standalone or server installation.

Build instruction:

1. Edit package.json and change the line that has --base-href to match the relative path that the application will be hosted at. If your site is hosted at http://www.mysite.com/YouTube2MP3, the value of base-href will be /YouTube2MP3
2. Edit src/app/y2m/y2m.component.ts and find the line moveToServer. If you want to run YouTube2MP3 as a server app change this to true. Otherwise if you want to run it as a standalone app, it should read moveToServer=false
3. Server - Edit src/php/serverTasks.php and set the value for $destinationPath to the path where you want the files to be copied to, $sourcePath as the location under the web server where the downloaded mp3 will be stored temporarily while its downloading and set $domain to the URL where the media is stored. Each of these directory locations must be writable by the user that the web server is running as. If your web server is located at /var/www/html/media and $sourcepath is set to "/var/www/html/media/" then $domain should be set to "http://www.mysite.com/media" replacing www.mysite.com with your actual domain.
4. npm install - This will install all of the missing dependencies
5. npm run build - This will build YouTube2MP3.
6. Copy the php folder to the dist\YouTube2MP3
7. If everything compiled correctly, copy the contents of the dist\YouTube2MP3 folder to the folder on your web server where you are hosting it and you referred to in step 2 (E.G. /YouTube2MP3)
8. On Windows, make sure you have the following files/folders in build/php: getid3 folder (Extract latest getid3.zip and copy getid3 subfolder), youtube-dl.exe, ffmpeg.exe and ffprobe.exe from the latest ffmpeg zip file.

YouToMe Bookmark:
YoutoMe also supports a URL parameter with the YouTube link. The easiest way to do this is to create a bookmark in your browsers' toolbar with the name Send to YouTube2MP3 and the following JavaScript code as the URL of the bookmark:

javascript:if(window.location.toString().indexOf('https://www.youtube.com')!=-1){window.open('https://mysite.com/YouTube2MP3/?URL='+window.location.toString()+'&Title='+document.title,'_parent','');event.preventDefault();}

Don't forget to replace mysite.com/YouTube2MP3 with the full URL where you access the application. Now visit a YouTube video and click on the bookmark. A new tab/window will open with YouTube2MP3 with the URL already filled in. YouTube2MP3 will also get the title of the YouTube video page and try to determine the artist and song name. 

Troubleshooting: 

If you get an error downloading the track from YouTube, there are a few things that you can do to figure out what is causing the problem.

1. Make sure that the php directory has 777 permissions.
2. Make sure that youtube-dl is up to date. You can run the command sudo wget https://yt-dl.org/downloads/latest/youtube-dl -O /usr/local/bin/youtube-dl any time that you want to update youtube-dl. 
3. Make sure that youtube-dl has the right permissions by running sudo chmod a+rx /usr/local/bin/youtube-dl
4. Run youtube-dl YOUTUBEURL -x --audio-format mp3 --audio-quality 320 where YOUTUBEURL is an actual YouTube link and make sure that the command completes and generates an mp3.
5. If you get the error "ERROR: WARNING: unable to obtain file audio codec with ffprobe" when running the step above, make sure that ffprobe is working correctly by running ffprobe -version. If you are using Plex and get a library error, this is caused by the envirnment variable LD_LIBRARY_PATH=/usr/lib/plexmediaserver. You can verify this by running the export command. If you see this path, remove it by editing /etc/environment and add # in front of this line.

Please contact me if you have any questons, run into any problems or would like to suggest new features. 