$ErrorActionPreference = "Stop"

$RootDir = Resolve-Path (Join-Path $PSScriptRoot "..")
$TaskName = if ($env:BIGDATA_TASK_NAME) { $env:BIGDATA_TASK_NAME } else { "SellSight Big Data Batch" }
$StartTime = if ($env:BIGDATA_START_TIME) { $env:BIGDATA_START_TIME } else { "02:00" }

$BatchScript = Join-Path $RootDir "scripts/run_bigdata_batch.ps1"

if (-not (Test-Path -LiteralPath $BatchScript -PathType Leaf)) {
    throw "Missing batch script: $BatchScript"
}

$Action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$BatchScript`"" `
    -WorkingDirectory $RootDir

$Trigger = New-ScheduledTaskTrigger -Daily -DaysInterval 2 -At $StartTime
$Settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Hours 6)

Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $Action `
    -Trigger $Trigger `
    -Settings $Settings `
    -Description "Runs the SellSight PostgreSQL -> HDFS -> Hive -> Spark -> PostgreSQL analytics batch every 2 days." `
    -Force | Out-Null

Write-Host "Scheduled task registered: $TaskName"
Write-Host "Frequency: every 2 days"
Write-Host "Start time: $StartTime"
Write-Host "Batch script: $BatchScript"
