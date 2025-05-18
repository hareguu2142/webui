Below is an English‐commented version of the same `reset_to_commit.bat` script. Save it as `reset_to_commit.bat` in your `webui` folder and double‐click to run:

```bat
@echo off
REM ===============================================
REM Initialize Git repo if missing and reset to a specific commit
REM ===============================================
setlocal

REM -------- Configuration --------
set REPO_URL=https://github.com/hareguu2142/webui.git
set TARGET_COMMIT=c07f5c68fd8f3b3aa11d803582cf042caa816f63
REM --------------------------------

REM 1) If there’s no .git folder, initialize and fetch from remote
if not exist ".git" (
    echo [.git folder not found] Initializing Git repository...
    git init || goto error
    git remote add origin %REPO_URL% || goto error
    git fetch origin --tags || goto error
)

REM 2) Check out the target commit and hard‐reset working tree
echo Checking out commit %TARGET_COMMIT%...
git checkout %TARGET_COMMIT% || goto error
git reset --hard %TARGET_COMMIT% || goto error

echo.
echo ===============================================
echo Done: Repository is now at commit %TARGET_COMMIT%.
echo ===============================================
pause
goto end

:error
echo.
echo ERROR: Something went wrong.
echo - Make sure Git is installed and on your PATH.
echo - Verify you have an internet connection.
pause

:end
endlocal
```
