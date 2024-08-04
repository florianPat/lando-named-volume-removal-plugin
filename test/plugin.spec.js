'use strict';

// Setup chai.
const chai = require('chai');
const expect = chai.expect;
chai.should();

const plugin = require('../app');

describe('plugin', () => {
  it('should handle the post init event correctly', () => {
    const app = {
      events: {
        on: (event, priority, callback) => {
          expect(event).to.equal('post-init');
          expect(priority).to.equal(9);
          callback(app);
        },
      },
      composeData: {
        ComposeService: {id: 'compose', info: {}, data: [{}]},
        LampPhp: {
          id: 'appserver',
          info: {
            via: 'apache',
            webroot: '.',
            config: {php: '/home/florain/.lando/config/lamp/php.ini'},
            service: 'appserver',
            type: 'lamp-php',
            version: '7.4',
            meUser: 'www-data',
            hasCerts: true,
            api: 3,
          },
          data: [
            {
              services: {
                appserver: {
                  image: 'devwithlando/php:7.4-apache-4',
                  environment: {
                    COMPOSER_ALLOW_SUPERUSER: 1,
                    COMPOSER_MEMORY_LIMIT: '-1',
                    PHP_MEMORY_LIMIT: '1G',
                    LANDO_WEBROOT: '/app/.',
                  },
                  networks: {default: {}},
                  ports: ['127.0.0.1::80'],
                  volumes: [
                    '/usr/local/bin',
                    '/home/florain/.lando/config/lamp-php/default-ssl.conf:/etc/apache2/sites-enabled/000-default.conf',
                    '/home/florain/.lando/config/lamp-php/php.ini:/usr/local/etc/php/conf.d/xxx-lando-default.ini',
                  ],
                  command: 'docker-php-entrypoint sh -c \'a2enmod rewrite && apache2-foreground\'',
                },
              },
            },
            {
              services: {
                appserver: {
                  working_dir: '/app',
                  environment: {LANDO_SERVICE_TYPE: 'webserver'},
                },
              },
            },
            {
              services: {
                appserver: {
                  entrypoint: '/lando-entrypoint.sh',
                  environment: {
                    LANDO_SERVICE_NAME: 'appserver',
                    LANDO_SERVICE_TYPE: 'lamp-php',
                  },
                  labels: {
                    'io.lando.http-ports': '80,443',
                    'io.lando.https-ports': '443',
                  },
                  logging: {
                    driver: 'json-file',
                    options: {'max-file': '3', 'max-size': '10m'},
                  },
                  ports: ['127.0.0.1::443'],
                  volumes: [
                    '/home/florain/.lando:/lando:cached',
                    '/home/florain/.lando/scripts:/helpers',
                    '/home/florain/.lando/scripts/lando-entrypoint.sh:/lando-entrypoint.sh',
                    'home_appserver:/var/www',
                    '/home/florain/.lando/scripts/add-cert.sh:/scripts/000-add-cert',
                    '/home/florain:/user:cached',
                    '/home/florain/.lando/config/lamp/php.ini:/usr/local/etc/php/conf.d/zzz-lando-my-custom.ini',
                  ],
                },
              },
              volumes: {data_appserver: {}, home_appserver: {}},
            },
            {services: {appserver: {}}},
          ],
        },
        LampMysql: {
          id: 'database',
          info: {
            internal_connection: {host: 'database', port: '3306'},
            external_connection: {host: '127.0.0.1', port: true},
            creds: {database: 'lamp', password: 'lamp', user: 'lamp'},
            config: {database: '/home/florain/.lando/config/lamp/mysql.cnf'},
            service: 'database',
            type: 'lamp-mysql',
            version: '5.7',
            meUser: 'www-data',
            hasCerts: false,
            api: 3,
          },
          data: [
            {
              services: {
                database: {
                  image: 'bitnami/mysql:5.7',
                  command: '/launch.sh',
                  environment: {
                    ALLOW_EMPTY_PASSWORD: 'yes',
                    MYSQL_AUTHENTICATION_PLUGIN: 'mysql_native_password',
                    MYSQL_DATABASE: 'lamp',
                    MYSQL_PASSWORD: 'lamp',
                    MYSQL_USER: 'lamp',
                    LANDO_NEEDS_EXEC: 'DOEEET',
                  },
                  volumes: [
                    '/home/florain/.lando/config/lamp-mysql/launch.sh:/launch.sh',
                    '/home/florain/.lando/config/lamp-mysql/my_custom.cnf:/opt/bitnami/mysql/conf/my_custom.cnf',
                    'data_database:/bitnami/mysql/data',
                  ],
                },
              },
            },
            {
              services: {
                database: {
                  environment: {
                    LANDO_WEBROOT: '/app/undefined',
                    LANDO_SERVICE_TYPE: 'service',
                  },
                },
              },
            },
            {
              services: {database: {ports: ['127.0.0.1::3306']}},
            },
            {
              services: {
                database: {
                  entrypoint: '/lando-entrypoint.sh',
                  environment: {
                    LANDO_SERVICE_NAME: 'database',
                    LANDO_SERVICE_TYPE: 'lamp-mysql',
                  },
                  labels: {
                    'io.lando.http-ports': '80,443',
                    'io.lando.https-ports': '443',
                  },
                  logging: {
                    driver: 'json-file',
                    options: {'max-file': '3', 'max-size': '10m'},
                  },
                  ports: [],
                  volumes: [
                    '/home/florain/.lando:/lando:cached',
                    '/home/florain/.lando/scripts:/helpers',
                    '/home/florain/.lando/scripts/lando-entrypoint.sh:/lando-entrypoint.sh',
                    'home_database:/var/www',
                    'external_volume:/extern',
                    '/home/florain:/user:cached',
                    '/home/florain/.lando/config/lamp/mysql.cnf:/opt/bitnami/mysql/conf/my_custom.cnf',
                  ],
                },
              },
              volumes: {data_database: {}, home_database: {}, external_volume: {external: true}},
            },
            {
              services: {database: {image: 'bitnami/mysql:5.7.29-debian-10-r51'}},
            },
            {services: {database: {}}},
          ],
        },
      },
    };

    const lando = {
      events: {
        on: (event, callback) => {
          expect(event).to.equal('pre-engine-start');
          callback({});
          callback({project: 'proxy', compose: []});
        },
      },
      config: {home: '/home/florain', proxyName: 'proxy', userConfRoot: '/home/florain/.lando'},
      utils: {loadComposeFiles: () => {}, dumpComposeData: () => {}},
    };

    plugin(app, lando);
    expect(app.composeData['LampPhp'].data[2].volumes).to.eql({});
    expect(app.composeData['LampPhp'].data[2].services.appserver.volumes).to.eql([
      '/home/florain/.lando:/lando:cached',
      '/home/florain/.lando/scripts:/helpers',
      '/home/florain/.lando/scripts/lando-entrypoint.sh:/lando-entrypoint.sh',
      // 'home_appserver:/var/www', // this needs to get unset by the plugin
      '/home/florain/.lando/scripts/add-cert.sh:/scripts/000-add-cert',
      // '/home/florain:/user:cached',
      '/home/florain/.lando/config/lamp/php.ini:/usr/local/etc/php/conf.d/zzz-lando-my-custom.ini',
    ]);

    expect(app.composeData['LampMysql'].data[0].services.database.volumes).to.eql([
      '/home/florain/.lando/config/lamp-mysql/launch.sh:/launch.sh',
      '/home/florain/.lando/config/lamp-mysql/my_custom.cnf:/opt/bitnami/mysql/conf/my_custom.cnf',
      // 'data_database:/bitnami/mysql/data' // this needs to get unset by the plugin
    ]);

    expect(app.composeData['LampMysql'].data[3].services.database.volumes).to.eql([
      '/home/florain/.lando:/lando:cached',
      '/home/florain/.lando/scripts:/helpers',
      '/home/florain/.lando/scripts/lando-entrypoint.sh:/lando-entrypoint.sh',
      // 'home_database:/var/www', // this needs to get unset by the plugin
      'external_volume:/extern', // still needs to exist as this is external
      // '/home/florain:/user:cached',
      '/home/florain/.lando/config/lamp/mysql.cnf:/opt/bitnami/mysql/conf/my_custom.cnf',
    ]);
    expect(app.composeData['LampMysql'].data[3].volumes).to.eql({external_volume: {external: true}});
  });
});
