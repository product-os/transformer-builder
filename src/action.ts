import transformBundle from './l1-transformer';
import { TransformerBundleType } from './types';
import {
	Contract,
	InputManifest,
	// Results,
	TransformerContract,
} from '@balena/transformers-core';
import * as yaml from 'js-yaml';
import * as path from 'path';
import * as fs from 'fs';

// Workout the path to input source and action source
// Read contracts from these directories
export async function main() {
	const appPath: string = process.env.APP_PATH || '/usr/src/app';
	const inputPath: string = (process.env.INPUT_PATH as string) || '/input';
	const inputArtifactPath: string = path.join(
		inputPath || '/input',
		'artifact',
	);
	// const outputPath = process.env.OUTPUT_PATH || '/output';
	// const outputArtifactPath = path.join(outputPath || '/output', 'artifacts');
	const secrets = JSON.parse(process.env.SECRETS || '{}');
	const inputManifest: InputManifest<TransformerBundleType> = {
		input: (await yaml.load(
			fs.readFileSync(path.join(inputPath, 'balena.yml'), 'utf8'),
		)) as Contract<TransformerBundleType>,
		transformer: (await yaml.load(
			fs.readFileSync(path.join(appPath, 'balena.yml'), 'utf8'),
		)) as TransformerContract,
		artifactPath: inputArtifactPath,
		decryptedSecrets: secrets,
		decryptedTransformerSecrets: secrets,
		// finalize: event.pull_request.merged,
	};
	// const results: Results = transformBundle(inputManifest);
	await transformBundle(inputManifest);
	// console.log(results);
	// TODO: add registry publishing logic from transformers-action
}

main();
