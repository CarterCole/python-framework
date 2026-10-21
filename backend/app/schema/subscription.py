from collections.abc import AsyncGenerator

import strawberry

from app.pubsub import MESSAGES_CHANNEL, subscribe
from app.schema.types import MessageGql


@strawberry.type
class Subscription:
    @strawberry.subscription
    async def message_posted(
        self, info: strawberry.Info
    ) -> AsyncGenerator[MessageGql, None]:
        async for message in subscribe(MESSAGES_CHANNEL):
            yield message
