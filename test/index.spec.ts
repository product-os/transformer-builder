// import * as transformer from '../src/index';
import * as yaml from "js-yaml";
import * as fs from "fs";
import {Contract, InputManifest} from "@balena/transformer-sdk";
import {transformBundle} from "../src";
import {TransformerContract} from "@balena/transformer-sdk/build/types";

describe('transformBundle', function ( ) {
    it('should return expected list of transformers & types', async function () {
        const manifest: InputManifest = {
            input: {
                contract: yaml.load(fs.readFileSync('input/artifact/balena.yml', 'utf8')) as Contract,
                transformerContract: yaml.load(fs.readFileSync('balena.yml', 'utf8')) as TransformerContract,
                artifactPath: 'input/artifact',
            }
        }
        const expectedResults = JSON.parse('{"results":[{"contract":{"handle":"egg","type":"type@1.0.0","loop":"","version":"0.2.1"},"artifactPath":""},{"contract":{"handle":"caterpillar","type":"type@1.0.0","loop":"","version":"0.2.1","data":{"schema":{"type":"object","required":["numLegs"],"properties":{"numLegs":{"type":"number"}}}}},"artifactPath":""},{"contract":{"handle":"chrysalis","type":"type@1.0.0","loop":"","version":"0.2.1"},"artifactPath":""},{"contract":{"handle":"butterfly","type":"type@1.0.0","loop":"","version":"0.2.1","data":{"schema":{"type":"object","required":["numWings"],"properties":{"numWings":{"type":"number"}}}}},"artifactPath":""},{"contract":{"handle":"egg-2-caterpillar","type":"transformer@1.0.0","loop":"","version":"0.2.1","data":{"inputFilter":{"type":"object","required":["type"],"properties":{"handle":{"type":"string"},"type":{"pattern":"egg@*"}}},"targetPlatform":"linux/amd64"}},"artifactPath":""},{"contract":{"handle":"caterpillar-2-chrysalis","type":"transformer@1.0.0","loop":"","version":"0.2.1","data":{"inputFilter":{"type":"object","required":["type"],"properties":{"handle":{"type":"string"},"type":{"pattern":"caterpillar@*"},"data":{"type":"object","required":["numLegs"],"properties":{"numLegs":{"type":"number"}}}}},"targetPlatform":"linux/amd64"}},"artifactPath":""},{"contract":{"handle":"chrysalis-2-butterfly","type":"transformer@1.0.0","loop":"","version":"0.2.1","data":{"inputFilter":{"type":"object","properties":{"handle":{"type":"string"},"type":{"pattern":"chrysalis@*"}},"required":["type"]},"targetPlatform":"linux/amd64"}},"artifactPath":""}]}')
        expect(await transformBundle(manifest)).toMatchObject(expectedResults);
    })
})