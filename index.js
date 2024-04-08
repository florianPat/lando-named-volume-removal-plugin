'use strict';

module.exports = lando => {
  lando.events.on('post-boostrap-config', () => {
    lando.log.info('Named volume removal plugin loaded!');
  });
};
