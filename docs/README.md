# Introduction

Serializable result object, that encapsulates operation status, statusText and returned data.

## Install

```sh
npm install @corejslib/result
```

Under `node` environment it also register itself as `global.result`, so you don;t need to import it into all modules;

## Usage

```javascript
import result from "@corejslib/result";

var res = result( 200 );

res = result( [ 200, "Completed" ] ); // custom status text

res = result( 200, { data } ); // with some data

try {
    res = result.try( await someFunctionCall() );
}
catch ( e ) {
    res = result.catch( e );
}
```

### result( status, data?, meta? )

- `status` {integer|Array|Error} Status code, {Error} object, result-like object (has `status` and `statusText` properties, for example, `node-fetch` result) or {Array}:
    - {integer} Status code.
    - {string} Status text.
- `data?` {any} arbitrary Data that represents returned value. This data is accesible via `result.data` property.
- `meta?` {Object} Additional meta properties, that will be stored in the result object.
- Returns: {Result}.

Creates new result object.

Example:

```javascript
const res = result( 500, { "a": 1 }, { "meta": "some data" } );

console.log( res.ok ); // false
console.log( res.status ); // 500
console.log( res.statustext ); // internal server error
console.log( res.data ); // {"a": 1}
console.log( res.meta ); // "some data"
```

### result.exception( status, data?, meta? )

- `status` {integer|Array} Status code or {Array} \[status code, status text].
- `data?` {any} arbitrary Data that represents returned value. This data is accesible via `result.data` property.
- `meta?` {Object} Additional meta properties, that will be stored in the result object.
- Returns: {Result}.

