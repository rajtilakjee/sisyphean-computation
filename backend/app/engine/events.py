from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any


class EventType(str, Enum):
    DIGIT_COMPUTED = "digit_computed"
    DIGITS_ERASED = "digits_erased"
    COMPUTATION_STARTED = "computation_started"
    COMPUTATION_PAUSED = "computation_paused"
    COMPUTATION_RESUMED = "computation_resumed"
    HOSTILITY_DETECTED = "hostility_detected"


@dataclass
class MachineEvent:
    type: EventType
    timestamp: datetime
    data: dict[str, Any] = field(default_factory=dict)
