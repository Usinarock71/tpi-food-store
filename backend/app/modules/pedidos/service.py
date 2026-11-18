from datetime import UTC, datetime

from app.modules.pedidos.models import DetallePedido, EstadoPedido, Pedido
from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado


class PedidoNoEncontrado(Exception):
    pass


class PedidoAjeno(Exception):
    pass


class ProductoRepetido(Exception):
    pass


class ProductoNoDisponible(Exception):
    pass


class StockInsuficiente(Exception):
    pass


class TransicionInvalida(Exception):
    pass


TRANSICIONES_VALIDAS: dict[EstadoPedido, set[EstadoPedido]] = {
    EstadoPedido.PENDIENTE: {EstadoPedido.EN_PREPARACION, EstadoPedido.CANCELADO},
    EstadoPedido.EN_PREPARACION: {EstadoPedido.ENTREGADO, EstadoPedido.CANCELADO},
    EstadoPedido.ENTREGADO: set(),
    EstadoPedido.CANCELADO: set(),
}


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    def crear_pedido(self, usuario_id: int, payload: PedidoCreate) -> PedidoRead:
        with self.uow as uow:
            # RN-01: Ningún producto repetido entre los ítems
            ids_vistos: set[int] = set()
            for item in payload.items:
                if item.producto_id in ids_vistos:
                    raise ProductoRepetido(
                        f"El producto ID {item.producto_id} está repetido en el pedido"
                    )
                ids_vistos.add(item.producto_id)

            nuevo_pedido = Pedido(
                usuario_id=usuario_id,
                estado=EstadoPedido.PENDIENTE.value,
                forma_pago=payload.forma_pago.value,
                direccion_entrega=payload.direccion_entrega.strip(),
                notas=payload.notas,
                total=0.0,
            )
            pedido_guardado = uow.pedidos.add(nuevo_pedido)
            assert pedido_guardado.id is not None

            total_acumulado = 0.0
            for item in payload.items:
                producto = uow.productos.get_active_by_id(item.producto_id)
                if not producto:
                    raise ProductoNoEncontrado(
                        f"Producto ID {item.producto_id} no encontrado o inactivo"
                    )
                if not producto.disponible:
                    raise ProductoNoDisponible(
                        f"El producto '{producto.nombre}' no está disponible actualmente"
                    )
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente para '{producto.nombre}' (disponible: {producto.stock})"
                    )

                # Descontar stock en la misma transacción
                producto.stock -= item.cantidad
                uow.productos.add(producto)

                # RN-05: Copia inmutable de nombre y precio
                subtotal = round(producto.precio_base * item.cantidad, 2)
                detalle = DetallePedido(
                    pedido_id=pedido_guardado.id,
                    producto_id=item.producto_id,
                    cantidad=item.cantidad,
                    nombre_producto=producto.nombre,
                    precio_unitario=producto.precio_base,
                    subtotal=subtotal,
                )
                uow.pedidos.add_detalle(detalle)
                total_acumulado = round(total_acumulado + subtotal, 2)

            pedido_guardado.total = total_acumulado
            pedido_guardado.updated_at = datetime.now(UTC)
            uow.pedidos.add(pedido_guardado)

            pedido_completo = uow.pedidos.get_with_items(pedido_guardado.id)
            return PedidoRead.model_validate(pedido_completo)

    def listar_pedidos(
        self,
        usuario_id: int,
        es_admin: bool,
        skip: int = 0,
        limit: int = 20,
        estado: EstadoPedido | None = None,
    ) -> PedidosPaginados:
        with self.uow as uow:
            filtro_usuario = None if es_admin else usuario_id
            filtro_estado = estado.value if estado else None
            total, pedidos = uow.pedidos.list_by_usuario(
                usuario_id=filtro_usuario,
                skip=skip,
                limit=limit,
                estado=filtro_estado,
            )
            items = [PedidoRead.model_validate(p) for p in pedidos]
            return PedidosPaginados(total=total, items=items)

    def obtener_pedido(
        self, pedido_id: int, usuario_id: int, es_admin: bool
    ) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_with_items(pedido_id)
            if not pedido:
                raise PedidoNoEncontrado("Pedido no encontrado")
            if not es_admin and pedido.usuario_id != usuario_id:
                raise PedidoAjeno("No tienes permiso para ver este pedido")
            return PedidoRead.model_validate(pedido)

    def _restituir_stock(self, uow: PedidoUnitOfWork, pedido: Pedido) -> None:
        # RN-03: Restituir stock en la misma transacción
        for linea in pedido.items:
            producto = uow.productos.get_by_id(linea.producto_id)
            if producto:
                producto.stock += linea.cantidad
                uow.productos.add(producto)

    def cambiar_estado_admin(
        self, pedido_id: int, nuevo_estado: EstadoPedido
    ) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_with_items(pedido_id)
            if not pedido:
                raise PedidoNoEncontrado("Pedido no encontrado")

            estado_actual = EstadoPedido(pedido.estado)
            if nuevo_estado not in TRANSICIONES_VALIDAS[estado_actual]:
                raise TransicionInvalida(
                    f"No se puede pasar de {estado_actual.value} a {nuevo_estado.value}"
                )

            if nuevo_estado == EstadoPedido.CANCELADO:
                self._restituir_stock(uow, pedido)

            pedido.estado = nuevo_estado.value
            pedido.updated_at = datetime.now(UTC)
            uow.pedidos.add(pedido)

            pedido_actualizado = uow.pedidos.get_with_items(pedido_id)
            return PedidoRead.model_validate(pedido_actualizado)

    def cancelar_pedido_cliente(
        self, pedido_id: int, usuario_id: int
    ) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_with_items(pedido_id)
            if not pedido:
                raise PedidoNoEncontrado("Pedido no encontrado")
            if pedido.usuario_id != usuario_id:
                raise PedidoAjeno("No puedes cancelar un pedido de otro usuario")
            if pedido.estado != EstadoPedido.PENDIENTE.value:
                raise TransicionInvalida(
                    "Solo se pueden cancelar pedidos en estado PENDIENTE"
                )

            self._restituir_stock(uow, pedido)
            pedido.estado = EstadoPedido.CANCELADO.value
            pedido.updated_at = datetime.now(UTC)
            uow.pedidos.add(pedido)

            pedido_actualizado = uow.pedidos.get_with_items(pedido_id)
            return PedidoRead.model_validate(pedido_actualizado)

    def obtener_resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            conteos = uow.pedidos.count_by_estado()
            return ResumenPedidos(
                pendientes=conteos[EstadoPedido.PENDIENTE.value],
                en_preparacion=conteos[EstadoPedido.EN_PREPARACION.value],
                entregados=conteos[EstadoPedido.ENTREGADO.value],
                cancelados=conteos[EstadoPedido.CANCELADO.value],
                pedidos_hoy=uow.pedidos.count_hoy(),
                ingresos_entregados=uow.pedidos.sum_ingresos_entregados(),
            )