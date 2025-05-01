-- CreateTable
CREATE TABLE "verifying" (
    "id" UUID NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verifying_pkey" PRIMARY KEY ("id")
);
