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

        message = serialize_event(event)

        await manager.broadcast(message)


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
):
    await websocket.accept()

    manager.active_connections.append(websocket)

    print(f"WebSocket connected. Clients: {manager.connection_count}")

    try:
        await websocket.send_json(
            {
                "type": "state",
                "timestamp": None,
                "data": machine.get_state(),
            }
        )

        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:
        print("WebSocket disconnected.")

    except Exception as error:
        print(f"WebSocket error: {error}")

    finally:
        manager.disconnect(websocket)

        print(f"WebSocket removed. Clients: {manager.connection_count}")
