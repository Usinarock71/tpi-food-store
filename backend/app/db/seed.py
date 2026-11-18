from sqlmodel import select

from app.core.database import create_all_tables, session_factory
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario


def run_seed() -> None:
    create_all_tables()
    with session_factory() as session:
        # 1. Usuario Admin (admin / Admin1234!)
        admin = session.exec(select(Usuario).where(Usuario.username == "admin")).first()
        if not admin:
            admin = Usuario(
                username="admin",
                full_name="Administrador General",
                email="admin@foodstore.com",
                hashed_password=hash_password("Admin1234!"),
                role="admin",
                disabled=False,
            )
            session.add(admin)
            session.flush()

        # 2. Categorías (al menos 3)
        categorias_data = [
            {
                "nombre": "Hamburguesas",
                "descripcion": "Hamburguesas artesanales a la parrilla con pan brioche",
            },
            {
                "nombre": "Pizzas",
                "descripcion": "Pizzas a la piedra con masa madre y muzzarella seleccionada",
            },
            {
                "nombre": "Bebidas",
                "descripcion": "Gaseosas, aguas saborizadas y cervezas artesanales",
            },
        ]

        categorias_map: dict[str, Categoria] = {}
        for cat_info in categorias_data:
            cat = session.exec(
                select(Categoria).where(Categoria.nombre == cat_info["nombre"])
            ).first()
            if not cat:
                cat = Categoria(
                    nombre=cat_info["nombre"],
                    descripcion=cat_info["descripcion"],
                    activo=True,
                )
                session.add(cat)
                session.flush()
            categorias_map[cat.nombre] = cat

        # 3. Productos (8 productos con stock e imágenes válidas)
        productos_data = [
            {
                "categoria": "Hamburguesas",
                "nombre": "Hamburguesa Clásica",
                "descripcion": "Medallón de 180g, cheddar, lechuga, tomate y salsa especial",
                "precio_base": 8500.0,
                "imagen_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600",
                "stock": 25,
            },
            {
                "categoria": "Hamburguesas",
                "nombre": "Doble Bacon Cheddar",
                "descripcion": "Doble medallón, cuádruple cheddar, panceta crocante y barbacoa",
                "precio_base": 11200.0,
                "imagen_url": "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600",
                "stock": 20,
            },
            {
                "categoria": "Hamburguesas",
                "nombre": "Hamburguesa Veggie",
                "descripcion": "Medallón de lentejas y hongos, palta, rúcula y alioli",
                "precio_base": 8900.0,
                "imagen_url": "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=600",
                "stock": 15,
            },
            {
                "categoria": "Pizzas",
                "nombre": "Pizza Muzzarella",
                "descripcion": "Salsa de tomate casera, abundante muzzarella, orégano y aceitunas",
                "precio_base": 9500.0,
                "imagen_url": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600",
                "stock": 18,
            },
            {
                "categoria": "Pizzas",
                "nombre": "Pizza Napolitana",
                "descripcion": "Muzzarella, rodajas de tomate fresco, ajo perejil y aceite de oliva",
                "precio_base": 10800.0,
                "imagen_url": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600",
                "stock": 14,
            },
            {
                "categoria": "Pizzas",
                "nombre": "Pizza Pepperoni",
                "descripcion": "Muzzarella fundida y pepperoni ligeramente picante",
                "precio_base": 11500.0,
                "imagen_url": "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600",
                "stock": 12,
            },
            {
                "categoria": "Bebidas",
                "nombre": "Coca-Cola 500ml",
                "descripcion": "Botella individual bien fría",
                "precio_base": 2200.0,
                "imagen_url": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600",
                "stock": 50,
            },
            {
                "categoria": "Bebidas",
                "nombre": "Cerveza Artesanal IPA 473ml",
                "descripcion": "Lata de cerveza lupulada estilo American IPA",
                "precio_base": 3800.0,
                "imagen_url": "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600",
                "stock": 30,
            },
        ]

        for prod_info in productos_data:
            existente = session.exec(
                select(Producto).where(Producto.nombre == prod_info["nombre"])
            ).first()
            if not existente:
                cat_obj = categorias_map[prod_info["categoria"]]
                assert cat_obj.id is not None
                session.add(
                    Producto(
                        categoria_id=cat_obj.id,
                        nombre=prod_info["nombre"],
                        descripcion=prod_info["descripcion"],
                        precio_base=prod_info["precio_base"],
                        imagen_url=prod_info["imagen_url"],
                        stock=prod_info["stock"],
                        disponible=True,
                        activo=True,
                    )
                )

        session.commit()
        print("Seed ejecutado correctamente: admin (admin / Admin1234!), 3 categorías y 8 productos.")


if __name__ == "__main__":
    run_seed()