
import config from "@payload-config";
import { generateImportMap } from "payload";

async function run() {
  const sanitized = await config;
  
  sanitized.admin.importMap.baseDir = process.cwd();
  await generateImportMap(sanitized, { force: true, log: true });
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
