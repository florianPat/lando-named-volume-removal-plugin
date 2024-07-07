'use strict';

const _ = require('lodash');

module.exports = (app, lando) => {
  // 9 because after all the plugins and core stuff and before the lando info generation
  // note that the proxy plugin loads itself into the mix in 'pre-start'... thats ok through, because it does not use any named volumes
  app.events.on('post-init', 9, app => {
    const namedVolumes = [];

    for (const composeData of Object.values(app.composeData)) {
      for (const data of composeData.data) {
        _.forEach(data.volumes, (value, key) => {
          if (value.external === true) {
            return;
          }

          namedVolumes.push(key);
        });
      }
    }

    for (const composeData of Object.values(app.composeData)) {
      for (const data of composeData.data) {
        _.forEach(namedVolumes, namedVolume => {
          _.unset(data.volumes, namedVolume);
          _.forEach(data.services, service => {
            _.remove(service.volumes, value => _.startsWith(value, namedVolume) || value.source === namedVolume);
          });
        });
      }
    }
  });
};
