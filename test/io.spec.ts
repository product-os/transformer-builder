import * as fs from 'fs';
import * as utils from '../src/io';

describe('utils.createWorkDir', function () {
	it('should create a valid path', async function () {
		const tempDir = await utils.createWorkDir();
		expect(fs.existsSync(tempDir)).toBe(true);
	});
	it('should create a directory', async function () {
		const tempDir = await utils.createWorkDir();
		expect(fs.lstatSync(tempDir).isDirectory()).toBe(true);
	});
});

describe('utils.loadContracts', function () {
	it('should load all contracts', async function () {
		expect(typeof (await utils.readContracts('/input/artifact'))).toBe(
			'object',
		);
	});
});
