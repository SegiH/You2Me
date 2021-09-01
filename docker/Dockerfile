FROM php:7.4-apache as build

ENV TZ=America/Los_Angeles

WORKDIR /var/www/html
COPY dist ./

RUN apt update && \
    apt -y install gpg  && \
    apt-key adv --keyserver https://packages.microsoft.com/keys/microsoft.asc --recv-keys EB3E94ADBE1229CF && \
    curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - && \
    curl https://packages.microsoft.com/config/ubuntu/20.04/prod.list > /etc/apt/sources.list.d/mssql-release.list && \
    apt update && \
    DEBIAN_FRONTEND=noninteractive ACCEPT_EULA=Y apt install -y ffmpeg libsqlite3-dev msodbcsql17 mssql-tools python python3 python3-distutils sqlite3 tzdata unixodbc-dev unzip vim wget && \
    curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py && python3 get-pip.py && \
    pip install pyacoustid requests # Install Python dependencies && \
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
    echo 'export PATH="$PATH:/opt/mssql-tools/bin"' >> ~/.bash_profile && \ 
    echo 'export PATH="$PATH:/opt/mssql-tools/bin"' >> ~/.bashrc && \
    printf "; priority=20\nextension=sqlsrv.so\n" > /usr/local/etc/php/conf.d/sqlsrv.ini && \
    printf "; priority=20\nextension=pdo_sqlsrv.so\n" > /usr/local/etc/php/conf.d/pdo_sqlsrv.ini && \
    pecl install sqlsrv && \
    pecl install pdo_sqlsrv

    #apt update && \
    #apt -y install gpg && \
    #apt update && \
    #ACCEPT_EULA=Y apt install -y msodbcsql17 mssql-tools unixodbc-dev && \

#FROM php:7.4-apache as final 
#COPY --from=0 /var/www/html /var/www/html

CMD apachectl -D FOREGROUND
EXPOSE 80
