import action from '../src/action';
import * as fs from 'fs';

jest.setTimeout(600000);
describe('action', function () {
	it('should bootstrap', async function () {
		process.env.GITHUB_ACTION_PATH = '.';
		process.env.GITHUB_WORKSPACE = 'test/fixture/artifact';
		process.env.REGISTRY_HOSTNAME = 'localhost';
		process.env.REGISTRY_PROTOCOL = 'http';
		process.env.DRYRUN = 'true';
		const results = await action();
		expect(typeof results[0].imagePath).toBe('string');
		await fs.promises.access(results[0].imagePath as string, fs.constants.R_OK);
	});
});
