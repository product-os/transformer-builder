import { createContract } from '../src/build';
import {
	BundledTransformerContract,
	ProcessedContractDefinition,
	TransformerContract,
} from '../src/types';
import { ContractDefinition } from '@balena/transformer-sdk';
import * as yaml from 'js-yaml';
import * as fs from 'fs';

jest.setTimeout(60 * 1000);
describe('convertContract', function () {
	const manifest = {
		input: {
			contract: yaml.load(
				fs.readFileSync('/input/artifact/balena.yml', 'utf8'),
			) as ProcessedContractDefinition,
		},
	};
	const contracts: ContractDefinition[] = yaml.loadAll(
		fs.readFileSync('/input/artifact/contracts.yml', 'utf8'),
	) as ContractDefinition[];
	const transformerContractWithRef: BundledTransformerContract = {
		handle: 'egg-2-caterpillar',
		type: 'transformer',
		data: { input: { $ref: 'egg' }, output: { $ref: 'caterpillar' } },
	};
	const resolvedContractFromRef: TransformerContract = {
		handle: 'egg-2-caterpillar',
		type: 'transformer@1.0.0',
		loop: '',
		version: '0.2.1',
		data: {
			inputFilter: {
				type: 'object',
				required: [
					'type', // versioned
				],
				properties: {
					handle: {
						type: 'string',
					},
					type: {
						pattern: 'egg@*', // transformer should be compatible with the type it was written for up to the next major version
					},
				},
			},
			targetPlatform: 'linux/amd64',
		},
	};
	it('should return a valid transformer contract', async function () {
		expect(
			await createContract(
				transformerContractWithRef,
				contracts,
				manifest.input.contract.version,
			),
		).toMatchObject(resolvedContractFromRef);
	});

	const transformerContractWithSchema: BundledTransformerContract = {
		handle: 'caterpillar-2-chrysalis',
		type: 'transformer',
		data: {
			input: {
				filter: {
					type: 'object',
					required: ['handle', 'type'],
					properties: {
						handle: {
							type: 'string',
						},
						type: {
							pattern: 'caterpillar@*',
						},
					},
				},
			},
			output: {
				$ref: 'chrysalis',
			},
		},
	};
	const resolvedContractFromSchema: TransformerContract = {
		handle: 'caterpillar-2-chrysalis',
		type: 'transformer@1.0.0',
		loop: '',
		version: '0.2.1',
		data: {
			inputFilter: {
				type: 'object',
				required: [
					'handle', // won't exist yet
					'type', // versioned
				],
				properties: {
					handle: {
						type: 'string',
					},
					type: {
						pattern: 'caterpillar@*', // transformer should be compatible with the type it was written for up to the next major version
					},
				},
			},
			targetPlatform: 'linux/amd64',
		},
	};
	it('should embed the input schema filter as "inputFilter"', async function () {
		expect(
			await createContract(
				transformerContractWithSchema,
				contracts,
				manifest.input.contract.version,
			),
		).toMatchObject(resolvedContractFromSchema);
	});

	const transformerContractWithEmptyInput: BundledTransformerContract = {
		handle: 'caterpillar-2-chrysalis',
		type: 'transformer',
		data: {
			input: {},
			output: {
				$ref: 'chrysalis',
			},
		},
	};

	it('should throw an error if both "input.filter" & "input.$ref" are undefined', async function () {
		await expect(async () => {
			await createContract(
				transformerContractWithEmptyInput,
				contracts,
				manifest.input.contract.version,
			);
		}).rejects.toThrowError(
			'ERROR: Could not create transformer contract. Both $ref & filter are undefined.',
		);
	});

	const transformerContractWithInvalidSchema = {
		handle: 'caterpillar-2-chrysalis',
		type: 'transformer',
		data: {
			input: {
				filter: {
					type: 'caterpillar',
				},
			},
			output: {
				$ref: 'chrysalis',
			},
		},
	} as unknown as BundledTransformerContract;

	it('should throw an error if "input.$ref" is undefined & "input.filter" is not a valid JSON schema.', async function () {
		await expect(async () => {
			await createContract(
				transformerContractWithInvalidSchema,
				contracts,
				manifest.input.contract.version,
			);
		}).rejects.toThrowError(
			'ERROR: Could not create transformer contract. "input.filter" is not a valid JSON schema.',
		);
	});
});
