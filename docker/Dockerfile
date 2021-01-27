FROM php:7.4-apache

ENV TZ=America/Los_Angeles

COPY dist /var/www/html

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y \
    gpg sqlite3 ffmpeg libsqlite3-dev python python3 python3-distutils tzdata unzip vim wget && \
    curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py && python3 get-pip.py && \
    pip install pyacoustid requests && \
    docker-php-ext-install pdo_sqlite && docker-php-ext-enable pdo_sqlite && \
    wget https://github.com/JamesHeinrich/getID3/archive/master.zip && \
    wget https://yt-dl.org/downloads/latest/youtube-dl -O /usr/local/bin/youtube-dl && \
    mkdir /var/www/html/media && \
    chmod 755 assets/php/serverTasks.php && \
    mkdir php && \
    mv assets/php/serverTasks.php php && \
    unzip master.zip && \
    rm master.zip && \
    mv getID3-master/getid3 php && \
    rm -rf getID3-master && \
    mv /usr/local/etc/php/php.ini-production /usr/local/etc/php/php.ini && \
    echo extension=pdo_sqlite >> /usr/local/etc/php/php.ini && \
    echo extension=sqlite3 >> /usr/local/etc/php/php.ini && \
    mkdir python && \
    cp assets/python/* python && \
    rm -rf assets && \
    chmod 755 /usr/local/bin/youtube-dl && \
    sed -i 's/www.mysite.com/\/localhost/g' php/serverTasks.php && \
    sed -i 's/You2Me\///g' index.html && \
    chmod 777 /var/www/html/media/ && \
    chmod 777 /var/www/html/php && \
    docker-php-ext-install mysqli pdo_mysql pdo_sqlite && \
    apt-key adv --keyserver https://packages.microsoft.com/keys/microsoft.asc --recv-keys EB3E94ADBE1229CF && \
    curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - && \
    curl https://packages.microsoft.com/config/ubuntu/20.04/prod.list > /etc/apt/sources.list.d/mssql-release.list && \
    apt update && \
    ACCEPT_EULA=Y apt install -y msodbcsql17 mssql-tools unixodbc-dev && \
    echo 'export PATH="$PATH:/opt/mssql-tools/bin"' >> ~/.bash_profile && \
    echo 'export PATH="$PATH:/opt/mssql-tools/bin"' >> ~/.bashrc && \
    printf "; priority=20\nextension=sqlsrv.so\n" > /usr/local/etc/php/conf.d/sqlsrv.ini && \
    printf "; priority=20\nextension=pdo_sqlsrv.so\n" > /usr/local/etc/php/conf.d/pdo_sqlsrv.ini && \
    pecl install sqlsrv && \
    pecl install pdo_sqlsrv && \
    apt -y clean

# COPY --from=builder dist /var/www/html
HEALTHCHECK --interval=10s --timeout=3s CMD wget --quiet --tries=1 --spider http://localhost || exit 1
EXPOSE 80
CMD apachectl -D FOREGROUND
