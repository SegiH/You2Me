You2Me is an Angular based application that is a YouTube downloader which will download the audio from a YouTube URL as an mp3, write the ID3 tags and will either present a download button or move the file to a location that you specify.

Note: This application is an Angular rewrite of my other application YouTube2MP3 which is written in React with a new name. It is still under initial development and may not full work yet.

Pre-requisites to run You2Me:

Linux based server (tested with Apache and Nginx) or Windows based server (tested with Apache).
PHP 7 (Not tested with PHP 5)
Open source utility youtube-dl (https://rg3.github.io/youtube-dl/) which does NOT need root permissions. If you are using Linux, it should be available in your repo so you can do apt-get install youtube-dl. A Windows binary is also available on the official site.
getid3 for php (http://getid3.sourceforge.net/) and ffpmeg (https://ffmpeg.org/).
Write access to a folder where you want the audio file to be copied to.
Node.js and npm.
Please make sure to set up these applications first.

The application can be set up to run in one of 2 different ways.

Standalone - A standalone installation of this application will present a download button for you to download the song after it has been downloaded and the id3 tags have been written.
Server - A media server installation application will automatically move the audio file to a specified location on your media server.
The installation instructions below will refer to specific steps that need to be followed for either standalone or server installation.

Build instruction:

Rename package.json.sample to package.json
Edit the "homepage" line in package.json and add the URL of your site so it reads "homepage":"https://www.mysite.com/You2Me",
Server - Edit src/You2Me.js and change const moveToServer=false to const moveToServer=true
Standalone - Edit src/You2Me.js and make sure that the line const moveToServer=false is actually false and not const moveToServer=true
Server - Edit src/php/serverTasks.php and set the value for $destinationPath to the path where you want the files to be copied to, $sourcePath as the location under the web server where the downloaded mp3 will be stored temporarily while its downloading and set $domain to the URL where the media is stored. Each of these directory locations must be writable by the user that the web server is running as. If your web server is located at /var/www/html/media and $sourcepath is set to "/var/www/html/media/" then $domain should be set to "http://www.mysite.com/media" replacing www.mysite.com with your actual domain.
npm install - This will install all of the missing dependencies
npm run build
If everything compiled correctly, copy the contents of the build folder to the folder on your web server where you are hosting it and you referred to in step 2 (E.G. /You2Me)
Copy the php folder to the build folder.
On Windows, make sure you have the following files/folders in build/php: getid3 folder (Extract latest getid3.zip and copy getid3 subfolder), youtube-dl.exe, ffmpeg.exe and ffprobe.exe from the latest ffmpeg zip file.
YouToMe Bookmark: YoutoMe also supports a URL parameter with the YouTube link. The easiest way to do this is to create a bookmark in your browsers' toolbar with the name Send to You2Me and the following JavaScript code as the URL of the bookmark:

javascript:if(window.location.toString().indexOf('https://www.youtube.com')!=-1){window.open('https://mysite.com/You2Me/?URL='+window.location.toString()+'&Title='+document.title,'_parent','');event.preventDefault();}

Don't forget to replace mysite.com/You2Me with the full URL where you access the application. Now visit a YouTube video and click on the bookmark. A new tab/window will open with You2Me with the URL already filled in. You2Me will also get the title of the YouTube video page and try to determine the artist and song name.

Troubleshooting:

If you get an error downloading the track from YouTube, there are a few things that you can do to figure out what is causing the problem.

Make sure that the php directory has 777 permissions.
Make sure that youtube-dl is up to date. You can run the command sudo wget https://yt-dl.org/downloads/latest/youtube-dl -O /usr/local/bin/youtube-dl any time that you want to update youtube-dl.
Make sure that youtube-dl has the right permissions by running sudo chmod a+rx /usr/local/bin/youtube-dl
Run youtube-dl YOUTUBEURL -x --audio-format mp3 --audio-quality 320 where YOUTUBEURL is an actual YouTube link and make sure that the command completes and generates an mp3.
If you get the error "ERROR: WARNING: unable to obtain file audio codec with ffprobe" when running the step above, make sure that ffprobe is working correctly by running ffprobe -version. If you are using Plex and get a library error, this is caused by the envirnment variable LD_LIBRARY_PATH=/usr/lib/plexmediaserver. You can verify this by running the export command. If you see this path, remove it by editing /etc/environment and add # in front of this line.
Please contact me if you have any questons, run into any problems or would like to suggest new features.