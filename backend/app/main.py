from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.requests import HTTPConnection
from strawberry.fastapi import GraphQLRouter

from app.database import Base, engine, get_db
from app.schema import schema


@asynccontextmanager
async def lifespan(app: FastAPI):
    # first migration needs writing.
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(lifespan=lifespan)


async def get_context(request: HTTPConnection, db: AsyncSession = Depends(get_db)):
    return {"request": request, "db": db}


graphql_app = GraphQLRouter(schema, context_getter=get_context)
app.include_router(graphql_app, prefix="/graphql")
