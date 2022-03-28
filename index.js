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
  Client id must be passed as "username" & Tokens as "password" during
  authenticating.
  
  Warning: keycloak use 'RS256' as default algorithm who generated
  too long token. To works with ZMTA, use 'ES256' or 'HS256'.
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
         * Authentication Keycloak URL
         * @type {string}
         */
        let auth_url = `${app.config.keycloak_url}/auth/realms/${auth.username}/protocol/openid-connect/userinfo`;
        
        request.get (
            {
                url: auth_url,
                method: 'get',
                headers: {
                    Authorization: `Bearer ${auth.password}`
                }
            },
            ( error, response, body ) => {
                /**
                 * Authentication : failed
                 * @type {Error}
                 */
                let err = new Error ( 'Authentication failed' );
                err.responseCode = 535;
                
                if ( error ) { return next ( err ); }
                if ( response.statusCode !== 200 ) { return next ( err ); }
                if ( ( ( 'preferred_username' in body ) === false ) || ( typeof body.preferred_username !== 'string' ) ) { return next ( err ); }
                
                app.logger.info (
                    'AUTHINFO',
                    'id=%s username="%s"',
                    session.id,
                    body.preferred_username
                );
                
                // Authentication : success
                next ();
            }
        );
    } );
    
    done ();
};
