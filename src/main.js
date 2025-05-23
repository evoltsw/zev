import * as fs from "node:fs";
import * as path from "node:path";
import * as process from "node:process";
import * as zlib from "node:zlib";

import { TarWriter } from "@gera2ld/tarjs";

/**
 * 
 * @param { fs.PathLike } dirPath 
 * @returns { fs.PathOrFileDescriptor[] }
 */
const
	getAllFiles = (dirPath) => {

		const
			files = [],
			items = fs.readdirSync(dirPath, { withFileTypes: true })
		;

		for (const item of items) {

			const fullPath = path.join(dirPath, item.name);

			if (item.isDirectory()) {

				const subFiles = getAllFiles(fullPath);
				files.push(...subFiles);

			} else {

				files.push(fullPath);

			}
		}

		return files;
	},

	target = process.argv[2],

	paths = getAllFiles(target),

	myWriter = new TarWriter()
;

for(const path of paths) {

	const zstdBuf = zlib.zstdCompressSync(fs.readFileSync(path), { level: 22 });
	console.log(`Compressed ${path}: ${Math.floor(zstdBuf.byteLength)} bytes`);
	myWriter.addFile(path, zstdBuf);

}

fs.writeFileSync(`${target}.zev`, zlib.zstdCompressSync(await myWriter.write().then(blob => blob.arrayBuffer()), { level: 22 }));