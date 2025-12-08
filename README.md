# Como Executar

## Pré-requisitos

- **Node.js**
- **PostgreSQL** (via Docker, PgAdmin, etc.)
- **Arquivo `google-credentials.json`** (obtido através do Google Vision)

---

## 1. Baixar o código

```bash
git clone https://github.com/IgoorSouza/trabalho-final-ia.git
cd trabalho-final-ia
```

## 2. Iniciar o PostgreSQL

Crie um banco ou use um existente. Guarde a string de conexão, por exemplo:

```bash
postgresql://usuario:senha@localhost:5432/nomedb?schema=public
```

# Backend

## 1. Configurar variáveis de ambiente

Entre na pasta backend e altere o valor da variável DATABASE_URL no arquivo .env para utilizar sua string de conexão:

```bash
DATABASE_URL="postgresql://usuario:senha@localhost:5432/nomedb?schema=public"
```

## 2. Adicionar credenciais do Google

Copie seu arquivo `google-credentials.json` para a raiz da pasta backend (mesmo local do .env).

## 3. Instalar dependências, rodar migrações e iniciar

Dentro da pasta backend:

```bash
npm install
npx prisma migrate dev
npm run dev
```

A API estará disponível na porta <strong>3000</strong>.

# Frontend

### 1. Entrar na pasta

```bash
cd frontend
```

## 2. Instalar dependências

```bash
npm install
```

## 3. Iniciar o projeto

```bash
npm run dev
```

O frontend ficará disponível no endereço exibido no terminal (ex.: <strong>http://localhost:5173</strong>).
