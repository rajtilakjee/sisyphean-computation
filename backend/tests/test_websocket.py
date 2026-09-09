from datetime import datetime

from app.api.connection_manager import ConnectionManager
from app.api.serializers import serialize_event
from app.engine.events import EventType, MachineEvent


def test_serialize_event():
    event = MachineEvent(
        type=EventType.DIGIT_COMPUTED,
        timestamp=datetime(
            2026,
            1,
            1,
            12,
            0,
            0,
        ),
        data={
            "position": 1,
            "digit": "1",
        },
    )

    result = serialize_event(event)

    assert result["type"] == "digit_computed"
    assert result["data"]["position"] == 1
    assert result["data"]["digit"] == "1"
    assert "timestamp" in result


def test_connection_manager_disconnect():
    manager = ConnectionManager()

    class FakeWebSocket:
        pass

    websocket = FakeWebSocket()

    manager.active_connections.append(websocket)

    assert manager.connection_count == 1

    manager.disconnect(websocket)

    assert manager.connection_count == 0
