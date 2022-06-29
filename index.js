'use strict';

/*
  Copyright (C) 2022 Mindbaz
  
  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.
  
  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
  
  --
  
  SMTP authentication with Keycloak
  Validates tokens via API calls
  
  Auth username must be a concatenation of keycloak realm, client_id &
  username, exemple :  random-realm/random-client-id/random-username
*/

const request = require ( 'request' );

module.exports.title = 'Keycloak Authentication';
module.exports.init = (app, done) => {
    // Listen for AUTH command
    
    app.addHook ( 'smtp:auth', ( auth, session, next ) => {
        if ( ! app.config.interfaces.includes ( session.interface ) ) {
            // Not an interface we care about
            next ();
        }
        
        /**
         * Authentication : failed
         * @type {Error}
         */
        let err = new Error ( 'Authentication failed' );
        err.responseCode = 535;
        
        if ( typeof ( auth.username ) !== 'string' ) {
            return next ( err );
        }
        
        /**
         * Split Auth username into realm/client_id/username
         * @type {string[]}
         */
        let [ realm, client_id, username ] = auth.username.split ( '/' );
        
        for ( let value of [ realm, client_id, username ] ) {
            if ( ( typeof ( value ) !== 'string' ) || ( value.trim () === '' ) ) {
                return next ( err );
            }
        }
        
        if ( ( app.config.auth_force_realm === true ) && ( realm !== app.config.auth_realm ) ) {
            // Force auth realm check
            return next ( err );
        }
        
        /**
         * Authentication Keycloak URL
         * @type {string}
         */
        let auth_url = `${app.config.keycloak_url}/auth/realms/${realm}/protocol/openid-connect/token`;
        
        request.post (
            {
                url: auth_url,
                method: 'post',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                form: {
                    username: encodeURI ( username ),
                    password: encodeURI ( auth.password ),
                    grant_type: 'password',
                    client_id: encodeURI ( client_id )
                }
            },
            ( error, response ) => {
                if ( error ) { return next ( err ); }
                if ( response.statusCode !== 200 ) { return next ( err ); }
                
                app.logger.info (
                    'Plugins/auth-keycloak',
                    'AUTHINFO id=%s realm="%s" client_id="%s" username="%s"',
                    session.id,
                    realm,
                    client_id,
                    username
                );
                
                // Authentication : success
                next ();
            }
        );
    } );
    
    done ();
};
