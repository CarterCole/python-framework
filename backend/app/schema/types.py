import strawberry

from app.database import to_global_id
from app.models import Message


@strawberry.type
class MessageGql:
    _db_id: strawberry.Private[int]
    text: str

    @strawberry.field
    def id(self) -> strawberry.ID:
        return to_global_id("Message", self._db_id)

    @classmethod
    def from_db(cls, message: Message) -> "MessageGql":
        return cls(_db_id=message.id, text=message.text)
