#!/usr/bin/env python3
"""
Import Amazon product metadata from HF Parquet files to PostgreSQL.
Downloads parquet files from HF and imports them with proper field mapping.

Usage:
  python3 scripts/import_from_hf.py --categories Electronics,All_Beauty --limit 2000
  python3 scripts/import_from_hf.py --all --limit 5000
  python3 scripts/import_from_hf.py --categories Electronics  # No limit, all files
"""

import argparse
import os
import sys
from pathlib import Path
from typing import Optional, Generator, Dict, Any
import psycopg2

try:
    import pyarrow.parquet as pq
    from huggingface_hub import hf_hub_download
except Exception as e:
    print(f'❌ Missing dependencies: {e}')
    print('Run: pip install pyarrow huggingface_hub')
    sys.exit(1)


# PostgreSQL Configuration
DB_CONFIG = {
    'host': os.getenv('PGHOST', 'localhost'),
    'port': int(os.getenv('PGPORT', '5432')),
    'database': os.getenv('PGDATABASE', 'sellsight_db'),
    'user': os.getenv('PGUSER', 'sellsight'),
    'password': os.getenv('PGPASSWORD', 'sellsight'),
}

IMPORT_SELLER_ID = os.getenv('IMPORT_SELLER_ID', 'd811ad74-bafa-4919-81f1-7003c8737604')

ALL_CATEGORIES = [
    'All_Beauty',
    'Arts_Crafts_and_Sewing',
    'Cell_Phones_and_Accessories',
    'Electronics',
    'Gift_Cards',
    'Handmade_Products',
    'Industrial_and_Scientific',
    'Musical_Instruments',
    'Toys_and_Games'
]

HF_REPO = 'McAuley-Lab/Amazon-Reviews-2023'
NUM_CHUNKS = 10


def extract_image_url(images: Optional[list]) -> Optional[str]:
    """Extract best quality image URL from images array."""
    if not images or len(images) == 0:
        return None
    
    img = images[0]
    if isinstance(img, dict):
        return img.get('hi_res') or img.get('variant') or img.get('large')
    return str(img) if img else None


def parse_price(price_val: Any) -> Optional[float]:
    """Parse price from various formats."""
    if price_val is None:
        return None
    
    if isinstance(price_val, (int, float)):
        return float(price_val)
    
    if isinstance(price_val, dict):
        return None
    
    price_str = str(price_val).replace('$', '').strip()
    import re
    match = re.search(r'[\d.]+', price_str)
    return float(match.group(0)) if match else None


def stream_parquet_records(parquet_path: str, category: str, limit: int = None) -> Generator[Dict[str, Any], None, None]:
    """Stream records from a parquet file with field extraction."""
    try:
        parquet_file = pq.ParquetFile(parquet_path)
        count = 0
        
        for batch in parquet_file.iter_batches(batch_size=500):
            for record in batch.to_pylist():
                if limit and count >= limit:
                    return
                
                product_id = record.get('asin') or record.get('parent_asin') or str(count)
                name = record.get('title') or record.get('main_category') or 'Unknown'
                description = record.get('description')
                
                if isinstance(description, dict):
                    description = str(description)
                elif isinstance(description, list):
                    description = ' '.join(str(d) for d in description if d)
                
                price = parse_price(record.get('price'))
                image_url = extract_image_url(record.get('images'))
                
                brand = record.get('brand')
                if isinstance(brand, dict):
                    brand = str(brand)
                
                rating_avg = float(record.get('average_rating') or 0)
                rating_count = int(record.get('rating_number') or 0)
                
                yield {
                    'id': str(product_id)[:200],
                    'name': str(name)[:500],
                    'description': description[:2000] if description else None,
                    'price': price or 0.0,
                    'category': category,
                    'seller_id': IMPORT_SELLER_ID,
                    'image_url': image_url[:500] if image_url else None,
                    'brand': (brand[:200] if isinstance(brand, str) else None) if brand else None,
                    'rating_avg': rating_avg,
                    'rating_count': rating_count,
                }
                
                count += 1
    
    except Exception as e:
        print(f'  ⚠️  Error reading parquet: {str(e)[:100]}')


