
import httpx
import logging

logger = logging.getLogger(__name__)

async def trigger_n8n_event(webhook_url: str, event_type: str, data: dict, db=None):
    """
    Dispara um evento para o webhook do n8n configurado.
    Enriquece os dados com informações do barco e cliente se o banco estiver disponível.
    """
    if not webhook_url:
        return

    from datetime import datetime, timezone
    
    # Enrich data if it's an order and we have DB
    if db and "boat_id" in data:
        from backend import models
        boat = db.query(models.Boat).filter(models.Boat.id == data["boat_id"]).first()
        if boat:
            data["boat_name"] = boat.name
            if boat.owner:
                data["client_name"] = boat.owner.name
                data["client_phone"] = boat.owner.phone

    payload = {
        "event": event_type,
        "data": data,
        "timestamp": str(data.get("updated_at") or data.get("created_at") or datetime.now(timezone.utc).isoformat())
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(webhook_url, json=payload)
            response.raise_for_status()
            logger.info(f"N8N Webhook triggered successfully: {event_type} - Status {response.status_code}")
    except Exception as e:
        logger.error(f"Failed to trigger N8N Webhook: {str(e)}")
