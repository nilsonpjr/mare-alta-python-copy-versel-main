"""
Este arquivo contém as funções CRUD (Create, Read, Update, Delete)
para interagir com o banco de dados. Cada função é responsável por
uma operação específica em um modelo SQLAlchemy, utilizando uma sessão de banco de dados.
"""

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc
from datetime import datetime
from typing import List, Optional

import models
import schemas
from auth import get_password_hash # Importa a função para hash de senhas

# --- USER CRUD ---
# Funções para operações CRUD na tabela de usuários (models.User).

def register_tenant(db: Session, signup_data: schemas.TenantSignup):
    """
    Registra uma nova empresa (Tenant) e seu primeiro usuário Admin.
    Transação atômica.
    """
    # 1. Cria o Tenant
    db_tenant = models.Tenant(
        name=signup_data.company_name,
        plan=signup_data.plan
    )
    db.add(db_tenant)
    db.commit()
    db.refresh(db_tenant)
    
    # 2. Cria o Usuário Admin vinculado ao Tenant
    hashed_password = get_password_hash(signup_data.admin_password)
    db_user = models.User(
        email=signup_data.admin_email,
        name=signup_data.admin_name,
        hashed_password=hashed_password,
        role=models.UserRole.ADMIN, # Primeiro usuário é sempre admin
        tenant_id=db_tenant.id
    )
    db.add(db_user)
    
    # 3. Inicializa CompanyInfo para o Tenant
    db_company = models.CompanyInfo(
        tenant_id=db_tenant.id,
        company_name=signup_data.company_name # Já preenche a Razão Social com o nome informado
    )
    db.add(db_company)
    
    try:
        db.commit()
        db.refresh(db_user)
        return db_user
    except Exception as e:
        db.rollback()
        raise e


def get_user_by_email(db: Session, email: str):
    """
    Busca um usuário pelo endereço de email.
    Args:
        db (Session): Sessão do banco de dados.
        email (str): Endereço de email do usuário.
    Returns:
        models.User: O objeto usuário, se encontrado, ou None.
    """
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    """
    Cria um novo usuário no banco de dados.
    Args:
        db (Session): Sessão do banco de dados.
        user (schemas.UserCreate): Dados do usuário para criação, incluindo senha em texto plano.
    Returns:
        models.User: O objeto usuário recém-criado.
    """
    hashed_password = get_password_hash(user.password) # Gera o hash da senha antes de armazenar.
    db_user = models.User(
        email=user.email,
        name=user.name,
        hashed_password=hashed_password,
        role=user.role,
        client_id=user.client_id,
        tenant_id=1 # Default tenant for new users
    )
    db.add(db_user) # Adiciona o novo usuário à sessão.
    db.commit() # Confirma a transação no banco de dados.
    db.refresh(db_user) # Atualiza o objeto com os dados do banco (ex: ID gerado).
    return db_user

# --- CLIENT CRUD ---
# Funções para operações CRUD na tabela de clientes (models.Client).

def get_clients(db: Session, tenant_id: int, skip: int = 0, limit: int = 100):
    """
    Retorna uma lista de clientes de um tenant.
    Args:
        db (Session): Sessão do banco de dados.
        tenant_id (int): ID do tenant.
        skip (int): Número de registros a pular (offset para paginação).
        limit (int): Número máximo de registros a retornar.
    Returns:
        List[models.Client]: Lista de objetos cliente.
    """
    return db.query(models.Client).filter(models.Client.tenant_id == tenant_id).offset(skip).limit(limit).all()

def get_client(db: Session, client_id: int):
    """
    Busca um cliente pelo ID.
    Args:
        db (Session): Sessão do banco de dados.
        client_id (int): ID do cliente.
    Returns:
        models.Client: O objeto cliente, se encontrado, ou None.
    """
    return db.query(models.Client).filter(models.Client.id == client_id).first()

def create_client(db: Session, client: schemas.ClientCreate, tenant_id: int):
    """
    Cria um novo cliente no banco de dados.
    Args:
        db (Session): Sessão do banco de dados.
        client (schemas.ClientCreate): Dados do cliente para criação.
        tenant_id (int): ID do tenant.
    Returns:
        models.Client: O objeto cliente recém-criado.
    """
    client_data = client.model_dump()
    db_client = models.Client(**client_data, tenant_id=tenant_id)
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

