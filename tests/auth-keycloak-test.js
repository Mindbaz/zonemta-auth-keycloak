const request = require ( 'request' );
const chai = require ( 'chai' );
const sinon = require ( 'sinon' );
var expect = chai.expect;

var AuthKeycloak = require ( '../index.js' );


describe ( 'auth-keycloak', function () {
    var app_mock = undefined;
    var done_mock = undefined;
    var auth_ds = undefined;
    var session_ds = undefined;
    var next_fake = undefined;
    
    beforeEach ( function () {
        done_fake = sinon.fake.returns ();
        auth_ds = { 'username': 'random-username', 'password': 'random-password' };
        session_ds = { 'interface': 'random-interface', 'id': 'random-id' };
        next_fake = sinon.fake.returns ();
        
        app_mock = {
            config: {
                keycloak_url: 'random-keycloak-url',
                interfaces: [ 'random-interface' ]
            },
            addHook: function ( type, cb ) {
                cb ( auth_ds, session_ds, next_fake );
            },
            logger: {
                info: function () {
                    console.log ( arguments );
                }
            }
        };
    } );
    
    
    it ( 'Correct auth', function () {
        var get_stub = sinon
            .stub ( request, 'get' )
            .yields ( null, { statusCode: 200 }, { 'preferred_username': 'another-username' } );
        
        var log_info_stub = sinon
            .stub ( app_mock.logger, 'info' );
        
        AuthKeycloak.init ( app_mock, done_fake );
        
        expect ( get_stub.callCount ).to.equal ( 1 );
        var get_args = get_stub.getCalls () [ 0 ].args [ 0 ];
        expect ( get_args [ 'url' ] ).to.equal ( 'random-keycloak-url/auth/realms/random-username/protocol/openid-connect/userinfo' );
        expect ( get_args [ 'method' ] ).to.equal ( 'get' );
        expect ( get_args [ 'headers' ] [ 'Authorization' ] ).to.equal ( 'Bearer random-password' );
        
        expect ( log_info_stub.callCount ).to.equal ( 1 );
        expect ( log_info_stub.getCalls () [ 0 ].args ).to.eql ( [ 'Plugins/auth-keycloak', 'AUTHINFO id=%s username="%s"', 'random-id', 'another-username' ] );
        
        expect ( done_fake.callCount ).to.equal ( 1 );
        
        expect ( next_fake.callCount ).to.equal ( 1 );
        expect ( next_fake.getCalls () [ 0 ].args ).to.eql ( [] );
        
        log_info_stub.restore ();
        get_stub.restore ();
    } );
    
    
    it ( 'Correct auth with body as string', function () {
        var get_stub = sinon
            .stub ( request, 'get' )
            .yields ( null, { statusCode: 200 }, JSON.stringify ( { 'preferred_username': 'another-username' } ) );
        
        var log_info_stub = sinon
            .stub ( app_mock.logger, 'info' );
        
        AuthKeycloak.init ( app_mock, done_fake );
        
        expect ( get_stub.callCount ).to.equal ( 1 );
        var get_args = get_stub.getCalls () [ 0 ].args [ 0 ];
        expect ( get_args [ 'url' ] ).to.equal ( 'random-keycloak-url/auth/realms/random-username/protocol/openid-connect/userinfo' );
        expect ( get_args [ 'method' ] ).to.equal ( 'get' );
        expect ( get_args [ 'headers' ] [ 'Authorization' ] ).to.equal ( 'Bearer random-password' );
        
        expect ( log_info_stub.callCount ).to.equal ( 1 );
        expect ( log_info_stub.getCalls () [ 0 ].args ).to.eql ( [ 'Plugins/auth-keycloak', 'AUTHINFO id=%s username="%s"', 'random-id', 'another-username' ] );
        
        expect ( done_fake.callCount ).to.equal ( 1 );
        
        expect ( next_fake.callCount ).to.equal ( 1 );
        expect ( next_fake.getCalls () [ 0 ].args ).to.eql ( [] );
        
        log_info_stub.restore ();
        get_stub.restore ();
    } );
    
    
    it ( 'Request : body preferred_username : wrong type', function () {
        var get_stub = sinon
            .stub ( request, 'get' )
            .yields ( null, { statusCode: 200 }, { 'preferred_username': {} } );
        
        var log_info_stub = sinon
            .stub ( app_mock.logger, 'info' );
        
        AuthKeycloak.init ( app_mock, done_fake );
        
        expect ( get_stub.callCount ).to.equal ( 1 );
        
        expect ( log_info_stub.callCount ).to.equal ( 0 );
        
        expect ( done_fake.callCount ).to.equal ( 1 );
        
        expect ( next_fake.callCount ).to.equal ( 1 );
        var next_error = next_fake.getCalls () [ 0 ].args [ 0 ];
        expect ( next_error instanceof Error ).to.be.true;
        expect ( next_error.responseCode ).to.equal ( 535 );
        expect ( next_error.toString () ).to.equal ( 'Error: Authentication failed' );
        
        log_info_stub.restore ();
        get_stub.restore ();
    } );
    
    
    it ( 'Request : body preferred_username : unexists', function () {
        var get_stub = sinon
            .stub ( request, 'get' )
            .yields ( null, { statusCode: 200 }, {} );
        
        var log_info_stub = sinon
            .stub ( app_mock.logger, 'info' );
        
        AuthKeycloak.init ( app_mock, done_fake );
        
        expect ( get_stub.callCount ).to.equal ( 1 );
        
        expect ( log_info_stub.callCount ).to.equal ( 0 );
        
        expect ( done_fake.callCount ).to.equal ( 1 );
        
        expect ( next_fake.callCount ).to.equal ( 1 );
        var next_error = next_fake.getCalls () [ 0 ].args [ 0 ];
        expect ( next_error instanceof Error ).to.be.true;
        expect ( next_error.responseCode ).to.equal ( 535 );
        expect ( next_error.toString () ).to.equal ( 'Error: Authentication failed' );
        
        log_info_stub.restore ();
        get_stub.restore ();
    } );
    
    
    it ( 'Request : response code <> 200', function () {
        var get_stub = sinon
            .stub ( request, 'get' )
            .yields ( null, { statusCode: 0 }, null );
        
        var log_info_stub = sinon
            .stub ( app_mock.logger, 'info' );
        
        AuthKeycloak.init ( app_mock, done_fake );
        
        expect ( get_stub.callCount ).to.equal ( 1 );
        
        expect ( log_info_stub.callCount ).to.equal ( 0 );
        
        expect ( done_fake.callCount ).to.equal ( 1 );
        
        expect ( next_fake.callCount ).to.equal ( 1 );
        var next_error = next_fake.getCalls () [ 0 ].args [ 0 ];
        expect ( next_error instanceof Error ).to.be.true;
        expect ( next_error.responseCode ).to.equal ( 535 );
        expect ( next_error.toString () ).to.equal ( 'Error: Authentication failed' );
        
        log_info_stub.restore ();
        get_stub.restore ();
    } );
    
    
    it ( 'Request : error exists', function () {
        var get_stub = sinon
            .stub ( request, 'get' )
            .yields ( 'random-error', null, null );
        
        var log_info_stub = sinon
            .stub ( app_mock.logger, 'info' );
        
        AuthKeycloak.init ( app_mock, done_fake );
        
        expect ( get_stub.callCount ).to.equal ( 1 );
        
        expect ( log_info_stub.callCount ).to.equal ( 0 );
        
        expect ( done_fake.callCount ).to.equal ( 1 );
        
        expect ( next_fake.callCount ).to.equal ( 1 );
        var next_error = next_fake.getCalls () [ 0 ].args [ 0 ];
        expect ( next_error instanceof Error ).to.be.true;
        expect ( next_error.responseCode ).to.equal ( 535 );
        expect ( next_error.toString () ).to.equal ( 'Error: Authentication failed' );
        
        log_info_stub.restore ();
        get_stub.restore ();
    } );
    
    
    it ( 'Interface not valid', function () {
        var get_stub = sinon
            .stub ( request, 'get' )
            .yields ( null, { statusCode: 200 }, { 'preferred_username': 'another-username' } );
        
        var log_info_stub = sinon
            .stub ( app_mock.logger, 'info' );
        
        session_ds [ 'interface' ] = 'another-interface';
        
        AuthKeycloak.init ( app_mock, done_fake );
        
        expect ( done_fake.callCount ).to.equal ( 1 );
        
        expect ( next_fake.callCount ).to.equal ( 2 );
        expect ( next_fake.getCalls () [ 0 ].args ).to.eql ( [] );
        
        log_info_stub.restore ();
        get_stub.restore ();
    } );
} );
