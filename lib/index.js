import STATUS_HTTP from "#resources/http.statuses.js";
import STATUS_JSON_RPC from "#resources/json-rpc.statuses.js";
import STATUS_WEBSOCKETS from "#resources/websockets.statuses.js";

const STATUS = {
        ...STATUS_HTTP,
        ...STATUS_WEBSOCKETS,
    },
    JSON_RPC_TO_HTTP = {},
    IS_RESULT_ACCESSOR = Symbol();

for ( const status in STATUS_JSON_RPC ) {
    JSON_RPC_TO_HTTP[ status ] = STATUS_JSON_RPC[ status ][ 0 ];
    STATUS[ status ] = STATUS_JSON_RPC[ status ][ 1 ];
}

class Result {
    data;
    #status;
    #statusText;
    #exception = false;
    #meta;

    constructor ( status, data, meta ) {
        var statusText;

        if ( typeof status !== "number" ) {

            // Array
            if ( Array.isArray( status ) ) {
                [ status, statusText ] = status;
            }

            // object
            else if ( typeof status === "object" ) {

                // Result
                if ( Result.isResult( status ) ) {
                    statusText = status.statusText;
                    status = status.status;
                }

                // Error
                else if ( Error.isError( status ) ) {
                    statusText = status.message;
                    status = 500;
                }

                // invalid status
                else {
                    throw new TypeError( "Result status is not valid" );
                }
            }
        }

        this._setStatus( status, statusText );

        if ( data !== undefined ) this.setData( data );

        if ( meta ) this.setMeta( meta );
    }

    // static
    static get Result () {
        // eslint-disable-next-line unicorn/class-reference-in-static-methods
        return Result;
    }

    static isResult ( object ) {
        return !!object?.[ IS_RESULT_ACCESSOR ];
    }

    static exception ( status, data, meta ) {
        const res = new this( status, data, meta );

        res._setException();

        return res;
    }

    static try ( res, { allowUndefined, keepError = true } = {} ) {
        if ( res === undefined && allowUndefined ) {
            return new this( 200 );
        }

        // Result
        else if ( this.isResult( res ) ) {
            return res;
        }

        // Error
        else if ( Error.isError( res ) ) {
            if ( keepError ) {
                return new this( [ 500, res.message ] );
            }
            else {
                return new this( 500 );
            }
        }

        // invalid result type
        else {
            console.error( new TypeError( `Invalid return value, "Result" object is expected` ) );

            return this.exception( 500 );
        }
    }

    static fromError ( e, { keepError = true, log = true } = {} ) {
        var res;

        // Result
        if ( this.isResult( e ) ) {
            res = e;
        }

        // Error
        else {
            if ( !Error.isError( e ) ) e = new Error( e );

            if ( log ) console.warn( e );

            if ( keepError ) {
                res = this.exception( [ 500, e.message ] );
            }
            else {
                res = this.exception( 500 );
            }
        }

        return res;
    }

    static fromJson ( json ) {
        var res;

        // object is plain
        try {
            if ( json.exception ) {
                res = this.exception( [ json.status, json.status_text ], json.data, json.meta );
            }
            else {
                res = new this( [ json.status, json.status_text ], json.data, json.meta );
            }
        }
        catch {
            res = this.exception( [ 500, "Invalid API response" ] );
        }

        return res;
    }

    static fromJsonRpc ( msg ) {
        var res;

        try {

            // error
            if ( msg.error ) {
                if ( msg.error.data?.exception ) {
                    res = this.exception( [ msg.error.code, msg.error.message ] );
                }
                else {
                    res = new this( [ msg.error.code, msg.error.message ] );
                }

                res.setMeta( msg.error.data?.meta );
            }

            // ok
            else {
                res = this.fromJson( msg.result );
            }
        }
        catch {
            res = this.exception( 500 );
        }

        return res;
    }

    static getHttpStatus ( status ) {
        if ( status < 100 ) return JSON_RPC_TO_HTTP[ status ] || 500;

        if ( status in STATUS ) return status;

        if ( status < 100 ) return 400;
        else if ( status >= 100 && status < 200 ) return 100;
        else if ( status >= 200 && status < 300 ) return 200;
        else if ( status >= 300 && status < 400 ) return 300;
        else if ( status >= 400 && status < 500 ) return 400;
        else return 500;
    }

