-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'VENDEDOR',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Configuracao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "percentLucro" REAL NOT NULL DEFAULT 0.40,
    "percentComissao" REAL NOT NULL DEFAULT 0.06,
    "percentImposto" REAL NOT NULL DEFAULT 0.08,
    "custoEmbalagem" REAL NOT NULL DEFAULT 10.00,
    "pecasPorCaixa" INTEGER NOT NULL DEFAULT 20,
    "descontoMaximoLivre" REAL NOT NULL DEFAULT 0.05,
    "freteGratisAcimaCx" INTEGER NOT NULL DEFAULT 5,
    "metaMensalRS" REAL,
    "tetoMEIAnual" REAL NOT NULL DEFAULT 81000.00,
    "atualizadoEm" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Produto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "larguraCm" INTEGER NOT NULL,
    "custoUnitario" REAL NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "empresa" TEXT,
    "cnpjCpf" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Venda" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" INTEGER NOT NULL,
    "data" DATETIME NOT NULL,
    "vendedorId" TEXT NOT NULL,
    "clienteId" TEXT,
    "clienteNomeAvulso" TEXT,
    "produtoId" TEXT NOT NULL,
    "comEmbalagem" BOOLEAN NOT NULL DEFAULT true,
    "metros" REAL NOT NULL,
    "pecas" INTEGER NOT NULL,
    "precoUnitario" REAL NOT NULL,
    "descontoPercent" REAL NOT NULL DEFAULT 0,
    "valorTotal" REAL NOT NULL,
    "custoProduto" REAL NOT NULL,
    "custoEmbalagem" REAL NOT NULL,
    "custoImposto" REAL NOT NULL,
    "custoComissao" REAL NOT NULL,
    "lucroLimpo" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ORCAMENTO',
    "formaPagamento" TEXT NOT NULL DEFAULT 'PIX',
    "observacao" TEXT,
    "shareToken" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "Venda_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Venda_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Venda_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Produto_larguraCm_key" ON "Produto"("larguraCm");

-- CreateIndex
CREATE UNIQUE INDEX "Venda_numero_key" ON "Venda"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "Venda_shareToken_key" ON "Venda"("shareToken");
