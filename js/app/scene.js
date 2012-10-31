define(["../three"], function () {
	
	// three.js objects
	var camera, 
		scene,
		renderer,
		cubes = new Array();

	// inner size of the window
	var WIDTH = window.innerWidth, HEIGHT = window.innerHeight;

	// camera attributes
	var VIEW_ANGLE = 70, ASPECT = WIDTH / HEIGHT, NEAR = 1, FAR = 1000;

	/**
	 * Create the scene
	 * @param containerElement - the element that will contains the scene
	 */
	function createScene(containerElement) {
		// create a renderer, camera and a scene
		renderer = new THREE.WebGLRenderer();
		renderer.setSize(WIDTH, HEIGHT);
		camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
		scene = new THREE.Scene();
		// add the camera to the scene
		scene.add(camera);
		// back the camera from the center of the scene
		camera.position.z = 300;
		
		// create a 3x3 matrix of cubes
		var x= -75,
			y= -50,
			z= 0,
			i= 0,
			currentCube;
		// clear array
		cubes.length= 0;
		
		for (i; i<3; i++) {
			currentCube = createCube({x:x,y:y,z:z});
			scene.add(currentCube);
			cubes[i] = currentCube;
			x += 75;
		}
		x= -75;
		y= 30;
		for (i; i<6; i++) {
			currentCube = createCube({x:x,y:y,z:z});
			scene.add(currentCube);
			cubes[i] = currentCube;
			x += 75;
		}
		x= -75;
		y= 110;
		for (i; i<9; i++) {
			currentCube = createCube({x:x,y:y,z:z});
			scene.add(currentCube);
			cubes[i] = currentCube;
			x += 75;
		}	
		// rendering in the dom
		containerElement.append(renderer.domElement);

		// resize listener
		handleResize();
	}

	/**
	 * Create a cube
	 * @param coordinates - x,y,z json object representing the coordinates of the cube in the scene
	 * @returns the created cube
	 */
	function createCube(coordinates) {
		// Cube creation
		// the cube we'll add to the scene is composed by it's geometry and a material covering it
		var geometry = new THREE.CubeGeometry(50, 50, 50);
		// give a random color for each face
		for (var i = 0; i < geometry.faces.length; i++) {
			geometry.faces[i].color.setHex(Math.random() * 0xffffff);
		}
		// create the material
		var material = new THREE.MeshBasicMaterial({
			// tell the material to use the already defined cube face colors
			vertexColors : THREE.FaceColors
		});
		// create the cube
		var cube = new THREE.Mesh(geometry, material);
		// set its coordinates
		cube.position.x = coordinates.x;
		cube.position.y = coordinates.y;
		cube.position.z = coordinates.z;
		
		return cube;
	}



	/**
	 * Resize canvas when window is resized
	 */
	function handleResize() {
		$(window).resize(function() {
			windowHalfX = window.innerWidth / 2;
			windowHalfY = window.innerHeight / 2;
			// update camera
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			// adjust canvas size
			renderer.setSize(window.innerWidth, window.innerHeight);
		});
	}

	/**
	 * Render the scene
	 * @param xRotation - the x-axis rotation to operate on each cube
	 * @param yRotation - the y-axis rotation to operate on each cube
	 */
	function render(xRotation, yRotation) {
		// rotate cubes
		for (cube in cubes) {
			cubes[cube].rotation.x += xRotation*0.00125;
			cubes[cube].rotation.y += yRotation*0.00125;
		} 
		// render the scene
		renderer.render(scene, camera);
	}

    return {
        createScene: createScene,
        render: render
    }
});

