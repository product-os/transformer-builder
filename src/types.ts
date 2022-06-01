import { JSONSchema6 as JSONSchema } from 'json-schema';
import { ContractData } from '@balena/jellyfish-types/build/core';
import { ContractDefinition } from '@balena/transformer-sdk';

export interface BundledTransformerContract
	extends ContractDefinition<{
		targetPlatform?: string;
		input: {
			$ref?: string;
			filter?: JSONSchema;
		};
		output: {
			$ref?: string;
			filter?: JSONSchema;
		};
	}> {}

export interface BundledTypeContract
	extends ContractDefinition<{
		schema?: JSONSchema;
	}> {}

export interface TransformerContract
	extends ProcessedContractDefinition<{
		targetPlatform?: string;
		inputFilter: JSONSchema;
	}> {}

export const inputFilterSchema: JSONSchema = {
	type: 'object',
	required: ['properties', 'type'],
	properties: {
		type: {
			const: 'object',
		},
		properties: {
			type: 'object',
			required: ['type'],
			properties: {
				handle: {
					type: 'object',
				},
				type: {
					type: 'object',
					properties: {
						const: {
							type: 'string',
						},
						pattern: {
							type: 'string',
						},
					},
				},
			},
		},
		required: {
			type: 'array',
			items: {
				type: 'string',
			},
		},
	},
};

export interface ProcessedContractDefinition<TData = ContractData>
	extends Omit<ContractDefinition, 'data'> {
	loop: string;
	version: string;
	data: TData;
}
