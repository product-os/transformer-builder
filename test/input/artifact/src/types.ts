import { ContractDefinition } from '@balena/transformer-sdk';

export interface EggData {
	[k: string]: unknown;
}

export interface EggContract extends ContractDefinition<EggData> {
	type: 'egg';
}

export interface CaterpillarData {
	numLegs: number;
	[k: string]: unknown;
}

export interface CaterpillarContract
	extends ContractDefinition<CaterpillarData> {
	type: 'caterpillar';
}

export interface ChrysalisData {
	[k: string]: unknown;
}

export interface ChrysalisContract extends ContractDefinition<ChrysalisData> {
	type: 'chrysalis';
}

export interface ButterflyData {
	numWings: number;
	[k: string]: unknown;
}

export interface ButterflyContract extends ContractDefinition<ButterflyData> {
	type: 'butterfly';
}

// cmfcruz: await sdk.query({type: "object", properties: { type: { const: 'whisper@1.0.0' } , data: {type: "object", properties: { actor: {const: '194e8b72-07bc-4981-9d75-5e5c81ad0d74'} } } } },{limit:10})
// paulokinho: await sdk.query({type: "object", properties: { type: { const: 'whisper@1.0.0' } , data: {type: "object", properties: { actor: {const: '038d85e6-71aa-4778-b571-ff04e5ed7657'} } } } },{limit:10})
// natasakyvetou: await sdk.query({type: "object", properties: { type: { const: 'whisper@1.0.0' } , data: {type: "object", properties: { actor: {const: '2dfcddbb-8c51-4946-83e0-faa80f604adb'} } } } },{limit:10})
