import { Contract, InputManifest, Result } from '@balena/transformer-sdk';
import type { ButterflyContract } from './types';

export default async function chrysalis2Butterfly(
	manifest: InputManifest<Contract>,
): Promise<Array<Result<ButterflyContract>>> {
	const contract: ButterflyContract = {
		// TODO: handle can safely be set to manifest.input.contract.handle once the property is standard in Jellyfish
		handle: manifest.input.contract.handle || manifest.input.contract.slug,
		type: 'butterfly',
		data: {
			numWings: 2,
		},
	};
	return [
		{
			contract: contract as ButterflyContract,
		},
	];
}
