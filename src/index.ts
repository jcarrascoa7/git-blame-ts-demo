import { promisify } from "util";
import { exec } from "child_process";
import * as fs from "fs";

interface AuthorStats {
  loc: number;
  files: Set<string>;
  commits: number;
  ctimes: number[];
}

const repoPath =
  "/mnt/c/Users/carra/Desktop/PUC/Magister/EVILAB/Repositorios/2021-2-S3-Grupo3-Backend";

const execAsync = promisify(exec);

function hours(
  dates: number[],
  maxCommitDiffInSec: number = 120 * 60,
  firstCommitAdditionInMinutes: number = 120
): number {
  dates.sort((a, b) => a - b);

  const diffInSec = dates
    .slice(1)
    .map((current, index) => current - dates[index]);

  const filteredDiffs = diffInSec.filter((diff) => diff < maxCommitDiffInSec);
  const res = filteredDiffs.reduce((acc, diff) => acc + diff, 0);

  return (res / 60 + firstCommitAdditionInMinutes) / 60;
}

async function getAuthStats(repoPath: string): Promise<void> {
  const gitCmd = `git -C ${repoPath}`;
  const authStats: { [author: string]: AuthorStats } = {};

  const { stdout: logData } = await execAsync(
    `${gitCmd} log --format="%aN|%ct" --numstat`
  );

  const logEntries = logData.split("\n");

  let currentAuthor = "";
  let currentStringTimestamp = "";
  let currentTimestamp = 0;

  for (const entry of logEntries) {
    const authorTimestampSplit = entry.split("|");

    if (authorTimestampSplit.length === 2) {
      [currentAuthor, currentStringTimestamp] = authorTimestampSplit;
      currentTimestamp = parseInt(currentStringTimestamp, 10);
      continue;
    }

    const statsSplit = entry.split("\t");
    if (statsSplit.length === 3) {
      const [insertions, deletions, filename] = statsSplit;
      if (!filename) continue; // Si no hay un nombre de archivo, no procesamos esta línea

      const loc = parseInt(insertions, 10) + parseInt(deletions, 10);
      if (!authStats[currentAuthor]) {
        authStats[currentAuthor] = {
          loc: loc,
          files: new Set([filename.trim()]),
          commits: 1,
          ctimes: [currentTimestamp],
        };
      } else {
        authStats[currentAuthor].loc += loc;
        authStats[currentAuthor].files.add(filename.trim());
        authStats[currentAuthor].commits++;
        authStats[currentAuthor].ctimes.push(currentTimestamp);
      }
    }
  }

  const writeFileAsync = promisify(fs.writeFile);

  try {
    await writeFileAsync("output.json", JSON.stringify(authStats, null, 2));
    console.log("Estadísticas escritas en 'output.json'.");
  } catch (err) {
    console.error("Error al escribir el archivo:", err);
  }
}

getAuthStats(repoPath)
  .then(() => {
    console.log("Proceso completado.");
  })
  .catch((error) => {
    console.error("Error al obtener estadísticas de autoría:", error);
  });
