import npm from "./npm.js";
import utils from "../utils/index.js";

function runProject() {
    try {
        /* 继续调用 npm 执行，npm start 命令 */
        const start = npm(["start"]);
        start();
    } catch (e) {
        utils.red("自动启动失败，请手动npm start 启动项目");
    }
}
export default runProject;
