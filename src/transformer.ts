import { Contract, InputManifest, Results } from '@balena/transformer-sdk/build/types';
import * as fs from 'fs';
import * as yaml from 'js-yaml';


// Classes are good for state
export class Transformer {
    private inputArtifactsPath: string;
    private outputArtifactsPath: string;
    private workingDir: string;
    private manifest: InputManifest;
    public transformerList: Contract[];
    public typeList: Contract[];

    constructor(manifest) {
        this.inputArtifactsPath = '/input/artifacts'
        this.outputArtifactsPath = '/output/artifacts'
        this.workingDir = './temp';
        try {
            if (!fs.existsSync(this.workingDir)){
                fs.mkdirSync(this.workingDir);
            }
        } catch (error) {
            console.log(error);
            throw(error);
        }
        this.manifest = manifest;
    }

    private async buildTransformer(contract: Contract): Contract {
        let transformerContract: Contract;
        // TODO: generate the transformer files here
        const transformerDir = this.workingDir + '/' + contract.handle;
        try {
            if (!fs.existsSync(transformerDir)){
                fs.mkdirSync(transformerDir);
            }
        } catch (error) {
            console.log(error);
            throw(error);
        }
        return transformerContract;
    }

    private async loadContracts() {
        try {
            const doc = yaml.load(fs.readFileSync(this.inputArtifactsPath + '/contracts.yml', 'utf8'));
            console.log(doc);
            // TODO: put all types into list
            // TODO: put all transformers into list
        } catch (error) {
            console.log(error);
            throw(error);
        }
    }

    private async processBundle() {
        let resultsList: Results;
        const outputArtifactsPath = this.outputPath + '/artifacts';
        for (const transformer of transformerList) {
            resultsList.push() await this.buildTransformer(transformer);
        }
        return resultsList;
    }

    public async transform() {
        let results: Results[];
        await this.loadContracts();
        results = await this.processBundle();
        return results;
    }
}