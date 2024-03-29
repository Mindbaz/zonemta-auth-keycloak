const request = require ( 'request' );
const chai = require ( 'chai' );
const sinon = require ( 'sinon' );
var expect = chai.expect;
const rewire = require ( 'rewire' );
var AuthKeycloak = rewire ( '../index.js' );


describe ( 'Test module init', function () {
    var app_mock = undefined;
    var done_mock = undefined;
    var auth_ds = undefined;
    var session_ds = undefined;
    var next_fake = undefined;
    
    beforeEach ( function () {
        done_fake = sinon.fake.returns ();
        auth_ds = { 'username': 'random-realm/random-client-id/random-username', 'password': 'random-password' };
        session_ds = { 'interface': 'random-interface', 'id': 'random-id' };
        next_fake = sinon.fake.returns ();
        
        app_mock = {
            config: {
                keycloak_url: 'random-keycloak-url',
                interfaces: [ 'random-interface' ],
                auth_force_realms: false
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
        var is_realm_can_auth_stub = sinon.stub ();
        AuthKeycloak.__set__ ( 'is_realm_can_auth', is_realm_can_auth_stub );
        
        var post_stub = sinon
            .stub ( request, 'post' )
            .yields ( null, { statusCode: 200 } );
        
        var log_info_stub = sinon
            .stub ( app_mock.logger, 'info' );
        
        AuthKeycloak.init ( app_mock, done_fake );

        expect ( is_realm_can_auth_stub.callCount ).to.equal ( 0 );
        
        expect ( post_stub.callCount ).to.equal ( 1 );
        var get_args = post_stub.getCalls () [ 0 ].args [ 0 ];
        expect ( get_args [ 'url' ] ).to.equal ( 'random-keycloak-url/realms/random-realm/protocol/openid-connect/token' );
        expect ( get_args [ 'method' ] ).to.equal ( 'post' );
        expect ( get_args [ 'headers' ] ).to.eql ( { 'Content-Type': 'application/x-www-form-urlencoded' } );
        expect ( get_args [ 'form' ] ).to.eql ( { 'username': 'random-username', 'password': 'random-password', 'grant_type': 'password', 'client_id': 'random-client-id' } );
        
        expect ( log_info_stub.callCount ).to.equal ( 1 );
        expect ( log_info_stub.getCalls () [ 0 ].args ).to.eql ( [ 'Plugins/auth-keycloak', 'AUTHINFO id=%s realm="%s" client_id="%s" username="%s"', 'random-id', 'random-realm', 'random-client-id', 'random-username' ] );
        
        expect ( done_fake.callCount ).to.equal ( 1 );
        
        expect ( next_fake.callCount ).to.equal ( 1 );
        expect ( next_fake.getCalls () [ 0 ].args ).to.eql ( [] );
        
        log_info_stub.restore ();
        post_stub.restore ();
    } );
    
    
    it ( 'Wrong : username', function () {
        auth_ds [ 'username' ] = 'random-realm/random-client-id';
        
        var is_realm_can_auth_stub = sinon.stub ();
        AuthKeycloak.__set__ ( 'is_realm_can_auth', is_realm_can_auth_stub );
        
        var post_stub = sinon
            .stub ( request, 'post' )
            .yields ( null, null );
        
        var log_info_stub = sinon
            .stub ( app_mock.logger, 'info' );
        
        AuthKeycloak.init ( app_mock, done_fake );

        expect ( is_realm_can_auth_stub.callCount ).to.equal ( 0 );
        
        expect ( post_stub.callCount ).to.equal ( 0 );
        expect ( log_info_stub.callCount ).to.equal ( 0 );
        expect ( done_fake.callCount ).to.equal ( 1 );
        
        expect ( next_fake.callCount ).to.equal ( 1 );
        var next_error = next_fake.getCalls () [ 0 ].args [ 0 ];
        expect ( next_error instanceof Error ).to.be.true;
        expect ( next_error.responseCode ).to.equal ( 535 );
        expect ( next_error.toString () ).to.equal ( 'Error: Authentication failed' );
        
        log_info_stub.restore ();
        post_stub.restore ();
    } );
    
    
    it ( 'Empty : username', function () {
        auth_ds [ 'username' ] = 'random-realm/random-client-id/';
        
        var is_realm_can_auth_stub = sinon.stub ();
        AuthKeycloak.__set__ ( 'is_realm_can_auth', is_realm_can_auth_stub );
        
        var post_stub = sinon
            .stub ( request, 'post' )
            .yields ( null, null );
        
        var log_info_stub = sinon
            .stub ( app_mock.logger, 'info' );
        
        AuthKeycloak.init ( app_mock, done_fake );

        expect ( is_realm_can_auth_stub.callCount ).to.equal ( 0 );
        
        expect ( post_stub.callCount ).to.equal ( 0 );
        expect ( log_info_stub.callCount ).to.equal ( 0 );
        expect ( done_fake.callCount ).to.equal ( 1 );
        
        expect ( next_fake.callCount ).to.equal ( 1 );
        var next_error = next_fake.getCalls () [ 0 ].args [ 0 ];
        expect ( next_error instanceof Error ).to.be.true;
        expect ( next_error.responseCode ).to.equal ( 535 );
        expect ( next_error.toString () ).to.equal ( 'Error: Authentication failed' );
        
        log_info_stub.restore ();
        post_stub.restore ();
    } );
    
    
    it ( 'Wrong : client-id', function () {
        auth_ds [ 'username' ] = 'random-realm';
        
        var is_realm_can_auth_stub = sinon.stub ();
        AuthKeycloak.__set__ ( 'is_realm_can_auth', is_realm_can_auth_stub );
        
        var post_stub = sinon
            .stub ( request, 'post' )
            .yields ( null, null );
        
        var log_info_stub = sinon
            .stub ( app_mock.logger, 'info' );
        
        AuthKeycloak.init ( app_mock, done_fake );

        expect ( is_realm_can_auth_stub.callCount ).to.equal ( 0 );
        
        expect ( post_stub.callCount ).to.equal ( 0 );
        expect ( log_info_stub.callCount ).to.equal ( 0 );
        expect ( done_fake.callCount ).to.equal ( 1 );
        
        expect ( next_fake.callCount ).to.equal ( 1 );
        var next_error = next_fake.getCalls () [ 0 ].args [ 0 ];
        expect ( next_error instanceof Error ).to.be.true;
        expect ( next_error.responseCode ).to.equal ( 535 );
        expect ( next_error.toString () ).to.equal ( 'Error: Authentication failed' );
        
        log_info_stub.restore ();
        post_stub.restore ();
    } );
    
    
    it ( 'Empty : client-id', function () {
        auth_ds [ 'username' ] = 'random-realm/';
        
        var is_realm_can_auth_stub = sinon.stub ();
        AuthKeycloak.__set__ ( 'is_realm_can_auth', is_realm_can_auth_stub );
        
        var post_stub = sinon
            .stub ( request, 'post' )
            .yields ( null, null );
        
        var log_info_stub = sinon
            .stub ( app_mock.logger, 'info' );
        
        AuthKeycloak.init ( app_mock, done_fake );

        expect ( is_realm_can_auth_stub.callCount ).to.equal ( 0 );
        
        expect ( post_stub.callCount ).to.equal ( 0 );
        expect ( log_info_stub.callCount ).to.equal ( 0 );
        expect ( done_fake.callCount ).to.equal ( 1 );
        
        expect ( next_fake.callCount ).to.equal ( 1 );
        var next_error = next_fake.getCalls () [ 0 ].args [ 0 ];
        expect ( next_error instanceof Error ).to.be.true;
        expect ( next_error.responseCode ).to.equal ( 535 );
        expect ( next_error.toString () ).to.equal ( 'Error: Authentication failed' );
        
        log_info_stub.restore ();
        post_stub.restore ();
    } );
    
    
    it ( 'Wrong : auth username / realm', function () {
        auth_ds [ 'username' ] = undefined;
        
        var is_realm_can_auth_stub = sinon.stub ();
        AuthKeycloak.__set__ ( 'is_realm_can_auth', is_realm_can_auth_stub );
        
        var post_stub = sinon
            .stub ( request, 'post' )
            .yields ( null, null );
        
        var log_info_stub = sinon
            .stub ( app_mock.logger, 'info' );
        
        AuthKeycloak.init ( app_mock, done_fake );

        expect ( is_realm_can_auth_stub.callCount ).to.equal ( 0 );
        
        expect ( post_stub.callCount ).to.equal ( 0 );
        expect ( log_info_stub.callCount ).to.equal ( 0 );
        expect ( done_fake.callCount ).to.equal ( 1 );
        
        expect ( next_fake.callCount ).to.equal ( 1 );
        var next_error = next_fake.getCalls () [ 0 ].args [ 0 ];
        expect ( next_error instanceof Error ).to.be.true;
        expect ( next_error.responseCode ).to.equal ( 535 );
        expect ( next_error.toString () ).to.equal ( 'Error: Authentication failed' );
        
        log_info_stub.restore ();
        post_stub.restore ();
    } );
    
    
    it ( 'Empty : realm', function () {
        auth_ds [ 'username' ] = '';
        
        var is_realm_can_auth_stub = sinon.stub ();
        AuthKeycloak.__set__ ( 'is_realm_can_auth', is_realm_can_auth_stub );
        
        var post_stub = sinon
            .stub ( request, 'post' )
            .yields ( null, null );
        
        var log_info_stub = sinon
            .stub ( app_mock.logger, 'info' );
        
        AuthKeycloak.init ( app_mock, done_fake );

        expect ( is_realm_can_auth_stub.callCount ).to.equal ( 0 );
        
        expect ( post_stub.callCount ).to.equal ( 0 );
        expect ( log_info_stub.callCount ).to.equal ( 0 );
        expect ( done_fake.callCount ).to.equal ( 1 );
        
        expect ( next_fake.callCount ).to.equal ( 1 );
        var next_error = next_fake.getCalls () [ 0 ].args [ 0 ];
        expect ( next_error instanceof Error ).to.be.true;
        expect ( next_error.responseCode ).to.equal ( 535 );
        expect ( next_error.toString () ).to.equal ( 'Error: Authentication failed' );
        
        log_info_stub.restore ();
        post_stub.restore ();
    } );
    
    
    it ( 'Request : response code <> 200', function () {
        var is_realm_can_auth_stub = sinon.stub ();
        AuthKeycloak.__set__ ( 'is_realm_can_auth', is_realm_can_auth_stub );
        
        var post_stub = sinon
            .stub ( request, 'post' )
            .yields ( null, { statusCode: 0 } );
        
        var log_info_stub = sinon
            .stub ( app_mock.logger, 'info' );
        
        AuthKeycloak.init ( app_mock, done_fake );

        expect ( is_realm_can_auth_stub.callCount ).to.equal ( 0 );
        
        expect ( post_stub.callCount ).to.equal ( 1 );
        expect ( log_info_stub.callCount ).to.equal ( 0 );
        expect ( done_fake.callCount ).to.equal ( 1 );
        
        expect ( next_fake.callCount ).to.equal ( 1 );
        var next_error = next_fake.getCalls () [ 0 ].args [ 0 ];
        expect ( next_error instanceof Error ).to.be.true;
        expect ( next_error.responseCode ).to.equal ( 535 );
        expect ( next_error.toString () ).to.equal ( 'Error: Authentication failed' );
        
        log_info_stub.restore ();
        post_stub.restore ();
    } );
    
    
    it ( 'Request : error exists', function () {
        var is_realm_can_auth_stub = sinon.stub ();
        AuthKeycloak.__set__ ( 'is_realm_can_auth', is_realm_can_auth_stub );
        
        var post_stub = sinon
            .stub ( request, 'post' )
            .yields ( 'random-error', null );
        
        var log_info_stub = sinon
            .stub ( app_mock.logger, 'info' );
        
        AuthKeycloak.init ( app_mock, done_fake );

        expect ( is_realm_can_auth_stub.callCount ).to.equal ( 0 );
        
        expect ( post_stub.callCount ).to.equal ( 1 );
        expect ( log_info_stub.callCount ).to.equal ( 0 );
        expect ( done_fake.callCount ).to.equal ( 1 );
        
        expect ( next_fake.callCount ).to.equal ( 1 );
        var next_error = next_fake.getCalls () [ 0 ].args [ 0 ];
        expect ( next_error instanceof Error ).to.be.true;
        expect ( next_error.responseCode ).to.equal ( 535 );
        expect ( next_error.toString () ).to.equal ( 'Error: Authentication failed' );
        
        log_info_stub.restore ();
        post_stub.restore ();
    } );
    
    
    it ( 'Wrong interface', function () {
        var is_realm_can_auth_stub = sinon.stub ();
        AuthKeycloak.__set__ ( 'is_realm_can_auth', is_realm_can_auth_stub );
        
        session_ds [ 'interface' ] = 'another-interface';
        
        var post_stub = sinon
            .stub ( request, 'post' )
            .yields ( null, { statusCode: 200 } );
        
        var log_info_stub = sinon
            .stub ( app_mock.logger, 'info' );
        
        AuthKeycloak.init ( app_mock, done_fake );

        expect ( is_realm_can_auth_stub.callCount ).to.equal ( 0 );
        
        expect ( done_fake.callCount ).to.equal ( 1 );
        expect ( next_fake.callCount ).to.equal ( 2 );
        expect ( next_fake.getCalls () [ 0 ].args ).to.eql ( [] );
        
        log_info_stub.restore ();
        post_stub.restore ();
    } );
    
    
    it ( 'Correct auth with force realm', function () {
        app_mock.config.auth_force_realms = true;
        var is_realm_can_auth_stub = sinon.stub ().returns ( true );
        AuthKeycloak.__set__ ( 'is_realm_can_auth', is_realm_can_auth_stub );
        
        var post_stub = sinon
            .stub ( request, 'post' )
            .yields ( null, { statusCode: 200 } );
        
        var log_info_stub = sinon
            .stub ( app_mock.logger, 'info' );
        
        AuthKeycloak.init ( app_mock, done_fake );

        expect ( is_realm_can_auth_stub.callCount ).to.equal ( 1 );
        const is_realm_can_auth_args = is_realm_can_auth_stub.getCall ( 0 ).args;
        expect ( typeof ( is_realm_can_auth_args [ 0 ] ) ).to.be.equal ( 'object' );
        expect ( is_realm_can_auth_args [ 1 ] ).to.be.equal ( 'random-realm' );
        
        expect ( post_stub.callCount ).to.equal ( 1 );
        var get_args = post_stub.getCalls () [ 0 ].args [ 0 ];
        expect ( get_args [ 'url' ] ).to.equal ( 'random-keycloak-url/realms/random-realm/protocol/openid-connect/token' );
        expect ( get_args [ 'method' ] ).to.equal ( 'post' );
        expect ( get_args [ 'headers' ] ).to.eql ( { 'Content-Type': 'application/x-www-form-urlencoded' } );
        expect ( get_args [ 'form' ] ).to.eql ( { 'username': 'random-username', 'password': 'random-password', 'grant_type': 'password', 'client_id': 'random-client-id' } );
        
        expect ( log_info_stub.callCount ).to.equal ( 1 );
        expect ( log_info_stub.getCalls () [ 0 ].args ).to.eql ( [ 'Plugins/auth-keycloak', 'AUTHINFO id=%s realm="%s" client_id="%s" username="%s"', 'random-id', 'random-realm', 'random-client-id', 'random-username' ] );
        
        expect ( done_fake.callCount ).to.equal ( 1 );
        
        expect ( next_fake.callCount ).to.equal ( 1 );
        expect ( next_fake.getCalls () [ 0 ].args ).to.eql ( [] );
        
        log_info_stub.restore ();
        post_stub.restore ();
    } );
    
    
    it ( 'Wrong auth with force realm', function () {
        app_mock.config.auth_force_realms = true;
        
        var is_realm_can_auth_stub = sinon.stub ().returns ( false );
        AuthKeycloak.__set__ ( 'is_realm_can_auth', is_realm_can_auth_stub );
        
        auth_ds [ 'username' ] = 'random-realm/random-client-id/random-username';
        
        var post_stub = sinon
            .stub ( request, 'post' )
            .yields ( null, null );
        
        var log_info_stub = sinon
            .stub ( app_mock.logger, 'info' );
        
        AuthKeycloak.init ( app_mock, done_fake );

        expect ( is_realm_can_auth_stub.callCount ).to.equal ( 1 );
        const is_realm_can_auth_args = is_realm_can_auth_stub.getCall ( 0 ).args;
        expect ( typeof ( is_realm_can_auth_args [ 0 ] ) ).to.be.equal ( 'object' );
        expect ( is_realm_can_auth_args [ 1 ] ).to.be.equal ( 'random-realm' );
        
        expect ( post_stub.callCount ).to.equal ( 0 );
        expect ( log_info_stub.callCount ).to.equal ( 0 );
        expect ( done_fake.callCount ).to.equal ( 1 );
        
        expect ( next_fake.callCount ).to.equal ( 1 );
        var next_error = next_fake.getCalls () [ 0 ].args [ 0 ];
        expect ( next_error instanceof Error ).to.be.true;
        expect ( next_error.responseCode ).to.equal ( 535 );
        expect ( next_error.toString () ).to.equal ( 'Error: Authentication failed' );
        
        log_info_stub.restore ();
        post_stub.restore ();
    } );
} );
