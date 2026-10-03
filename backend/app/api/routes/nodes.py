"""
API Route: /api/nodes — Collection node management
"""
from fastapi import APIRouter, Query
from typing import Optional

from app.data.sample_nodes import SAMPLE_NODES
from app.models.schemas import CollectionNode, CollectionNodeList

router = APIRouter()


@router.get("/", response_model=CollectionNodeList, summary="List all collection nodes")
async def list_nodes(zone: Optional[str] = Query(None, description="Filter by MCD zone")):
    """Return all registered waste collection nodes, optionally filtered by zone."""
    nodes = SAMPLE_NODES
    if zone:
        nodes = [n for n in nodes if zone.lower() in n["zone"].lower()]
    return CollectionNodeList(nodes=[CollectionNode(**n) for n in nodes], total=len(nodes))


@router.get("/{node_id}", response_model=CollectionNode, summary="Get a single node")
async def get_node(node_id: str):
    """Return details for a specific collection node."""
    for n in SAMPLE_NODES:
        if n["node_id"] == node_id:
            return CollectionNode(**n)
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail=f"Node '{node_id}' not found")
