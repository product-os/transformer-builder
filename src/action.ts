import * as yaml from 'js-yaml';
import * as path from 'path';
import * as fs from 'fs';
import * as assert from 'assert';
import { BundledContract, transform } from './transformer';
import {
	Contract,
	InputManifest,
	Result,
	TransformerType,
	TransformerContract,
	Registry,
	loadImage,
	ArtifactType,
} from '@balena/transformers-core';

export default async function () {
	assert(process.env.GITHUB_ACTION_PATH);
	assert(process.env.GITHUB_WORKSPACE);
	const actionPath: string = process.env.GITHUB_ACTION_PATH;
	const checkoutPath: string = process.env.GITHUB_WORKSPACE;
	const dryRunFlag = (process.env.DRYRUN as string) || 'false';
	const dryRun: boolean = dryRunFlag.toLowerCase() === 'true';
	const registryHostname = process.env.REGISTRY_HOSTNAME || 'ghcr.io';
	const registryPort = process.env.REGISTRY_PORT || '5000';
	const registryProtocol: 'https' | 'http' | 'ssh' | undefined =
		(process.env.REGISTRY_PROTOCOL as 'https' | 'http' | 'ssh' | undefined) ||
		'https';
	const event = JSON.parse(process.env.EVENT || '{}');
	const secrets = JSON.parse(process.env.SECRETS || '{}');
	const registryUsername =
		secrets.REGISTRY_USERNAME || event.pull_request?.user?.login;
	const registryPassword = secrets.REGISTRY_PASSWORD || secrets.GITHUB_TOKEN;
	const registry = new Registry(
		console,
		{
			username: registryUsername,
			token: registryPassword,
		},
		registryHostname,
		registryPort,
		registryProtocol,
	);

	// Create input manifest contract
	const inputManifest: InputManifest<TransformerType> = {
		input: (await yaml.load(
			fs.readFileSync(path.join(checkoutPath, 'balena.yml'), 'utf8'),
		)) as Contract<TransformerType>,
		transformer: (await yaml.load(
			fs.readFileSync(path.join(actionPath, 'balena.yml'), 'utf8'),
		)) as TransformerContract,
		artifactPath: checkoutPath,
		// finalize: event.pull_request.merged,
	};

	// Run L1 Transformer
	const results: Array<Result<BundledContract>> = await transform(
		inputManifest,
	);

	// Upload results to the registry
	if (!dryRun) {
		for (const result of results) {
			const repository: string = `${registryHostname}/${result.contract.loop}/${result.contract.name}`;
			if (result.contract.type === 'transformer') {
				if ('imagePath' in result) {
					const imageSHA: string = await loadImage(result.imagePath as string);
					console.log('repository: ', repository);
					await registry.push(
						`${repository}/${result.contract.type}/artifact`,
						result.contract.version,
						{
							type: ArtifactType.image,
							name: imageSHA,
						},
					);
				} else if ('artifactPath' in result) {
					await registry.push(
						`${repository}/${result.contract.type}/artifact`,
						result.contract.version,
						{
							type: ArtifactType.object,
							value: result.artifactPath,
						},
					);
				} else {
					throw new Error(
						`No artifacts were generated for the transformer ${result.contract.name}`,
					);
				}
			}
			await registry.push(
				`${repository}/${result.contract.type}/contract`,
				result.contract.version,
				{
					type: ArtifactType.object,
					value: result.contract,
				},
			);
			console.log('Success.');
		}
	}
	return results;
}
