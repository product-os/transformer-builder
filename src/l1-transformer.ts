// import { readContracts } from './io';
// import { buildTransformer, createContract } from './build';
import { TransformerBundleType } from './types';
import { InputManifest } from '@balena/transformers-core';
// import { transform } from '@balena/transformer-sdk';

// const inputArtifactPath = '/input/artifact';
// const outputArtifactPath = '/output/artifact';

export default async function transformBundle(
	manifest: InputManifest<TransformerBundleType>,
	// ): Promise<Array<Result<ContractDefinition<ContractData>>>> {
	// const contracts = (await readContracts(
	// 	inputArtifactPath,
	// )) as Contract[];
	// const results: Result[] = [];
	// for (const rawContract of contracts) {
	// 	const contract: ProcessedContractDefinition = await createContract(
	// 		rawContract,
	// 		contracts,
	// 		manifest.input.contract.version,
	// 		manifest.input.contract.loop,
	// 	);
	// 	const result = { contract };
	// 	if (rawContract.type === 'transformer') {
	// 		const artifactPath = await buildTransformer(
	// 			contract as Contract<Transformer>,
	// 			inputArtifactPath,
	// 			outputArtifactPath,
	// 		);
	// 		Object.assign(result, { artifactPath });
	// 	}

	// 	results.push(result);
	// }
	// return results;
): Promise<void> {
	console.log(JSON.stringify(manifest, null, 4));
}

// transform(transformBundle);
