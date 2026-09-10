import { copyFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const hooksDir = join(root, ".git", "hooks");
const sourceDir = join(root, "scripts", "git-hooks");

if (!existsSync(hooksDir)) {
  console.log("No .git/hooks directory — skipping hook install.");
  process.exit(0);
}

for (const name of ["prepare-commit-msg", "commit-msg"]) {
  copyFileSync(join(sourceDir, name), join(hooksDir, name));
  console.log(`Installed ${name}`);
}
