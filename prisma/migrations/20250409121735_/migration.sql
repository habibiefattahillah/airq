-- CreateTable
CREATE TABLE "WaterQualityEntry" (
    "id" SERIAL NOT NULL,
    "dissolvedOxygenMgL" DOUBLE PRECISION NOT NULL,
    "dissolvedOxygenSaturation" DOUBLE PRECISION NOT NULL,
    "specificConductanceUSCm" DOUBLE PRECISION NOT NULL,
    "temperatureWaterDegC" DOUBLE PRECISION NOT NULL,
    "turbidityNTU" DOUBLE PRECISION NOT NULL,
    "pHStdUnits" DOUBLE PRECISION NOT NULL,
    "tdsMgL" DOUBLE PRECISION NOT NULL,
    "wqi" INTEGER NOT NULL,

    CONSTRAINT "WaterQualityEntry_pkey" PRIMARY KEY ("id")
);
