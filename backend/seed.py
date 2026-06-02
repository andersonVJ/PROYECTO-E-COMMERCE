import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from store.models import Category, Product, Inventory, StoreConfig, BlogPost

def seed_db():
    print("Seeding database...")
    
    # 1. Store Config
    config, created = StoreConfig.objects.get_or_create(
        id=1,
        defaults={
            "nequi_number": "3123456789",
            "whatsapp_number": "+573052043217",
            "shipping_cost_medellin": 12000
        }
    )
    if not created:
        config.nequi_number = "3123456789"
        config.whatsapp_number = "+573052043217"
        config.shipping_cost_medellin = 12000
        config.save()
    print("OK: Global Store Configuration created/updated.")

    # 2. Categories
    categories_data = [
        {"name": "Snapback", "slug": "snapback"},
        {"name": "Trucker", "slug": "trucker"},
        {"name": "Baseball", "slug": "baseball"},
        {"name": "Premium", "slug": "premium"},
    ]
    
    cats = {}
    for cat_data in categories_data:
        cat, _ = Category.objects.get_or_create(slug=cat_data["slug"], defaults={"name": cat_data["name"]})
        cats[cat_data["slug"]] = cat
    print("OK: Categories created.")

    # 3. Products
    products_data = [
        {
            "name": "Urban Gold Classic Snapback",
            "sku": "UG-SNAP-01",
            "slug": "urban-gold-classic-snapback",
            "category": cats["snapback"],
            "description": "Gorra Snapback clásica con bordado de alta densidad en color dorado sobre fondo negro premium. Visera plana y cierre ajustable de plástico. Fabricada en algodón premium para máxima comodidad.",
            "price": 120000.00,
            "discount_price": 95000.00,
            "is_active": True,
            "is_featured": True,
            "is_weekly_recommendation": True,
            "stock_actual": 45,
            "stock_min": 10
        },
        {
            "name": "Vanguard Trucker Cap Black",
            "sku": "UG-TRUC-02",
            "slug": "vanguard-trucker-cap-black",
            "category": cats["trucker"],
            "description": "Gorra Trucker con frente de espuma acolchada negra y malla trasera transpirable de alta resistencia. Estampado 3D dorado con diseño futurista de la marca.",
            "price": 85000.00,
            "discount_price": None,
            "is_active": True,
            "is_featured": True,
            "is_weekly_recommendation": False,
            "stock_actual": 8,
            "stock_min": 5
        },
        {
            "name": "Hyperion Baseball Cap Gold",
            "sku": "UG-BASE-03",
            "slug": "hyperion-baseball-cap-gold",
            "category": cats["baseball"],
            "description": "Gorra de béisbol clásica con visera curva de bajo perfil. Tela de sarga lavada premium con hebilla de metal ajustable grabada con el logo de Urban Gold.",
            "price": 95000.00,
            "discount_price": 79000.00,
            "is_active": True,
            "is_featured": False,
            "is_weekly_recommendation": False,
            "stock_actual": 60,
            "stock_min": 15
        },
        {
            "name": "Stealth Premium Edition Leather",
            "sku": "UG-PREM-04",
            "slug": "stealth-premium-edition-leather",
            "category": cats["premium"],
            "description": "Gorra de cuero sintético premium negro mate con detalles de costura dorada hechos a mano. Logo Urban Gold metálico de 18k en la parte frontal izquierda. Exclusividad urbana en su máxima expresión.",
            "price": 180000.00,
            "discount_price": 159000.00,
            "is_active": True,
            "is_featured": True,
            "is_weekly_recommendation": False,
            "stock_actual": 12,
            "stock_min": 3
        },
        {
            "name": "Nova Street Trucker Yellow",
            "sku": "UG-TRUC-05",
            "slug": "nova-street-trucker-yellow",
            "category": cats["trucker"],
            "description": "Gorra Trucker con panel frontal amarillo vibrante y parche tejido clásico de la colección Cyber Streetvibe.",
            "price": 85000.00,
            "discount_price": None,
            "is_active": True,
            "is_featured": False,
            "is_weekly_recommendation": False,
            "stock_actual": 30,
            "stock_min": 5
        }
    ]

    for prod_data in products_data:
        stock = prod_data.pop("stock_actual")
        min_stock = prod_data.pop("stock_min")
        
        prod, created = Product.objects.get_or_create(
            sku=prod_data["sku"], 
            defaults=prod_data
        )
        if not created:
            prod.name = prod_data["name"]
            prod.slug = prod_data["slug"]
            prod.category = prod_data["category"]
            prod.description = prod_data["description"]
            prod.price = prod_data["price"]
            prod.discount_price = prod_data["discount_price"]
            prod.is_active = prod_data["is_active"]
            prod.is_featured = prod_data["is_featured"]
            prod.is_weekly_recommendation = prod_data["is_weekly_recommendation"]
            prod.save()
            
        inventory, _ = Inventory.objects.get_or_create(product=prod)
        inventory.stock_actual = stock
        inventory.stock_min = min_stock
        inventory.save()
    print("OK: Products and Inventory seeded.")

    # 4. Blog Posts
    blogs_data = [
        {
            "title": "La Evolución del Streetwear en Medellín",
            "slug": "la-evolucion-del-streetwear-en-medellin",
            "category": BlogPost.CAT_MODA,
            "content": "El streetwear ha pasado de ser una subcultura a dominar las pasarelas y el estilo cotidiano de la ciudad. Descubre cómo las gorras Snapback y Trucker se convirtieron en el accesorio clave de expresión para los jóvenes paisas y las marcas locales que están empujando los límites del diseño urbano."
        },
        {
            "title": "Cómo cuidar tus gorras de cuero y algodón premium",
            "slug": "como-cuidar-tus-gorras-de-cuero-y-algodon-premium",
            "category": BlogPost.CAT_ESTILO,
            "content": "Una gorra premium merece un cuidado excepcional. En este artículo te enseñamos a limpiar la visera, mantener la forma estructurada de tus gorras snapback, desinfectar la banda de sudor interna y evitar que el color negro profundo pierda su intensidad frente a la luz solar."
        }
    ]

    for blog_data in blogs_data:
        blog, created = BlogPost.objects.get_or_create(slug=blog_data["slug"], defaults=blog_data)
        if not created:
            blog.title = blog_data["title"]
            blog.content = blog_data["content"]
            blog.category = blog_data["category"]
            blog.save()
    print("OK: Blog posts seeded.")
    print("Database seeding completed successfully.")

if __name__ == "__main__":
    seed_db()
