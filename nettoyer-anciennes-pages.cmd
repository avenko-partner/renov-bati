@echo off
setlocal
chcp 65001 >nul
if not exist "%~dp0index.html" goto erreur
if not exist "%~dp0content.js" goto erreur
for %%F in (zones-intervention.html zones.js prestations.html) do (
  if exist "%~dp0%%F" (
    del /q "%~dp0%%F"
    if exist "%~dp0%%F" goto erreur
  )
)
echo Les anciens fichiers SEO sont absents du dossier.
echo Les photographies et les pages du site ont ete conservees.
exit /b 0
:erreur
echo Nettoyage impossible. Verifiez que ce fichier est dans le dossier du site.
exit /b 1
