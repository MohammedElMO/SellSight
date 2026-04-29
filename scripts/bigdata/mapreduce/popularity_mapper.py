#!/usr/bin/env python3
"""MapReduce Mapper: Extract product_id and event data.

Input format: product_id\tevent_type\trating (TSV)
Output: product_id\tevent_type,rating (for sorting by product_id in reducer)
"""
import sys
import json

for line in sys.stdin:
    line = line.strip()
    if not line or line.startswith('#'):
        continue
    
    try:
        parts = line.split('\t')
        if len(parts) < 2:
            continue
        
        product_id = parts[0].strip()
        event_type = parts[1].strip()
        rating = parts[2].strip() if len(parts) > 2 else '0'
        
        # Validate product_id is numeric
        int(product_id)
        
        # Output: product_id as key, event_data as value (intermediate)
        print(f"{product_id}\t{event_type}|{rating}")
    
    except (ValueError, IndexError):
        # Skip malformed lines
        pass