Creates new result exception object. Same, as [`result( status, data, properties )`](#result-status-data-properties-), but also set `result.exception` to the `true` in case if result is not successuful.

### result.try( res?, options? )

- `res?` {any} Value to check.
- `options?` {Object}:
    - `allowUndefined` {boolean} Returns error if set to `false`. **Default:** `false`.
    - `keepError` {boolean} If `res` is instance of the {Error} set error message as result `statusText`.
- Returns: {Result}.

Checks, that `res` is instance of {Result}. If `res` is:

- {undefined}: returns `result( 200 )`.
- {Result}: returns `res` as is.
- Result-like object (object, that has `status` and `statusText` properties): returns `result( [res.status, res.statusText] )`.
- {Error}: returns `result( [500, error.message] )`.
- Any other value: returns `result( 500 )`.

### result.catch( res, options? )

- `res` {any} Value to check.
- `options?` {Object}:
    - `keepError` {boolean} If `res` is instance of {Error} set error message as result `statusText`.
    - `log` {boolean} Do not print error to the console.
- Returns: {Result}.

Checks, that `res` is instance of {Result}. If `res` is:

- {Result}: returns `res` as is;
- Result-like object (object, that has `status` and `statusText` properties): returns `result( [res.status, res.statusText] )`.
- {Error}: returns `result( [500, error.message] )`.
- Any other value converted to the {Error} object (`Error( res )`) and processed as described above.

### result.fromJson( res )

- `res` {Object} Result object data, produced by `Result.toJSON()`.
- Returns: {Result}.

### result.fromJsonRpc)

- `msg` {Object} JSON RPC 2.0 message.
- Returns: {Result}.

Converts JSON RPC response message to the {Result} object.

### result.getHttpStatus( status )

- `status` {integer} Status code.
- Returns: {integer} Status code.

Returns status code in range, supported by `HTTP` protocol.

### result.getStatusText( status )

- `status` {integer} Status code.
- Returns: {string} Status text.

Resolves status text by the status code.

### Class: Result

#### result.status

- {integer} Status code.

#### result.statusText

- {string} Status text.

#### result.isException

- {boolean} Returns `true` if result is exception.

#### result.ok

- {boolean} Returns `true` if result is successful, otherwise returns `false`.

#### result.error

- {boolean} Returns `true` if result is error.

#### result.is1xx

- {boolean} Returns `true` if result code is in range: `100` - `199`.

#### result.is2xx

- {boolean} Returns `true` if result code is in range: `200` - `299`.

#### result.is3xx

- {boolean} Returns `true` if result code is in range: `300` - `399`.

#### result.is4xx

- {boolean} Returns `true` if result code is in range: `400` - `499`.

#### result.is5xx

- {boolean} Returns `true` if result code >= `500`.

#### result.toString()

- Returns: {string}.

#### result.toJSON()

- Returns: {string}.

#### result.toJsonRpc( id )

- `id` {integer} JSON RPC message id.
- Returns: {Object} JSON RPC response.

Converts result object to the JSON RPC response.

## Status codes

### RPC status codes

#### RPC request errors

| Status Code | Status Text                                          |
| ----------: | ---------------------------------------------------- |
|      -32800 | RPC calls are not supported                          |
|      -32802 | Too many requests                                    |
|      -32803 | Unsupported content type                             |
|      -32804 | HTTP method not allowed                              |
|      -32807 | Unable to decode RPC message body                    |
|      -32808 | Parameters validation error                          |
|      -32809 | API method not found                                 |
|      -32810 | Persistent connection is required to call API method |
|      -32811 | Access denied                                        |
|      -32812 | Authorization is required                            |
|      -32813 | Session is disabled                                  |
|      -32814 | Backend is down                                      |
|      -32815 | Session was deleted                                  |
|      -32816 | Service is shutting down                             |
|      -32817 | Request aborted                                      |

### HTTP status codes

#### Informational

| Status Code | Status Text         |
| ----------: | ------------------- |
|         100 | Continue            |
|         101 | Switching Protocols |
|         102 | Processing          |
|         103 | Early Hints         |

#### Success

| Status Code | Status Text                   |
| ----------: | ----------------------------- |
|         200 | OK                            |
|         201 | Created                       |
|         202 | Accepted                      |
|         203 | Non-Authoritative Information |
|         204 | No Content                    |
|         205 | Reset Content                 |
|         206 | Partial Content               |
|         207 | Multi-Status                  |
|         208 | Already Reported              |
|         226 | IM Used                       |

#### Redirect

| Status Code | Status Text        |
| ----------: | ------------------ |
|         300 | Multiple Choices   |
|         301 | Moved Permanently  |
|         302 | Found              |
|         303 | See Other          |
|         304 | Not Modified       |
|         305 | Use Proxy          |
|         307 | Temporary Redirect |
|         308 | Permanent Redirect |

#### Client error

| Status Code | Status Text                     |
| ----------: | ------------------------------- |
|         400 | Bad Request                     |
|         401 | Unauthorized                    |
|         402 | Payment Required                |
|         403 | Forbidden                       |
|         404 | Not Found                       |
|         405 | Method Not Allowed              |
|         406 | Not Acceptable                  |
|         407 | Proxy Authentication Required   |
|         408 | Request Timeout                 |
|         409 | Conflict                        |
|         410 | Gone                            |
|         411 | Length Required                 |
|         412 | Precondition Failed             |
|         413 | Payload Too Large               |
|         414 | URI Too Long                    |
|         415 | Unsupported Media Type          |
|         416 | Range Not Satisfiable           |
|         417 | Expectation Failed              |
|         418 | I'm a Teapot                    |
|         421 | Misdirected Request             |
|         422 | Unprocessable Entity            |
|         423 | Locked                          |
|         424 | Failed Dependency               |
|         425 | Too Early                       |
|         426 | Upgrade Required                |
|         428 | Precondition Required           |
|         429 | Too Many Requests               |
|         431 | Request Header Fields Too Large |
|         451 | Unavailable For Legal Reasons   |

#### Server error

| Status Code | Status Text                     |
| ----------: | ------------------------------- |
|         500 | Internal Server Error           |
|         501 | Not Implemented                 |
|         502 | Bad Gateway                     |
|         503 | Service Unavailable             |
|         504 | Gateway Timeout                 |
|         505 | HTTP Version Not Supported      |
|         506 | Variant Also Negotiates         |
|         507 | Insufficient Storage            |
|         508 | Loop Detected                   |
|         509 | Bandwidth Limit Exceeded        |
|         510 | Not Extended                    |
|         511 | Network Authentication Required |

### WebSockets status codes

| Status Code | Status Text         |
| ----------: | ------------------- |
|        1000 | Normal Closure      |
|        1001 | Going Away          |
|        1002 | Protocol error      |
|        1003 | Unsupported Data    |
|        1004 | Reserved            |
|        1005 | No Status Rcvd      |
|        1006 | Abnormal Closure    |
|        1007 | Invalid Payload     |
|        1008 | Policy Violation    |
|        1009 | Message Too Big     |
|        1010 | Mandatory Extension |
|        1011 | Internal Error      |
|        1012 | Service Restart     |
|        1013 | Try Again Later     |
|        1014 | Bad Gateway         |
|        1015 | TLS Handshake       |
