' Continuum Engine - Silent 1-Click Public Tunnel & App Launcher
' Runs backend and public tunnel completely hidden in the background (ZERO terminal windows)
' Opens browser directly with zero manual commands.

Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")

strScriptDir = FSO.GetParentFolderName(WScript.ScriptFullName)
strBackendDir = strScriptDir & "\backend"

' 1. Start FastAPI Backend Silently (hidden window)
strCmdBackend = "cmd /c cd /d """ & strBackendDir & """ && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"
WshShell.Run strCmdBackend, 0, False

' 2. Wait for backend startup
WScript.Sleep 2000

' 3. Open Web App in default browser immediately
WshShell.Run "http://127.0.0.1:8000/app"

' 4. Popup confirmation
WshShell.Popup "⚡ Continuum Engine is running invisibly in the background with ZERO terminal windows!" & vbCrLf & vbCrLf & "• Local / Network URL: http://127.0.0.1:8000/app" & vbCrLf & "• To stop the background server at any time, run stop_server.bat", 5, "Continuum Engine Active", 64
