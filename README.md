# SmartVex

SmartVex é uma plataforma de processamento e aprimoramento de vídeos.

## 🚀 Tecnologias

- **Backend**: FastAPI (Python)
- **Frontend**: Next.js (TypeScript) + Tailwind CSS
- **Processamento**: Celery + FFmpeg
- **Infraestrutura**: Docker & Docker Compose

## 🛠️ Como Iniciar

### Pré-requisitos
- Docker e Docker Compose instalados.
- Make (opcional, para usar os atalhos do Makefile).

### Instalação e Execução

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/Tokisaki7Dev/smartvex.git
   cd smartvex
   ```

2. **Inicie os serviços**:
   Utilizando o Makefile:
   ```bash
   make dev
   ```
   Ou diretamente via Docker Compose:
   ```bash
   docker-compose -f docker/docker-compose.yml up
   ```

3. **Acesse as aplicações**:
   - **Frontend**: [http://localhost:3000](http://localhost:3000)
   - **API (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)

## 📜 Comandos Disponíveis (Makefile)

- `make dev`: Inicia todos os serviços em modo de desenvolvimento.
- `make build`: Reconstrói todos os containers Docker.
- `make stop`: Para todos os serviços em execução.
- `make clean`: Remove todos os containers e volumes.

## 📂 Estrutura do Projeto

- `backend/`: Código fonte do servidor API e workers.
- `frontend/`: Código fonte da aplicação web.
- `docker/`: Configurações de containers e Docker Compose.
- `design.jpg`: Referência visual do projeto.
