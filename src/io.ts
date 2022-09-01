import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';
import * as os from 'os';
import {
	Contract,
	ContractType,
	InputManifest,
	Results,
} from '@balena/transformers-core';
import { BundledContract } from './transformer';

export async function readContracts(
	inputPath: string,
): Promise<Array<Contract<ContractType>>> {
	// TODO: add a type guard
	return yaml.loadAll(
		fs.readFileSync(path.join(inputPath, 'balena.yml'), 'utf8'),
	) as Array<Contract<ContractType>>;
}

export async function createWorkDir() {
	return fs.promises.mkdtemp(path.join(os.tmpdir(), path.sep), {
		encoding: 'utf8',
	});
}

export async function readInput(inputPath: string) {
	const inputDir = path.dirname(inputPath);
	const manifest = yaml.load(
		(await fs.promises.readFile(inputPath)).toString(),
	) as InputManifest<BundledContract>;
	if (typeof manifest.artifactPath === 'string') {
		manifest.artifactPath = path.join(inputDir, manifest.artifactPath);
	}
	return manifest;
}

export async function writeOutput(outputPath: string, results: Results) {
	await fs.promises.writeFile(outputPath, JSON.stringify(results));
}
