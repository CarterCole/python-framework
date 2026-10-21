import strawberry
from sqlalchemy.future import select

from app.models import Message
from app.schema.types import MessageGql


@strawberry.type
class Query:
    @strawberry.field
    async def messages(self, info: strawberry.Info) -> list[MessageGql]:
        db = info.context["db"]
        rows = await db.scalars(select(Message).order_by(Message.id))
        return [MessageGql.from_db(m) for m in rows]
