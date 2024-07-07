Lando starts with plugin
=========

This example tests that lando starts up successfully with the plugin loaded.

Start up tests
--------------

Run the following commands to get up and running with this example

```bash
# Should poweroff
lando poweroff

# Should start up successfully
echo "<?php phpinfo(); ?>" > index.php
lando start
```

Verification commands
---------------------

Run the following commands to validate things are rolling as they should.

```bash
# Should return PHP info
lando ssh -s appserver -c "curl -L localhost" | grep "PHP Version"
```

Destroy tests
-------------

Run the following commands to trash this app like nothing ever happened.

```bash
# Should be destroyed with success
lando destroy -y
lando poweroff
rm index.php
```
