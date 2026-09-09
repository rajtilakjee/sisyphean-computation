from decimal import Decimal, getcontext
from math import factorial


C = 426880 * Decimal(10005).sqrt()


def compute_pi(digits: int) -> str:
    """
    Compute pi to the requested number of decimal digits
    using the Chudnovsky algorithm.
    """

    if digits < 1:
        raise ValueError("digits must be greater than 0")

    # Extra precision prevents intermediate rounding errors.
    getcontext().prec = digits + 20

    total = Decimal(0)

    k = 0

    while True:
        numerator = (
            Decimal((-1) ** k)
            * Decimal(factorial(6 * k))
            * Decimal(13591409 + 545140134 * k)
        )

        denominator = (
            Decimal(factorial(3 * k))
            * Decimal(factorial(k)) ** 3
            * Decimal(640320) ** (3 * k)
        )

        term = numerator / denominator
        total += term

        if abs(term) < Decimal(10) ** -(digits + 10):
            break

        k += 1

    pi = C / total

    return format(pi, f".{digits}f")
