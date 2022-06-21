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

const inputArtifactPath = '/input/artifact';
const outputArtifactPath = '/output/artifact';

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
	return results;
}

transform(transformBundle);
