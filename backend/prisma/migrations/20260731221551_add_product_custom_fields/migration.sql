-- CreateTable
CREATE TABLE "product_custom_fields" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "fieldType" VARCHAR(50) NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "productSubcategoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_custom_fields_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "product_custom_fields" ADD CONSTRAINT "product_custom_fields_productSubcategoryId_fkey" FOREIGN KEY ("productSubcategoryId") REFERENCES "product_subcategories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
