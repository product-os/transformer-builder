import { Contract, InputManifest, Result } from '@balena/transformer-sdk';
import type { CaterpillarContract } from './types';

export default async function egg2Caterpillar(
	manifest: InputManifest<Contract>,
): Promise<Array<Result<CaterpillarContract>>> {
	const contract: CaterpillarContract = {
		// TODO: handle can safely be set to manifest.input.contract.handle once the property is standard in Jellyfish
		handle: manifest.input.contract.handle || manifest.input.contract.slug,
		type: 'caterpillar',
		data: {
			numLegs: 16,
		},
	};
	return [
		{
			contract,
		},
	];
}
