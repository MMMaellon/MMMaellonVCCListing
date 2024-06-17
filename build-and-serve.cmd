echo Building Website
cd ..\package-list-action\
cmd /c .\build.cmd
cd .\docs\ 
http-server
