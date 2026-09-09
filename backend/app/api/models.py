from pydantic import BaseModel, Field


class InteractionRequest(BaseModel):
    message: str = Field(
        min_length=1,
        max_length=1000,
    )
