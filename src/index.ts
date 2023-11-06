import { promisify } from "util";
import { exec } from "child_process";
import { writeFile } from "fs";

const repoPath =
  "/mnt/c/Users/carra/Desktop/PUC/Magister/EVILAB/Repositorios/2021-2-S3-Grupo3-Backend";

const execAsync = promisify(exec);

const RE_AUTHS_BLAME = new RegExp("^author (.+)$", "mg");
const RE_NCOM_AUTH_EM = new RegExp("^\\s*(\\d+)\\s+(.*?)\\s+<(.*)>\\s*$", "mg");
const RE_BLAME_BOUNDS = new RegExp(
  "^\\w+\\s+\\d+\\s+\\d+(\\s+\\d+)?\\s*$[^\\t]*?^boundary\\s*$[^\\t]*?^\\t.*?$",
  "mg"
);
const RE_AUTHS_LOG = new RegExp("^aN(.+?) ct(\\d+)$", "mg");
const RE_STAT_BINARY = new RegExp("^\\s*-\\s*-.*?$", "mg");
const RE_RENAME = new RegExp("\\{.+? => (.+?)\\}", "mg");
const RE_CSPILT = new RegExp("(?<!\\\\),", "g");

async function main(repoPath: string) {
  // Aquí iría la lógica de ejecución de comandos de Git y procesamiento de resultados
  // Por ejemplo, un comando simple de git log podría verse así:
  try {
    const { stdout } = await execAsync("git log", { cwd: repoPath });
    console.log(stdout);
    // Procesamiento adicional aquí
  } catch (error) {
    console.error("Error running git commands:", error);
  }
}

main(repoPath).catch(console.error);
