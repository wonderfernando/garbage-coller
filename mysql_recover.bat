@echo off
cd /d C:\laragon\bin\mysql\mysql-8.4.3-winx64\bin
mysqld.exe --defaults-file=C:\laragon\bin\mysql\mysql-8.4.3-winx64\my.ini --skip-grant-tables --port=3306 --bind-address=0.0.0.0 > C:\laragon\www\backend\mysql_recover.log 2>&1