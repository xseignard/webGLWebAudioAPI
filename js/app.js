require.config({
    baseUrl: 'js/lib',
    //except, if the module ID starts with "app",load it from the js/app directory.
    paths: {
        app: '../app'
    }
});

// Start the main app logic.
require(['jquery', 'app/scene', 'app/audio', 'bootstrap'],
function ($, scene, audio) {
	
	// flag to indicate if the source node is the mic
	var useMic = false;
	
	// url of the sound
	var url = 'sound/OGLikeCapone.ogg';
	
	// create scene
	scene.createScene($('#container'));
	
	// callback called each 2048 audio frames processed
	var callback = function(average) { scene.render(average,average);}
	
	// create audio
	audio.setupAudioNodes(callback);
	// firstly connect to the sound
	audio.connectsound(url);
	
	// handle sourcenode changes
	$('#switch').on('click', '.btn', function() {
	    if (!$(this).hasClass('btn-info')) {
	    	$(this).addClass('btn-info');
	    	$(this).siblings().removeClass('btn-info');
	    	useMic = !useMic;
	    	console.log(useMic);
	    	if (useMic) {
	    		audio.setupAudioNodes(callback);
	    		audio.connectStream();
	    	}
	    	else {
	    		audio.setupAudioNodes(callback);
	    		audio.connectsound(url);
	    	}
	    }
	});

});