from contextvars import ContextVar
from typing import Optional

_tenant_context: ContextVar[Optional[int]] = ContextVar("tenant_id", default=None)

def set_tenant_id(tenant_id: int):
    return _tenant_context.set(tenant_id)

def get_tenant_id() -> Optional[int]:
    return _tenant_context.get()

def reset_tenant_id(token):
    _tenant_context.reset(token)
