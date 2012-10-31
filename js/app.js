require.config({
    baseUrl: 'js/lib',
    //except, if the module ID starts with "app",load it from the js/app directory.
    paths: {
        app: '../app'
    }
});

// Start the main app logic.
require(['jquery', 'app/scene', 'app/audio'],
function ($, scene, audio) {
	
	// create audio
	audio.setupAudioNodes(function(average) {
		scene.render(average,average);
	});
	audio.loadSound('sound/OGLikeCapone.ogg');
	// create scene
	scene.createScene($('#container'));
});