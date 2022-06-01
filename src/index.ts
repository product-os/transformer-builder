import { readContracts } from './io';
import {
	ContractDefinition,
	InputManifest,
	Result,
	Results,
} from '@balena/transformer-sdk';
import { createContract } from './build';
import { ProcessedContractDefinition } from './types';

const inputArtifactPath = 'input/artifact';
const outputArtifactPath = 'output/artifact';

export async function transformBundle(
	manifest: InputManifest,
): Promise<Results> {
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
		const artifactPath = `${outputArtifactPath}/${rawContract.handle}.tar`;
		// TODO: build transformer source
		// const artifactPath =
		// 	rawContract.type === 'transformer'
		// 		? await buildTransformer(
		// 				contract as TransformerContract,
		// 				inputArtifactPath,
		// 				outputArtifactPath,
		// 		  )
		// 		: undefined;
		results.push({
			contract,
			artifactPath,
		});
	}
	return {
		results,
	};
}
