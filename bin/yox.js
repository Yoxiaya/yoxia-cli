#!/usr/bin/env node
"use strict";
import { program } from "commander";
import inquirer from "inquirer";
import { question } from "./config.js";
import consoleColors from "../utils/index.js";
import createYox from "../src/create.js";
import runProject from "../src/start.js";

const { green } = consoleColors;

program
    .version("0.0.1")
    .option("-d, --debug", "output extra debugging")
    .option("-s, --small", "small output");

program
    .command("create")
    .description("create a project")
    .action(() => {
        green("🍕 🍕 🍕 欢迎使用yox-cli,轻松构建ts项目～ 🎉 🎉 🎉");
        inquirer.prompt(question).then((ans) => {
            if (ans.conf) {
                createYox(ans);
            }
        });
    });

/* start 运行项目 */
program
    .command("run")
    .description("start a project")
    .action(function () {
        green("--------运行项目-------");
        runProject();
    });

/* build 打包项目 */
program
    .command("build")
    .description("build a project")
    .action(function () {
        green("--------构建项目-------");
    });

program.parse(process.argv);
