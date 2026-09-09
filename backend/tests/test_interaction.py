import pytest

from app.engine.machine import Machine
from app.engine.sentiment import analyze


@pytest.mark.anyio
async def test_hostility_erases_machine_work():
    machine = Machine()

    await machine.compute(20)

    before = machine.computed_digits

    result = analyze("machines are useless")

    erased = await machine.register_hostility(
        message="machines are useless",
        score=result.score,
        digits_erased=5,
    )

    assert len(erased) == 5
    assert machine.computed_digits == before - 5
    assert machine.erased_digits == 5
    assert machine.repeated_computations == 1


@pytest.mark.anyio
async def test_machine_can_continue_after_hostility():
    machine = Machine()

    await machine.compute(20)

    await machine.register_hostility(
        message="AI is garbage",
        score=1.0,
        digits_erased=5,
    )

    await machine.compute(5)

    assert machine.computed_digits == 20
    assert machine.total_digits_computed == 25
    assert machine.erased_digits == 5
