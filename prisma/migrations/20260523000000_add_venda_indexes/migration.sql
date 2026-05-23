-- Índices para as queries mais frequentes em Venda

CREATE INDEX IF NOT EXISTS "Venda_vendedorId_idx" ON "Venda"("vendedorId");
CREATE INDEX IF NOT EXISTS "Venda_status_idx" ON "Venda"("status");
CREATE INDEX IF NOT EXISTS "Venda_data_idx" ON "Venda"("data");
CREATE INDEX IF NOT EXISTS "Venda_vendedorId_data_idx" ON "Venda"("vendedorId", "data");
