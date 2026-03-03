// The error codes from and including -32768 to -32000 are reserved for pre-defined errors.
// Any code within this range, but not defined explicitly below is reserved for future use.
// The error codes are nearly the same as those suggested for
// XML-RPC at the following url: http://xmlrpc-epi.sourceforge.net/specs/rfc.fault_codes.php

export default {

    // NOTE don't use standard error codes in api response, create custom code, if needed
    "-32700": [ 400, "Parse Error" ],
    "-32600": [ 400, "Invalid Request" ],
    "-32601": [ 404, "Method Not Found" ],
    "-32602": [ 400, "Invalid Params" ],
    "-32603": [ 500, "Internal Error" ],
    "-32000": [ 500, "Server Error" ], // -32000 to -32099

    // custom common errors
    "-32800": [ 400, "RPC calls are not supported" ],
    "-32802": [ 429, "Too many requests" ],
    "-32803": [ 415, "Unsupported content type" ],
    "-32804": [ 405, "HTTP method not allowed" ],
    "-32807": [ 400, "Unable to decode RPC message body" ],
    "-32808": [ 400, "Arguments validation error" ],
    "-32809": [ 404, "API method not found" ],
    "-32810": [ 400, "Connection type is not valid for API method" ],
    "-32811": [ 401, "Access denied" ],
    "-32812": [ 401, "Authorization is required" ],
    "-32813": [ 401, "Session is disabled" ],
    "-32814": [ 503, "Backend is down" ],
    "-32815": [ 401, "Session was deleted" ],
    "-32816": [ 503, "Service is shutting down" ],
    "-32817": [ 509, "Request aborted" ],
};
