/**
 * 用于管理 modal、toast 等弹层的层级
 */

let base = 99999;

export default function () {
    base += 1;
    return base;
}