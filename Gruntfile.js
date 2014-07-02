var TaskManager = require('./node_modules/uproxy-build-tools/build/taskmanager/taskmanager');

module.exports = function(grunt) {
  grunt.initConfig({
    copy: {
      build: {
        files: [ {
          expand: true, cwd: 'src/', src: ['**/*.js', '**/*.ts'], dest: 'build/'
        }, {
          expand: true, cwd: 'src/transformers', src: ['uTransformers.fte.js', 'uTransformers.rabbit.js'], dest: 'demo/html/'
        } ]
      },
    },

    jasmine_node: {
      options: {
        forceExit: true,
        match: '.',
        matchall: false,
        extensions: 'js',
        specNameMatcher: 'spec'
      },
      all: ['build/']
    },

    clean: ['build/**']
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-jasmine-node');

  var taskManager = new TaskManager.Manager();

  taskManager.add('build', [
    'copy'
  ]);

  taskManager.add('test', [
    'build',
    'jasmine_node'
  ]);

  taskManager.add('default', ['build']);

  taskManager.list().forEach(function(taskName) {
    grunt.registerTask(taskName, taskManager.get(taskName));
  });
};
