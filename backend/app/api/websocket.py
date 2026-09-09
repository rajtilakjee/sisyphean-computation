import asyncio

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.api.connection_manager import ConnectionManager
from app.api.serializers import serialize_event
from app.engine.state import machine


router = APIRouter()

manager = ConnectionManager()


async def event_broadcaster():
    """
    Consume machine events and broadcast them
    to every connected client.
    """

    while True:
        event = await machine.next_event()

        await manager.broadcast(serialize_event(event))


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)

    await websocket.send_json(
        {
            "type": "state",
            "timestamp": None,
            "data": machine.get_state(),
        }
    )

    try:
        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:
        manager.disconnect(websocket)

    except Exception:
        manager.disconnect(websocket)
