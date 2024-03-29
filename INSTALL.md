# You2Me Installation

### Installation

You2Me can be run as a Docker container or installed on your own web server (Apache or Nginx). 

#### Docker
This is the easiest way to run You2Me. You can use my compose script `you2me.docker-compose.yml` located in `docker/` which will pull an image of You2Me from [Docker Hub](https://hub.docker.com/) that I build and push to Docker Hub regularly. This gives you a You2Me image with the default options. You can also build a You2Me image yourself if you want to customize any of the default options like enabling "Move To Server" which lets you move the audio/video file to your own web server

#### Use Docker image from Docker Hub
1. Edit docker/you2me.docker-compose.yml and change `YourNetworkName` on line 5 to your actual custom network name in Docker ([How to create a network in Docker](https://docs.docker.com/engine/reference/commandline/network_create/)). This should not be `host`.
1. Run the command `docker-compose -f you2me.docker-compose.yml up -d` to create the You2Me container.

#### Build Docker image
   1. Install [Node.js](https://nodejs.org/en/) which includes npm.
     1. Edit package.json and find the line that begins with "build" under "scripts". Make sure that --base-href is set to /.
   1. Edit the file assets/php/serverTasks.php and set the following values: 
        - If you want to be able to move the generated file directly to your media server, change the value of $moveToServerAllowed to true. Make sure to add a volume in you2me.docker-compose.yml that points to /mnt/usb in the container: Ex `- /mnt/media:/mnt/usb`
        - $domain - no need to change unless you want to explicitly set the domain . If you do change this, make sure that the domain is in the format `$domain ="https://www.domain.com/media/";` which includes `media/` at the end.
    1. If you want to be able to move the file directly to your media server, edit src/app/y2m/y2m.component.ts and make sure that the line with allowMoveToServer reads `allowMoveToServer = true;`
   1. Rename `proxy.example.conf.json` to `proxy.conf.json`
   1. Run `npm install` - This will install all of the missing dependencies.
   1. Run `npm run build` - This will build the You2Me application in the dist folder.  
   1. If you are on Linux, the dist folder should automatically be moved to the docker folder. If you are on Windows, ignore the mv error because the command to move the dist folder only works on Linux and manually move the dist folder into the docker folder. 
   1. Build the you2me Docker image: `docker build docker/ -t you2me`
   1. Edit you2me.docker-compose.yml and change `YourNetworkName` to the name of the Docker network that you want this container to be on. The image name should also match the value you provided with -t in the previous step. If you copied and pasted the command above, the image name will be you2me.
   1. Build the container using the you2me image you created above by running `docker-compose -f you2me.docker-compose.yml up -d`.
   1. Visit http://dockeripaddress in your browser. You can run `docker-machine ip` to find the IP address of your docker instance on Windows or `docker inspect $(sudo docker ps -q) | grep \"IPAddress\"` on Linux.

#### Install on your own web server
   1. Install  PHP 7 (Not tested with PHP 5)
   1. Install [Node.js](https://nodejs.org/en/) which includes npm.
   1. Download the open source utility [youtube-dl](https://rg3.github.io/youtube-dl/) which does NOT need root permissions. If you are using Linux, it should be available in your repo so you can install it by running `apt-get install youtube-dl`. A Windows binary is also available on the official site.
   1. Install getid3 for PHP. Linux users can install it using `apt-get install php-getid3`. If you are on Windows or its not available in your repo, download [getid3](http://getid3.sourceforge.net), extract the zip and copy the folder getid3 into the php folder
   1. Install ffpmeg. Windows users can download [ffmpeg](https://ffmpeg.org/) from this link. Linux users need to run `apt-get install ffmpeg`.
   1. Download the latest source for You2Me from my Github page
   1. Edit package.json and find the line that begins with "build". Edit --base-href to match the relative path that the application will be hosted at. If your site is hosted at http://www.mysite.com/You2Me, your build line should look like this: "build": "ng build --base-href /You2Me/ --prod", Don't forget to add / at the beginning and end of the path.
   1. Create a folder called media in the root of the web server (which is usually located at `/var/www/html`) where the generated file will be stored temporarily. Linux users need to give this folder write permissions by running `chmod 775 media`.
   1. Edit the file assets/php/serverTasks.php and set the following values: 
        - If you want to be able to move the file directly to your media server, change the value of $moveToServerAllowed to true and set $audioDestinationPath and $videoDestinationPath to a location that the web server has access to. You can use the same path for both variables. This can be any path that is writable including a remote location such as a Samba mounted folder.
        - $sourcePath - The full path to the media folder on your web server that you created above. Ex: `/var/www/html/media/`. This location needs to be under your web root and writable.
        - $domain - no need to change unless you want to explicitly set the domain . You can change this to $domain ='https://mydomain.com/media/" which is the full URL where this app will be hosted. Ex: `https://www.mysite.com/You2Me/media`. This has to include `media/` at the end/
   1. Edit src/app/y2m/y2m.component.ts 
        -  If you want to be able to move the file directly to your media server, edit src/app/y2m/y2m.component.ts and make sure that the line with allowMoveToServer reads `allowMoveToServer = true;`
        - Run `npm install` - This will install all of the missing dependencies.
        - Run `npm run build` - This will build the You2Me application in the dist folder.  
        - Move the folders `php` and `python` from the assets folder into the dist folder. 
        - Give dist/php/serverTasks.php 755 permissions on Linux `chmod 755 serverTasks.php`.
        . The assets folder should be empty now and can be deleted.
        - Copy everything incode of the dist folder to your web server but not the dist folder itself.
        - On Windows, make sure you have the following files/folders in the php folder: getid3, youtube-dl.exe, ffmpeg.exe and ffprobe.exe.

### URL Parameters
You can supply default values for all of the fields by providing URL parameters.

The URL parameters are as follows: URL, Name and Format. 

To add a URL parameter use "?" for the first URL parameter and "&" for every parameter after that in the format parametername=value. 

To specify Beck as the artist and Odelay as the album as a URL parameter use. `http://www.example.com/You2Me?Name=Uptown%20Funk&format=320k` For audio or video formats, supply one of the values above such as `Format=original` for video without reencoding or `Format=320k` for 320kbps mp3 audio.

### You2Me Bookmark

You2Me supports a bookmark which will automatically load You2Me in a new tab with the URL of the site that you want to use You2Me with. Create a bookmark in your browsers' toolbar with the name Send to You2Me and the following JavaScript code as the URL of the bookmark:

```
javascript:window.open('https://mysite.com/You2Me/?URL='+window.location.toString()+'&Name='+document.title+'&Format=320k','_parent','');event.preventDefault();
```

Don't forget to replace `https://mysite.com/You2Me` with the full URL of your instance of You2Me. Now visit a supported site like YouTube and click on the bookmark. A new You2Me tab/window will open with the URL already filled in. 

When you use this shortcut, you do not need to enter the artist and or track title. This application uses fingerprinting to try and automatically identify the song. If it cannot identify the track, you will be prompted to enter the artist and song name.

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
     - "traefik.http.middlewares.you2meMiddleware.headers.accesscontrolallowmethods=GET,OPTIONS,PUT"
     - "traefik.http.middlewares.you2meMiddleware.headers.accesscontrolalloworiginlist=https://you2me.mysite.com,http://localhost:4200"
`

Please submit a new issue for bug reports or feature requests.