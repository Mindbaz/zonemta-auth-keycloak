# zonemta-auth-keycloak

Authentication with Keycloak for [ZoneMTA](https://github.com/zone-eu/zone-mta). Install this to performs SMTP authentication with [Keycloak](https://www.keycloak.org/)

## Setup

Add this as a dependency for your ZoneMTA app

```shell
npm install @mindbaz/zonemta-auth-keycloak --save
```

## Configure

The module uses `wild-config`, so there are two `toml` configuration files to manage

### Plugin conf

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
auth_force_realms = true # Optional : to force a realm on current zmta instance
```

### Wild-config

ZoneMTA uses the following file for wild-config : `/path/to/zone-mta/config/zonemta.toml`

```toml
[auth_keycloak]
realms = [ 'random-realm', 'another-realm' ]
```

## License

The GNU General Public License 3 ([details](https://www.gnu.org/licenses/quick-guide-gplv3.en.html))

# Support version

Keycloak : `>=20`
