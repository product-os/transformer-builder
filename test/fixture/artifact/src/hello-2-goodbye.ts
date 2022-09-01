import { InputManifest } from '@balena/transformers-core';

type message = {
	type: 'message';
	data: {
		content: string;
	};
};

export default async function hello2Goodbye(
	manifest: InputManifest<message>,
): Promise<message> {
	return {
		type: 'message',
		data: {
			content: manifest.input.data.content === 'hello' ? 'goodbye' : '',
		},
	};
}
