# Guia de Deploy - Mare Alta

Este documento detalha como realizar o deploy da aplicação Mare Alta utilizando Docker e Docker Compose.

## Pré-requisitos

- Docker instalado e rodando.
- Docker Compose instalado.

## Estrutura dos Containers

O sistema é composto por 3 serviços:
1. **db**: Banco de dados PostgreSQL 15.
2. **backend**: API FastAPI (Python 3.9).
3. **frontend**: Servidor Web Nginx servindo a aplicação React (Vite).

## Instruções de Deploy

### 1. Preparação

Certifique-se de estar na raiz do projeto.

Se você possui um Certificado Digital A1 (.pfx) para emissão fiscal, coloque-o na pasta:
`backend/certs/`

Exemplo: `backend/certs/meu_certificado.pfx`

**Importante:** Após iniciar o sistema, vá em **Configurações -> Empresa** e no campo "Nome do Arquivo do Certificado", informe o caminho relativo: `certs/meu_certificado.pfx`.

### 2. Iniciando os Serviços

Execute o seguinte comando para construir e iniciar os containers:

```bash
docker-compose up --build -d
```

O parâmetro `-d` roda os containers em segundo plano (detached mode).

### 3. Verificando o Status

Para ver se tudo subiu corretamente:

```bash
docker-compose ps
```

Para acompanhar os logs:

```bash
docker-compose logs -f
```

### 4. Acessando a Aplicação

- **Frontend (Aplicação Web):** Acesse [http://localhost:3000](http://localhost:3000)
- **Backend (Docs API):** Acesse [http://localhost:3000/docs](http://localhost:3000/docs) (Redirecionado via Nginx) ou [http://localhost:8000/docs](http://localhost:8000/docs) (Direto)

## Configuração de Ambiente (.env)

O `docker-compose.yml` já define valores padrão para testes. Para produção, crie um arquivo `.env` na raiz com as variáveis seguras:

```env
POSTGRES_USER=seu_usuario
POSTGRES_PASSWORD=sua_senha_segura
POSTGRES_DB=marealta
SECRET_KEY=sua_secret_key_super_segura
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

## Persistência de Dados

- Os dados do banco PostgreSQL são salvos em um volume Docker chamado `postgres_data`. Eles não serão perdidos se você reiniciar os containers.
- Os certificados digitais na pasta `backend/certs` são mapeados via *bind mount*, então arquivos colocados lá na sua máquina host estarão disponíveis para o container.

## Solução de Problemas

**Erro de permissão no script shell (se houver):**
Execute `chmod +x nome_do_script.sh`.

**Porta em uso:**
Se a porta 3000 ou 8000 estiver ocupada, edite o `docker-compose.yml` e altere o mapeamento de portas (ex: `"3001:80"`).

**Rebuild forçado:**
Se alterar dependências (requirements.txt ou package.json), force a reconstrução:
```bash
docker-compose up --build -d
```
