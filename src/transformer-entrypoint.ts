import { transform } from './transformer';
import { BundledContract } from './transformer';
import { readInput, writeOutput } from './io';
import { InputManifest, Results } from '@balena/transformers-core';
import { assert } from 'console';

export async function main(
	callback: (manifest: InputManifest<BundledContract>) => Promise<Results>,
) {
	assert(process.env.INPUT);
	assert(process.env.OUTPUT);
	const inputPath = process.env.INPUT as string;
	const outputPath = process.env.OUTPUT;
	const manifest = await readInput(inputPath);
	const results = await callback(manifest);
	await writeOutput(outputPath as string, results);
}

main(transform).catch(console.error);
