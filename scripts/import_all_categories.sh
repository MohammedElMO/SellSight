#!/bin/bash
# Download and import all Amazon Review categories to PostgreSQL

set -e

SELLER_ID="d811ad74-bafa-4919-81f1-7003c8737604"
CACHE_DIR="/tmp/hf_amazon_all"
CATEGORIES="${1:-Electronics All_Beauty}"  # Default: Electronics + All_Beauty

echo "📊 Amazon Reviews 2023 → PostgreSQL Importer"
echo "👤 Seller ID: $SELLER_ID"
echo ""

export PGHOST=localhost
export PGPORT=5432
export PGDATABASE=sellsight_db
export PGUSER=sellsight
export PGPASSWORD=sellsight
export IMPORT_SELLER_ID=$SELLER_ID

mkdir -p "$CACHE_DIR"
cd /workspaces/SellSight
TOTAL_IMPORTED=0

for CATEGORY in $CATEGORIES; do
    echo "🚀 $CATEGORY"
    
    # Download all 10 chunks
    for i in {0..9}; do
            FILE="$CACHE_DIR/${CATEGORY}_$(printf "%02d" $i).parquet"
        
        # Skip if already cached (size > 100MB)
        if [ -f "$FILE" ] && [ $(stat -c%s "$FILE") -gt 100000000 ]; then
            echo "  ✅ Chunk $i (cached)"
            continue
        fi
        
        URL="https://huggingface.co/datasets/McAuley-Lab/Amazon-Reviews-2023/resolve/main/raw_meta_${CATEGORY}/full-0000${i}-of-00010.parquet"
        
        echo -n "  ⬇️  Chunk $i... "
        if curl -L -f -o "$FILE" --speed-time 60 --speed-limit 1 "$URL" 2>/dev/null; then
            SIZE=$(stat -c%s "$FILE" | awk '{print $1/1024/1024 " MB"}')
            echo "✅ ($SIZE)"
        else
            echo "❌ Failed"
            rm -f "$FILE"
            continue
        fi
        
        # Import immediately after download
        echo -n "    Importing... "
        OUTPUT=$(python3 scripts/import_amazon_products.py "$FILE" 2>&1)
        if echo "$OUTPUT" | grep -q "Imported"; then
            COUNT=$(echo "$OUTPUT" | grep "Imported" | awk '{print $2}')
            TOTAL_IMPORTED=$((TOTAL_IMPORTED + COUNT))
            echo "✅ $COUNT products (total: $TOTAL_IMPORTED)"
        else
            echo "⚠️ Error"
        fi
    done
    
    echo ""
done

echo "✨ Total imported: $TOTAL_IMPORTED products"
