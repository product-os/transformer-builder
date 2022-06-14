import { readContracts } from './io';
import {
	ContractDefinition,
	ContractData,
	InputManifest,
	Result,
	transform,
} from '@balena/transformer-sdk';
import { buildTransformer, createContract } from './build';
import { ProcessedContractDefinition } from './types';
import { TransformerContract } from '@balena/transformer-sdk/build/types';

// TODO: mock absolute path for local tests
const inputArtifactPath = 'test/test-bundle-build/input/artifact';
const outputArtifactPath = 'test/test-bundle-build/output/artifact';

export async function transformBundle(
	manifest: InputManifest,
): Promise<Array<Result<ContractDefinition<ContractData>>>> {
	const contracts = (await readContracts(
		inputArtifactPath,
	)) as ContractDefinition[];
	const results: Result[] = [];
	for (const rawContract of contracts) {
		const contract: ProcessedContractDefinition = await createContract(
			rawContract,
			contracts,
			manifest.input.contract.version,
			manifest.input.contract.loop,
		);
		const result = { contract };
		// const artifactPath = `${outputArtifactPath}/${rawContract.handle}.tar`;
		// TODO: build transformer source
		if (rawContract.type === 'transformer') {
			const artifactPath = await buildTransformer(
				contract as TransformerContract,
				inputArtifactPath,
				outputArtifactPath,
			);
			Object.assign(result, { artifactPath });
		}

		results.push(result);
	}
	// console.log(JSON.stringify({results}));
	return results;
}

// TODO:
// startDockerDaemon();

transform(transformBundle);
