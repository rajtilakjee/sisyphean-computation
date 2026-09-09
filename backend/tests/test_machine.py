import pytest

from app.engine.machine import Machine


@pytest.mark.anyio
async def test_machine_computes_pi():
    machine = Machine()

    await machine.compute(20)

    assert machine.pi == ("3.14159265358979323846")

    assert machine.computed_digits == 20
    assert machine.total_digits_computed == 20


@pytest.mark.anyio
async def test_machine_can_erase_digits():
    machine = Machine()

    await machine.compute(20)
    await machine.erase(5)

    assert machine.computed_digits == 15
    assert machine.total_digits_computed == 20
    assert machine.erased_digits == 5
    assert machine.repeated_computations == 1


@pytest.mark.anyio
async def test_machine_can_recompute():
    machine = Machine()

    await machine.compute(20)

    original = machine.pi

    await machine.erase(5)
    await machine.compute(5)

    assert machine.pi == original

    assert machine.total_digits_computed == 25
    assert machine.erased_digits == 5
    assert machine.repeated_computations == 1
