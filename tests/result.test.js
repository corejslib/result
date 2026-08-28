#!/usr/bin/env -S node

import "#lib/index";
import assert from "node:assert";
import { suite, test } from "node:test";

suite( "result", () => {
    test( "1", () => {
        const res = result( 200 );

        assert.deepStrictEqual( res.toJSON(), {
            "status": 200,
            "status_text": "OK",
            "exception": false,
            "data": undefined,
            "meta": undefined,
        } );
    } );

    test( "2", () => {
        const res = result( 200, "data", { "a": 1, "b": 2 } );

        assert.deepStrictEqual( res.toJSON(), {
            "status": 200,
            "status_text": "OK",
            "exception": false,
            "data": "data",
            "meta": {
                "a": 1,
                "b": 2,
            },
        } );
    } );

    test( "3", () => {
        const res = result( [ 200 ] );

        assert.deepStrictEqual( res.toJSON(), {
            "status": 200,
            "status_text": "OK",
            "exception": false,
            "data": undefined,
            "meta": undefined,
        } );
    } );

    test( "4", () => {
        const res = result( [ 200, "message" ] );

        assert.deepStrictEqual( res.toJSON(), {
            "status": 200,
            "status_text": "message",
            "exception": false,
            "data": undefined,
            "meta": undefined,
        } );
    } );

    test( "5", () => {
        const res = result( [ 200, false ] );

        assert.deepStrictEqual( res.toJSON(), {
            "status": 200,
            "status_text": "OK",
            "exception": false,
            "data": undefined,
            "meta": undefined,
        } );
    } );

    test( "6", () => {
        const _res = result( [ 300, "message" ], "data", { "a": 1, "b": 2 } );

        const res = result( _res );

        assert.deepStrictEqual( res.toJSON(), {
            "status": 300,
            "status_text": "message",
            "exception": false,
            "data": undefined,
            "meta": undefined,
        } );
    } );
} );
