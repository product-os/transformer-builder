# L1 Transformer

## Introduction

This transformer builds transformers from bundled transformer source.


## How to define a bundle of transformer contracts
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
    export default async function egg2Caterpillar (input: InputManifest<EggContract>): Promise<Result<CaterpillarContract>[]> {
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
    - If contract contains a transformer:
      - Set the contract version to the bundle version
      - Create a work directory
      - Write the transformer contract (balena.yml) into the work directory
      - Assemble source
        - Copy bundle/src into base source code for node
        - Install package.json globally
        - generate the wrapper
        - build source with the wrapper (`npm run build`)
      - build dockerfile
        - copy assembled source into /app/src
        - use template Dockerfile then append install_packages
        - append standard entrypoint index.ts
      - Append the transformer contract into the results.
    - If contract contains a type:
      - Set the contract version to the bundle version 
      - Append the type contract into the results.

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

## Configuration

When using as a Github action, the transformer-builder can be configured using environment variables.

### Secrets

The following secrets should be set by an Owner at the Organization level,
but they can also be [configured for personal repositories](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository).

These secrets can also be found at the top of [flowzone.yml](./.github/workflows/flowzone.yml).

#### `REGISTRY_USERNAME`

The username used for authenticating with the Docker registry.  Defaults to the Github username of the user that created the pull request which triggered this Github action.

#### `REGISTRY_PASSWORD`

The password used for authenticating with the Docker registry.  Defaults to the `GITHUB_TOKEN` secret which is automatically generated for each Github workflow run.


### Other Configuration

#### `DRYRUN`

Disables artifact uploading to the registry when `DRYRUN` is set to `true`. Defaults to `false`.

#### `REGISTRY_HOSTNAME`

The hostname of the Docker registry where artifacts and images will be uploaded to. Defaults to `ghcr.io`.

#### `REGISTRY_PROTOCOL`

The protocol used to upload artifacts or images to the Docker registry. Options are `https`, `http`, or `ssh`.  Defaults to `https`.

