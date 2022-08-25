import { Contract, InputManifest, Result } from '@balena/transformer-sdk';
import type { ChrysalisContract } from './types';

export default async function caterpillar2Chrysalis(
	manifest: InputManifest<Contract>,
): Promise<Array<Result<ChrysalisContract>>> {
	const contract: ChrysalisContract = {
		// TODO: handle can safely be set to manifest.input.contract.handle once the property is standard in Jellyfish
		handle: manifest.input.contract.handle || manifest.input.contract.slug,
		type: 'chrysalis',
		data: {},
	};
	return [
		{
			contract,
		},
	];
}
