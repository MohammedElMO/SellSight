#!/usr/bin/env python3
"""MapReduce Reducer: Aggregate product events and compute popularity score.

Input: product_id\tevent_type|rating (from mapper)
Output: product_id\tviews\tadd_to_cart\tavg_rating\tpopularity_score

Formula: score = views*0.2 + add_to_cart*0.5 + avg_rating*0.3 (out of 100)
"""
import sys
from collections import defaultdict

current_product = None
event_counts = defaultdict(int)
ratings = []

for line in sys.stdin:
    line = line.strip()
    if not line or line.startswith('#'):
        continue
    
    try:
        parts = line.split('\t')
        if len(parts) != 2:
            continue
        
        product_id = parts[0].strip()
        event_data = parts[1].strip()
        event_type, rating_str = event_data.split('|')
        
        # Switch product
        if current_product is None:
            current_product = product_id
        
        if product_id != current_product:
            # Emit aggregated metrics for previous product
            views = event_counts.get('view', 0)
            adds = event_counts.get('add_to_cart', 0)
            purchases = event_counts.get('purchase', 0)
            avg_rating = sum(ratings) / len(ratings) if ratings else 0.0
            
            # Weighted popularity score
            popularity_score = (views * 0.2) + (adds * 0.5) + (avg_rating * 0.3)
            popularity_score = min(100, max(0, popularity_score))  # Clamp 0-100
            
            output = f"{current_product}\t{views}\t{adds}\t{purchases}\t{avg_rating:.2f}\t{popularity_score:.2f}"
            print(output)
            
            # Reset for new product
            event_counts = defaultdict(int)
            ratings = []
            current_product = product_id
        
        # Accumulate events
        event_counts[event_type] += 1
        try:
            rating_val = float(rating_str)
            if 0 <= rating_val <= 5:  # Assuming 0-5 scale
                ratings.append(rating_val)
        except ValueError:
            pass
    
    except (ValueError, IndexError):
        continue

# Flush last product
if current_product:
    views = event_counts.get('view', 0)
    adds = event_counts.get('add_to_cart', 0)
    purchases = event_counts.get('purchase', 0)
    avg_rating = sum(ratings) / len(ratings) if ratings else 0.0
    popularity_score = (views * 0.2) + (adds * 0.5) + (avg_rating * 0.3)
    popularity_score = min(100, max(0, popularity_score))
    print(f"{current_product}\t{views}\t{adds}\t{purchases}\t{avg_rating:.2f}\t{popularity_score:.2f}")