    static getStatusText ( status ) {
        const statusText = STATUS[ status ];

        if ( statusText ) return statusText;

        if ( status < 100 ) return STATUS[ 400 ];
        if ( status >= 100 && status < 200 ) return STATUS[ 100 ];
        else if ( status >= 200 && status < 300 ) return STATUS[ 200 ];
        else if ( status >= 300 && status < 400 ) return STATUS[ 300 ];
        else if ( status >= 400 && status < 500 ) return STATUS[ 400 ];
        else return STATUS[ 500 ];
    }

    static get [ IS_RESULT_ACCESSOR ] () {
        return true;
    }

    // properties
    get [ IS_RESULT_ACCESSOR ] () {
        return true;
    }

    get status () {
        return this.#status;
    }

    get statusText () {
        return this.#statusText;
    }

    get isException () {
        return this.#exception;
    }

    get meta () {
        this.#meta ??= {};

        return this.#meta;
    }

    // XXX remove
    set meta ( value ) {
        this.setMeta( value );
    }

    // status properties
    get ok () {
        return this.#status >= 200 && this.#status < 300;
    }

    get error () {
        return this.#status >= 400 || this.#status < 100;
    }

    get is1xx () {
        return this.#status >= 100 && this.#status < 200;
    }

    get is2xx () {
        return this.#status >= 200 && this.#status < 300;
    }

    get is3xx () {
        return this.#status >= 300 && this.#status < 400;
    }

    get is4xx () {
        return ( this.#status >= 400 && this.#status < 500 ) || this.#status < 100;
    }

    get is5xx () {
        return this.#status >= 500;
    }

    // public
    setData ( value ) {
        this.data = value;

        return this;
    }

    setMeta ( value ) {

        // object is plain
        if ( value instanceof Object && value.constructor === Object ) {
            this.#meta = value;
        }
        else {
            throw new Error( "Result meta must be a plain object" );
        }

        return this;
    }

    toString () {
        return `${ this.#status } ${ this.#statusText }`;
    }

    toJSON () {
        return {
            "status": this.#status,
            "status_text": this.#statusText,
            "exception": this.#exception,
            "data": this.data,
            "meta": this.#meta,
        };
    }

    toJsonRpc ( id ) {
        var res;

        // ok
        if ( this.ok ) {
            res = {
                "jsonrpc": "2.0",
                "result": this.toJSON(),
            };
        }

        // exception, hide exceptions details from external clients
        else if ( this.isException ) {
            res = {
                "jsonrpc": "2.0",
                "error": {
                    "code": 500,
                    "message": STATUS[ 500 ],
                    "data": {
                        "exception": true,
                        "meta": this.meta,
                    },
                },
            };
        }

        // error
        else {
            res = {
                "jsonrpc": "2.0",
                "error": {
                    "code": this.#status,
                    "message": this.#statusText,
                    "data": {
                        "exception": false,
                        "meta": this.meta,
                    },
                },
            };
        }

        if ( id ) res.id = id;

        return res;
    }

    [ Symbol.for( "nodejs.util.inspect.custom" ) ] ( depth, options, inspect ) {
        const spec = this.toJSON();

        return `${ this.constructor.name }: ${ inspect( spec ) }`;
    }

    // protected
    _setStatus ( status, statusText ) {
        if ( typeof status !== "number" ) throw new TypeError( "Status is not a number" );

        this.#status = status;

        if ( statusText ) {
            if ( typeof statusText !== "string" ) throw new TypeError( "Status text is not a string" );

            this.#statusText = statusText;
        }
        else {
            this.#statusText = Result.getStatusText( status );
        }

        if ( this.#exception && this.ok ) this.#exception = false;
    }

    _setException () {
        this.#exception = true;

        if ( this.ok ) {
            this._setStatus( 500 );
        }
    }
}

export default function result ( status, data, meta ) {
    return new Result( status, data, meta );
}

Object.setPrototypeOf( result, Result );

// register globally
if ( !globalThis.result?.[ IS_RESULT_ACCESSOR ] ) {
    Object.defineProperty( globalThis, "result", {
        "configurable": false,
        "writable": false,
        "enumerable": true,
        "value": result,
    } );
}
