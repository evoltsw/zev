import * as cp from "node:child_process";
import * as path from "node:path";
import * as process from "node:process"

cp.execFileSync(
	path.resolve(
		__dirname,
		"bin",
		process.platform === 'win32'
			? process.arch === 'x64'
				? 'zstd64.exe'
				: 'zstd32.exe'
			: process.platform === 'darwin'
				?'zstd.darwin'
				:'zstd.linux64'
	)
)