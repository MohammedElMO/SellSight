#!/usr/bin/env python3
"""
Script d'injection de 5000 produits synthétiques (1250 par catégorie)
"""

import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime
import random
import uuid

# Configuration DB
DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "dbname": "sellsight_db",
    "user": "sellsight",
    "password": "sellsight",
}

CATEGORIES = [
    "All_Beauty",
    "Software",
    "Appliances",
    "Magazine_Subscriptions"
]

ITEMS_PER_CATEGORY = 1250
MIN_INVENTORY = 50
MAX_INVENTORY = 500


class DataInjector:
    def __init__(self, db_config):
        self.db_config = db_config
        self.conn = None
        self.cursor = None
        self.sellers = []
        
    def connect(self):
        try:
            self.conn = psycopg2.connect(**self.db_config)
            self.cursor = self.conn.cursor()
            print("✅ Connexion PostgreSQL")
        except Exception as e:
            print(f"❌ Erreur: {e}")
            exit(1)
    
    def close(self):
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()
    
    def get_sellers(self):
        try:
            self.cursor.execute("SELECT id FROM users WHERE role = 'SELLER' LIMIT 20")
            self.sellers = [row[0] for row in self.cursor.fetchall()]
            print(f"✅ {len(self.sellers)} sellers trouvés")
        except Exception as e:
            print(f"❌ Erreur: {e}")
            exit(1)
    
    def inject(self):
        print("\n" + "="*60)
        print("🚀 INJECTION 5000 PRODUITS (1250 par catégorie)")
        print("="*60)
        
        self.connect()
        self.get_sellers()
        
        total = 0
        
        for cat_idx, category in enumerate(CATEGORIES, 1):
            print(f"\n📦 [{cat_idx}/4] {category}")
            
            products = []
            inventory = []
            
            for i in range(ITEMS_PER_CATEGORY):
                pid = f"{category[:4]}-{uuid.uuid4().hex[:8]}"
                name = f"{category} Product #{i+1:04d}"
                desc = f"High quality {category.lower()} product with excellent features and durability"
                price = round(random.uniform(9.99, 299.99), 2)
                seller_id = random.choice(self.sellers)
                
                products.append((
                    pid, name, desc, price, category, 
                    seller_id, None, True, datetime.now(), datetime.now()
                ))
                
                inventory.append((pid, random.randint(MIN_INVENTORY, MAX_INVENTORY), 20))
                
                if (i + 1) % 250 == 0:
                    print(f"   ⏳ {i + 1}/{ITEMS_PER_CATEGORY}", end='\r')
            
            # Insert
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
                print(f"   ✅ {len(products)} produits")
                total += len(products)
            except Exception as e:
                print(f"   ❌ Erreur: {e}")
                self.conn.rollback()
        
        self.close()
        
        print("\n" + "="*60)
        print(f"✅ INJECTION TERMINÉE: {total} produits")
        print("="*60)


if __name__ == "__main__":
    DataInjector(DB_CONFIG).inject()
