#!/usr/bin/env python3
"""
Script de réinjection de 5000 produits avec images réalistes
"""

import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime
import random
import uuid

DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "dbname": "sellsight_db",
    "user": "sellsight",
    "password": "sellsight",
}

CATEGORIES = {
    "All_Beauty": [
        "https://images.unsplash.com/photo-1596462502278-af3c4e7db999?w=500",
        "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500",
        "https://images.unsplash.com/photo-1571875285973-91c29c3f3d67?w=500",
        "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500",
    ],
    "Software": [
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500",
        "https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=500",
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
        "https://images.unsplash.com/photo-1516321318423-f06f70504c0a?w=500",
    ],
    "Appliances": [
        "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500",
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500",
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
        "https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=500",
    ],
    "Magazine_Subscriptions": [
        "https://images.unsplash.com/photo-1507842217343-583f20270319?w=500",
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500",
        "https://images.unsplash.com/photo-1507842217343-583f20270319?w=500",
        "https://images.unsplash.com/photo-1543002588-d83cea6d0b75?w=500",
    ],
}

ITEMS_PER_CATEGORY = 1250


class DataReinjector:
    def __init__(self, db_config):
        self.db_config = db_config
        self.conn = None
        self.cursor = None
        self.sellers = []
        
    def connect(self):
        self.conn = psycopg2.connect(**self.db_config)
        self.cursor = self.conn.cursor()
        print("✅ Connexion PostgreSQL")
    
    def close(self):
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()
    
    def get_sellers(self):
        self.cursor.execute("SELECT id FROM users WHERE role = 'SELLER' LIMIT 20")
        self.sellers = [row[0] for row in self.cursor.fetchall()]
        print(f"✅ {len(self.sellers)} sellers trouvés")
    
    def delete_last_injection(self):
        """Supprimer les produits des 4 catégories (derniers 5000)"""
        self.cursor.execute("""
            DELETE FROM products 
            WHERE category IN ('All_Beauty', 'Software', 'Appliances', 'Magazine_Subscriptions')
            AND created_at > NOW() - INTERVAL '1 hour'
        """)
        deleted = self.cursor.rowcount
        self.conn.commit()
        print(f"🗑️  {deleted} produits supprimés")
    
    def reinject(self):
        print("\n" + "="*60)
        print("🚀 RÉINJECTION 5000 PRODUITS AVEC IMAGES")
        print("="*60)
        
        self.connect()
        self.get_sellers()
        self.delete_last_injection()
        
        total = 0
        
        for cat_idx, category in enumerate(CATEGORIES.keys(), 1):
            print(f"\n📦 [{cat_idx}/4] {category}")
            
            products = []
            inventory = []
            images = CATEGORIES[category]
            
            for i in range(ITEMS_PER_CATEGORY):
                pid = f"{category[:4]}-{uuid.uuid4().hex[:8]}"
                name = f"{category} Product #{i+1:04d}"
                desc = f"Premium quality {category.lower()} product with excellent features and guaranteed durability"
                price = round(random.uniform(9.99, 299.99), 2)
                seller_id = random.choice(self.sellers)
                image_url = random.choice(images)
                
                products.append((
                    pid, name, desc, price, category, 
                    seller_id, image_url, True, datetime.now(), datetime.now()
                ))
                
                inventory.append((pid, random.randint(50, 500), 20))
                
                if (i + 1) % 250 == 0:
                    print(f"   ⏳ {i + 1}/{ITEMS_PER_CATEGORY}", end='\r')
            
            try:
                q1 = """INSERT INTO products 
                        (id, name, description, price, category, seller_id, 
                         image_url, active, created_at, updated_at)
                        VALUES %s ON CONFLICT (id) DO NOTHING"""
                execute_values(self.cursor, q1, products, page_size=1000)
                
                q2 = """INSERT INTO inventory 
                        (product_id, quantity, reorder_threshold)
                        VALUES %s ON CONFLICT (product_id) DO UPDATE 
                        SET quantity = EXCLUDED.quantity"""
                execute_values(self.cursor, q2, inventory, page_size=1000)
                
                self.conn.commit()
                print(f"   ✅ {len(products)} produits avec images")
                total += len(products)
            except Exception as e:
                print(f"   ❌ Erreur: {e}")
                self.conn.rollback()
        
        self.close()
        
        print("\n" + "="*60)
        print(f"✅ RÉINJECTION TERMINÉE: {total} produits")
        print("="*60)


if __name__ == "__main__":
    DataReinjector(DB_CONFIG).reinject()
