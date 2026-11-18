from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaRead,
    CategoriaUpdate,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    pass


class NombreDuplicado(Exception):
    pass


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork) -> None:
        self.uow = uow

    def listar_categorias(self, skip: int = 0, limit: int = 100) -> list[CategoriaRead]:
        with self.uow as uow:
            categorias = uow.categorias.list_activas(skip=skip, limit=limit)
            return [CategoriaRead.model_validate(c) for c in categorias]

    def obtener_categoria(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_active_by_id(categoria_id)
            if not categoria:
                raise CategoriaNoEncontrada("Categoría no encontrada")
            return CategoriaRead.model_validate(categoria)

    def crear_categoria(self, payload: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            if uow.categorias.get_by_nombre(payload.nombre):
                raise NombreDuplicado("Ya existe una categoría con ese nombre")
            nueva = Categoria(
                nombre=payload.nombre.strip(),
                descripcion=payload.descripcion,
                activo=True,
            )
            creada = uow.categorias.add(nueva)
            return CategoriaRead.model_validate(creada)

    def actualizar_categoria(self, categoria_id: int, payload: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_active_by_id(categoria_id)
            if not categoria:
                raise CategoriaNoEncontrada("Categoría no encontrada")

            if payload.nombre is not None:
                existente = uow.categorias.get_by_nombre(payload.nombre)
                if existente and existente.id != categoria.id:
                    raise NombreDuplicado("Ya existe una categoría con ese nombre")
                categoria.nombre = payload.nombre.strip()

            if payload.descripcion is not None:
                categoria.descripcion = payload.descripcion

            actualizada = uow.categorias.add(categoria)
            return CategoriaRead.model_validate(actualizada)

    def eliminar_categoria(self, categoria_id: int) -> None:
        with self.uow as uow:
            categoria = uow.categorias.get_active_by_id(categoria_id)
            if not categoria:
                raise CategoriaNoEncontrada("Categoría no encontrada")
            categoria.activo = False
            uow.categorias.add(categoria)