def update_client(db: Session, client_id: int, client_update: schemas.ClientCreate): # Usando ClientCreate como update por simplificação, idealmente ClientUpdate
    """
    Atualiza um cliente existente.
    """
    db_client = get_client(db, client_id)
    if not db_client:
        return None
    
    update_data = client_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_client, key, value)
    
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

def delete_client(db: Session, client_id: int):
    """
    Deleta um cliente.
    """
    db_client = get_client(db, client_id)
    if not db_client:
        return None
        
    db.delete(db_client)
    db.commit()
    return db_client

# --- MARINA CRUD ---
# Funções para operações CRUD na tabela de marinas (models.Marina).

def get_marinas(db: Session, tenant_id: int):
    """
    Retorna uma lista de todas as marinas de um tenant.
    Args:
        db (Session): Sessão do banco de dados.
        tenant_id (int): ID do tenant.
    Returns:
        List[models.Marina]: Lista de objetos marina.
    """
    return db.query(models.Marina).filter(models.Marina.tenant_id == tenant_id).all()

def create_marina(db: Session, marina: schemas.MarinaCreate, tenant_id: int):
    """
    Cria uma nova marina no banco de dados.
    Args:
        db (Session): Sessão do banco de dados.
        marina (schemas.MarinaCreate): Dados da marina para criação.
        tenant_id (int): ID do tenant.
    Returns:
        models.Marina: O objeto marina recém-criada.
    """
    db_marina = models.Marina(**marina.model_dump(), tenant_id=tenant_id)
    db.add(db_marina)
    db.commit()
    db.refresh(db_marina)
    return db_marina

def update_marina(db: Session, marina_id: int, marina_update: schemas.MarinaCreate):
    db_marina = db.query(models.Marina).filter(models.Marina.id == marina_id).first()
    if not db_marina:
        return None
    
    update_data = marina_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_marina, key, value)
    
    db.commit()
    db.refresh(db_marina)
    return db_marina

def delete_marina(db: Session, marina_id: int):
    db_marina = db.query(models.Marina).filter(models.Marina.id == marina_id).first()
    if db_marina:
        db.delete(db_marina)
        db.commit()
    return db_marina

# --- BOAT CRUD ---
# Funções para operações CRUD na tabela de embarcações (models.Boat).

def get_boats(db: Session, tenant_id: int, client_id: Optional[int] = None):
    """
    Retorna uma lista de embarcações, filtrada por tenant e opcionalmente por ID do cliente.
    Args:
        db (Session): Sessão do banco de dados.
        tenant_id (int): ID do tenant.
        client_id (Optional[int]): ID do cliente para filtrar as embarcações.
    Returns:
        List[models.Boat]: Lista de objetos embarcação.
    """
    query = db.query(models.Boat).filter(models.Boat.tenant_id == tenant_id)
    if client_id:
        query = query.filter(models.Boat.client_id == client_id)
    return query.all()

def get_boat(db: Session, boat_id: int):
    """
    Busca uma embarcação pelo ID.
    Args:
        db (Session): Sessão do banco de dados.
        boat_id (int): ID da embarcação.
    Returns:
        models.Boat: O objeto embarcação, se encontrado, ou None.
    """
    return db.query(models.Boat).filter(models.Boat.id == boat_id).first()

def create_boat(db: Session, boat: schemas.BoatCreate, tenant_id: int):
    """
    Cria uma nova embarcação no banco de dados.
    """
    # Separa os dados da embarcação dos dados dos motores (se houver).
    boat_data = boat.model_dump()
    engines_data = boat_data.pop("engines", [])
    
    # Cria a embarcação com o tenant_id
    db_boat = models.Boat(**boat_data, tenant_id=tenant_id)
    db.add(db_boat)
    db.commit()
    db.refresh(db_boat)
    
    # Cria os motores associados, se houver.
    for engine_data in engines_data:
        db_engine = models.Engine(**engine_data, boat_id=db_boat.id, tenant_id=tenant_id)
        db.add(db_engine)
    
    if engines_data:
        db.commit()
        db.refresh(db_boat)
        
    return db_boat

