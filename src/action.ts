import * as fs from 'fs';
import * as os from 'os';
import * as child_process from 'child_process';
import * as core from '@actions/core';
import * as download from 'download';

async function downloadUpx(): Promise<string> {
    const tmpdir = fs.mkdtempSync("upx-action");
    if (os.type() == "Linux") {
        await download.default('https://github.com/upx/upx-automatic-builds/blob/devel-20190303-16bfa7b-travis/amd64-linux-gcc-8-release/upx-git-16bfa7b846cf.out?raw=true', tmpdir, { filename: "upx" });
        const upx_path = `${tmpdir}/upx`;
        fs.chmodSync(upx_path, "755");
        return upx_path;
    } else if (os.type() == "Darwin") {
        await download.default('https://github.com/upx/upx-automatic-builds/blob/devel-20190303-16bfa7b-travis/amd64-darwin-clang-1000-release/upx-git-16bfa7b846cf.out?raw=true', tmpdir, { filename: "upx" });
        const upx_path = `${tmpdir}/upx`;
        fs.chmodSync(upx_path, "755");
        return upx_path;
    } else if (os.type() == "Windows_NT") {
        await download.default('https://github.com/upx/upx-automatic-builds/blob/devel-20190303-570b2d0-appveyor/amd64-win64-msvc-14.1-release/upx-git-570b2d0e88d1.exe?raw=true', tmpdir, { filename: "upx.exe" });
        const upx_path = `${tmpdir}/upx.exe`;
        fs.chmodSync(upx_path, "755");
        return upx_path;
    }
    throw "unsupported OS";
}

async function runUpx(file: string, upx_path: string) {
    child_process.execSync(`strip ${file}`);
    child_process.execSync(`${upx_path} ${file}`);
}

export async function run() {
    try {
        const file = core.getInput('file', { required: true });

        if (!fs.existsSync(file)) {
            core.setFailed(`File ${file} wasn't found.`);
        }

        const upx_path = await downloadUpx();
        await runUpx(file, upx_path);
    } catch (error) {
        core.setFailed(error.message);
        throw error;
    }
}
