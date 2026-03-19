CREATE TABLE "ModuleCatalog" (
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModuleCatalog_pkey" PRIMARY KEY ("key")
);

CREATE TABLE "ModuleCatalogItem" (
    "key" TEXT NOT NULL,
    "moduleKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModuleCatalogItem_pkey" PRIMARY KEY ("key")
);

CREATE TABLE "ClientModuleItem" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "itemKey" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientModuleItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ClientModuleItem_clientId_itemKey_key" ON "ClientModuleItem"("clientId", "itemKey");
CREATE INDEX "ModuleCatalogItem_moduleKey_idx" ON "ModuleCatalogItem"("moduleKey");
CREATE INDEX "ClientModuleItem_clientId_idx" ON "ClientModuleItem"("clientId");
CREATE INDEX "ClientModuleItem_itemKey_idx" ON "ClientModuleItem"("itemKey");

ALTER TABLE "ModuleCatalogItem"
ADD CONSTRAINT "ModuleCatalogItem_moduleKey_fkey"
FOREIGN KEY ("moduleKey") REFERENCES "ModuleCatalog"("key")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ClientModuleItem"
ADD CONSTRAINT "ClientModuleItem_clientId_fkey"
FOREIGN KEY ("clientId") REFERENCES "Client"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ClientModuleItem"
ADD CONSTRAINT "ClientModuleItem_itemKey_fkey"
FOREIGN KEY ("itemKey") REFERENCES "ModuleCatalogItem"("key")
ON DELETE CASCADE ON UPDATE CASCADE;
