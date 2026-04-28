#!/usr/bin/env node
/**
 * Stabiler Dev-Start für ScanDesk:
 * - festes Projektroot (dieses Repo), unabhängig vom aktuellen Terminal-CWD
 * - optional .next löschen (--clean)
 * - Port 3000 freimachen (verhindert „hängende“ kaputte next dev Prozesse)
 */
"use strict";

const { spawnSync, execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
process.chdir(root);

const argv = new Set(process.argv.slice(2));
const wantClean = argv.has("--clean") || process.env.SCAN_DESK_DEV_CLEAN === "1";
const noFreePort = argv.has("--no-free-port");
const isWin = process.platform === "win32";

function die(msg) {
  console.error("\n\x1b[31mScanDesk Dev:\x1b[0m " + msg + "\n");
  process.exit(1);
}

if (!fs.existsSync(path.join(root, "app", "page.tsx"))) {
  die(
    "Kein gültiges ScanDesk-Projekt (app/page.tsx fehlt).\n" +
      "Erwartetes Root:\n  " +
      root,
  );
}

let pkg;
try {
  pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
} catch {
  die("package.json nicht lesbar.");
}
if (pkg.name !== "docscanner") {
  die('Falsches package.json (name muss "docscanner" sein). Gefunden: ' + pkg.name);
}

if (wantClean) {
  const nextDir = path.join(root, ".next");
  if (fs.existsSync(nextDir)) {
    console.log("ScanDesk: entferne .next …");
    fs.rmSync(nextDir, { recursive: true, force: true });
  }
}

if (!noFreePort && !isWin) {
  try {
    const out = execSync("lsof -ti :3000", {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    }).trim();
    if (out) {
      const pids = [...new Set(out.split(/\s+/).filter(Boolean))];
      console.log("ScanDesk: Port 3000 belegt (PID " + pids.join(", ") + ") — beende alte Prozesse …");
      for (const pid of pids) {
        try {
          process.kill(Number(pid), "SIGTERM");
        } catch {
          /* ignore */
        }
      }
      const t0 = Date.now();
      while (Date.now() - t0 < 3000) {
        try {
          execSync("lsof -ti :3000", { stdio: ["pipe", "pipe", "ignore"] });
        } catch {
          break;
        }
      }
    }
  } catch {
    /* Port frei */
  }
}

const nextBin = path.join(root, "node_modules", ".bin", isWin ? "next.cmd" : "next");
if (!fs.existsSync(nextBin)) {
  die("Next.js nicht gefunden. Im Ordner ausführen:\n  npm install\n\n" + root);
}

const spawnOpts = {
  stdio: "inherit",
  cwd: root,
  env: { ...process.env },
};

const result = isWin
  ? spawnSync(nextBin, ["dev"], { ...spawnOpts, shell: true })
  : spawnSync(nextBin, ["dev"], spawnOpts);

process.exit(result.status === null ? 1 : result.status);
