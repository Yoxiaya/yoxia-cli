import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "fs";
import utils from "../utils/index.js";
import npm from "./npm.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let fileCount = 0; /* 文件数量 */
let dirCount = 0; /* 文件夹数量 */
let flat = 0; /* readir数量 */
let isInstall = false;

export default function (res) {
    utils.green("------开始构建-------");
    const sourcePath = __dirname.slice(0, -3) + "template";
    utils.blue("当前路径:" + process.cwd());
    revisePackageJson(res, sourcePath).then(() => {
        copy(sourcePath, process.cwd(), npm());
    });
}
function revisePackageJson(res, sourcePath) {
    return new Promise((resolve) => {
        /* 读取文件 */
        fs.readFile(sourcePath + "/package.json", (err, data) => {
            if (err) throw err;
            const { author, name } = res;
            let json = data.toString();
            /* 替换模版 */
            json = json.replace(/template-name/g, name.trim());
            json = json.replace(/template-author/g, author.trim());
            const path = process.cwd() + "/package.json";
            /* 写入文件 */
            fs.writeFile(path, Buffer.from(json), () => {
                utils.green("创建文件：" + path);
                resolve();
            });
        });
    });
}

/**
 *
 * @param {*} sourcePath   //template资源路径
 * @param {*} currentPath  //当前项目路径
 * @param {*} cb           //项目复制完成回调函数
 */
function copy(sourcePath, currentPath, cb) {
    flat++;
    /* 读取文件夹下面的文件 */
    fs.readdir(sourcePath, (err, paths) => {
        flat--;
        if (err) {
            throw err;
        }
        paths.forEach((path) => {
            if (path !== ".git" && path !== "package.json") fileCount++;
            const newSourcePath = sourcePath + "/" + path;
            const newCurrentPath = currentPath + "/" + path;
            /* 判断文件信息 */
            fs.stat(newSourcePath, (err, stat) => {
                if (err) {
                    throw err;
                }
                /* 判断是文件，且不是 package.json  */
                if (stat.isFile() && path !== "package.json") {
                    /* 创建读写流 */
                    const readSteam = fs.createReadStream(newSourcePath);
                    const writeSteam = fs.createWriteStream(newCurrentPath);
                    readSteam.pipe(writeSteam);
                    utils.green("创建文件：" + newCurrentPath);
                    fileCount--;
                    completeControl(cb);
                    /* 判断是文件夹，对文件夹单独进行 dirExist 操作 */
                } else if (stat.isDirectory()) {
                    if (path !== ".git" && path !== "package.json") {
                        dirCount++;
                        dirExist(newSourcePath, newCurrentPath, copy, cb);
                    }
                }
            });
        });
    });
}

/**
 *
 * @param {*} sourcePath  //template资源路径
 * @param {*} currentPath  //当前项目路径
 * @param {*} copyCallback  // 上面的 copy 函数
 * @param {*} cb    //项目复制完成回调函数
 */
function dirExist(sourcePath, currentPath, copyCallback, cb) {
    fs.exists(currentPath, (ext) => {
        if (ext) {
            /* 递归调用copy函数 */
            copyCallback(sourcePath, currentPath, cb);
        } else {
            fs.mkdir(currentPath, () => {
                fileCount--;
                dirCount--;
                copyCallback(sourcePath, currentPath, cb);
                utils.yellow("创建文件夹：" + currentPath);
                completeControl(cb);
            });
        }
    });
}
function completeControl(cb) {
    /* 三变量均为0，异步I/O执行完毕。 */
    if (fileCount === 0 && dirCount === 0 && flat === 0) {
        utils.green("------构建完成-------");
        if (cb && !isInstall) {
            isInstall = true;
            utils.blue("-----开始install-----");
            cb(() => {
                utils.blue("-----完成install-----");
            });
        }
    }
}
