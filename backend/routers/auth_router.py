"""
Este módulo define as rotas da API para autenticação de usuários (login, registro)
e gerenciamento de usuários.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List
from sqlalchemy.orm import Session
from datetime import timedelta

# Importa os esquemas de dados (Pydantic), funções CRUD e utilitários de autenticação.
import models
import schemas
import crud
import auth
from database import get_db # Função de dependência para obter a sessão do banco de dados.

# Cria uma instância de APIRouter com um prefixo e tags para organização na documentação OpenAPI.
router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/login", response_model=schemas.Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(), # Dependência para dados de formulário de login (username e password).
    db: Session = Depends(get_db) # Injeta a sessão do banco de dados.
):
    """
    Endpoint para login de usuário.
    Autentica o usuário e retorna um token de acesso JWT.
    """
    # Normalizar email: remove espaços e coloca em minúsculo
    clean_email = form_data.username.strip().lower()
    
    # Tenta autenticar
    user = auth.authenticate_user(db, clean_email, form_data.password)
    
    if not user:
        # Tenta descobrir o motivo para retornar erro detalhado (DEBUG MODE)
        debug_user = db.query(models.User).filter(models.User.email == clean_email).first()
        if not debug_user:
            detail_msg = f"Usuário não encontrado: '{clean_email}'"
        else:
            detail_msg = f"Senha incorreta para usuário: '{clean_email}'"
            
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail_msg, # Mostra o motivo exato no frontend
            headers={"WWW-Authenticate": "Bearer"}, # Cabeçalho para informar o tipo de autenticação esperada.
        )
    
    # Define a expiração do token de acesso.
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    # Cria o token de acesso com tenant_id
    access_token = auth.create_access_token(
        data={
            "sub": user.email,
            "tenant_id": user.tenant_id  # NOVO: Incluir tenant_id no token
        }, 
        expires_delta=access_token_expires
    )
    
    # Retorna o token de acesso e o tipo do token.
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/refresh-token", response_model=schemas.Token)
def refresh_token(current_user: models.User = Depends(auth.get_current_active_user)):
    """Atualiza o token de acesso (na prática gera um novo com validade estendida)"""
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    # Inclui tenant_id e role no novo token
    access_token = auth.create_access_token(
        data={
            "sub": current_user.email,
            "tenant_id": current_user.tenant_id,
            "role": current_user.role
        },
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# Endpoint DEBUG (TEMPORÁRIO - REMOVER DEPOIS)
@router.get("/debug-check/{email}/{password}")
def debug_check_password(email: str, password: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        return {"result": "User Not Found"}
    
    is_valid = auth.verify_password(password, user.hashed_password)
    
    return {
        "email": user.email,
        "found": True,
        "hash_prefix": user.hashed_password[:10] + "...",
        "input_password_length": len(password),
        "is_valid": is_valid
    }

@router.get("/debug-generate/{password}")
def debug_generate_hash(password: str):
    return {"password": password, "hash": auth.get_password_hash(password)}

# Endpoint MÁGICO para bypass de login (Use com sabedoria)
@router.get("/magic-login/{email}")
def magic_login(email: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        return {"error": "User not found"}
    
    access_token = auth.create_access_token(
        data={
            "sub": user.email,
            "tenant_id": user.tenant_id,
            "role": user.role
        }
    )
    return {"access_token": access_token, "instructions": "Run in browser console: localStorage.setItem('token', 'YOUR_TOKEN'); window.location.href = '/app';"}

@router.get("/auto-login/{email}", response_class=HTMLResponse)
def auto_login(email: str, db: Session = Depends(get_db)):
    """Gera um HTML que faz o login automático e redireciona"""
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        return "<h1>Erro: Usuário não encontrado</h1>"
    
    access_token = auth.create_access_token(
        data={
            "sub": user.email,
            "tenant_id": user.tenant_id,
            "role": user.role
        }
    )
    
    html_content = f"""
    <html>
        <head>
            <title>Login Automático...</title>
        </head>
        <body>
            <h1>Conectando você ao Mare Alta...</h1>
            <p>Se não for redirecionado em 3 segundos, <a href="/app">clique aqui</a>.</p>
            <script>
                console.log("Setting auto-login token...");
                localStorage.setItem('token', '{access_token}');
                setTimeout(function() {{
                    window.location.href = '/app';
                }}, 1000);
            </script>
        </body>
    </html>
    """
    return html_content

@router.get("/me", response_model=schemas.User)
def read_users_me(current_user: schemas.User = Depends(auth.get_current_active_user)):
    """
    Endpoint para obter informações do usuário atualmente logado.
    Requer autenticação via token JWT.
    """
    # 'get_current_active_user' é uma dependência que verifica o token e retorna o usuário autenticado.
    return current_user

@router.post("/register", response_model=schemas.User)
def register(
    user: schemas.UserCreate, # Dados do usuário para registro.
    db: Session = Depends(get_db) # Injeta a sessão do banco de dados.
):
    """
    Endpoint para registrar um novo usuário.
    Apenas um usuário com permissão de Administrador (que o crie) pode usar isso no fluxo atual.
    """
    # Verifica se o email já está registrado.
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        # Se o email já existe, levanta uma exceção HTTP 400 Bad Request.
        raise HTTPException(status_code=400, detail="Email já registrado")
    # Cria o usuário no banco de dados e o retorna.
    return crud.create_user(db=db, user=user)

@router.post("/signup", response_model=schemas.User)
def signup(
    signup_data: schemas.TenantSignup,
    db: Session = Depends(get_db)
):
    """
    Endpoint para registrar UMA NOVA EMPRESA (Tenant) no sistema.
    Cria o Tenant e o Usuário Admin.
    """
    # Verifica se o email já existe (em qualquer tenant, para evitar confusão no login global)
    db_user = crud.get_user_by_email(db, email=signup_data.admin_email)
    if db_user:
        raise HTTPException(status_code=400, detail="Este email já está cadastrado.")
    
    return crud.register_tenant(db=db, signup_data=signup_data)


# === USER MANAGEMENT ENDPOINTS ===

@router.get("/users", response_model=List[schemas.User])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_active_user)
):
    """Lista todos os usuários do tenant."""
    users = db.query(models.User).filter(models.User.tenant_id == current_user.tenant_id).all()
    return users

@router.put("/users/{user_id}", response_model=schemas.User)
def update_user(
    user_id: int,
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_active_user)
):
    """Atualiza um usuário."""
    db_user = db.query(models.User).filter(
        models.User.id == user_id,
        models.User.tenant_id == current_user.tenant_id
    ).first()
    
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    # Atualizar campos
    update_data = user_update.model_dump(exclude_unset=True)
    
    # Se senha foi fornecida, fazer hash
    if  'password' in update_data and update_data['password']:
        update_data['hashed_password'] = auth.get_password_hash(update_data['password'])
        del update_data['password']
    
    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_active_user)
):
    """Deleta um usuário."""
    db_user = db.query(models.User).filter(
        models.User.id == user_id,
        models.User.tenant_id == current_user.tenant_id
    ).first()
    
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    # Não pode deletar a si mesmo
    if db_user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Não é possível deletar seu próprio usuário")
    
    db.delete(db_user)
    db.commit()
    return None
