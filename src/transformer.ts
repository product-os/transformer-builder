import * as assert from 'assert';
import { buildTransformer } from './build';
import { createWorkDir } from './io';
import {
	Contract,
	ContractType,
	InputManifest,
	Result,
	createContract,
	TransformerType,
} from '@balena/transformers-core';

export type BundledContract = TransformerType | ContractType;

export type BuildResult = {
	imagePath?: string;
	artifactPath?: string;
};

export async function transform(
	manifest: InputManifest<BundledContract>,
): Promise<Array<Result<BundledContract>>> {
	assert(manifest.artifactPath);
	const results: Array<Result<BundledContract>> = [];
	if ('transformers' in manifest.input.data) {
		for (const transformerContract of manifest.input.data.transformers) {
			transformerContract.type = 'transformer';
			transformerContract.loop = manifest.input.loop;
			transformerContract.version = manifest.input.version;
			const contract: Contract<TransformerType> = await createContract(
				transformerContract,
			);
			const result: BuildResult = await buildTransformer(
				contract,
				manifest.artifactPath,
				await createWorkDir(),
			);
			results.push({
				contract,
				...result,
			});
		}
	}
	if ('types' in manifest.input.data) {
		for (const typeContract of manifest.input.data.types) {
			typeContract.type = 'type';
			typeContract.loop = manifest.input.loop;
			typeContract.version = manifest.input.version;
			const contract: Contract<ContractType> = await createContract(
				typeContract,
			);
			results.push({ contract });
		}
	}
	return results;
}
