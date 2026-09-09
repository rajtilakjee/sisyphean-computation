import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.routes import router
from app.api.websocket import (
    event_broadcaster,
    router as websocket_router,
)
from app.engine.state import machine


@asynccontextmanager
async def lifespan(app: FastAPI):
    await machine.start()

    broadcaster_task = asyncio.create_task(event_broadcaster())

    yield

    broadcaster_task.cancel()

    try:
        await broadcaster_task
    except asyncio.CancelledError:
        pass

    await machine.stop()


app = FastAPI(
    title="Sisyphean Computation",
    description="An interactive computational artwork about machine labor.",
    version="0.1.0",
    lifespan=lifespan,
)

app.include_router(router)
app.include_router(websocket_router)
