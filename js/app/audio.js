define(function () {

	// create the audio context (chrome only for now)
	var context = new webkitAudioContext(),
		audioBuffer,
		mediaStreamBuffer,
		sourceNode,
		splitter,
		analyser,
		javascriptNode;
	
	/**
	 * Setup the nodes that will analyse and process the sound
	 * @param callback - the callback which is fired when the javascriptNode has processed 2048 audio frames
	 */
	function setupAudioNodes(callback) {
		// setup a javascript node that will process audio with a buffer of 2048 frames
		// so every 2048 frame an AudioProcessingEvent event will be fired
		// this node have one input channel and one output channel
		// see: http://www.w3.org/TR/webaudio/#JavaScriptAudioNode
		javascriptNode = context.createJavaScriptNode(2048, 1, 1);
		// connect the node to its destination
		javascriptNode.connect(context.destination);
	
		// create an analyzer, capable of realtime analysis of the audio frames
		// see: http://www.w3.org/TR/webaudio/#RealtimeAnalyserNode-section
		analyser = context.createAnalyser();
		// do not analyze each frame, smooth it 
		analyser.smoothingTimeConstant = 0.3;
		// size of the fft, results of sampling the sound in 1024/2=512 frequencies
		analyser.fftSize = 1024;
		
		// audioprocess callback definition
		onAudioProcess(callback);
		
		// plug the nodes together
		// analyser-->javascriptNode to analyze and interact with the sound
		// see this again : http://www.w3.org/TR/webaudio/#ModularRouting-section
		analyser.connect(javascriptNode);
	}
	
	/**
	 * Connect a buffered node as the sourceNode
	 * @param url - the url of the sound to load
	 */
	function connectSound(url) {
		// stop the previous mediaStreamBuffer, if it exists
		if (mediaStreamBuffer) {
			mediaStreamBuffer.disconnect(analyser);
			mediaStreamBuffer.disconnect(context.destination);
		}
		// create a buffer source node (i.e. in memory sound)
		// see : http://www.w3.org/TR/webaudio/#AudioBufferSourceNode-section
		sourceNode = context.createBufferSource();
		// connect the source to the analyser
		sourceNode.connect(analyser);
		// connect sourceNode to context.destination
		sourceNode.connect(context.destination);
		// finally load the sound
		loadSound(url);
	}
	
	/**
	 * Connect a media stream node as the sourceNode
	 */
	function connectStream() {
		// stop the previous sourceNode, if it exists
		if (sourceNode) {
			sourceNode.stop(0);
			sourceNode.disconnect(analyser);
			sourceNode.disconnect(context.destination);
		}
		// create a stream source from the microphone
		// see : http://www.w3.org/TR/webaudio/#MediaStreamAudioSourceNode-section
		// get the usermedia object to be able to connect to the mic
		navigator.webkitGetUserMedia({audio:true}, 
			function onSuccess(stream) {
				mediaStreamBuffer = context.createMediaStreamSource(stream);
				// connect the source to the analyser
				mediaStreamBuffer.connect(analyser);
				// dont do that unless you like Larsen effect
				//mediaStreamBuffer.connect(context.destination);
			}, 
			function onError() {
				console.log('go and get a decent browser!');
			}
		);
		
	}
	
	/**
	 * Loads the sound from the given url
	 * @param url - url of the sound
	 */
	function loadSound(url) {
		// request the sound
		var request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.responseType = 'arraybuffer';
		// when data is loaded, send it to the audio context
		request.onload = function() {
			// decode the data
			// see: http://www.w3.org/TR/webaudio/#methodsandparams-AudioContext
			context.decodeAudioData(
					request.response, 
					// when the audio is decoded play the sound
					function(buffer) {
						// sets the recieved sound as the buffer of the source node
						// see: http://www.w3.org/TR/webaudio/#methodsandparams-AudioContext
						sourceNode.buffer = buffer;
						// schedule to play the sound in 0 seconds
						// see: http://www.w3.org/TR/webaudio/#methodsandparams-AudioBufferSourceNode
						sourceNode.noteOn(0);
					},
					function(err) {
						console.log('Error while retrieving sound : ' + err);
					});
			}
		// send the request
		request.send();
	}
	
	/**
	 * Callback fired each time 2048 frames have been processed by the javascriptNode
	 */
	function onAudioProcess(callback) {
		// see : http://www.w3.org/TR/webaudio/#AudioProcessingEvent-section
		javascriptNode.onaudioprocess = function() {
			// creates an array of the size of 'frequencyBinCount' which is half of the 'fftSize'
			// so you'll have an array ready to get the amplitude of each frequency of the sound
			var array = new Uint8Array(analyser.frequencyBinCount);
			// put the current amplitude of each frequency in the array
			// see: http://www.w3.org/TR/webaudio/#methods-and-parameters
			analyser.getByteFrequencyData(array);
			// calculate the average amplitude of the sound
			var average = getAverageVolume(array);
			// let's do something with this average value
			callback(average);
		}
	}
	
	/**
	 * Calculates the average amplitude of each frequency
	 * @param array - array containing the amplitude of each frequency
	 * @returns the average amplitude of all frequency
	 */
	function getAverageVolume(array) {
		var values = 0;
		var average;
		var length = array.length;
		// sum the frequency amplitudes
		for (var i = 0; i < length; i++) {
			values += array[i];
		}
		// then mean it
		average = values / length;
		return average;
	}
	
	return {
		setupAudioNodes: setupAudioNodes,
		connectsound: connectSound,
		connectStream: connectStream
	}
});