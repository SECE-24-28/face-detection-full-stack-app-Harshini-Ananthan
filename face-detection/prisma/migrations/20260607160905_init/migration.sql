-- CreateTable
CREATE TABLE "Detection" (
    "id" SERIAL NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "faceCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Detection_pkey" PRIMARY KEY ("id")
);
