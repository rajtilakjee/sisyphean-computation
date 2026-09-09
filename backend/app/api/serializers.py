from app.engine.events import MachineEvent


def serialize_event(event: MachineEvent) -> dict:
    return {
        "type": event.type.value,
        "timestamp": event.timestamp.isoformat(),
        "data": event.data,
    }
