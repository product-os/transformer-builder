import {
	BundledTransformerContract,
	BundledTypeContract,
	inputFilterSchema,
	ProcessedContractDefinition,
} from './types';
import { ContractDefinition } from '@balena/transformer-sdk';
import { JSONSchema6 as JSONSchema } from 'json-schema';
import * as skhema from 'skhema';
import { TransformerContract } from '@balena/transformer-sdk/build/types';
import { $, chalk, fs, path } from 'zx';
import { render } from 'mustache';
import { createWorkDir } from './io';

export async function createContract(
	inputContract: ContractDefinition,
	contracts: ContractDefinition[],
	bundleVersion: string,
	bundleLoop?: string | null,
): Promise<ProcessedContractDefinition> {
	const contract = {
		handle: inputContract.handle,
		type:
			inputContract.type === 'transformer' ? 'transformer@1.0.0' : 'type@1.0.0',
		loop: bundleLoop || '',
		version: bundleVersion,
		data: inputContract.data || {},
	} as ProcessedContractDefinition;
	if (inputContract.type === 'transformer') {
		const transformerContract = inputContract as BundledTransformerContract;
		const inputFilter = await createInputFilter(
			transformerContract.data.input,
			contracts,
		);
		contract.data = {
			inputFilter,
			targetPlatform: (await isValidTargetPlatform(
				transformerContract.data.targetPlatform,
			))
				? transformerContract.data.targetPlatform
				: 'linux/amd64',
		};
		if (contract.data.inputFilter === undefined) {
			throw new TypeError();
		}
	}
	return contract;
}

async function createInputFilter(
	input: { $ref?: string; filter?: JSONSchema },
	contracts: ContractDefinition[],
): Promise<JSONSchema> {
	if (input.filter) {
		if (!skhema.isValid(input.filter, {}, { schemaOnly: true })) {
			throw new TypeError(
				'ERROR: Could not create transformer contract. "input.filter" is not a valid JSON schema.',
			);
		}
		if (!skhema.isValid(inputFilterSchema, input.filter)) {
			throw new TypeError(
				'ERROR: Could not create transformer contract. "input.filter" does not have the minimum set of properties for a transformer input filter.',
			);
		}
		return input.filter;
	}
	if (input.$ref) {
		const refType = contracts.filter(
			(bundledContract: ContractDefinition) =>
				bundledContract.handle === input.$ref &&
				bundledContract.type === 'type',
		)[0] as BundledTypeContract;
		if (refType === undefined) {
			throw new ReferenceError(
				'Referenced contract in "input.$ref" does not exist in the bundle.',
			);
		}
		return await toJSONSchema(refType);
	}
	throw new TypeError(
		'ERROR: Could not create transformer contract. Both $ref & filter are undefined.',
	);
}

async function isValidTargetPlatform(
	targetPlatform?: string,
): Promise<boolean> {
	switch (targetPlatform) {
		case 'linux/amd64':
		case 'linux/arm64':
		case 'linux/arm/v7':
		case 'linux/arm/v6':
			return true;
		case undefined:
		default:
			return false;
	}
}

async function toJSONSchema(
	contract: BundledTypeContract,
): Promise<JSONSchema> {
	return {
		type: 'object',
		required: ['type'],
		properties: {
			handle: {
				type: 'string',
			},
			type: {
				pattern: `${contract.handle}@*`,
			},
		},
	};
}

export async function buildTransformer(
	contract: TransformerContract,
	inputArtifactPath: string,
	outputArtifactPath: string,
): Promise<string> {
	const sourcePath = await buildSource(contract, inputArtifactPath);
	const tag = await buildImage(contract, sourcePath);
	return await saveImage(tag, outputArtifactPath);
}

async function buildSource(
	contract: TransformerContract,
	artifactPath: string,
): Promise<string> {
	//     Consider build secrets:
	//     if (buildSecrets) {
	//         const tmpDir = await fs.promises.mkdtemp('/tmp/build-secrets-');
	//         for (const key of Object.keys(buildSecrets)) {
	//             const secretPath = path.join(tmpDir, key);
	//             const secretContent = Buffer.from(buildSecrets[key], 'base64');
	//             await fs.promises.writeFile(secretPath, secretContent);
	//             args.push('--secret', `id=${key},src=${secretPath}`);
	//         }
	//     }
	//     //
	$.verbose = false;
	const sourcePath = await createWorkDir();
	const artifactSourcePath = path.join(__dirname, '..', artifactPath);
	await $`cp -a ${artifactSourcePath}/* ${sourcePath}`;
	await renderTemplate(
		path.join(__dirname, 'templates/index.ts.mustache'),
		path.join(sourcePath, 'src/index.ts'),
		contract,
	);
	await renderTemplate(
		path.join(__dirname, 'templates/Dockerfile.mustache'),
		path.join(sourcePath, 'Dockerfile'),
		contract,
	);
	await $`rimraf ${sourcePath}/balena.yml ${sourcePath}/contracts.yml`;
	return sourcePath;
}

async function renderTemplate(
	templatePath: string,
	targetFilePath: string,
	contract: TransformerContract,
): Promise<void> {
	const indexTemplate = await fs.readFile(templatePath);
	await fs.writeFile(
		targetFilePath,
		render(indexTemplate.toString('utf8'), contract),
	);
}

async function buildImage(
	contract: TransformerContract,
	sourcePath: string,
): Promise<string> {
	const tag = contract.handle || contract.slug;
	const buildPlatform = contract.data.targetPlatform || 'linux/amd64';
	const args = [`build`, '--platform', buildPlatform, `--tag`, tag, sourcePath];
	console.log(chalk.blue('Starting docker build.'));
	const buildProcess = $`docker ${args}`;
	// buildProcess.stdout.pipe(process.stdout);
	// buildProcess.stderr.pipe(process.stderr);
	await buildProcess;
	console.log(chalk.blue('Done.'));
	return tag;
}

async function saveImage(tag: string, artifactPath: string): Promise<string> {
	console.log(chalk.blue(`Saving docker image ${tag}.`));
	const imagePath = path.join(artifactPath, `${tag}.tar`);
	const args = ['save', tag, '-o', imagePath];
	await $`mkdir -p ${artifactPath}`;
	await $`docker ${args}`;
	console.log((await $`ls -lh ${artifactPath}`).stdout);
	console.log(chalk.blue('Done.'));
	return imagePath;
}
