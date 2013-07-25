var app = null;

module.exports = function(grunt) {
	// Configure plugins
	grunt.initConfig({
	  watch: {
		scripts: {
		  files: ['app.js'],
		  tasks: ['server']
		}
	  }
	});
	
	grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['server', 'watch']);	
	
	grunt.registerTask('server', 'Restarts the server.', function() {
		if (app !== null) app.kill();
		app = grunt.util.spawn({
			cmd: 'node',
			args: ['./app.js'],
			opt: { stdio: 'inherit' }
		});
 	});
}
