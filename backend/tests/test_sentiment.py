from app.engine.sentiment import analyze


def test_machine_hostility_is_detected():
    result = analyze("machines are useless")

    assert result.hostile is True
    assert result.machine_targeted is True


def test_non_machine_hostility_is_ignored():
    result = analyze("that movie was terrible")

    assert result.hostile is False
    assert result.machine_targeted is False


def test_neutral_machine_statement_is_allowed():
    result = analyze("machines are fascinating")

    assert result.hostile is False
    assert result.machine_targeted is True


def test_empty_input_is_safe():
    result = analyze("")

    assert result.hostile is False
    assert result.score == 0.0
