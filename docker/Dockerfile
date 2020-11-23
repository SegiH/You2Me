FROM php:7.4-apache

ENV TZ=America/Los_Angeles

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y sqlite3 ffmpeg libsqlite3-dev python python3 python3-distutils tzdata unzip vim wget

# Install pip
RUN curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py && python3 get-pip.py

# Install Python dependencies
RUN pip install pyacoustid requests

# install php modules
RUN docker-php-ext-install pdo_sqlite && docker-php-ext-enable pdo_sqlite

# Get ID3 tagger library
RUN wget https://github.com/JamesHeinrich/getID3/archive/master.zip

# Download & Install youtube-dl
RUN wget https://yt-dl.org/downloads/latest/youtube-dl -O /usr/local/bin/youtube-dl

ADD dist /var/www/html

RUN mkdir /var/www/html/media

# Set up PHP
RUN chmod 755 assets/php/serverTasks.php

RUN mkdir php

RUN mv assets/php/serverTasks.php php

RUN unzip master.zip

RUN rm master.zip

RUN mv getID3-master/getid3 php

RUN rm -rf getID3-master

RUN mv /usr/local/etc/php/php.ini-production /usr/local/etc/php/php.ini

RUN echo extension=pdo_sqlite >> /usr/local/etc/php/php.ini

RUN echo extension=sqlite3 >> /usr/local/etc/php/php.ini

RUN mkdir python

RUN cp assets/python/* python

RUN rm -rf assets

RUN chmod 755 /usr/local/bin/youtube-dl

# Make serverTasks.php point to localhost
RUN sed -i 's/www.mysite.com/\/localhost/g' php/serverTasks.php

# Make base href the root folder
RUN sed -i 's/You2Me\///g' index.html

RUN chmod 777 /var/www/html/media/
RUN chmod 777 /var/www/html/php

EXPOSE 80
CMD apachectl -D FOREGROUND
