"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("util");
var child_process_1 = require("child_process");
var fs = require("fs");
var repoPath = "/mnt/c/Users/carra/Desktop/PUC/Magister/EVILAB/Repositorios/2021-2-S3-Grupo3-Backend";
var execAsync = (0, util_1.promisify)(child_process_1.exec);
var writeFileAsync = (0, util_1.promisify)(fs.writeFile);
function hours(dates, maxCommitDiffInSec, firstCommitAdditionInMinutes) {
    if (maxCommitDiffInSec === void 0) { maxCommitDiffInSec = 120 * 60; }
    if (firstCommitAdditionInMinutes === void 0) { firstCommitAdditionInMinutes = 120; }
    dates.sort(function (a, b) { return a - b; });
    var diffInSec = dates
        .slice(1)
        .map(function (current, index) { return current - dates[index]; });
    var filteredDiffs = diffInSec.filter(function (diff) { return diff < maxCommitDiffInSec; });
    var res = filteredDiffs.reduce(function (acc, diff) { return acc + diff; }, 0);
    return (res / 60 + firstCommitAdditionInMinutes) / 60;
}
function getAuthStats(repoPath) {
    return __awaiter(this, void 0, void 0, function () {
        var gitCmd, authStats, authorTimestampList, logData, logEntries, currentAuthor, currentStringTimestamp, _i, logEntries_1, entry, authorTimestampSplit, statsSplit, insertions, deletions, filename, loc, totalCommits, totalCtimes, totalFiles, totalLoc, authorsArray, _a, _b, _c, author, stats, finalOutput, err_1;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    gitCmd = "git -C ".concat(repoPath);
                    authStats = {};
                    authorTimestampList = [];
                    return [4 /*yield*/, execAsync("".concat(gitCmd, " log --format=\"%aN|%ct\" --numstat"))];
                case 1:
                    logData = (_d.sent()).stdout;
                    logEntries = logData.split("\n");
                    currentAuthor = "";
                    currentStringTimestamp = "";
                    for (_i = 0, logEntries_1 = logEntries; _i < logEntries_1.length; _i++) {
                        entry = logEntries_1[_i];
                        authorTimestampSplit = entry.split("|");
                        if (authorTimestampSplit.length === 2) {
                            authorTimestampList.push("".concat(currentAuthor, "|").concat(currentStringTimestamp));
                            currentAuthor = authorTimestampSplit[0], currentStringTimestamp = authorTimestampSplit[1];
                            if (!authStats[currentAuthor]) {
                                authStats[currentAuthor] = {
                                    loc: 0,
                                    files: 0,
                                    commits: 1,
                                    ctimes: 1,
                                };
                            }
                            else {
                                authStats[currentAuthor].commits++;
                                authStats[currentAuthor].ctimes++;
                            }
                        }
                        statsSplit = entry.split("\t");
                        if (statsSplit.length === 3) {
                            insertions = statsSplit[0], deletions = statsSplit[1], filename = statsSplit[2];
                            loc = 0;
                            if (insertions !== "-" && deletions !== "-") {
                                loc = parseInt(insertions, 10) + parseInt(deletions, 10);
                            }
                            authStats[currentAuthor].loc += loc;
                            authStats[currentAuthor].files++;
                        }
                    }
                    totalCommits = 0;
                    totalCtimes = 0;
                    totalFiles = 0;
                    totalLoc = 0;
                    authorsArray = [];
                    for (_a = 0, _b = Object.entries(authStats); _a < _b.length; _a++) {
                        _c = _b[_a], author = _c[0], stats = _c[1];
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
                    finalOutput = {
                        totalCommits: totalCommits,
                        totalCtimes: totalCtimes,
                        totalFiles: totalFiles,
                        totalLoc: totalLoc,
                        Authors: authorsArray,
                    };
                    _d.label = 2;
                case 2:
                    _d.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, writeFileAsync("output.json", JSON.stringify(finalOutput, null, 2))];
                case 3:
                    _d.sent();
                    console.log("Estadísticas escritas en 'output.json'.");
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _d.sent();
                    console.error("Error al escribir el archivo:", err_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
getAuthStats(repoPath)
    .then(function () {
    console.log("Proceso completado.");
})
    .catch(function (error) {
    console.error("Error al obtener estadísticas de autoría:", error);
});
