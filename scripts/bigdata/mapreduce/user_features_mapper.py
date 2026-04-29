#!/usr/bin/env python3
"""MapReduce Mapper: Extract user engagement data.

Input: user_id\tevent_type\tproduct_id\trating
Output: user_id\tevent_type|product_id|rating
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
        
        user_id = parts[0].strip()
        event_type = parts[1].strip()
        product_id = parts[2].strip()
        rating = parts[3].strip() if len(parts) > 3 else '0'
        
        # Validate IDs
        int(user_id)
        int(product_id)
        
        print(f"{user_id}\t{event_type}|{product_id}|{rating}")
    
    except (ValueError, IndexError):
        pass