def download_parquet_files(category: str, cache_dir: str = '/tmp/hf_amazon_cache') -> list:
    """Download parquet files for a category from HF Hub."""
    os.makedirs(cache_dir, exist_ok=True)
    downloaded = []
    
    for chunk_idx in range(NUM_CHUNKS):
        filename = f'full-{chunk_idx:05d}-of-{NUM_CHUNKS:05d}.parquet'
        
        try:
            print(f'  ⬇️  Downloading {category}_{chunk_idx}...', end=' ', flush=True)
            
            path = hf_hub_download(
                repo_id=HF_REPO,
                filename=f'raw_meta_{category}/{filename}',
                repo_type='dataset',
                cache_dir=cache_dir
            )
            
            print(f'✅ ({Path(path).stat().st_size / 1024 / 1024:.1f} MB)')
            downloaded.append(path)
            
        except Exception as e:
            error_msg = str(e)
            if '404' in error_msg or 'not found' in error_msg.lower():
                print(f'❌ Not found')
            else:
                print(f'❌ {str(e)[:40]}')
    
    return downloaded


def insert_batch(conn, products: list) -> int:
    """Batch insert products using upsert logic."""
    if not products:
        return 0
    
    try:
        cur = conn.cursor()
        
        query = """
            INSERT INTO products 
            (id, name, description, price, category, seller_id, image_url, 
             brand, rating_avg, rating_count, active, created_at, updated_at)
            VALUES %s
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                price = EXCLUDED.price,
                image_url = EXCLUDED.image_url,
                rating_avg = EXCLUDED.rating_avg,
                active = true,
                updated_at = NOW()
            RETURNING id
        """
        
        values = [
            (
                p['id'],
                p['name'],
                p['description'],
                p['price'],
                p['category'],
                p['seller_id'],
                p['image_url'],
                p['brand'],
                p['rating_avg'],
                p['rating_count'],
                True,
                'NOW()',
                'NOW()',
            )
            for p in products
        ]
        
        cur.execute(query, (values,))
        result = cur.fetchall()
        conn.commit()
        cur.close()
        
        return len(result)
        
    except Exception as e:
        print(f'    ❌ Insert failed: {e}')
        conn.rollback()
        return 0


def ingest_from_hf(categories: list, limit: int = None, cache_dir: str = '/tmp/hf_amazon_cache'):
    """Main ingestion function."""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        print('✅ Connected to PostgreSQL\n')
    except Exception as e:
        print(f'❌ Connection failed: {e}')
        return
    
    total_imported = 0
    batch_size = 200
    
    for category in categories:
        print(f'🚀 Importing {category}...')
        
        parquet_files = download_parquet_files(category, cache_dir)
        
        if not parquet_files:
            print(f'  ⚠️  No parquet files available for {category}\n')
            continue
        
        print(f'  📦 Processing {len(parquet_files)} files...\n')
        
        for file_path in parquet_files:
            batch = []
            
            for product in stream_parquet_records(file_path, category, limit=limit):
                batch.append(product)
                
                if len(batch) >= batch_size:
                    inserted = insert_batch(conn, batch)
                    total_imported += inserted
                    print(f'    📝 {Path(file_path).name}: {len(batch)} rows, {inserted} inserted (total: {total_imported})')
                    batch = []
            
            if batch:
                inserted = insert_batch(conn, batch)
                total_imported += inserted
                print(f'    📝 {Path(file_path).name}: {len(batch)} rows, {inserted} inserted (total: {total_imported})')
        
        print()
    
    conn.close()
    print(f'\n✨ Import complete: {total_imported} products total')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Import Amazon metadata from HF Parquet to PostgreSQL')
    parser.add_argument('--categories', type=str, help='Comma-separated categories (e.g., Electronics,All_Beauty)')
    parser.add_argument('--all', action='store_true', help='Import all available categories')
    parser.add_argument('--limit', type=int, help='Limit products per category (per file)')
    parser.add_argument('--cache', type=str, default='/tmp/hf_amazon_cache', help='Cache directory for downloads')
    
    args = parser.parse_args()
    
    if args.all:
        categories = ALL_CATEGORIES
    elif args.categories:
        categories = [c.strip() for c in args.categories.split(',')]
    else:
        categories = ['Electronics']
    
    print(f'📊 Importing from {len(categories)} categories: {", ".join(categories)}')
    print(f'💾 Target: {DB_CONFIG["database"]} @ {DB_CONFIG["host"]}:{DB_CONFIG["port"]}')
    print(f'👤 Seller ID: {IMPORT_SELLER_ID}')
    print(f'📥 Cache: {args.cache}\n')
    
    ingest_from_hf(categories, args.limit, args.cache)
