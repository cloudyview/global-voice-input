$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$dist = Join-Path $root "dist"

New-Item -ItemType Directory -Force -Path $dist | Out-Null

Copy-Item -Force (Join-Path $root "src\recorder.html") (Join-Path $dist "recorder.html")
Copy-Item -Force (Join-Path $root "src\settings.html") (Join-Path $dist "settings.html")
