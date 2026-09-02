# PowerShell Script to Create Desktop App Shortcut on User's Desktop
$desktopPath = [Environment]::GetFolderPath('Desktop')
$targetPath = "c:\unstop hackathon\start_desktop_app.bat"
$shortcutPath = Join-Path $desktopPath "⚡ Continuum Engine Desktop App.lnk"

$wshell = New-Object -ComObject WScript.Shell
$shortcut = $wshell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $targetPath
$shortcut.WorkingDirectory = "c:\unstop hackathon"
$shortcut.Description = "Launch Continuum Engine Desktop App"
$shortcut.IconLocation = "shell32.dll,14" # High-tech lightning icon
$shortcut.Save()

Write-Host "✅ Desktop Shortcut Created Successfully at: $shortcutPath"