def update_boat(db: Session, boat_id: int, boat_update: schemas.BoatUpdate):
    """
    Atualiza os dados de uma embarcação e sincroniza seus motores.
    Args:
        db (Session): Sessão do banco de dados.
        boat_id (int): ID da embarcação a ser atualizada.
        boat_update (schemas.BoatUpdate): Dados de atualização da embarcação e lista de motores.
    Returns:
        models.Boat: O objeto embarcação atualizado, ou None se não encontrada.
    """
    db_boat = get_boat(db, boat_id)
    if not db_boat:
        return None

    update_data = boat_update.model_dump(exclude_unset=True, exclude={'engines'})
    for key, value in update_data.items():
        setattr(db_boat, key, value)

    # Sincronização de motores: adicionar novos, atualizar existentes, remover os que não estão na lista.
    if boat_update.engines is not None:
        existing_engine_ids = {engine.id for engine in db_boat.engines}
        incoming_engine_ids = {engine.id for engine in boat_update.engines if engine.id}

        # Deleta motores que não estão mais na lista de entrada
        for engine_id in existing_engine_ids - incoming_engine_ids:
            engine_to_delete = db.query(models.Engine).filter(models.Engine.id == engine_id).first()
            if engine_to_delete: # Verifica se o motor existe antes de deletar
                db.delete(engine_to_delete)

        # Atualiza motores existentes ou cria novos
        for engine_data in boat_update.engines:
            if engine_data.id: # Motor existente (possui ID)
                db_engine = db.query(models.Engine).filter(models.Engine.id == engine_data.id).first()
                if db_engine:
                    for key, value in engine_data.model_dump(exclude_unset=True).items():
                        setattr(db_engine, key, value)
            else: # Novo motor (não possui ID)
                new_engine = models.Engine(**engine_data.model_dump(exclude={'id'}), boat_id=db_boat.id)
                db.add(new_engine)

    db.commit()
    db.refresh(db_boat)
    return db_boat

def delete_boat(db: Session, boat_id: int):
    """
    Deleta uma embarcação e seus motores associados.
    Args:
        db (Session): Sessão do banco de dados.
        boat_id (int): ID da embarcação a ser deletada.
    Returns:
        bool: True se deletado com sucesso, False se não encontrado.
    """
    db_boat = get_boat(db, boat_id)
    if not db_boat:
        return False
    
    # Os motores serão deletados automaticamente devido ao cascade
    db.delete(db_boat)
    db.commit()
    return True

# --- PART CRUD ---
# Funções para operações CRUD na tabela de peças (models.Part).

def get_parts(db: Session, tenant_id: int):
    """
    Retorna uma lista de todas as peças de um tenant.
    Args:
        db (Session): Sessão do banco de dados.
        tenant_id (int): ID do tenant.
    Returns:
        List[models.Part]: Lista de objetos peça.
    """
    return db.query(models.Part).filter(models.Part.tenant_id == tenant_id).all()

def get_part(db: Session, part_id: int):
    """
    Busca uma peça pelo ID.
    Args:
        db (Session): Sessão do banco de dados.
        part_id (int): ID da peça.
    Returns:
        models.Part: O objeto peça, se encontrado, ou None.
    """
    return db.query(models.Part).filter(models.Part.id == part_id).first()

def get_part_by_sku(db: Session, sku: str):
    """
    Busca uma peça pelo SKU.
    Args:
        db (Session): Sessão do banco de dados.
        sku (str): SKU da peça.
    Returns:
        models.Part: O objeto peça, se encontrado, ou None.
    """
    return db.query(models.Part).filter(models.Part.sku == sku).first()

def create_part(db: Session, part: schemas.PartCreate, tenant_id: int):
    """
    Cria uma nova peça no inventário.
    """
    db_part = models.Part(**part.model_dump(), tenant_id=tenant_id)
    db.add(db_part)
    db.commit()
    db.refresh(db_part)
    return db_part

def update_part(db: Session, part_id: int, part_update: schemas.PartUpdate):
    """
    Atualiza os dados de uma peça.
    Args:
        db (Session): Sessão do banco de dados.
        part_id (int): ID da peça a ser atualizada.
        part_update (schemas.PartUpdate): Dados de atualização da peça.
    Returns:
        models.Part: O objeto peça atualizado, ou None se não encontrada.
    """
    db_part = get_part(db, part_id)
    if not db_part:
        return None
    
    update_data = part_update.model_dump(exclude_unset=True) # Obtém apenas os campos que foram definidos no schema de atualização.
    for key, value in update_data.items():
        setattr(db_part, key, value) # Atualiza os atributos do objeto do banco de dados.
    
    db.commit()
    db.refresh(db_part)
    return db_part

