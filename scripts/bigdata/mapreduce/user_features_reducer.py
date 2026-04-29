#!/usr/bin/env python3
"""MapReduce Reducer: Aggregate user engagement metrics.

Input: user_id\tevent_type|product_id|rating
Output: user_id\tproducts_viewed\tproducts_carted\tproducts_purchased\tavg_rating_given\tpreferred_category
"""
import sys
from collections import defaultdict

current_user = None
event_counts = defaultdict(int)
products_viewed = set()
products_carted = set()
products_purchased = set()
ratings = []
category_freq = defaultdict(int)

for line in sys.stdin:
    line = line.strip()
    if not line or line.startswith('#'):
        continue
    
    try:
        parts = line.split('\t')
        if len(parts) != 2:
            continue
        
        user_id = parts[0].strip()
        event_data = parts[1].strip()
        event_parts = event_data.split('|')
        
        event_type = event_parts[0]
        product_id = event_parts[1] if len(event_parts) > 1 else '0'
        rating = event_parts[2] if len(event_parts) > 2 else '0'
        
        # Switch user
        if current_user is None:
            current_user = user_id
        
        if user_id != current_user:
            # Emit for previous user
            products_viewed_count = len(products_viewed)
            products_carted_count = len(products_carted)
            products_purchased_count = len(products_purchased)
            avg_rating = sum(ratings) / len(ratings) if ratings else 0.0
            preferred_cat = max(category_freq.items(), key=lambda x: x[1])[0] if category_freq else 'unknown'
            
            print(f"{current_user}\t{products_viewed_count}\t{products_carted_count}\t{products_purchased_count}\t{avg_rating:.2f}\t{preferred_cat}")
            
            # Reset
            event_counts = defaultdict(int)
            products_viewed = set()
            products_carted = set()
            products_purchased = set()
            ratings = []
            category_freq = defaultdict(int)
            current_user = user_id
        
        # Track events
        event_counts[event_type] += 1
        
        if event_type == 'view':
            products_viewed.add(product_id)
        elif event_type == 'add_to_cart':
            products_carted.add(product_id)
        elif event_type == 'purchase':
            products_purchased.add(product_id)
        
        try:
            rating_val = float(rating)
            if 0 <= rating_val <= 5:
                ratings.append(rating_val)
        except ValueError:
            pass
    
    except (ValueError, IndexError):
        continue

# Flush last user
if current_user:
    products_viewed_count = len(products_viewed)
    products_carted_count = len(products_carted)
    products_purchased_count = len(products_purchased)
    avg_rating = sum(ratings) / len(ratings) if ratings else 0.0
    preferred_cat = max(category_freq.items(), key=lambda x: x[1])[0] if category_freq else 'unknown'
    print(f"{current_user}\t{products_viewed_count}\t{products_carted_count}\t{products_purchased_count}\t{avg_rating:.2f}\t{preferred_cat}")
