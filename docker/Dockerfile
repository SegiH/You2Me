FROM inutano/wget
FROM iojs 
FROM php:7.3-apache

ENV TZ=America/Los_Angeles

RUN apt-get update
RUN apt-get -y upgrade

# Disable python-pip because Python fingerprinting is disabled
RUN apt-get install -y ffmpeg git libsqlite3-dev npm sqlite3 tzdata unzip vim wget

RUN docker-php-ext-install pdo_sqlite && docker-php-ext-enable pdo_sqlite
# Fix me says has no installation candidate
# RUN apt-get install -y php-getid3

# Upgrade pip or it can cause build issues
#RUN wget https://bootstrap.pypa.io/get-pip.py 
#RUN python get-pip.py
#RUN rm get-pip.py

# Python dependencies
# Install setuptools and m2r first because they are a dependency of the other packages. 
# --upgrade ensures that any packages thare are installed already will be upgraded
#RUN pip install --upgrade setuptools m2r
#RUN pip install --upgrade chromaprint pyacoustid requests

# Install youtube-dl
RUN wget https://yt-dl.org/downloads/latest/youtube-dl -O /usr/local/bin/youtube-dl

RUN chmod 755 /usr/local/bin/youtube-dl

# Set up folders in web root
# RUN mkdir /var/www/html/php/
# RUN mkdir /var/www/html/python/

RUN mkdir /var/www/html/media/
RUN chmod 777 /var/www/html/media

# Upgrade npm to avoid build issues
RUN npm i npm@latest -g

# Work in tmp
WORKDIR /tmp

RUN git clone https://github.com/SegiH/You2Me.git

# Update npm
RUN npm install n -g

# Make base href the root folder
RUN sed -i 's/You2Me\///g' You2Me/package.json

RUN npm update

# Make serverTasks.php point to localhost
RUN sed -i 's/www.yoursite.com/\/localhost/g' You2Me/src/assets/php/serverTasks.php

# Replace https with http
RUN sed -i 's/https/http/g' You2Me/src/assets/php/serverTasks.php

RUN chmod 755 You2Me/src/assets/php/serverTasks.php

WORKDIR /tmp/You2Me/

RUN npm install

RUN mkdir php

RUN mkdir python

RUN mv src/assets/php/serverTasks.php php

RUN mv src/assets/python/* python

RUN npm run build

RUN mv dist/* /var/www/html

RUN mv php /var/www/html/

RUN mv python /var/www/html/

RUN chmod 777 /var/www/html/php/

# cleanup tmp folder
WORKDIR /tmp

RUN rm -rf You2Me

RUN rm -rf npm*

WORKDIR /var/www/html/

RUN wget https://github.com/JamesHeinrich/getID3/archive/master.zip

RUN unzip master.zip

RUN rm master.zip

RUN mv getID3-master/getid3 php

RUN rm -rf getID3-master

RUN ln -s /etc/apache2/mods-available/headers.load /etc/apache2/mods-enabled/headers.load

RUN ln -s /etc/apache2/mods-available/rewrite.load /etc/apache2/mods-enabled/rewrite.load

RUN echo Header set Content-Disposition "attachment" > /var/www/html/media/.htaccess

RUN echo Header set Content-Type application/force-download >> /var/www/html/media/.htaccess

# Make enable SQLite3
RUN cp /usr/local/etc/php/php.ini-production /usr/local/etc/php/php.ini

RUN sed -i 's/;extension=pdo_sqlite/extension=pdo_sqlite/g' /usr/local/etc/php/php.ini

RUN sed -i 's/;extension=sqlite3/extension=sqlite3/g' /usr/local/etc/php/php.ini

RUN apache2ctl restart

EXPOSE 80