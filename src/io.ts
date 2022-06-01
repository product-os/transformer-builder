import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';
import * as os from 'os';
import { Contract } from '@balena/transformer-sdk';

export async function readContracts(inputPath: string): Promise<Contract[]> {
	// TODO: add a type guard
	return yaml.loadAll(
		fs.readFileSync(inputPath + '/contracts.yml', 'utf8'),
	) as Contract[];
}

export async function createWorkDir() {
	return fs.promises.mkdtemp(path.join(os.tmpdir(), path.sep), {
		encoding: 'utf8',
	});
}
