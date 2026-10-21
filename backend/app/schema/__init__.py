import strawberry

from app.schema.mutation import Mutation
from app.schema.query import Query
from app.schema.subscription import Subscription

schema = strawberry.Schema(query=Query, mutation=Mutation, subscription=Subscription)
