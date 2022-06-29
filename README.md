# zonemta-auth-keycloak

Authentication with Keycloak for [ZoneMTA](https://github.com/zone-eu/zone-mta). Install this to performs SMTP authentication with [Keycloak](https://www.keycloak.org/)

## Setup

Add this as a dependency for your ZoneMTA app

```
npm install @mindbaz/zonemta-auth-keycloak --save
```

Add a configuration entry in the "plugins" section of your ZoneMTA app

Example [here](./config.example.toml).

First enable plugin :

```toml
# auth-keycloak.toml
["modules/@mindbaz/zonemta-auth-keycloak"]
enabled="receiver"
interfaces=["feeder"]
```

Then set keycloak configuration for this plugin :

```toml
keycloak_url="http://example.org:8080"
auth_force_realm = false
```

Optional : to force a realm on current zmta instance

```
auth_force_realm = true
auth_realm = 'random-realm'
```

## License

The GNU General Public License 3 ([details](https://www.gnu.org/licenses/quick-guide-gplv3.en.html))
