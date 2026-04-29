#!/usr/bin/env python3
"""
Script d'injection de données réelles Amazon depuis fichiers .jsonl.gz
Charge directement depuis les fichiers téléchargés localement
"""

import psycopg2
from psycopg2.extras import execute_values
import gzip
import json
from datetime import datetime
import random
import logging
import os

# Configuration logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration DB
DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "dbname": "sellsight_db",
    "user": "sellsight",
    "password": "sellsight",
}

# Fichiers de données locaux
DATA_DIRECTORY = "/workspaces/SellSight/data"

CATEGORIES = [
    "All_Beauty",
    "Software",
    "Appliances",
    "Magazine_Subscriptions"
]

ITEMS_PER_CATEGORY = 1250  # 4 * 1250 = 5000 total
MIN_INVENTORY = 50
MAX_INVENTORY = 500
REORDER_THRESHOLD = 20


class AmazonDataInjector:
    def __init__(self, db_config, data_dir):
        self.db_config = db_config
        self.data_dir = data_dir
        self.conn = None
        self.cursor = None
        self.sellers = []
        
    def connect(self):
        """Établit la connexion PostgreSQL"""
        try:
            self.conn = psycopg2.connect(**self.db_config)
            self.cursor = self.conn.cursor()
            logger.info("✅ Connexion à PostgreSQL réussie")
        except Exception as e:
            logger.error(f"❌ Erreur de connexion: {e}")
            exit(1)
    
    def close(self):
        """Ferme la connexion"""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()
        logger.info("Connexion fermée")
    
    def get_existing_sellers(self):
        """Récupère tous les sellers existants"""
        try:
            self.cursor.execute(
                "SELECT id FROM users WHERE role = 'SELLER' LIMIT 20"
            )
            self.sellers = [row[0] for row in self.cursor.fetchall()]
            
            if not self.sellers:
                logger.warning("⚠️  Aucun seller trouvé!")
                exit(1)
            else:
                logger.info(f"✅ {len(self.sellers)} sellers trouvés")
        except Exception as e:
            logger.error(f"❌ Erreur: {e}")
            exit(1)
    
    def load_jsonl_gz(self, filepath):
        """
        Charge un fichier .jsonl.gz
        Retourne un générateur des lignes JSON
        """
        try:
            with gzip.open(filepath, 'rt', encoding='utf-8') as f:
                for line in f:
                    if line.strip():
                        try:
                            yield json.loads(line)
                        except json.JSONDecodeError:
                            continue
        except FileNotFoundError:
            logger.error(f"❌ Fichier non trouvé: {filepath}")
            return iter([])
        except Exception as e:
            logger.error(f"❌ Erreur lecture fichier: {e}")
            return iter([])
    
    def get_file_path(self, category):
        """Construit le chemin du fichier pour une catégorie"""
        filename = f"raw_meta_{category}.jsonl.gz"
        filepath = os.path.join(self.data_dir, filename)
        return filepath
    
    def inject_category(self, category):
        """Injecte les données d'une catégorie depuis un fichier .jsonl.gz"""
        logger.info(f"\n{'='*60}")
        logger.info(f"📦 Chargement: {category}")
        logger.info(f"{'='*60}")
        
        filepath = self.get_file_path(category)
        
        # Vérifier si le fichier existe
        if not os.path.exists(filepath):
            logger.warning(f"⚠️  Fichier non trouvé: {os.path.basename(filepath)}")
            return 0
        
        products_batch = []
        inventory_batch = []
        count = 0
        skipped = 0
        
        try:
            for item in self.load_jsonl_gz(filepath):
                if count >= ITEMS_PER_CATEGORY:
                    break
                
                try:
                    # Extraction des données
                    product_id = item.get('parent_asin')
                    if not product_id:
                        skipped += 1
                        continue
                    
                    title = (item.get('title') or "No Title")[:255]
                    description = str(item.get('description') or "No description")[:1000]
                    
                    # Prix
                    price_raw = item.get('price')
                    if isinstance(price_raw, (int, float)):
                        price = float(price_raw)
                    else:
                        try:
                            price = float(str(price_raw).replace('$', '').replace(',', '')) if price_raw else 19.99
                        except:
                            price = 19.99
                    
                    # Assurer un prix valide
                    if price < 0.01 or price > 999999.99:
                        price = 19.99
                    
                    # Images
                    img_list = item.get('images', {})
                    if isinstance(img_list, dict):
                        img_list = img_list.get('hi_res', [])
                    img_url = img_list[0] if (img_list and len(img_list) > 0) else None
                    
                    # Catégorie
                    main_cat = item.get('main_category') or category
                    
                    # Sélectionner un seller aléatoire
                    seller_id = random.choice(self.sellers)
                    now = datetime.now()
                    
                    # Tuple produit
                    product_tuple = (
                        product_id,
                        title,
                        description,
                        price,
                        main_cat,
                        seller_id,
                        img_url,
                        True,  # active
                        now,
                        now
                    )
                    products_batch.append(product_tuple)
                    
                    # Tuple inventory
                    qty = random.randint(MIN_INVENTORY, MAX_INVENTORY)
                    inventory_tuple = (
                        product_id,
                        qty,
                        REORDER_THRESHOLD
                    )
                    inventory_batch.append(inventory_tuple)
                    
                    count += 1
                    
                    # Afficher progression
                    if count % 100 == 0:
                        print(f"   ⏳ {count}/{ITEMS_PER_CATEGORY}", end='\r')
                    
                except Exception as e:
                    skipped += 1
                    continue
            
            # Insertion dans la base de données
            if products_batch:
                try:
                    products_query = """
                        INSERT INTO products 
                        (id, name, description, price, category, seller_id, image_url, active, created_at, updated_at)
                        VALUES %s
                        ON CONFLICT (id) DO NOTHING
                    """
                    execute_values(self.cursor, products_query, products_batch, page_size=1000)
                    logger.info(f"   ✅ {len(products_batch)} produits insérés")
                except Exception as e:
                    logger.error(f"   ❌ Erreur insertion produits: {e}")
                    self.conn.rollback()
                    return 0
            
            if inventory_batch:
                try:
                    inventory_query = """
                        INSERT INTO inventory 
                        (product_id, quantity, reorder_threshold)
                        VALUES %s
                        ON CONFLICT (product_id) DO UPDATE 
                        SET quantity = EXCLUDED.quantity
                    """
                    execute_values(self.cursor, inventory_query, inventory_batch, page_size=1000)
                    logger.info(f"   ✅ {len(inventory_batch)} inventory insérés")
                except Exception as e:
                    logger.error(f"   ❌ Erreur insertion inventory: {e}")
                    self.conn.rollback()
                    return 0
            
            self.conn.commit()
            logger.info(f"✅ {category}: {count} produits")
            return count
            
        except Exception as e:
            logger.error(f"❌ Erreur: {e}")
            self.conn.rollback()
            return 0
    
    def inject_all(self):
        """Injecte tous les fichiers disponibles"""
        logger.info("\n" + "="*60)
        logger.info("🚀 INJECTION DONNÉES RÉELLES AMAZON (5000 produits)")
        logger.info("="*60)
        
        self.connect()
        self.get_existing_sellers()
        
        total_injected = 0
        
        for category in CATEGORIES:
            count = self.inject_category(category)
            total_injected += count
        
        self.close()
        
        logger.info("\n" + "="*60)
        logger.info("✅ INJECTION TERMINÉE")
        logger.info(f"📊 Total produits injectés: {total_injected}")
        logger.info("="*60)


def main():
    injector = AmazonDataInjector(DB_CONFIG, DATA_DIRECTORY)
    injector.inject_all()


if __name__ == "__main__":
    main()
