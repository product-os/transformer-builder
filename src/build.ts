import {
	BundledTransformerContract,
	BundledTypeContract,
	inputFilterSchema,
	ProcessedContractDefinition,
} from './types';
import { ContractDefinition } from '@balena/transformer-sdk';
import { JSONSchema6 as JSONSchema } from 'json-schema';
import * as skhema from 'skhema';

export async function createContract(
	inputContract: ContractDefinition,
	contracts: ContractDefinition[],
	bundleVersion: string,
	bundleLoop?: string | null,
): Promise<ProcessedContractDefinition> {
	const contract = {
		handle: inputContract.handle,
		type:
			inputContract.type === 'transformer' ? 'transformer@1.0.0' : 'type@1.0.0',
		loop: bundleLoop ? bundleLoop : '',
		version: bundleVersion,
		data: inputContract.data,
	} as ProcessedContractDefinition;
	if (inputContract.type === 'transformer') {
		const transformerContract = inputContract as BundledTransformerContract;
		const inputFilter = await createInputFilter(
			transformerContract.data.input,
			contracts,
		);
		contract.data = {
			inputFilter,
			targetPlatform: (await isValidTargetPlatform(
				transformerContract.data.targetPlatform,
			))
				? transformerContract.data.targetPlatform
				: 'linux/amd64',
		};
		if (contract.data.inputFilter === undefined) {
			throw new TypeError();
		}
	}
	return contract;
}

async function createInputFilter(
	input: { $ref?: string; filter?: JSONSchema },
	contracts: ContractDefinition[],
): Promise<JSONSchema> {
	if (input.filter) {
		if (!skhema.isValid(input.filter, {}, { schemaOnly: true })) {
			throw new TypeError(
				'ERROR: Could not create transformer contract. "input.filter" is not a valid JSON schema.',
			);
		}
		if (!skhema.isValid(inputFilterSchema, input.filter)) {
			throw new TypeError(
				'ERROR: Could not create transformer contract. "input.filter" does not have the minimum set of properties for a transformer input filter.',
			);
		}
		return input.filter;
	}
	if (input.$ref) {
		const refType = contracts.filter(
			(bundledContract: ContractDefinition) =>
				bundledContract.handle === input.$ref &&
				bundledContract.type === 'type',
		)[0] as BundledTypeContract;
		if (refType === undefined) {
			throw new ReferenceError(
				'Referenced contract in "input.$ref" does not exist in the bundle.',
			);
		}
		return await toJSONSchema(refType);
	}
	throw new TypeError(
		'ERROR: Could not create transformer contract. Both $ref & filter are undefined.',
	);
}

async function isValidTargetPlatform(
	targetPlatform?: string,
): Promise<boolean> {
	switch (targetPlatform) {
		case 'linux/amd64':
		case 'linux/arm64':
		case 'linux/arm/v7':
		case 'linux/arm/v6':
			return true;
		case undefined:
		default:
			return false;
	}
}

async function toJSONSchema(
	contract: BundledTypeContract,
): Promise<JSONSchema> {
	return {
		type: 'object',
		required: ['type'],
		properties: {
			handle: {
				type: 'string',
			},
			type: {
				pattern: `${contract.handle}@*`,
			},
		},
	};
}
