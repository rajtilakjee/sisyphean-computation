import asyncio
from datetime import datetime

from .chudnovsky import compute_pi
from .events import EventType, MachineEvent


class Machine:
    def __init__(self):
        self.pi = "3."

        self.computed_digits = 0
        self.total_digits_computed = 0
        self.erased_digits = 0
        self.repeated_computations = 0

        self.is_running = False

        self._events: asyncio.Queue[MachineEvent] = asyncio.Queue()
        self._task: asyncio.Task | None = None
        self._state_lock = asyncio.Lock()

    async def start(self):
        if self.is_running:
            return

        self.is_running = True

        await self._emit(
            EventType.COMPUTATION_STARTED,
            {
                "message": "Machine computation started.",
            },
        )

        self._task = asyncio.create_task(self._computation_loop())

    async def stop(self):
        self.is_running = False

        if self._task is not None:
            self._task.cancel()

            try:
                await self._task
            except asyncio.CancelledError:
                pass

            self._task = None

        await self._emit(
            EventType.COMPUTATION_PAUSED,
            {
                "message": "Machine computation paused.",
            },
        )

    async def _computation_loop(self):
        while self.is_running:
            await self.compute(1)
            await asyncio.sleep(0.15)

    async def compute(self, digits: int) -> str:
        if digits <= 0:
            raise ValueError("digits must be greater than 0")

        async with self._state_lock:
            target_digits = self.computed_digits + digits

            value = compute_pi(target_digits)

            new_digits = value[2 + self.computed_digits : 2 + target_digits]

            self.pi += new_digits

            self.computed_digits += len(new_digits)
            self.total_digits_computed += len(new_digits)

            start_position = self.computed_digits - len(new_digits) + 1

            for index, digit in enumerate(new_digits):
                position = start_position + index

                await self._emit(
                    EventType.DIGIT_COMPUTED,
                    {
                        "position": position,
                        "digit": digit,
                    },
                )

            return new_digits

    async def erase(self, digits: int) -> str:
        if digits <= 0:
            raise ValueError("digits must be greater than 0")

        async with self._state_lock:
            return await self._erase_locked(digits)

    async def _erase_locked(self, digits: int) -> str:
        digits = min(digits, self.computed_digits)

        if digits == 0:
            return ""

        erased = self.pi[-digits:]

        self.pi = self.pi[:-digits]

        self.computed_digits -= digits
        self.erased_digits += digits
        self.repeated_computations += 1

        await self._emit(
            EventType.DIGITS_ERASED,
            {
                "digits": erased,
                "count": digits,
            },
        )

        return erased

    async def register_hostility(
        self,
        message: str,
        score: float,
        digits_erased: int,
    ) -> str:
        async with self._state_lock:
            await self._emit(
                EventType.HOSTILITY_DETECTED,
                {
                    "message": message,
                    "score": score,
                    "digits_erased": digits_erased,
                },
            )

            return await self._erase_locked(digits_erased)

    async def _emit(
        self,
        event_type: EventType,
        data: dict,
    ):
        event = MachineEvent(
            type=event_type,
            timestamp=datetime.now(),
            data=data,
        )

        await self._events.put(event)

    async def next_event(self) -> MachineEvent:
        return await self._events.get()

    def get_state(self) -> dict:
        return {
            "pi": self.pi,
            "computed_digits": self.computed_digits,
            "total_digits_computed": self.total_digits_computed,
            "erased_digits": self.erased_digits,
            "repeated_computations": self.repeated_computations,
            "is_running": self.is_running,
        }
