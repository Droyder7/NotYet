/**
 * Seed the database with demo data from the command line:
 *   pnpm db:seed        → load demo data (replaces everything)
 *   pnpm db:seed --clear → wipe everything
 */
import { seedDemoData, clearData, getDataCounts } from "../src/lib/demo-data";

async function main() {
  const shouldClear = process.argv.includes("--clear");

  if (shouldClear) {
    await clearData();
    console.log("Database cleared.");
    return;
  }

  await seedDemoData();
  const counts = await getDataCounts();
  console.log("Demo data loaded:");
  console.log(`  Signals:     ${counts.signals}`);
  console.log(`  Intents:     ${counts.intents}`);
  console.log(`  Explorations: ${counts.explorations}`);
  console.log(`  Experiments:  ${counts.experiments}`);
  console.log(`  Candidates:   ${counts.candidates}`);
  console.log(`  Projects:     ${counts.projects}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
