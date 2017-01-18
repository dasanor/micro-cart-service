const fs = require('fs');

module.exports = {
  base: undefined,
  configFiles: undefined,
  servicePath: __dirname,

  setConfigFiles(configFiles) {
    this.configFiles = configFiles;
    return this;
  },

  defaultConfigFiles(extraFiles) {
    let files = [];

    if (fs.existsSync(`${this.servicePath}/extra.json`)) {
      files.push(`${this.servicePath}/extra.json`);
    }
    if (process.env.LOCAL_CONFIG_FILE) {
      files.push(process.env.LOCAL_CONFIG_FILE);
    }
    if (extraFiles) {
      files = files.concat(extraFiles);
    }
    files.push(`${this.servicePath}/config/${process.env.NODE_ENV || 'development'}.json`);
    files.push(`${this.servicePath}/config/defaults.json`);
    return files;
  },

  start(options = {}) {
    // Start microbase
    this.base = require('microbase')({
      extra: options.extra,
      configFiles: this.configFiles || this.defaultConfigFiles(),
      configObject: {
        servicePath: this.servicePath
      }
    });

    // Register model(s)
    this.base.utils.loadModulesFromKey('models');

    // Add operations
    this.base.services.addOperationsFromFolder();

    return this;
  }

};

