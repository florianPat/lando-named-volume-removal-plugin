'use strict';

const _ = require('lodash');

module.exports = (app, lando) => {
  app.events.on('post-init', 1, app => {
    for (const composeData of app.composeData) {
      for (const data of composeData.data) {
        const namedVolumes = [];
        _.forEach(data.volumes, (value, key) => {
          if (value.external === true) {
            return;
          }

          namedVolumes.push(key);
        });
        _.forEach(namedVolumes, namedVolume => {
          _.unset(data.volumes, namedVolume);
          _.forEach(data.services, service => {
            _.remove(service.volumes, value => _.startsWith(value, namedVolume) || value.source === namedVolume);
          })
        })
      }
    }
  });
};
