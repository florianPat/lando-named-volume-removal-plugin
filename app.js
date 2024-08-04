'use strict';

const _ = require('lodash');

const removeNamedVolume = (composeDataIn, home, userConfRoot) => {
  const namedVolumes = [];

  for (const composeData of Object.values(composeDataIn)) {
    for (const data of composeData.data) {
      _.forEach(data.volumes, (value, key) => {
        if (value.external === true) {
          return;
        }

        namedVolumes.push(key);
      });
    }
  }

  for (const composeData of Object.values(composeDataIn)) {
    for (const data of composeData.data) {
      _.forEach(namedVolumes, namedVolume => {
        _.unset(data.volumes, namedVolume);
        _.forEach(data.services, service => {
          _.remove(service.volumes, value =>
            _.startsWith(value, namedVolume + ':') ||
            value.source === namedVolume ||
            _.startsWith(value, '/var/run/docker.sock:') ||
            (!_.startsWith(value, userConfRoot) && _.startsWith(value, home)),
          );
        });
      });
    }
  }
};

module.exports = (app, lando) => {
  // 9 because after all the plugins and core stuff and before the lando info generation
  // note that the proxy plugin loads itself into the mix in 'pre-start'... thats ok through, because it does not use any named volumes
  app.events.on('post-init', 9, () => {
    removeNamedVolume(app.composeData, lando.config.home, lando.config.userConfRoot);
  });

  app.events.on('pre-engine-start', data => {
    if (data.project !== lando.config.proxyName) {
      return;
    }

    const proxyData = lando.utils.loadComposeFiles(data.compose);
    removeNamedVolume({proxy: {data: proxyData}}, lando.config.home, lando.config.userConfRoot);
    lando.utils.dumpComposeData(proxyData, path.join(lando.config.userConfRoot, 'proxy'));
  });
};
