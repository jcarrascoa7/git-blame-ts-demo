import { promisify } from "util";
import { exec } from "child_process";
import * as fs from "fs";

interface AuthorStats {
  loc: number;
  files: number;
  commits: number;
  ctimes: number;
}

const repoPath =
  "/mnt/c/Users/carra/Desktop/PUC/Magister/EVILAB/Repositorios/2021-2-S3-Grupo3-Backend";

const execAsync = promisify(exec);
const writeFileAsync = promisify(fs.writeFile);

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

  const authorTimestampList: string[] = [];

  const { stdout: logData } = await execAsync(
    `${gitCmd} log --format="%aN|%ct" --numstat`
  );

  const logEntries = logData.split("\n");

  let currentAuthor = "";
  let currentStringTimestamp = "";

  for (const entry of logEntries) {
    const authorTimestampSplit = entry.split("|");

    if (authorTimestampSplit.length === 2) {
      authorTimestampList.push(`${currentAuthor}|${currentStringTimestamp}`);
      [currentAuthor, currentStringTimestamp] = authorTimestampSplit;
      if (!authStats[currentAuthor]) {
        authStats[currentAuthor] = {
          loc: 0,
          files: 0,
          commits: 1,
          ctimes: 1,
        };
      } else {
        authStats[currentAuthor].commits++;
        authStats[currentAuthor].ctimes++;
      }
    }

    const statsSplit = entry.split("\t");
    if (statsSplit.length === 3) {
      const [insertions, deletions, filename] = statsSplit;

      let loc = 0;
      if (insertions !== "-" && deletions !== "-") {
        loc = parseInt(insertions, 10) + parseInt(deletions, 10);
      }
      authStats[currentAuthor].loc += loc;
      authStats[currentAuthor].files++;
    }
  }

  let totalCommits = 0;
  let totalCtimes = 0;
  let totalFiles = 0;
  let totalLoc = 0;

  const authorsArray = [];

  for (const [author, stats] of Object.entries(authStats)) {
    totalCommits += stats.commits;
    totalCtimes += stats.ctimes;
    totalFiles += stats.files;
    totalLoc += stats.loc;

    authorsArray.push({
      name: author,
      loc: stats.loc,
      coms: stats.commits,
      fils: stats.files,
    });
  }

  const finalOutput = {
    totalCommits,
    totalCtimes,
    totalFiles,
    totalLoc,
    Authors: authorsArray,
  };

  try {
    await writeFileAsync("output.json", JSON.stringify(finalOutput, null, 2));
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
