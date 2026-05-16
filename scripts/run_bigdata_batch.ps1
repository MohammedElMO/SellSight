$ErrorActionPreference = "Stop"

$RootDir = Resolve-Path (Join-Path $PSScriptRoot "..")
$PostgresUser = if ($env:POSTGRES_USER) { $env:POSTGRES_USER } else { "sellsight" }
$PostgresDb = if ($env:POSTGRES_DB) { $env:POSTGRES_DB } else { "sellsight_db" }
$JdbcUrl = if ($env:JDBC_URL) { $env:JDBC_URL } else { "https://repo1.maven.org/maven2/org/postgresql/postgresql/42.7.4/postgresql-42.7.4.jar" }

Set-Location $RootDir

function Write-Step {
    param([string] $Message)
    Write-Host ""
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $Message"
}

function Stop-Batch {
    param([string] $Message)
    throw $Message
}

function Ensure-JdbcDriver {
    param([string] $Path)
    if (Test-Path -LiteralPath $Path -PathType Leaf) {
        return
    }

    Write-Step "PostgreSQL JDBC driver is missing; downloading it"
    $Directory = Split-Path -Parent $Path
    if (-not (Test-Path -LiteralPath $Directory -PathType Container)) {
        New-Item -ItemType Directory -Path $Directory | Out-Null
    }

    Invoke-WebRequest -Uri $JdbcUrl -OutFile $Path
}

function Wait-ForContainerCommand {
    param(
        [string] $Container,
        [string] $Command,
        [string] $Label,
        [int] $Attempts = 60,
        [int] $DelaySeconds = 5
    )

    Write-Step "Waiting for $Label"
    for ($i = 1; $i -le $Attempts; $i++) {
        $PreviousErrorActionPreference = $ErrorActionPreference
        $ErrorActionPreference = "Continue"
        docker exec $Container bash -lc $Command 1> $null 2> $null
        $ExitCode = $LASTEXITCODE
        $ErrorActionPreference = $PreviousErrorActionPreference

        if ($ExitCode -eq 0) {
            Write-Step "$Label is ready"
            return
        }
        Start-Sleep -Seconds $DelaySeconds
    }

    Stop-Batch "$Label did not become ready in time"
}

Ensure-JdbcDriver "bigdata/jdbc/postgresql.jar"

Write-Step "Starting SellSight + Big Data containers"
docker compose -f docker-compose.yml -f docker-compose.bigdata.yml up -d

Wait-ForContainerCommand "sellsight-db" "pg_isready -U '$PostgresUser' -d '$PostgresDb'" "PostgreSQL"
Wait-ForContainerCommand "sellsight-namenode" "/opt/hadoop-3.2.1/bin/hdfs dfs -ls /" "HDFS"
Wait-ForContainerCommand "sellsight-hive-server" "/opt/hive/bin/hive -e 'SHOW DATABASES;'" "Hive"
Wait-ForContainerCommand "sellsight-spark-master" "/spark/bin/spark-submit --version" "Spark"

Write-Step "Importing PostgreSQL source tables to HDFS with Sqoop"
docker exec sellsight-sqoop bash /opt/sellsight/sqoop/import_postgres_to_hdfs.sh

Write-Step "Creating Hive raw and analytics databases/tables"
docker cp bigdata/hive/01_create_raw_tables.sql sellsight-hive-server:/tmp/01_create_raw_tables.sql
docker exec sellsight-hive-server /opt/hive/bin/hive -f /tmp/01_create_raw_tables.sql

Write-Step "Running Spark analytics batch"
docker cp bigdata/spark/sellsight_analytics.py sellsight-spark-master:/tmp/sellsight_analytics.py
docker exec sellsight-spark-master /spark/bin/spark-submit --master spark://spark-master:7077 /tmp/sellsight_analytics.py

Write-Step "Preparing PostgreSQL analytics tables"
docker cp bigdata/sql/create_analytics_tables.sql sellsight-db:/tmp/create_analytics_tables.sql
docker exec sellsight-db psql -U $PostgresUser -d $PostgresDb -f /tmp/create_analytics_tables.sql
docker exec sellsight-db psql -U $PostgresUser -d $PostgresDb -c "TRUNCATE analytics_daily_sales, analytics_top_products, analytics_event_funnel, analytics_category_sales, analytics_seller_performance, analytics_inventory_risk, analytics_monthly_sales, analytics_customer_value;"

Write-Step "Exporting processed analytics from HDFS to PostgreSQL with Sqoop"
docker exec sellsight-sqoop bash /opt/sellsight/sqoop/export_analytics_to_postgres.sh

Write-Step "Analytics row counts"
docker exec sellsight-db psql -U $PostgresUser -d $PostgresDb -c @"
SELECT 'analytics_daily_sales' AS table_name, count(*) FROM analytics_daily_sales
UNION ALL
SELECT 'analytics_top_products', count(*) FROM analytics_top_products
UNION ALL
SELECT 'analytics_event_funnel', count(*) FROM analytics_event_funnel
UNION ALL
SELECT 'analytics_category_sales', count(*) FROM analytics_category_sales
UNION ALL
SELECT 'analytics_seller_performance', count(*) FROM analytics_seller_performance
UNION ALL
SELECT 'analytics_inventory_risk', count(*) FROM analytics_inventory_risk
UNION ALL
SELECT 'analytics_monthly_sales', count(*) FROM analytics_monthly_sales
UNION ALL
SELECT 'analytics_customer_value', count(*) FROM analytics_customer_value;
"@

Write-Step "Big Data batch completed"
