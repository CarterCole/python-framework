"""In-process pub/sub for GraphQL subscriptions.

"""

import asyncio
from collections import defaultdict
from collections.abc import AsyncGenerator
from typing import Any

MESSAGES_CHANNEL = "messages"

_subscribers: dict[str, set[asyncio.Queue]] = defaultdict(set)


def publish(channel: str, data: Any) -> None:
    for queue in _subscribers[channel]:
        queue.put_nowait(data)


async def subscribe(channel: str) -> AsyncGenerator[Any, None]:
    queue: asyncio.Queue = asyncio.Queue()
    _subscribers[channel].add(queue)
    try:
        while True:
            yield await queue.get()
    finally:
        _subscribers[channel].discard(queue)
