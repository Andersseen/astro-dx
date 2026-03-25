import { execSync } from "node:child_process";
import { stdin as input, stdout as output } from "node:process";
import * as readline from "node:readline/promises";
import kleur from "kleur";
import sade from "sade";

const PACKAGES = {
  core: "@astro-dx/core",
  events: "@astro-dx/events",
  attributes: "@astro-dx/attributes",
  elements: "@astro-dx/elements",
} as const;

type PackageKey = keyof typeof PACKAGES;

const DESCRIPTIONS: Record<PackageKey, string> = {
  core: "signal, computed, effect, services - required",
  events: "on, onHover, onKey, onFocus - declarative event bindings",
  attributes: "dx-if, dx-show, dx-for as HTML attributes",
  elements: "dx-if, dx-show, dx-for as custom elements",
};

async function detectPackageManager(): Promise<
  "npm" | "pnpm" | "yarn" | "bun"
> {
  try {
    execSync("pnpm --version", { stdio: "ignore" });
    return "pnpm";
  } catch {}
  try {
    execSync("bun --version", { stdio: "ignore" });
    return "bun";
  } catch {}
  try {
    execSync("yarn --version", { stdio: "ignore" });
    return "yarn";
  } catch {}
  return "npm";
}

function installCommand(pm: string, packages: string[]): string {
  const pkgs = packages.join(" ");
  if (pm === "yarn") return `yarn add ${pkgs}`;
  if (pm === "pnpm") return `pnpm add ${pkgs}`;
  if (pm === "bun") return `bun add ${pkgs}`;
  return `npm install ${pkgs}`;
}

async function init(): Promise<void> {
  const rl = readline.createInterface({ input, output });
  const selected: PackageKey[] = ["core"];

  const keys = Object.keys(PACKAGES).filter(
    (k) => k !== "core",
  ) as PackageKey[];

  for (const key of keys) {
    const answer = await rl.question(
      kleur.cyan(`  Install @astro-dx/${key}? `) +
        kleur.gray(`(${DESCRIPTIONS[key]}) `) +
        kleur.white("[Y/n] "),
    );
    if (answer.toLowerCase() !== "n") {
      selected.push(key);
    }
  }

  rl.close();

  const packagesToInstall = selected.map((k) => PACKAGES[k]);
  const pm = await detectPackageManager();
  const cmd = installCommand(pm, packagesToInstall);

  try {
    execSync(cmd, { stdio: "inherit" });

    if (selected.includes("events")) {
   
        kleur.white("  import { on, onHover } from '@astro-dx/events'"),
      );
    }
    if (selected.includes("attributes")) {
  
    }
    if (selected.includes("elements")) {

    }

  } catch {
   
    process.exit(1);
  }
}

sade("astro-dx")
  .version("0.1.0")
  .describe("Scaffold astro-dx in your Astro project")
  .action(init)
  .parse(process.argv);