def delete_part(db: Session, part_id: int):
    """
    Deleta uma peça do estoque.
    Args:
        db (Session): Sessão do banco de dados.
        part_id (int): ID da peça a ser deletada.
    Returns:
        bool: True se deletado com sucesso, False se não encontrado.
    """
    db_part = get_part(db, part_id)
    if not db_part:
        return False
    
    db.delete(db_part)
    db.commit()
    return True

# --- SERVICE ORDER CRUD ---
# Funções para operações CRUD na tabela de ordens de serviço (models.ServiceOrder).

def get_orders(db: Session, tenant_id: int, status: Optional[str] = None):
    """
    Retorna uma lista de ordens de serviço de um tenant, opcionalmente filtrada por status.
    Carrega os itens e notas relacionadas para evitar N+1 queries.
    Args:
        db (Session): Sessão do banco de dados.
        tenant_id (int): ID do tenant.
        status (Optional[str]): Status da OS para filtrar.
    Returns:
        List[models.ServiceOrder]: Lista de objetos ordem de serviço.
    """
    query = db.query(models.ServiceOrder).filter(models.ServiceOrder.tenant_id == tenant_id).options(
        joinedload(models.ServiceOrder.items), # Carrega os itens da OS
        joinedload(models.ServiceOrder.notes) # Carrega as notas da OS
    ).order_by(desc(models.ServiceOrder.created_at)) # Ordena pelas mais recentes
    if status:
        query = query.filter(models.ServiceOrder.status == status)
    return query.all()

def get_order(db: Session, order_id: int):
    """
    Busca uma ordem de serviço pelo ID.
    Carrega os itens e notas relacionadas.
    Args:
        db (Session): Sessão do banco de dados.
        order_id (int): ID da ordem de serviço.
    Returns:
        models.ServiceOrder: O objeto ordem de serviço, se encontrado, ou None.
    """
    return db.query(models.ServiceOrder).options(
        joinedload(models.ServiceOrder.items),
        joinedload(models.ServiceOrder.notes)
    ).filter(models.ServiceOrder.id == order_id).first()

def create_order(db: Session, order: schemas.ServiceOrderCreate, tenant_id: int):
    """
    Cria uma nova ordem de serviço.
    """
    db_order = models.ServiceOrder(**order.model_dump(), tenant_id=tenant_id)
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

def update_order(db: Session, order_id: int, order_update: schemas.ServiceOrderUpdate):
    """
    Atualiza os dados de uma ordem de serviço.
    Args:
        db (Session): Sessão do banco de dados.
        order_id (int): ID da ordem de serviço a ser atualizada.
        order_update (schemas.ServiceOrderUpdate): Dados de atualização da ordem de serviço.
    Returns:
        models.ServiceOrder: O objeto ordem de serviço atualizado, ou None se não encontrada.
    """
    db_order = get_order(db, order_id)
    if not db_order:
        return None
    
    update_data = order_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_order, key, value)
    
    db.commit()
    db.refresh(db_order)
    return db_order

def add_order_item(db: Session, order_id: int, item: schemas.ServiceItemCreate):
    """
    Adiciona um item a uma ordem de serviço e recalcula o valor total da OS.
    Args:
        db (Session): Sessão do banco de dados.
        order_id (int): ID da ordem de serviço.
        item (schemas.ServiceItemCreate): Dados do item a ser adicionado.
    Returns:
        models.ServiceOrder: A ordem de serviço atualizada com o novo item e total recalculado.
    """
    db_item = models.ServiceItem(**item.model_dump(), order_id=order_id)
    db.add(db_item)
    
    # Recalcula o total da ordem de serviço.
    db_order = get_order(db, order_id) # Pega a OS com os itens carregados para recalcular o total.
    if db_order: # Verifica se a OS foi encontrada
        # Soma o total de todos os itens existentes e adiciona o total do novo item.
        db_order.total_value = sum(i.total for i in db_order.items if i.id != db_item.id) + db_item.total
    
    db.commit()
    db.refresh(db_order) # Refresh para garantir que o total_value atualizado esteja no objeto.
    db.refresh(db_item) # Refresh para garantir que o item adicionado esteja no objeto.
    return db_order

