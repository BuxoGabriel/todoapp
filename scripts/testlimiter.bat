@echo off
set count=150
:loop
curl.exe http://localhost:3000
echo:
set /a count=count-1
if %count%==0 goto exitloop
goto loop
:exitloop