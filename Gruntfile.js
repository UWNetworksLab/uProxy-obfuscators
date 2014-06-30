var TaskManager = require('./node_modules/uproxy-build-tools/build/taskmanager/taskmanager');

module.exports = function(grunt) {
  grunt.initConfig({
    jasmine_node: {
      options: {
        forceExit: true,
        match: '.',
        matchall: false,
        extensions: 'js',
        specNameMatcher: '*'
      }
    }
  });

  grunt.loadNpmTasks('grunt-jasmine-node');

  var taskManager = new TaskManager.Manager();

  taskManager.add('test', [
    'jasmine_node'
  ]);

  taskManager.add('default', ['build']);

  taskManager.list().forEach(function(taskName) {
    grunt.registerTask(taskName, taskManager.get(taskName));
  });
};