def add_order_note(db: Session, order_id: int, note: schemas.OrderNoteCreate):
    """
    Adiciona uma nota a uma ordem de serviço.
    Args:
        db (Session): Sessão do banco de dados.
        order_id (int): ID da ordem de serviço.
        note (schemas.OrderNoteCreate): Dados da nota a ser adicionada.
    Returns:
        models.OrderNote: O objeto nota recém-criado.
    """
    db_note = models.OrderNote(**note.model_dump(), order_id=order_id)
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

def complete_order(db: Session, order_id: int):
    """
    Completa uma ordem de serviço:
    - Muda o status da OS para "Concluído".
    - Baixa as peças do estoque.
    - Registra os movimentos de estoque.
    - Gera uma transação de receita.
    Args:
        db (Session): Sessão do banco de dados.
        order_id (int): ID da ordem de serviço a ser completada.
    Returns:
        models.ServiceOrder: A ordem de serviço completada, ou None se não encontrada ou já completada.
    """
    db_order = get_order(db, order_id)
    if not db_order or db_order.status == models.OSStatus.COMPLETED:
        return None
    
    # Muda o status da ordem de serviço para CONCLUÍDO.
    db_order.status = models.OSStatus.COMPLETED
    
    # Baixa o estoque das peças utilizadas na ordem de serviço.
    for item in db_order.items:
        if item.type == models.ItemType.PART and item.part_id: # Se o item for uma peça e tiver um part_id
            part = get_part(db, item.part_id)
            if part:
                part.quantity = max(0, part.quantity - item.quantity) # Garante que a quantidade não seja negativa.
                
                # Registra o movimento de saída no estoque.
                movement = models.StockMovement(
                    part_id=part.id,
                    type=models.MovementType.OUT_OS,
                    quantity=item.quantity,
                    description=f"Saída OS #{order_id}",
                    reference_id=str(order_id),
                    user="Sistema" # O usuário deveria vir do contexto de autenticação real.
                )
                db.add(movement)
    
    # Gera uma transação financeira de receita para a ordem de serviço.
    transaction = models.Transaction(
        type="INCOME",
        category="Serviços", # Categoria padrão, pode ser mais granular.
        description=f"Recebimento OS #{order_id}",
        amount=db_order.total_value,
        date=datetime.utcnow(),
        status="PENDING", # Status inicial da receita (pendente de recebimento).
        order_id=order_id
    )
    db.add(transaction)
    
    db.commit()
    db.refresh(db_order)
    return db_order

# --- TRANSACTION CRUD ---
# Funções para operações CRUD na tabela de transações (models.Transaction).

def get_transactions(db: Session, tenant_id: int):
    """
    Retorna uma lista de todas as transações financeiras de um tenant, ordenadas por data.
    Args:
        db (Session): Sessão do banco de dados.
        tenant_id (int): ID do tenant.
    Returns:
        List[models.Transaction]: Lista de objetos transação.
    """
    return db.query(models.Transaction).filter(models.Transaction.tenant_id == tenant_id).order_by(desc(models.Transaction.date)).all()

def create_transaction(db: Session, transaction: schemas.TransactionCreate):
    """
    Cria uma nova transação financeira no banco de dados.
    Args:
        db (Session): Sessão do banco de dados.
        transaction (schemas.TransactionCreate): Dados da transação para criação.
    Returns:
        models.Transaction: O objeto transação recém-criado.
    """
    db_transaction = models.Transaction(**transaction.model_dump())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

# --- STOCK MOVEMENT CRUD ---
# Funções para operações CRUD na tabela de movimentos de estoque (models.StockMovement).

def get_movements(db: Session, tenant_id: int, part_id: Optional[int] = None):
    """
    Retorna uma lista de movimentos de estoque de um tenant, opcionalmente filtrada por ID da peça.
    Args:
        db (Session): Sessão do banco de dados.
        tenant_id (int): ID do tenant.
        part_id (Optional[int]): ID da peça para filtrar os movimentos.
    Returns:
        List[models.StockMovement]: Lista de objetos movimento de estoque.
    """
    query = db.query(models.StockMovement).filter(models.StockMovement.tenant_id == tenant_id).order_by(desc(models.StockMovement.date))
    if part_id:
        query = query.filter(models.StockMovement.part_id == part_id)
    return query.all()

