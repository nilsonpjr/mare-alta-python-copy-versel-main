
import httpx
import logging

logger = logging.getLogger(__name__)

async def trigger_n8n_event(webhook_url: str, event_type: str, data: dict):
    """
    Dispara um evento para o webhook do n8n configurado.
    """
    if not webhook_url:
        return

    payload = {
        "event": event_type,
        "data": data,
        "timestamp": str(data.get("updated_at") or "")
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(webhook_url, json=payload)
            response.raise_for_status()
            logger.info(f"N8N Webhook triggered successfully: {event_type} - Status {response.status_code}")
    except Exception as e:
        logger.error(f"Failed to trigger N8N Webhook: {str(e)}")
