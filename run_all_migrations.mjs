import { runMigration } from './src/cms/migrations/runMigration.js';

async function execute() {
  console.log("Executing runMigration('all')...");
  const result = await runMigration('all');
  console.log("Migration result:", result);
  process.exit(0);
}

execute();
