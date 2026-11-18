from datetime import UTC, datetime

from sqlalchemy.orm import selectinload
from sqlmodel import Session, func, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import DetallePedido, EstadoPedido, Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Pedido)

    def get_with_items(self, pedido_id: int) -> Pedido | None:
        statement = (
            select(Pedido)
            .options(selectinload(Pedido.items))  # type: ignore[arg-type]
            .where(Pedido.id == pedido_id)
        )
        return self.session.exec(statement).first()

    def add_detalle(self, detalle: DetallePedido) -> DetallePedido:
        self.session.add(detalle)
        self.session.flush()
        return detalle

    def list_by_usuario(
        self,
        usuario_id: int | None = None,
        skip: int = 0,
        limit: int = 20,
        estado: str | None = None,
    ) -> tuple[int, list[Pedido]]:
        filters = []
        if usuario_id is not None:
            filters.append(Pedido.usuario_id == usuario_id)
        if estado is not None:
            filters.append(Pedido.estado == estado)

        count_stmt = select(func.count()).select_from(Pedido).where(*filters)
        total = int(self.session.exec(count_stmt).one())

        items_stmt = (
            select(Pedido)
            .options(selectinload(Pedido.items))  # type: ignore[arg-type]
            .where(*filters)
            .order_by(Pedido.created_at.desc())  # type: ignore[attr-defined]
            .offset(skip)
            .limit(limit)
        )
        items = list(self.session.exec(items_stmt).all())
        return total, items

    def count_by_estado(self) -> dict[str, int]:
        stmt = select(Pedido.estado, func.count()).group_by(Pedido.estado)
        rows = self.session.exec(stmt).all()
        conteos = {
            EstadoPedido.PENDIENTE.value: 0,
            EstadoPedido.EN_PREPARACION.value: 0,
            EstadoPedido.ENTREGADO.value: 0,
            EstadoPedido.CANCELADO.value: 0,
        }
        for est, cnt in rows:
            conteos[est] = int(cnt)
        return conteos

    def count_hoy(self) -> int:
        inicio_dia = datetime.now(UTC).replace(hour=0, minute=0, second=0, microsecond=0)
        stmt = select(func.count()).select_from(Pedido).where(Pedido.created_at >= inicio_dia)
        return int(self.session.exec(stmt).one())

    def sum_ingresos_entregados(self) -> float:
        stmt = select(func.coalesce(func.sum(Pedido.total), 0.0)).where(
            Pedido.estado == EstadoPedido.ENTREGADO.value
        )
        return float(self.session.exec(stmt).one())