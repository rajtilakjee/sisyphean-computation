import asyncio

import pytest

from app.engine.events import EventType
from app.engine.machine import Machine


@pytest.mark.anyio
async def test_machine_runs_continuously():
    machine = Machine()

    await machine.start()

    await asyncio.sleep(0.7)

    await machine.stop()

    assert machine.computed_digits > 0
    assert machine.total_digits_computed > 0
    assert machine.is_running is False
