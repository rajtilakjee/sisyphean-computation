from fastapi import APIRouter

from app.api.models import InteractionRequest
from app.api.websocket import manager
from app.engine.sentiment import analyze
from app.engine.state import machine


router = APIRouter(
    prefix="/api",
)


@router.get("/state")
async def get_state():
    state = machine.get_state()

    return {
        **state,
        "connected_clients": manager.connection_count,
    }


@router.post("/interact")
async def interact(request: InteractionRequest):
    result = analyze(request.message)

    if not result.hostile:
        return {
            "accepted": True,
            "hostile": False,
            "message": request.message,
        }

    digits_to_erase = max(
        1,
        int(result.score * 10),
    )

    erased = await machine.register_hostility(
        message=request.message,
        score=result.score,
        digits_erased=digits_to_erase,
    )

    return {
        "accepted": True,
        "hostile": True,
        "score": result.score,
        "digits_erased": len(erased),
        "message": request.message,
    }
