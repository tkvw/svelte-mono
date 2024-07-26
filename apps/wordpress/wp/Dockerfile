# Gebruik de officiële WordPress image als basis
FROM wordpress:6-php8.2

# Installeer extra PHP extensies (voorbeeld)
RUN apt-get update && \
    apt-get install -y libxml2-dev && \
    docker-php-ext-install soap

# Kopieer een aangepast php.ini-bestand (optioneel)
#COPY php.ini /usr/local/etc/php/

# Voeg aangepaste scripts of bestanden toe
# COPY custom-script.sh /usr/local/bin/custom-script.sh
# RUN chmod +x /usr/local/bin/custom-script.sh

# Make things cleaner by saving this path on a variable
ARG XDEBUG_INI="/usr/local/etc/php/conf.d/xdebug.ini"

# Install, enable and configure xdebug
RUN pecl install xdebug \
    && docker-php-ext-enable xdebug 