def create_stock_movement(db: Session, movement: schemas.StockMovementCreate, user_name: str, tenant_id: int):
    """
    Registra um movimento de estoque e atualiza a quantidade da peça.
    """
    # 1. Cria o registro de movimento
    movement_data = movement.model_dump()
    if 'user' in movement_data:
        del movement_data['user']
    db_movement = models.StockMovement(**movement_data, user=user_name, tenant_id=tenant_id) # Campo user é string (nome)
    db.add(db_movement)
    
    # 2. Atualiza a quantidade da peça
    part = get_part(db, movement.part_id)
    if part:
        if movement.type == models.MovementType.IN_INVOICE or \
           movement.type == models.MovementType.RETURN_OS or \
           movement.type == models.MovementType.ADJUSTMENT_PLUS:
            part.quantity += movement.quantity
        elif movement.type == models.MovementType.OUT_OS or \
             movement.type == models.MovementType.ADJUSTMENT_MINUS:
            part.quantity -= movement.quantity
        
        db.add(part)
    
    db.commit()
    db.refresh(db_movement)
    return db_movement

# --- CONFIG CRUD ---
# Funções para operações CRUD relacionadas a configurações (fabricantes, modelos, informações da empresa).

def get_manufacturers(db: Session, tenant_id: int, type: Optional[str] = None):
    """
    Retorna uma lista de fabricantes de um tenant, opcionalmente filtrada por tipo (BOAT ou ENGINE).
    Carrega os modelos relacionados para evitar N+1 queries.
    Args:
        db (Session): Sessão do banco de dados.
        tenant_id (int): ID do tenant.
        type (Optional[str]): Tipo do fabricante para filtrar.
    Returns:
        List[models.Manufacturer]: Lista de objetos fabricante.
    """
    query = db.query(models.Manufacturer).filter(models.Manufacturer.tenant_id == tenant_id).options(joinedload(models.Manufacturer.models))
    if type:
        query = query.filter(models.Manufacturer.type == type)
    return query.all()

def create_manufacturer(db: Session, manufacturer: schemas.ManufacturerCreate, tenant_id: int):
    """
    Cria um novo fabricante no banco de dados.
    Args:
        db (Session): Sessão do banco de dados.
        manufacturer (schemas.ManufacturerCreate): Dados do fabricante para criação.
        tenant_id (int): ID do tenant.
    Returns:
        models.Manufacturer: O objeto fabricante recém-criado.
    """
    db_manufacturer = models.Manufacturer(name=manufacturer.name, type=manufacturer.type, tenant_id=tenant_id)
    db.add(db_manufacturer)
    db.commit()
    db.refresh(db_manufacturer)
    return db_manufacturer

def delete_manufacturer(db: Session, manufacturer_id: int):
    """
    Deleta um fabricante pelo ID.
    Args:
        db (Session): Sessão do banco de dados.
        manufacturer_id (int): ID do fabricante a ser deletado.
    Returns:
        models.Manufacturer: O objeto fabricante deletado, ou None se não encontrado.
    """
    db_manufacturer = db.query(models.Manufacturer).filter(models.Manufacturer.id == manufacturer_id).first()
    if db_manufacturer:
        db.delete(db_manufacturer)
        db.commit()
    return db_manufacturer

def create_model(db: Session, manufacturer_id: int, model: schemas.ModelCreate):
    """
    Cria um novo modelo associado a um fabricante.
    Args:
        db (Session): Sessão do banco de dados.
        manufacturer_id (int): ID do fabricante ao qual o modelo será associado.
        model (schemas.ModelCreate): Dados do modelo para criação.
    Returns:
        models.Model: O objeto modelo recém-criado.
    """
    db_model = models.Model(name=model.name, manufacturer_id=manufacturer_id)
    db.add(db_model)
    db.commit()
    db.refresh(db_model)
    return db_model

def delete_model(db: Session, model_id: int):
    """
    Deleta um modelo pelo ID.
    Args:
        db (Session): Sessão do banco de dados.
        model_id (int): ID do modelo a ser deletado.
    Returns:
        models.Model: O objeto modelo deletado, ou None se não encontrado.
    """
    db_model = db.query(models.Model).filter(models.Model.id == model_id).first()
    if db_model:
        db.delete(db_model)
        db.commit()
    return db_model

