@echo off
echo Checking if Git is installed...
where git >nul 2>&1
if %errorlevel% neq 0 (
  echo Git is not installed. Please install Git and add it to your PATH.
  pause
  exit /b 1
)

echo Checking if this is a Git repository...
if exist .git (
  echo This directory is already a Git repository.
) else (
  echo Initializing Git repository...
  git init
)

echo Adding all files...
git add .
if %errorlevel% neq 0 (
  echo Error adding files.
  pause
  exit /b 1
)

echo Committing changes...
git commit -m "Upload to main"
if %errorlevel% neq 0 (
  echo Error committing changes.
  pause
  exit /b 1
)

echo Pushing to main branch...
git remote add origin https://github.com/hareguu2142/webui.git
if %errorlevel% neq 0 (
  echo Error adding remote origin.
  pause
  exit /b 1
)
git branch -M main
if %errorlevel% neq 0 (
  echo Error renaming branch to main.
  pause
  exit /b 1
)
git push -f origin main
if %errorlevel% neq 0 (
  echo Error pushing to main branch. You may need to force push.
  echo Please ensure you have the correct permissions and that the repository exists.
  pause
  exit /b 1
)

echo Done!
pause
