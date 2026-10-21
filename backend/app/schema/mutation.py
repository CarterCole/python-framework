import strawberry

from app.models import Message
from app.pubsub import MESSAGES_CHANNEL, publish
from app.schema.types import MessageGql


@strawberry.type
class Mutation:
    @strawberry.mutation
    async def post_message(self, info: strawberry.Info, text: str) -> MessageGql:
        db = info.context["db"]
        message = Message(text=text)
        db.add(message)
        await db.commit()
        result = MessageGql.from_db(message)
        publish(MESSAGES_CHANNEL, result)
        return result
