
import path from "path";
import config from "@payload-config";
import { generateTypes } from "../node_modules/payload/dist/bin/generateTypes.js";

async function run() {
  const sanitized = await config;
  // The config derives its outputFile from its own dir; once bundled into
  // scripts/ that resolves to scripts/payload-types.ts. Pin it to the project
  // root (cwd) so the generated file lands where the app imports it from.
  sanitized.typescript.outputFile = path.resolve(process.cwd(), "payload-types.ts");
  await generateTypes(sanitized, { log: true });
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
