-- AlterTable
ALTER TABLE "Member" ALTER COLUMN "fullName" DROP NOT NULL,
ALTER COLUMN "hireDate" DROP NOT NULL,
ALTER COLUMN "category" DROP NOT NULL;

-- CreateTable
CREATE TABLE "MemberSkill" (
    "id" SERIAL NOT NULL,
    "memberId" INTEGER NOT NULL,
    "skillId" INTEGER NOT NULL,
    "expertiseLevel" INTEGER,
    "expertiseDescription" TEXT,
    "assessmentDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemberSkill_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MemberSkill_memberId_skillId_key" ON "MemberSkill"("memberId", "skillId");

-- AddForeignKey
ALTER TABLE "MemberSkill" ADD CONSTRAINT "MemberSkill_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberSkill" ADD CONSTRAINT "MemberSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
