import { copyFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
const erpPublic = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "Plexi-ERP", "public");

const copies = [
  { from: join(erpPublic, "logo.png"), to: join(dir, "logo.png") },
  { from: join(erpPublic, "icon-192x192.png"), to: join(dir, "icon-192.png") },
  { from: join(erpPublic, "icon-512x512.png"), to: join(dir, "icon-512.png") },
  { from: join(erpPublic, "icon-192x192.png"), to: join(dir, "apple-touch-icon.png") },
];

let copied = 0;
for (const { from, to } of copies) {
  if (existsSync(from) && !existsSync(to)) {
    copyFileSync(from, to);
    copied++;
  }
}

if (copied > 0) {
  console.log(`Copied ${copied} branding asset(s) from Plexi-ERP`);
} else if (existsSync(join(dir, "logo.png"))) {
  console.log("Branding assets already present");
} else {
  console.warn("logo.png missing — add Flexicom logo to public/");
}
