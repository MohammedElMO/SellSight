#!/usr/bin/env python3
"""MapReduce Mapper: Extract category and event data.

Input: category\tproduct_id\tevent_type\trating
Output: category\tproduct_id|event_type|rating
"""
import sys

for line in sys.stdin:
    line = line.strip()
    if not line or line.startswith('#'):
        continue
    
    try:
        parts = line.split('\t')
        if len(parts) < 3:
            continue
        
        category = parts[0].strip()
        product_id = parts[1].strip()
        event_type = parts[2].strip()
        rating = parts[3].strip() if len(parts) > 3 else '0'
        
        # Validate product_id
        int(product_id)
        
        print(f"{category}\t{product_id}|{event_type}|{rating}")
    
    except (ValueError, IndexError):
        pass
