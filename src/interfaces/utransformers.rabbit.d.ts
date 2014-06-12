/// <reference path='utransformer.d.ts' />

declare module rabbit {
  class Transformer implements UTransformers.Transformer {
    /**
     * Create a transformer instance.
     * @constructor
     */
    constructor();

    // It's unfortunate that TypeScript class declarations must explicitly
    // declare the functions of their declared interfaces.
    setKey(key:ArrayBuffer) : void;
    configure(json:string) : void;
    transform(buffer:ArrayBuffer) : ArrayBuffer;
    restore(buffer:ArrayBuffer) : ArrayBuffer;
    dispose() : void;
  }
}
