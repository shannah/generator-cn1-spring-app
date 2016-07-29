var generators = require('yeoman-generator');
var fs = require('fs');
module.exports = generators.Base.extend({
  // The name `constructor` is important here
  constructor: function () {
    // Calling the super constructor is important so our generator is correctly set up
    generators.Base.apply(this, arguments);

    // Next, add your custom code
    this.argument('appname', {type: String, required: true});
    this.option('pkg');
  },
  
  prompting: function() {
    if (!this.options.pkg) {
        return this.prompt([{
            type: 'input',
            name: 'pkg',
            message: 'Base app package',
            default: 'com.example.myapp'
        }]).then(function(answers) {
            this.options.pkg = answers.pkg;
            //this.log('base package', answers.pkg);
        }.bind(this));
    }
  },
  
  method1: function () {
    console.log('method 1 just ran');
  },
  method2: function () {
    console.log('method 2 just ran');
  },
  
  gitClone: function() {
    this.log("Cloning codenameone-spring-template into", this.destinationPath(this.appname),"with package",this.options.pkg);
    this.spawnCommandSync('git', ['clone', 'https://github.com/shannah/codenameone-spring-template', this.destinationPath(this.appname)]);
  
  },
  
  copyProperties: function() {
    var done = this.async();
    this.log("Copying properties file");
    var propertiesSamplePath = this.destinationPath(this.appname + '/config.properties.sample');
    var propertiesPath = this.destinationPath(this.appname + '/config.properties');
    this.propertiesPath = propertiesPath;
    var source = fs.createReadStream(propertiesSamplePath);
    var dest = fs.createWriteStream(propertiesPath);

    source.pipe(dest);
    source.on('end', function() {
        fs.unlinkSync(propertiesSamplePath);
        done();
    });
    source.on('error', function(err) { this.log("Failed to move config properties"); });
    
  },
  
  updateProperties: function() {
    this.log("Updating properties");
    var contents = fs.readFileSync(this.propertiesPath, 'utf-8');
    contents = contents.replace('base.package.name=com.example', 'base.package.name='+this.options.pkg)
        .replace('artifact.prefix=com-example-app', 'artifact.prefix='+this.options.pkg.replace(/\./g, '-'))
        .replace('base.package.path=com/example', 'base.package.path='+this.options.pkg.replace(/\./g, '/'));
    //this.fs.write(this.propertiesPath, contents);
    fs.writeFileSync(this.propertiesPath, contents);
  },
  
  antSetup: function() {
    this.spawnCommandSync('ant', ['setup'], {cwd: this.destinationPath(this.appname)});
  },
  
  antInstallShared: function() {
    this.spawnCommandSync('ant', ['install-shared'], {cwd: this.destinationPath(this.appname)});
  },
  
});