def get_company_info(db: Session, tenant_id: int):
    """
    Retorna as informações da empresa filtrando pelo tenant_id.
    Args:
        db (Session): Sessão do banco de dados.
        tenant_id (int): ID do tenant.
    Returns:
        models.CompanyInfo: O objeto com as informações da empresa, ou None.
    """
    return db.query(models.CompanyInfo).filter(models.CompanyInfo.tenant_id == tenant_id).first()

def update_company_info(db: Session, info: schemas.CompanyInfoCreate, tenant_id: int):
    """
    Atualiza as informações da empresa para o tenant específico.
    Se não existirem informações, uma nova entrada é criada associada ao tenant.
    Args:
        db (Session): Sessão do banco de dados.
        info (schemas.CompanyInfoCreate): Dados para atualização.
        tenant_id (int): ID do tenant.
    Returns:
        models.CompanyInfo: O objeto atualizado.
    """
    db_info = get_company_info(db, tenant_id)
    if not db_info:
        # Se não houver informações da empresa, cria uma nova.
        db_info = models.CompanyInfo(tenant_id=tenant_id)
        db.add(db_info)

    # Atualiza os atributos do objeto do banco de dados com os dados do schema.
    update_data = info.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_info, key, value)
            
    db.commit()
    db.refresh(db_info)
    return db_info

# --- MAINTENANCE KIT CRUD ---

def get_maintenance_kits(db: Session, tenant_id: int):
    """
    Retorna a lista de kits de manutenção do tenant.
    """
    return db.query(models.MaintenanceKit).filter(models.MaintenanceKit.tenant_id == tenant_id).options(
        joinedload(models.MaintenanceKit.items)
    ).all()

def create_maintenance_kit(db: Session, kit: schemas.MaintenanceKitCreate, tenant_id: int):
    """
    Cria um novo kit de manutenção e seus itens.
    """
    kit_data = kit.model_dump()
    items_data = kit_data.pop("items", [])
    
    db_kit = models.MaintenanceKit(**kit_data, tenant_id=tenant_id)
    db.add(db_kit)
    db.commit()
    db.refresh(db_kit)
    
    for item_data in items_data:
        db_item = models.MaintenanceKitItem(**item_data, kit_id=db_kit.id)
        db.add(db_item)
        
    db.commit()
    db.refresh(db_kit)
    return db_kit

def delete_maintenance_kit(db: Session, kit_id: int):
    """
    Remove um kit de manutenção.
    """
    db_kit = db.query(models.MaintenanceKit).filter(models.MaintenanceKit.id == kit_id).first()
    if db_kit:
        db.delete(db_kit)
        db.commit()
    return db_kit



# --- PARTNER CRUD ---
# Funções para operações CRUD na tabela de parceiros.

def get_partners(db: Session, tenant_id: int, active_only: bool = False):
    """
    Retorna todos os parceiros de um tenant.
    """
    query = db.query(models.Partner).filter(models.Partner.tenant_id == tenant_id)
    if active_only:
        query = query.filter(models.Partner.active == True)
    return query.order_by(models.Partner.name).all()

def get_partner(db: Session, partner_id: int):
    """
    Retorna um parceiro pelo ID.
    """
    return db.query(models.Partner).filter(models.Partner.id == partner_id).first()

def create_partner(db: Session, partner: schemas.PartnerCreate, tenant_id: int):
    """
    Cria um novo parceiro.
    """
    db_partner = models.Partner(**partner.model_dump(), tenant_id=tenant_id)
    db.add(db_partner)
    db.commit()
    db.refresh(db_partner)
    return db_partner

def update_partner(db: Session, partner_id: int, partner_update: schemas.PartnerUpdate):
    """
    Atualiza um parceiro.
    """
    db_partner = get_partner(db, partner_id)
    if not db_partner:
        return None
    
    update_data = partner_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_partner, key, value)
    
    db.commit()
    db.refresh(db_partner)
    return db_partner

def delete_partner(db: Session, partner_id: int):
    """
    Deleta um parceiro.
    """
    db_partner = get_partner(db, partner_id)
    if not db_partner:
        return False
    
    db.delete(db_partner)
    db.commit()
    return True

