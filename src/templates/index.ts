// TODO: replace with original template using the sdk (transform())

import {
	Contract,
	ContractType,
	InputManifest,
	TransformerContract,
	TransformerType,
	Result,
	yaml,
} from '@balena/transformers-core';
import * as fs from 'fs';
import * as path from 'path';
import * as assert from 'assert';

/* tslint:disable-next-line */
const transformer = yaml.load(
	fs.readFileSync(path.join(__dirname, 'balena.yml')).toString(),
) as Contract<TransformerContract>;

export type BundledContract = TransformerType | ContractType;

export async function transform(transformerName: string) {
	const transformerFunction = await import(`${transformerName}.ts`);
	const outputPath = process.env.OUTPUT || '/output';
	const manifest = await readInput();
	const results = await transformerFunction(manifest);
	await writeOutput(outputPath, results);
}

export async function readInput(): Promise<InputManifest<TransformerType>> {
	assert(process.env.GITHUB_ACTION_PATH);
	const actionPath: string = process.env.GITHUB_ACTION_PATH;
	assert(process.env.GITHUB_WORKSPACE);
	const checkoutPath: string = process.env.GITHUB_WORKSPACE;
	return {
		input: (await yaml.load(
			fs.readFileSync(path.join(checkoutPath, 'balena.yml'), 'utf8'),
		)) as Contract<TransformerType>,
		transformer: (await yaml.load(
			fs.readFileSync(path.join(actionPath, 'balena.yml'), 'utf8'),
		)) as TransformerContract,
		artifactPath: checkoutPath,
	};
}

async function writeOutput(
	outputPath: string,
	results: Array<Result<BundledContract>>,
) {
	await fs.promises.writeFile(outputPath, JSON.stringify(results));
}

transform(transformer.name).catch(console.error);
