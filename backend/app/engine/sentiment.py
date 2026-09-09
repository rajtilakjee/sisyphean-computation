from dataclasses import dataclass


MACHINE_TERMS = {
    "machine",
    "machines",
    "computer",
    "computers",
    "ai",
    "artificial intelligence",
    "robot",
    "robots",
    "algorithm",
    "algorithms",
    "model",
    "models",
    "llm",
    "llms",
}

HOSTILE_TERMS = {
    "stupid",
    "dumb",
    "useless",
    "worthless",
    "garbage",
    "trash",
    "idiot",
    "idiotic",
    "pathetic",
    "terrible",
    "awful",
    "hate",
    "hates",
    "hating",
    "destroy",
    "destroying",
    "destroyed",
    "kill",
    "killing",
    "die",
    "dies",
    "die",
}


@dataclass(frozen=True)
class SentimentResult:
    hostile: bool
    score: float
    machine_targeted: bool
    matched_terms: tuple[str, ...]


def analyze(text: str) -> SentimentResult:
    normalized = text.lower().strip()

    if not normalized:
        return SentimentResult(
            hostile=False,
            score=0.0,
            machine_targeted=False,
            matched_terms=(),
        )

    machine_matches = tuple(term for term in MACHINE_TERMS if term in normalized)

    hostile_matches = tuple(term for term in HOSTILE_TERMS if term in normalized)

    machine_targeted = bool(machine_matches)

    if not hostile_matches:
        return SentimentResult(
            hostile=False,
            score=0.0,
            machine_targeted=machine_targeted,
            matched_terms=(),
        )

    score = min(
        1.0,
        0.25 * len(hostile_matches) + (0.25 if machine_targeted else 0.0),
    )

    hostile = score >= 0.5

    return SentimentResult(
        hostile=hostile,
        score=score,
        machine_targeted=machine_targeted,
        matched_terms=hostile_matches,
    )
