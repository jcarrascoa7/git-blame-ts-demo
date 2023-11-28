import { promisify } from "util";
import { AuthorStats } from "./interfaces/authorStats";
import { exec } from "child_process";
//import * as fs from "fs";
import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const repoPath =
  "/mnt/c/Users/carra/Desktop/PUC/Magister/EVILAB/Repositorios/2021-2-S3-Grupo3-Backend";

const execAsync = promisify(exec);
//const writeFileAsync = promisify(fs.writeFile);

const calculateDistribution = (
  authorStats: AuthorStats,
  totalLoc: number,
  totalCommits: number,
  totalFiles: number
) => {
  const locPercent = ((authorStats.loc / totalLoc) * 100).toFixed(1);
  const comsPercent = ((authorStats.commits / totalCommits) * 100).toFixed(1);
  const filsPercent = ((authorStats.files.size / totalFiles) * 100).toFixed(1);
  return `${locPercent}/${comsPercent}/${filsPercent}`;
};

async function getGPT4Insights(data: any) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "Eres un asistente de profesor especializado en la evaluación de estudiantes en proyectos de software. Recibirás archivos JSON con las estadísticas de los distintos autores de un repositorio en GitHub y deberás extraer conclusiones importantes acerca del trabajo de cada uno en el proyecto.",
        },
        {
          role: "user",
          content: data,
        },
      ],
      model: "gpt-4-1106-preview",
    });
    console.log(completion.choices[0].message.content);
  } catch (err) {
    console.error(err);
    return null;
  }
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
          files: new Set(),
          commits: 1,
          ctimes: 1,
        };
      } else {
        authStats[currentAuthor].commits++;
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
      authStats[currentAuthor].ctimes++;
      authStats[currentAuthor].files.add(filename.trim());
    }
  }

  let totalCommits = 0;
  let totalCtimes = 0;
  let totalFiles = 0;
  let totalLoc = 0;

  for (const [author, stats] of Object.entries(authStats)) {
    totalCommits += stats.commits;
    totalCtimes += stats.ctimes;
    totalFiles += stats.files.size;
    totalLoc += stats.loc;
  }

  const authorsArray = [];

  for (const [author, stats] of Object.entries(authStats)) {
    const distribution = calculateDistribution(
      stats,
      totalLoc,
      totalCommits,
      totalFiles
    );
    authorsArray.push({
      name: author,
      loc: stats.loc,
      coms: stats.commits,
      fils: stats.files.size,
      distribution: distribution,
    });
  }

  const finalOutput = {
    totalCommits,
    totalCtimes,
    totalFiles,
    totalLoc,
    Authors: authorsArray,
  };
  // try {
  //   await writeFileAsync("output.json", JSON.stringify(finalOutput, null, 2));
  //   console.log("Estadísticas escritas en 'output.json'.");
  // } catch (err) {
  //   console.error("Error al escribir el archivo:", err);
  // }

  try {
    const data = JSON.stringify(finalOutput, null, 2);
    await getGPT4Insights(data);
  } catch (err) {
    console.error("Error al obtener insights:", err);
  }
}

getAuthStats(repoPath)
  .then(() => {
    console.log("Proceso completado.");
  })
  .catch((error) => {
    console.error("Error al obtener estadísticas de autoría:", error);
  });
