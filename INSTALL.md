# You2Me Installation

### Usage
This application can be set up to run in one of 2 different ways: 

 - Client - Using the application this way will display a download button that that lets you download the file to your computer or phone. (Default)
 - Server - Using this application this way will automatically move the audio file to a specified location on your media server instead of showing a download button. Add ?MoveToServer=true at the end of the URL to enable this option. You can also choose whether to download the file or move to server if you do not specify this URL argument, as long as this feature is enabled (see the section Edit src/app/y2m/y2m.component.ts below).

### Installation

You2Me can be run as a Docker container or installed on your own web server (Apache or Nginx). 

#### Docker
This is the easiest way to run You2Me. You can now pull an image of You2Me directly from Docker Hub if you want to use You2Me with the default options.

If you already use Docker:

#### Use existing image 
1. Run the command `docker pull shovav/you2me:latest` to pull the latest image from Docker Hub.
1. Edit docker/you2me.docker-compose.yml and change `YourNetworkName` on line 5 to your actual custom network name in Docker ([How to create a network in Docker](https://docs.docker.com/engine/reference/commandline/network_create/)). This should not be `host`.
1. Run the command `docker-compose -f you2me.docker-compose.yml up --no-start && docker start You2Me` to create the You2Me container.
### Build Docker image
   1. Install npm 6+ which includes Node.js and npm.
   1. Go to the main You2Me folder in terminal or command prompt
   1. Edit package.json and find the line that begins with "build". Edit --base-href to match the relative path that the application will be hosted at. If your site is hosted at http://www.mysite.com/You2Me/, your build line should look like this: "build": "ng build --base-href /You2Me/ --prod", Don't forget to add / at the beginning and end of the path.
   1. Rename `proxy.example.conf.json` to `proxy.conf.json`
   1. Run `npm install` - This will install all of the missing dependencies.
   1. Run `npm run build` - This will build You2Me and create the dist folder.  
   1. If you are on Linux, the dist folder should automatically be moved to the docker folder. If you are on Windows, ignore the error (because the command only works on Linux) and manually move the dist folder into the docker folder. 
   1. Build the you2me Docker image: `docker build docker/ -t you2me`
   1. Edit you2me.docker-compose.yml and change `YourNetworkName` to the name of the Docker network that you want this container to be on.
   1. Build the container using the you2me image you created above by running `docker-compose -f you2me.docker-compose.yml up --no-start && docker start You2Me`.
   1. Visit https://dockeripaddress:port in your browser. You can run `docker-machine ip` to find the IP address of your docker instance on Windows or `docker inspect $(sudo docker ps -q) | grep \"IPAddress\"` on Linux.

#### Install on your own web server
   1. Install  PHP 7 (Not tested with PHP 5) 
   1. Download the open source utility [youtube-dl](https://rg3.github.io/youtube-dl/) which does NOT need root permissions. If you are using Linux, it should be available in your repo so you can install it by running `apt-get install youtube-dl`. A Windows binary is also available on the official site.
   1. Install getid3 for PHP. Linux users can install it using `apt-get install php-getid3`. If you are on Windows or its not available in your repo, download [getid3](http://getid3.sourceforge.net), extract the zip and copy the folder getid3 into the php folder
   1. Install ffpmeg. Windows users can download [ffmpeg](https://ffmpeg.org/) from this link. Linux users need to run `apt-get install ffmpeg`.
   1. Install npm 6+ which includes Node.js and npm.
   1. Download the latest source for You2Me from my Github page
   1. Edit package.json and find the line that begins with "build". Edit --base-href to match the relative path that the application will be hosted at. If your site is hosted at http://www.mysite.com/You2Me, your build line should look like this: "build": "ng build --base-href /You2Me/ --prod", Don't forget to add / at the beginning and end of the path.
   1. Create a folder called media under the root of your web server where the file will be stored temporarily. Linux users need to give this folder write permissions by running `chmod 775 media`.
   1. Edit the file assets/php/serverTasks.php and set the following values: 
        - $destinationPath (Only needed if you are running in server mode) - The path where the media file will be moved to. This can be any path that is writable including a remote location such as a Samba mounted folder.
        - $sourcePath - The full path to the media folder on your web server that you created above. Ex: `/var/www/html/media/`. This location needs to be under your web root and writable.
        - $domain - no need to change unless you want to explicitly set the domain . You can change this to $domain ='https://mydomain.com/media/" which is the full URL where this app will be hosted. Ex: `https://www.mysite.com/You2Me/`
   1. Edit src/app/y2m/y2m.component.ts 
        - If you want to always run the app in server mode only, find and change the line `moveToServer = false;` to `moveToServer = true;`. If you want to be able to choose whether to download the file or move it to your server, leave this set to false. You can always use the MoveToServer URL parameter to decide this when running the web app. The title of the page will change to You2Me (Server) when running in server mode to distinguish client and server mode. If you don't provide this URL parameter and allowServerMode is false, the app will run in client mode. Please note that setting moveToServer = true in src/app/y2m/y2m.component.ts  or by setting the URL parameter &MoveToServer=true will automatically move the file to the server and not display a download button.
        - If you do not want to allow the file from ever being moved to the server with a URL parameter, find and change the line allowMoveToServer = true; to allowMoveToServer = false;
        - Run `npm install` - This will install all of the missing dependencies.
        - Run `npm run build` - This will build You2Me.
        - Make a folder called php in dist and move assets/serverTasks.php into this folder. Give it 755 permissions on Linux. ~~Create folder python in dist and move all files ending in py and pyc to this folder. The assets folder should be empty now. if it is you can delete it.~~   
        - Copy the contents of the dist folder to your web server
        - On Windows, make sure you have the following files/folders in the php folder: getid3 folder (Extract latest getid3.zip and copy getid3 subfolder) youtube-dl.exe, ffmpeg.exe and ffprobe.exe from the latest ffmpeg zip file.
        - If you are using Linux, make sure that php/serverTasks.php has execute permission by running `chmod 775 serverTasks.php`.

### URL Parameters
You can supply default values for all of the fields by providing URL parameters.

The URL parameters are as follows: URL, Name and Format. 

To add a URL parameter use "?" for the first URL parameter and "&" for every parameter after that in the format parametername=value. 

To specify Beck as the artist and Odelay as the album as a URL parameter use. `http://www.example.com/You2Me?Name=Uptown%20Funk&format=320k` For audio or video formats, supply one of the values above such as `Format=original` for video without reencoding or `Format=320k` for 320kbps mp3 audio.

### You2Me Bookmark

You2Me supports a bookmark which will automatically load You2Me in a new tab with the URL of the site that you want to use You2Me with. Create a bookmark in your browsers' toolbar with the name Send to You2Me and the following JavaScript code as the URL of the bookmark:

Client mode:

```
javascript:window.open('https://mysite.com/You2Me/?URL='+window.location.toString()+'&Name='+document.title+'&Format=320k','_parent','');event.preventDefault();
```
Server mode:

```
javascript:window.open('https://mysite.com/You2Me/?MoveToServer=true&URL='+window.location.toString()+'&Name='+document.title+'&Format=320k','_parent','');event.preventDefault();
```

Don't forget to replace `mysite.com/You2Me` with the full URL of your instance of You2Me. Now visit a supported site like YouTube and click on the bookmark. A new You2Me tab/window will open with the URL already filled in. 

When you use this shortcut, you do not need to enter the artist and or track title and don't need to fix the filled in artist or track title because it will be fixed automatically if Python is able to identify the song.

### Troubleshooting

If you get an error downloading the track, there are a few things that you can do to figure out what is causing the problem.

##### Docker Troubleshooting
1. Make sure that youtube-dl is up to date. It gets updated fairly often and is usually the most common reason that this app  will stop working. Run the command `docker exec You2Me pip install --upgrade youtube_dl`.
2. Run the following command to test youtube-dl in your You2Me Docker container `docker exec -it You2me youtube-dl URL -x --audio-format mp3 --audio-quality 320` where URL is the full URL of the site that you want to download. Make sure that the command completes and generates an mp3.

##### Self installed
1. Make sure that youtube-dl is up to date. It gets updated fairly often and is usually the most common reason that this app  will stop working. Run the command `sudo pip install --upgrade youtube_dl` to upgrade YouTube-dl. 
1. Make sure that youtube-dl has the right permissions by running `chmod a+rx /usr/local/bin/youtube-dl` (Change the path if youtube-dl if it is located in a different location).
1. Make sure that the php directory has write permissions.
1. Make sure that the media folder has write permissions. 
1. Run the following command in a terminal: `youtube-dl URL -x --audio-format mp3 --audio-quality 320` where URL is the full URL of the site that you want to download. Make sure that the command completes and generates an mp3.
1. If you get the error "ERROR: WARNING: unable to obtain file audio codec with ffprobe" when running the step above, make sure that ffprobe is working correctly by running `ffprobe -version`. If you are using Plex and get this error, it is caused by the envirnment variable `LD_LIBRARY_PATH=/usr/lib/plexmediaserver`. You can verify this by running the command export and looking for this variable. If you see this path, remove it by editing /etc/environment and add # in front of this line.
1. Make sure that the youtube URL is in the format `https://www.youtube.com/watch?v=<YOUTUBEID>` where `<YOUTUBEID>` is random letters and number.
1. When using the Angular dev server, downloading won't work unless you allow CORS Headers. You will need to look up how to do to this for your web server. For Traefik you would add something like this: (Replace MY-NETWORK-NAME with your network and you2me.mysite.com with your actual domain in 2 places )
`
labels:
     - "traefik.enable=true"
     - "traefik.network=MY-NETWORK-NAME"
     - "traefik.http.routers.you2me.rule=Host(`you2me.mysite.com`)"
     - "traefik.http.routers.you2me.entrypoints=websecure"
     - "traefik.http.routers.you2me.tls.certresolver=letsencryptresolver"
     - "traefik.http.routers.you2me.middlewares=you2meMiddleware"
     # CORS HEADER
     - "traefik.http.middlewares.you2meMiddleware.headers.accesscontrolallowmethods=GET,OPTIONS,PUT"
     - "traefik.http.middlewares.you2meMiddleware.headers.accesscontrolalloworiginlist=https://you2me.mysite.com,http://localhost:4200"
`

Please submit a new issue for bug reports or feature requests.