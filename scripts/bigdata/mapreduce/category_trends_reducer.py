#!/usr/bin/env python3
"""MapReduce Reducer: Aggregate category-level KPIs.

Input: category\tproduct_id|event_type|rating
Output: category\ttotal_views\ttotal_carts\ttop_products\tavg_rating\ttrend_score
"""
import sys
from collections import defaultdict

current_category = None
product_events = defaultdict(lambda: defaultdict(int))
product_ratings = defaultdict(list)
all_ratings = []

for line in sys.stdin:
    line = line.strip()
    if not line or line.startswith('#'):
        continue
    
    try:
        parts = line.split('\t')
        if len(parts) != 2:
            continue
        
        category = parts[0].strip()
        event_data = parts[1].strip()
        event_parts = event_data.split('|')
        
        product_id = event_parts[0]
        event_type = event_parts[1] if len(event_parts) > 1 else 'unknown'
        rating = event_parts[2] if len(event_parts) > 2 else '0'
        
        # Switch category
        if current_category is None:
            current_category = category
        
        if category != current_category:
            # Emit for previous category
            total_views = sum(c.get('view', 0) for c in product_events.values())
            total_carts = sum(c.get('add_to_cart', 0) for c in product_events.values())
            
            # Top 3 products by views
            top_products = sorted(
                ((pid, events.get('view', 0)) for pid, events in product_events.items()),
                key=lambda x: x[1],
                reverse=True
            )[:3]
            top_pids = ','.join([f"{pid}({views})" for pid, views in top_products])
            
            avg_rating = sum(all_ratings) / len(all_ratings) if all_ratings else 0.0
            trend_score = (total_views * 0.3 + total_carts * 0.7) / max(1, len(product_events))
            
            print(f"{current_category}\t{total_views}\t{total_carts}\t{top_pids}\t{avg_rating:.2f}\t{trend_score:.2f}")
            
            # Reset
            product_events = defaultdict(lambda: defaultdict(int))
            product_ratings = defaultdict(list)
            all_ratings = []
            current_category = category
        
        # Accumulate
        product_events[product_id][event_type] += 1
        try:
            rating_val = float(rating)
            if 0 <= rating_val <= 5:
                product_ratings[product_id].append(rating_val)
                all_ratings.append(rating_val)
        except ValueError:
            pass
    
    except (ValueError, IndexError):
        continue

# Flush last category
if current_category:
    total_views = sum(c.get('view', 0) for c in product_events.values())
    total_carts = sum(c.get('add_to_cart', 0) for c in product_events.values())
    top_products = sorted(
        ((pid, events.get('view', 0)) for pid, events in product_events.items()),
        key=lambda x: x[1],
        reverse=True
    )[:3]
    top_pids = ','.join([f"{pid}({views})" for pid, views in top_products])
    avg_rating = sum(all_ratings) / len(all_ratings) if all_ratings else 0.0
    trend_score = (total_views * 0.3 + total_carts * 0.7) / max(1, len(product_events))
    print(f"{current_category}\t{total_views}\t{total_carts}\t{top_pids}\t{avg_rating:.2f}\t{trend_score:.2f}")
