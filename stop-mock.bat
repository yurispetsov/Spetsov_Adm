@echo off
echo Stopping mock API window (if open)...
:: This just closes the opened window title "mock-api" if found
for /f "tokens=2 delims==; " %%a in ('tasklist /v /fi "WINDOWTITLE eq mock-api" /fo list ^| findstr /i PID') do taskkill /PID %%a /F
echo Done.
