import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from store.models import Category, Product, Inventory

def add_caps():
    print("Adding 20 new caps to the store...")
    
    # Get categories
    try:
        cat_baseball = Category.objects.get(slug='baseball')
    except Category.DoesNotExist:
        cat_baseball = Category.objects.create(name='Baseball', slug='baseball')

    try:
        cat_premium = Category.objects.get(slug='premium')
    except Category.DoesNotExist:
        cat_premium = Category.objects.create(name='Premium', slug='premium')

    # 1. 10 New Era Baseball Caps
    new_era_caps = [
        {
            "name": "New Era NY Yankees Classic 9FORTY",
            "sku": "UG-NE-01",
            "slug": "new-era-ny-yankees-classic-9forty",
            "category": cat_baseball,
            "description": "Gorra de béisbol clásica New Era de los New York Yankees. Visera curva, ajuste regulable con hebilla metálica y logotipo clásico bordado en hilo dorado premium de alta densidad.",
            "price": 135000.00,
            "discount_price": 119000.00,
            "is_active": True,
            "is_featured": True,
            "is_weekly_recommendation": False,
            "stock": 25
        },
        {
            "name": "New Era LA Dodgers Curve 9FORTY",
            "sku": "UG-NE-02",
            "slug": "new-era-la-dodgers-curve-9forty",
            "category": cat_baseball,
            "description": "Gorra curve clásica de Los Ángeles Dodgers de New Era. Fabricada con sarga de algodón peinado de alta duración y un elegante logotipo bordado a tono.",
            "price": 135000.00,
            "discount_price": None,
            "is_active": True,
            "is_featured": False,
            "is_weekly_recommendation": False,
            "stock": 20
        },
        {
            "name": "New Era Chicago Bulls MVP Curve",
            "sku": "UG-NE-03",
            "slug": "new-era-chicago-bulls-mvp-curve",
            "category": cat_baseball,
            "description": "Edición especial New Era de los Chicago Bulls. Silueta estructurada con visera curva de color rojo y logotipo de los Bulls bordado en relieve frontal.",
            "price": 140000.00,
            "discount_price": 125000.00,
            "is_active": True,
            "is_featured": True,
            "is_weekly_recommendation": False,
            "stock": 15
        },
        {
            "name": "New Era Boston Red Sox Retro 9FORTY",
            "sku": "UG-NE-04",
            "slug": "new-era-boston-red-sox-retro-9forty",
            "category": cat_baseball,
            "description": "Gorra béisbol Boston Red Sox de New Era. Toque retro con visera curva azul marino y bordado rojo clásico.",
            "price": 135000.00,
            "discount_price": None,
            "is_active": True,
            "is_featured": False,
            "is_weekly_recommendation": False,
            "stock": 18
        },
        {
            "name": "New Era SF Giants Pitcher Curve",
            "sku": "UG-NE-05",
            "slug": "new-era-sf-giants-pitcher-curve",
            "category": cat_baseball,
            "description": "Gorra estructurada San Francisco Giants. Corona de perfil medio, visera curva y logotipo bordado naranja de alto relieve.",
            "price": 138000.00,
            "discount_price": None,
            "is_active": True,
            "is_featured": False,
            "is_weekly_recommendation": False,
            "stock": 12
        },
        {
            "name": "New Era Detroit Tigers Classic 9FORTY",
            "sku": "UG-NE-06",
            "slug": "new-era-detroit-tigers-classic-9forty",
            "category": cat_baseball,
            "description": "Gorra clásica curve Detroit Tigers. Color azul profundo con la 'D' retro bordada en hilo blanco de alta costura.",
            "price": 135000.00,
            "discount_price": 115000.00,
            "is_active": True,
            "is_featured": False,
            "is_weekly_recommendation": False,
            "stock": 30
        },
        {
            "name": "New Era Oakland Athletics Retro",
            "sku": "UG-NE-07",
            "slug": "new-era-oakland-athletics-retro",
            "category": cat_baseball,
            "description": "Gorra oficial de los Athletics en verde clásico y logotipo bordado amarillo oro. Visera precurvada y corona ajustable.",
            "price": 135000.00,
            "discount_price": None,
            "is_active": True,
            "is_featured": False,
            "is_weekly_recommendation": False,
            "stock": 14
        },
        {
            "name": "New Era Miami Marlins Curved Edition",
            "sku": "UG-NE-08",
            "slug": "new-era-miami-marlins-curved-edition",
            "category": cat_baseball,
            "description": "Edición especial New Era Miami Marlins. Color negro con bordado azul neón y detalles en plata reflectante.",
            "price": 142000.00,
            "discount_price": 129000.00,
            "is_active": True,
            "is_featured": True,
            "is_weekly_recommendation": False,
            "stock": 8
        },
        {
            "name": "New Era Atlanta Braves Black Gold",
            "sku": "UG-NE-09",
            "slug": "new-era-atlanta-braves-black-gold",
            "category": cat_baseball,
            "description": "Gorra Atlanta Braves con corona de sarga negra y logotipo bordado en hilo dorado premium.",
            "price": 138000.00,
            "discount_price": None,
            "is_active": True,
            "is_featured": False,
            "is_weekly_recommendation": False,
            "stock": 10
        },
        {
            "name": "New Era NY Mets Curved Classic",
            "sku": "UG-NE-10",
            "slug": "new-era-ny-mets-curved-classic",
            "category": cat_baseball,
            "description": "Gorra curve New York Mets. Azul clásico con costuras y logotipo bordado en naranja de alto contraste.",
            "price": 135000.00,
            "discount_price": None,
            "is_active": True,
            "is_featured": False,
            "is_weekly_recommendation": False,
            "stock": 22
        }
    ]

    # 2. 10 Multi-marca Premium Caps
    multimarcas_caps = [
        {
            "name": "Goorin Bros The Panther Classic",
            "sku": "UG-PM-01",
            "slug": "goorin-bros-the-panther-classic",
            "category": cat_premium,
            "description": "Gorra Goorin Bros Premium de la colección Animal Farm con parche bordado de pantera negra. Detalles premium de costura y ajuste trucker clásico.",
            "price": 160000.00,
            "discount_price": 145000.00,
            "is_active": True,
            "is_featured": True,
            "is_weekly_recommendation": False,
            "stock": 12
        },
        {
            "name": "Goorin Bros The King Lion",
            "sku": "UG-PM-02",
            "slug": "goorin-bros-the-king-lion",
            "category": cat_premium,
            "description": "Gorra premium Goorin Bros de la serie de animales con parche frontal de león bordado y malla transpirable de alta calidad.",
            "price": 160000.00,
            "discount_price": None,
            "is_active": True,
            "is_featured": True,
            "is_weekly_recommendation": False,
            "stock": 14
        },
        {
            "name": "Capslab Dragon Ball Z Goku Premium",
            "sku": "UG-PM-03",
            "slug": "capslab-dragon-ball-z-goku-premium",
            "category": cat_premium,
            "description": "Gorra de colección Capslab oficial DBZ. Parche bordado de Goku súper saiyajin con costuras naranjas y tejido transpirable premium.",
            "price": 155000.00,
            "discount_price": 139000.00,
            "is_active": True,
            "is_featured": False,
            "is_weekly_recommendation": False,
            "stock": 20
        },
        {
            "name": "Capslab Marvel Spider-Man Edition",
            "sku": "UG-PM-04",
            "slug": "capslab-marvel-spider-man-edition",
            "category": cat_premium,
            "description": "Gorra oficial Capslab con parche bordado de Spider-Man. Malla trasera negra y costuras de alta definición rojas.",
            "price": 155000.00,
            "discount_price": None,
            "is_active": True,
            "is_featured": False,
            "is_weekly_recommendation": False,
            "stock": 16
        },
        {
            "name": "Mitchell & Ness Chicago Bulls Retro",
            "sku": "UG-PM-05",
            "slug": "mitchell-ness-chicago-bulls-retro",
            "category": cat_premium,
            "description": "Gorra Mitchell & Ness clásica de los Chicago Bulls. Silueta snapback estructurada de sarga de lana roja con letras bordadas en relieve.",
            "price": 175000.00,
            "discount_price": 159000.00,
            "is_active": True,
            "is_featured": True,
            "is_weekly_recommendation": False,
            "stock": 9
        },
        {
            "name": "Mitchell & Ness LA Lakers Premium Gold",
            "sku": "UG-PM-06",
            "slug": "mitchell-ness-la-lakers-premium-gold",
            "category": cat_premium,
            "description": "Gorra snapback premium Los Ángeles Lakers con visera de cuero sintético negro y corona bordada en color morado y dorado.",
            "price": 180000.00,
            "discount_price": None,
            "is_active": True,
            "is_featured": False,
            "is_weekly_recommendation": False,
            "stock": 6
        },
        {
            "name": "Von Dutch Classic Premium Black",
            "sku": "UG-PM-07",
            "slug": "von-dutch-classic-premium-black",
            "category": cat_premium,
            "description": "Gorra trucker de lujo Von Dutch con panel frontal bordado en terciopelo y malla trasera de alta resistencia.",
            "price": 165000.00,
            "discount_price": 149000.00,
            "is_active": True,
            "is_featured": False,
            "is_weekly_recommendation": False,
            "stock": 15
        },
        {
            "name": "Von Dutch Gold Patch Premium",
            "sku": "UG-PM-08",
            "slug": "von-dutch-gold-patch-premium",
            "category": cat_premium,
            "description": "Gorra trucker premium Von Dutch con el logotipo ovalado clásico bordado en hilo dorado brillante.",
            "price": 170000.00,
            "discount_price": None,
            "is_active": True,
            "is_featured": False,
            "is_weekly_recommendation": False,
            "stock": 10
        },
        {
            "name": "Goorin Bros Cock Premium Farm",
            "sku": "UG-PM-09",
            "slug": "goorin-bros-cock-premium-farm",
            "category": cat_premium,
            "description": "Gorra trucker de animales Goorin Bros con parche bordado de gallo. Acabados premium, correa ajustable trasera.",
            "price": 160000.00,
            "discount_price": None,
            "is_active": True,
            "is_featured": False,
            "is_weekly_recommendation": False,
            "stock": 12
        },
        {
            "name": "Mitchell & Ness Raiders Stealth Black",
            "sku": "UG-PM-10",
            "slug": "mitchell-ness-raiders-stealth-black",
            "category": cat_premium,
            "description": "Gorra snapback Mitchell & Ness de los Oakland Raiders en negro mate y logotipo bordado en relieve gris plata.",
            "price": 175000.00,
            "discount_price": 159000.00,
            "is_active": True,
            "is_featured": True,
            "is_weekly_recommendation": False,
            "stock": 8
        }
    ]

    all_caps = new_era_caps + multimarcas_caps

    for cap_data in all_caps:
        stock = cap_data.pop("stock")
        prod, created = Product.objects.get_or_create(
            sku=cap_data["sku"],
            defaults=cap_data
        )
        if not created:
            prod.name = cap_data["name"]
            prod.slug = cap_data["slug"]
            prod.category = cap_data["category"]
            prod.description = cap_data["description"]
            prod.price = cap_data["price"]
            prod.discount_price = cap_data["discount_price"]
            prod.is_active = cap_data["is_active"]
            prod.is_featured = cap_data["is_featured"]
            prod.is_weekly_recommendation = cap_data["is_weekly_recommendation"]
            prod.save()

        # Update Inventory
        inventory, _ = Inventory.objects.get_or_create(product=prod)
        inventory.stock_actual = stock
        inventory.save()
        
    print(f"Success: Added {len(all_caps)} new premium products into database!")

if __name__ == "__main__":
    add_caps()
