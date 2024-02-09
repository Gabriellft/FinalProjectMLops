from fastapi import APIRouter

router = APIRouter(prefix='/gen-data', tags=["gen-data"])


@router.get("")
async def root():
    return {"message": "Root Generation data"}
