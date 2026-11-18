from fastapi import HTTPException, status

from app.core.security import create_access_token, hash_password, verify_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class AuthService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def register(self, payload: UserCreate) -> UserPublic:
        with self.uow as uow:
            if uow.usuarios.get_by_username(payload.username):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="El nombre de usuario ya está en uso",
                )
            if uow.usuarios.get_by_email(payload.email):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="El correo electrónico ya está registrado",
                )

            nuevo_usuario = Usuario(
                username=payload.username,
                full_name=payload.full_name,
                email=payload.email,
                hashed_password=hash_password(payload.password),
                role="user",
                disabled=False,
            )
            creado = uow.usuarios.add(nuevo_usuario)
            return UserPublic.model_validate(creado)

    def authenticate_and_create_token(self, username: str, password: str) -> str:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username)
            if not usuario or not verify_password(password, usuario.hashed_password):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Usuario o contraseña incorrectos",
                )
            if usuario.disabled:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cuenta de usuario desactivada",
                )
            return create_access_token(data={"sub": usuario.username, "role": usuario.role})