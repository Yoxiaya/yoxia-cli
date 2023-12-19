import which from "which";
import child_process from "child_process";
/* 找到npm */
function findNpm() {
    var npms = process.platform === "win32" ? ["npm.cmd"] : ["npm"];
    for (var i = 0; i < npms.length; i++) {
        try {
            which.sync(npms[i]);
            console.log("use npm: " + npms[i]);
            return npms[i];
        } catch (e) {}
    }
    throw new Error("please install npm");
}

/**
 *
 * @param {*} cmd
 * @param {*} args
 * @param {*} fn
 */
/* 运行终端命令 */
function runCmd(cmd, args, fn) {
    args = args || [];
    const runner = child_process.spawn(cmd, args, {
        stdio: "inherit",
    });
    runner.on("close", function (code) {
        if (fn) {
            fn(code);
        }
    });
}
/**
 *
 * @param {*} installArg  执行命令 命令行组成的数组，默认为 install
 */
export default function (installArg = ["install"]) {
    /* 通过第一步,闭包保存npm */
    const npm = findNpm();
    return function (done) {
        /* 执行命令 */
        runCmd(which.sync(npm), installArg, function () {
            /* 执行成功回调 */
            done && done();
        });
    };
}
