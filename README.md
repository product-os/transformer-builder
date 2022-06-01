// import * as fs from 'fs';
// import { YAML } from 'yaml';

## How to define a transformer bundle of contracts
- contracts.yml
    - can contain `type: type` or `type: transformer` contracts
    - contracts are seperated using the yaml document separator `---`
    - each contract can have an `$artifact` field to define how the artifact is created
    - `entrypoint` is optional if already defined in Dockerfile
    ```yaml
    $artifact:
        install_packages:
            - git
    ```
  
- index.ts
    - contains the transformer functions referenced by the transformer contracts
    ```typescript
    export async function egg2caterpillar (input: InputManifest<EggContract>): Promise<Result<CaterpillarContract>[]> {
    // TODO: implement transformation
    }
    ```

## Bare transformer approach (no-sdk)
- read manifest from /input/manifest.json
- read artifact from /input/artifact
- write output artifacts to /output/artifact
    - write transformer image to /output/artifact/example2example.tar
- write outout manifest to /outout/manifest.json
    - manifest will contract { results: Result[] }
    - Result is { contract, imagePath }
    - e.g. { contract: { type: transformer, handle: example2example }. imagePath: /output/artifact/example2example.tar }
    - e.g. see source2image for example of output image

## Working with input
- input is transformer-bundle source
- L1 transformer should contain the base source code for node
- read from /input/artifact/
- read contracts from /input/artifact/contracts.yml
- parse contracts.yml file
- for each contract
    - if transformer:
        - create working directory
        - write the transformer contract (balena.yml)
        - assemble source
          - copy bundle/src into base source code for node
          - install package.json globally
          - build source with the wrapper (`npm run build`)
        - build dockerfile
          - copy assembled source into /app/src
          - use template Dockerfile then append install_packages
          - append standard entrypoint index.ts
    - if type:
        - 

## For all output contracts
- add a version field
    - version should be the same as input contract (transformer-bundle) version
- consider individualized versioning for transformer & types
  - diff transformer images to detect change
  - compare type with the previous version of the same type

## Create a type contract
- Force the slug
    ```yaml
    slug: `${handle}`    
    type: type
    data: 
        schema:
            ...
    ```
    ```yaml
    slug: `${loop}/${handle}`    
    type: type
    data: 
        schema:
            ...
    ```

## Create a transformer contract
- if `input.filter` is not set:
    - generate `input.filter` based on `input.$ref` using a JSON Schema that matches on type
    - Q: how will we know the slug before type is created? --
    - A:  We just use the handle
    - OR A: we will set the slug when generating the type and use what we set, and if it gets rejected
    - add nonce OR complain loudly
    ```yaml
    type: object
    required: ['type']
    properties:
        type: { const: typeSlug@typeVersion }
    ```

## Build transformers images
- Options
    - Use `zx`- 
    - https://github.com/product-os/t-blueprint2keyframe-transformer/blob/master/lib/docker.ts

    
    
## Notes

### current slug implemenation
slug: `${type}-${slugified(name)}`

### future slug
slug: `${loop}/${type}/${handle}`




- Launch with just typescript support
- bash stuff: install_packages then call script from typescript
- Look into Repl.it
- Camel-case the function name then snake-case the handle
- Design-time script that generates interfaces in typescript
- index.ts file should export transformer functions with Camel-case of transformer handle
- No env var for input manifest. Should use absolute paths for manifest & artifacts