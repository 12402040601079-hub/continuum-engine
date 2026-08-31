' Continuum Engine - Silent Invisible Background Launcher
' Runs uvicorn on 0.0.0.0:8000 in background and opens default browser without showing any command prompt window.

Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")

strScriptDir = FSO.GetParentFolderName(WScript.ScriptFullName)
strBackendDir = strScriptDir & "\backend"

' Run uvicorn completely hidden (window style 0 = invisible)
strCmd = "cmd /c cd /d """ & strBackendDir & """ && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"
WshShell.Run strCmd, 0, False

' Wait 1.5 seconds for server initialization
WScript.Sleep 1500

' Open application in default web browser
WshShell.Run "http://127.0.0.1:8000/app"
