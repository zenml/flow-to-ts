// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as fs from "fs";
import * as flow from "./flow";
import * as path from "path";
import { expectEOF, expectSingleResult } from "./parsec";
import { printTypeScript } from "./PrintTS";

function readWrite(filePath: string, outputPath: string) {
    //根据文件路径读取文件，返回文件列表
    fs.readdir(filePath, function (err, files) {
        if (err) {
            console.warn(err);
        } else {
            //遍历读取到的文件列表
            files.forEach(function (filename) {
                //获取当前文件的绝对路径
                const filedir = path.join(filePath, filename);
                //根据文件路径获取文件信息，返回一个fs.Stats对象
                fs.stat(filedir, function (eror, stats) {
                    if (eror) {
                        console.warn("获取文件stats失败");
                    } else {
                        const isFile = stats.isFile(); //是文件
                        const isDir = stats.isDirectory(); //是文件夹
                        if (isFile) {
                            const flowSourceCode = fs.readFileSync(filedir, {
                                encoding: "utf-8",
                            });
                            let tsSourceCode = "";
                            try {
                                tsSourceCode = `
                                ${printTypeScript(
                                    expectSingleResult(
                                        expectEOF(
                                            flow.PROGRAM.parse(
                                                flow.tokenizer.parse(
                                                    flowSourceCode
                                                )
                                            )
                                        )
                                    ),
                                    true,
                                    { useReactNull: false }
                                )}`;
                                fs.writeFileSync(
                                    outputPath +
                                        "/" +
                                        filename.slice(0, -3) +
                                        ".ts",
                                    tsSourceCode,
                                    { encoding: "utf-8" }
                                );
                            } catch (err) {
                                throw new Error(filename + err);
                            }
                        }
                        if (isDir) {
                            readWrite(filedir, outputPath); //递归，如果是文件夹，就继续遍历该文件夹下面的文件
                        }
                    }
                });
            });
        }
    });
}

function main(): void {
    const inputPath = path.join(__dirname, `../../recoil/test/`);
    const outputPath = path.join(__dirname, `../../recoil/ts`);
    readWrite(inputPath, outputPath);
}

main();
