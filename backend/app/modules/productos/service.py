from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


class ProductoNoEncontrado(Exception):
    pass


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork) -> None:
        self.uow = uow

    def listar_productos(
        self,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, productos = uow.productos.search(
                skip=skip,
                limit=limit,
                search=search,
                categoria_id=categoria_id,
                disponible=disponible,
            )
            items = [ProductoRead.model_validate(p) for p in productos]
            return ProductosPaginados(total=total, items=items)

    def obtener_producto(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_active_by_id(producto_id)
            if not producto:
                raise ProductoNoEncontrado("Producto no encontrado")
            return ProductoRead.model_validate(producto)

    def crear_producto(self, payload: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            categoria = uow.categorias.get_active_by_id(payload.categoria_id)
            if not categoria:
                raise CategoriaNoEncontrada("La categoría especificada no existe o está inactiva")

            nuevo = Producto(
                categoria_id=payload.categoria_id,
                nombre=payload.nombre.strip(),
                descripcion=payload.descripcion,
                precio_base=payload.precio_base,
                imagen_url=payload.imagen_url,
                stock=payload.stock,
                disponible=payload.disponible,
                activo=True,
            )
            creado = uow.productos.add(nuevo)
            assert creado.id is not None
            recargado = uow.productos.get_active_by_id(creado.id)
            return ProductoRead.model_validate(recargado)

    def actualizar_producto(self, producto_id: int, payload: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_active_by_id(producto_id)
            if not producto:
                raise ProductoNoEncontrado("Producto no encontrado")

            if payload.categoria_id is not None:
                categoria = uow.categorias.get_active_by_id(payload.categoria_id)
                if not categoria:
                    raise CategoriaNoEncontrada("La categoría especificada no existe o está inactiva")
                producto.categoria_id = payload.categoria_id

            if payload.nombre is not None:
                producto.nombre = payload.nombre.strip()
            if payload.descripcion is not None:
                producto.descripcion = payload.descripcion
            if payload.precio_base is not None:
                producto.precio_base = payload.precio_base
            if payload.imagen_url is not None:
                producto.imagen_url = payload.imagen_url
            if payload.stock is not None:
                producto.stock = payload.stock
            if payload.disponible is not None:
                producto.disponible = payload.disponible

            uow.productos.add(producto)
            recargado = uow.productos.get_active_by_id(producto_id)
            return ProductoRead.model_validate(recargado)

    def actualizar_stock(self, producto_id: int, payload: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_active_by_id(producto_id)
            if not producto:
                raise ProductoNoEncontrado("Producto no encontrado")
            producto.stock = payload.stock
            producto.disponible = payload.disponible
            uow.productos.add(producto)
            recargado = uow.productos.get_active_by_id(producto_id)
            return ProductoRead.model_validate(recargado)

    def eliminar_producto(self, producto_id: int) -> None:
        with self.uow as uow:
            producto = uow.productos.get_active_by_id(producto_id)
            if not producto:
                raise ProductoNoEncontrado("Producto no encontrado")
            producto.activo = False
            uow.productos.add(producto)