import { TransformerContract } from '@balena/transformers-core';
import { $, chalk, fs, path } from 'zx';
import * as yaml from 'js-yaml';
import { BuildResult } from './transformer';
import { createWorkDir } from './io';

export async function buildTransformer(
	contract: TransformerContract,
	inputArtifactPath: string,
	outputArtifactPath: string,
): Promise<BuildResult> {
	$.verbose = false;
	await $`mkdir -p ${outputArtifactPath}`;
	const runtime = await getTransformerRuntime(contract, inputArtifactPath);
	if (runtime === 'shell') {
		return {
			artifactPath: await saveScript(
				contract,
				inputArtifactPath,
				outputArtifactPath,
			),
		};
	} else if (runtime === 'typescript') {
		const sourcePath = await buildSource(contract, inputArtifactPath);
		const tag = await buildImage(contract, sourcePath);
		return { imagePath: await saveImage(tag, outputArtifactPath) };
	}
	throw Error(`Unknown transformer runtime: ${runtime}`);
}

async function buildSource(
	contract: TransformerContract,
	artifactPath: string,
): Promise<string> {
	$.verbose = false;
	const sourcePath = await createWorkDir();
	await $`cp -rf ${artifactPath}/* ${sourcePath}`;
	await $`cp -f src/templates/index.ts ${sourcePath}/src/`;
	await $`cp -f src/templates/Dockerfile ${sourcePath}/`;
	await fs.promises.writeFile(
		path.join(sourcePath, 'balena.yml'),
		yaml.dump(contract),
	);
	return sourcePath;
}

async function buildImage(
	contract: TransformerContract,
	sourcePath: string,
): Promise<string> {
	$.verbose = false;
	const tag = `${contract.name || contract.slug}:${contract.version}`;
	const buildPlatform = 'linux/amd64';
	const args = [`build`, '--platform', buildPlatform, `--tag`, tag, sourcePath];
	console.log(chalk.blue(`Starting docker build for ${tag}.`));
	const buildProcess = $`docker ${args}`;
	await buildProcess;
	console.log(chalk.blue('Done.'));
	return tag;
}

// TODO: return runtime class
async function getTransformerRuntime(
	contract: TransformerContract,
	artifactPath: string,
): Promise<'shell' | 'typescript'> {
	let shellExists: boolean;
	let tsExists: boolean;
	try {
		shellExists = fs
			.statSync(path.join(artifactPath, 'src', `${contract.name}.sh`))
			.isFile();
	} catch (error) {
		shellExists = false;
	}
	try {
		tsExists = fs
			.statSync(path.join(artifactPath, 'src', `${contract.name}.ts`))
			.isFile();
	} catch (error) {
		tsExists = false;
	}
	if (shellExists && !tsExists) {
		return 'shell';
	}
	if (!shellExists && tsExists) {
		return 'typescript';
	}
	throw Error(
		`Could not find "src/${contract.name}.sh" or "src/${contract.name}.ts".`,
	);
}

async function saveImage(tag: string, artifactPath: string): Promise<string> {
	$.verbose = false;
	console.log(chalk.blue(`Saving docker image ${tag}.`));
	const imagePath = path.join(artifactPath, `${tag}.tar`);
	const args = ['save', tag, '-o', imagePath];
	await $`mkdir -p ${artifactPath}`;
	await $`docker ${args}`;
	console.log(chalk.blue('Done.'));
	return imagePath;
}

async function saveScript(
	contract: TransformerContract,
	inputArtifactPath: string,
	outputArtifactPath: string,
): Promise<string> {
	$.verbose = false;
	console.log(chalk.blue('Copying script to output path.'));
	const inputScriptPath = path.join(
		inputArtifactPath,
		'src',
		`${contract.name}.sh`,
	);
	const outputScriptPath = path.join(outputArtifactPath, `${contract.name}.sh`);
	await $`cp -fv ${inputScriptPath} ${outputScriptPath}`;
	return outputScriptPath;
}