def rate_partner(db: Session, partner_id: int, new_rating: float):
    """
    Atualiza a avaliação de um parceiro.
    Calcula a média ponderada com avaliações anteriores.
    """
    db_partner = get_partner(db, partner_id)
    if not db_partner:
        return None
    
    # Calcula nova média
    total_ratings = db_partner.total_jobs
    if total_ratings == 0:
        db_partner.rating = new_rating
    else:
        current_total = db_partner.rating * total_ratings
        db_partner.rating = (current_total + new_rating) / (total_ratings + 1)
    
    db_partner.total_jobs += 1
    db.commit()
    db.refresh(db_partner)
    return db_partner


# --- TECHNICAL INSPECTION CRUD ---

def get_inspections(db: Session, tenant_id: int, boat_id: int = None):
    """
    Retorna inspeções de um tenant, opcionalmente filtradas por boat_id.
    """
    query = db.query(models.TechnicalInspection).filter(models.TechnicalInspection.tenant_id == tenant_id)
    if boat_id:
        query = query.filter(models.TechnicalInspection.boat_id == boat_id)
    return query.order_by(models.TechnicalInspection.created_at.desc()).all()

def get_inspection(db: Session, inspection_id: int):
    """
    Retorna uma inspeção pelo ID.
    """
    return db.query(models.TechnicalInspection).filter(models.TechnicalInspection.id == inspection_id).first()

def create_inspection(db: Session, inspection: schemas.TechnicalInspectionCreate, tenant_id: int):
    """
    Cria uma nova inspeção técnica.
    """
    db_inspection = models.TechnicalInspection(**inspection.model_dump(), tenant_id=tenant_id)
    db.add(db_inspection)
    db.commit()
    db.refresh(db_inspection)
    return db_inspection

def update_inspection(db: Session, inspection_id: int, inspection_update: schemas.TechnicalInspectionUpdate):
    """
    Atualiza uma inspeção.
    """
    db_inspection = get_inspection(db, inspection_id)
    if not db_inspection:
        return None
    
    update_data = inspection_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_inspection, key, value)
    
    db.commit()
    db.refresh(db_inspection)
    return db_inspection

def add_checklist_item(db: Session, inspection_id: int, item: schemas.InspectionChecklistItemCreate):
    """
    Adiciona um item ao checklist de uma inspeção.
    """
    db_item = models.InspectionChecklistItem(**item.model_dump(), inspection_id=inspection_id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


# --- PARTNER QUOTE CRUD ---

def get_partner_quotes(db: Session, tenant_id: int, inspection_id: int = None, partner_id: int = None):
    """
    Retorna orçamentos, opcionalmente filtrados por inspeção ou parceiro.
    """
    query = db.query(models.PartnerQuote).filter(models.PartnerQuote.tenant_id == tenant_id)
    if inspection_id:
        query = query.filter(models.PartnerQuote.inspection_id == inspection_id)
    if partner_id:
        query = query.filter(models.PartnerQuote.partner_id == partner_id)
    return query.order_by(models.PartnerQuote.created_at.desc()).all()

def get_partner_quote(db: Session, quote_id: int):
    """
    Retorna um orçamento pelo ID.
    """
    return db.query(models.PartnerQuote).filter(models.PartnerQuote.id == quote_id).first()

def create_partner_quote(db: Session, quote: schemas.PartnerQuoteCreate, tenant_id: int):
    """
    Cria uma solicitação de orçamento para um parceiro.
    """
    db_quote = models.PartnerQuote(**quote.model_dump(), tenant_id=tenant_id)
    db.add(db_quote)
    db.commit()
    db.refresh(db_quote)
    return db_quote

def update_partner_quote(db: Session, quote_id: int, quote_update: schemas.PartnerQuoteUpdate):
    """
    Atualiza um orçamento (resposta do parceiro ou atualização interna).
    """
    db_quote = get_partner_quote(db, quote_id)
    if not db_quote:
        return None
    
    update_data = quote_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_quote, key, value)
    
    # Se foi respondido, atualiza data
    if quote_update.quoted_value and not db_quote.response_date:
        from datetime import datetime
        db_quote.response_date = datetime.utcnow()
    
    db.commit()
    db.refresh(db_quote)
    return db_quote
