import * as sdk from '@balena/transformer-sdk';
import { Transformer } from './transformer';

sdk.transform((manifest) => {
	// assume manifest is of type 'transformer-bundle'
	const transformer = new Transformer(manifest);
	console.log(transformer.typeList);
	console.log(transformer.transformerList);
	return transformer.transform();
});

// export function trueGuy () {
//     const name = 'trueGuy'
//     printHello(name)
//     return true
// }

// export function printHello (name: string) {
//     console.log(`Hi my name is ${name}`)
//     return true
// }
