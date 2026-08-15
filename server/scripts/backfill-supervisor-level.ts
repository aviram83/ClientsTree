import prisma from '../src/db';

// One-time backfill: SUPERVISOR nodes must always be at LEVEL_4 (50%).
// Idempotent — the WHERE clause means re-running this is always safe.
async function backfillSupervisorLevel() {
  const result = await prisma.treeNode.updateMany({
    where: {
      status: 'SUPERVISOR',
      NOT: { percentageLevel: 'LEVEL_4' },
    },
    data: { percentageLevel: 'LEVEL_4' },
  });

  console.log(`Backfilled ${result.count} SUPERVISOR node(s) to percentageLevel=LEVEL_4`);
}

backfillSupervisorLevel()
  .catch((error) => {
    console.error('Backfill failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
