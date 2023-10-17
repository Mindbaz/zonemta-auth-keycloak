const chai = require ( 'chai' );
const expect = chai.expect;
const rewire = require ( 'rewire' );
const AuthKeycloak = rewire ( '../index.js' );


describe ( 'Is realm can auth', function () {
    const is_realm_can_auth = AuthKeycloak.__get__ ( 'is_realm_can_auth' );

    it ( 'Realm in config => true', () => {
        let ret = is_realm_can_auth (
            {
                'auth_keycloak': {
                    'realms': [
                        'random-realm'
                    ]
                }
            },
            'random-realm'
        );
        expect ( ret ).to.be.true;
    } );

    
    it ( 'Realm not in config => false', () => {
        let ret = is_realm_can_auth (
            {
                'auth_keycloak': {
                    'realms': [
                        'random-realm'
                    ]
                }
            },
            'another-realm'
        );
        expect ( ret ).to.be.false;
    } );
} );
