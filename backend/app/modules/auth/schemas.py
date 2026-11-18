from sqlmodel import SQLModel


class TokenMessage(SQLModel):
    message: str