import * as fs from "node:fs";
import * as path from "node:path";
import * as process from "node:process";
import * as zlib from "node:zlib";

import * as tar from "tar";

/**
 * 
 * @param { fs.PathLike } dirPath 
 * @returns { fs.PathOrFileDescriptor[] }
 */
const getAllFiles = (dirPath) => {

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
}

const target = process.argv[2];
const paths = getAllFiles(target);
const buffers = [];
const compressedBuffers = []

for(const path of paths) {
	const zstdBuf = zlib.zstdCompressSync(fs.readFileSync(path), { level: 22 })
	console.log(`Compressed ${path}: ${Math.floor(zstdBuf.byteLength)} bytes`);
	buffers.push(zstdBuf);
}

const tarStream = tar.c({ gzip: false }, buffers);

tarStream.on("data", chunk => compressedBuffers.push(chunk));

await new Promise(tarStream.on.bind(tarStream, "end"));

fs.writeFileSync(`${target}.zev`, zlib.zstdCompressSync(Buffer.concat(compressedBuffers), { level: 22 }));