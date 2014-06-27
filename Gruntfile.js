var TaskManager = require('./node_modules/uproxy-build-tools/build/taskmanager/taskmanager');

module.exports = function(grunt) {
  grunt.initConfig({
    copy: {
      build: {
        files: [ {
          expand: true, cwd: 'src/', src: ['**/*.js', '**/*.ts'], dest: 'npm/'
        } ]
      },
    },
    jasmine: {
      transformers: {
        src: [
          'src/rabbit_transformer_test.js',
          'src/fte_transformer_test.js'
          ],
        options : { specs : 'npm/*.spec.js' }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jasmine');

  var taskManager = new TaskManager.Manager();

  taskManager.add('build', [
    'copy'
  ]);

  taskManager.add('test', [
    'jasmine'
  ]);

  taskManager.add('default', ['build']);

  taskManager.list().forEach(function(taskName) {
    grunt.registerTask(taskName, taskManager.get(taskName));
  });
};
