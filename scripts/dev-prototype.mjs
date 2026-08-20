import { spawn } from "node:child_process";
import { resolve } from "node:path";

const nextCli = resolve("node_modules/next/dist/bin/next");

const child = spawn(process.execPath, [nextCli, "dev", "--turbopack"], {
  cwd: process.cwd(),
  stdio: "inherit",
  env: {
    ...process.env,
    SKIP_DB_READY: "1",
    CLIENT_SHOW_DEMO_CLINICS: "true",
  },
});

child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => child.kill(signal));
}
