FROM inutano/wget
FROM iojs 
FROM keinos/sqlite3
FROM guilhem/apt-get-install

ENV TZ=America/Los_Angeles

# Update apt-get repo
RUN apt-get update
RUN apt-get -y upgrade

# Disable python-pip because Python fingerprinting is disabled
RUN apt-get install -y git libsqlite3-dev sqlite3 tzdata unzip vim wget

FROM kahunacoder/docker-php-extensions

RUN docker-php-ext-install pdo_sqlite && docker-php-ext-enable pdo_sqlite

# Python

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

FROM node

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
RUN sed -i 's/www.mysite.com/\/localhost/g' You2Me/src/assets/php/serverTasks.php

# Replace https with http
RUN sed -i 's/https/http/g' You2Me/src/assets/php/serverTasks.php

RUN chmod 755 You2Me/src/assets/php/serverTasks.php

WORKDIR /tmp/You2Me/

RUN npm install

RUN mkdir php

# RUN mkdir python

RUN mv src/assets/php/serverTasks.php php

# RUN mv src/assets/python/* python

RUN npm run build

RUN mkdir /var/www
RUN mkdir /var/www/html

RUN mv dist/* /var/www/html

RUN mv php /var/www/html/

# RUN mv python /var/www/html/

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

RUN apt update

RUN apt install -y apache2 php7.0 php7.0-sqlite3 ffmpeg

RUN ln -s /etc/apache2/mods-available/headers.load /etc/apache2/mods-enabled/headers.load

RUN ln -s /etc/apache2/mods-available/rewrite.load /etc/apache2/mods-enabled/rewrite.load

RUN mkdir /var/www/html/media

RUN echo Header set Content-Disposition \""attachment\"" > /var/www/html/media/.htaccess

RUN echo Header set Content-Type application/force-download >> /var/www/html/media/.htaccess

# Enable SQLite3
RUN sed -i 's/;extension=php_pdo_sqlite/extension=php_pdo_sqlite/g' /etc/php/7.0/apache2/php.ini

RUN sed -i 's/;extension=php_sqlite3.dll/extension=php_sqlite3.dll/g' /etc/php/7.0/apache2/php.ini

RUN apt install -y vim

RUN echo extension=sqlite3.so > /etc/php/7.0/mods-available/sqlite3.ini

# Install youtube-dl
RUN wget https://yt-dl.org/downloads/latest/youtube-dl -O /usr/local/bin/youtube-dl

RUN chmod 755 /usr/local/bin/youtube-dl

RUN chmod 777 /var/www/html/media/
RUN chmod 777 /var/www/html/php

COPY cmd.txt /tmp

RUN echo "<Directory /var/www/html/media>" >> /etc/apache2/sites-enabled/000-default.conf
RUN echo Header set Content-Disposition "attachment" >> /etc/apache2/sites-enabled/000-default.conf
RUN echo Header set Content-Type application/force-download >> /etc/apache2/sites-enabled/000-default.conf
RUN echo "</Directory>" >> /etc/apache2/sites-enabled/000-default.conf

EXPOSE 80
CMD apachectl -D FOREGROUND 
