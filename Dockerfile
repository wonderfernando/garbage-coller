FROM php:8.3-fpm

# Instala dependências do sistema e extensões do PHP necessárias para o Laravel
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip

# Limpa cache do apt
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Instala extensões nativas do PHP
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Copia o Composer oficial
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Script de inicialização do servidor de desenvolvimento do Laravel
CMD php artisan serve --host=0.0.0.0 --port=8000