import result from "#lib/_browser/index";

export default result;

// set console.log hook
result.Result.prototype[ Symbol.for( "nodejs.util.inspect.custom" ) ] = function ( depth, options, inspect ) {
    return `${ this.constructor.name }: ${ inspect( this.toJSON() ) }`;
};

// register globally
if ( !globalThis.result?.isResult ) {
    Object.defineProperty( globalThis, "result", {
        "configurable": false,
        "writable": false,
        "enumerable": true,
        "value": result,
    } );
}
