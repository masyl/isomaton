/*
todo:
- Add block type and textures for each letters
- Add block type and texture for life heart


- Fix the mouse events to support the isographic camera
	https://github.com/mrdoob/three.js/issues/599
	http://catchvar.com/threejs-game-transforming-isometric-screen-co

 */
LOWRES = false;
ISOCAM = true;
if (LOWRES) {
	SETTING_ANTIALIAS = false;
	SETTING_FANCYLIGHTING = false;
	SETTING_FPS = 12;
	ANIMATED = false;
} else {
	SETTING_ANTIALIAS = true;
	SETTING_FANCYLIGHTING = true;
	SETTING_FPS = 4;
	ANIMATED = true;
}

(function IsomatonIsographPackage(Isomaton, _, undefined){
	var fps = SETTING_FPS;
	var requestAnimationFrame;

	if ( !window.requestAnimationFrame ) {
		requestAnimationFrame = ( function() {
			return window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {
				window.setTimeout( callback, 1000 / fps );
			};
		} )();
	}
	if (fps) {
		requestAnimationFrame = function(callback, element ) {
			window.setTimeout( callback, 1000 / fps );
		};
	}

	Isomaton.Isograph = function Isograph(options) {
		var container, camera, scene, renderer, mouse2d;

		var isograph = this;
		mixinPubSub(this);

		this._options = {};
		this.stepSpeed = 0;
		this.state = null; // Reference to the state machine containing all the blocks
		this.blockTypes = null;


		var cubeSize = 50;

		var baseMaterial;
		if (SETTING_FANCYLIGHTING) {
			baseMaterial = THREE.MeshLambertMaterial;
		} else {
			baseMaterial = THREE.MeshBasicMaterial;
		}
		var loader = THREE.ImageUtils.loadTexture;
		var geometries = {};

		function getGeometry(blockType) {
			var root = "textures/";
			var id = blockType.id;
			var shape = blockType.shape;
			var geometry;
			if (geometries.hasOwnProperty(id)) {
				geometry = geometries[id];
			} else {
				var materials = [
					material(id, "left"),
					material(id, "right"),
					material(id, "top"),
					material(id, "bottom"),
					material(id, "front"),
					material(id, "back")
				];
				var offset = { x: 0, y: 0, z: 0};
				if (shape == "liquidBlock") {
					geometry = new THREE.CubeGeometry(cubeSize, cubeSize*0.85, cubeSize, 4, 4, 1, materials);
					offset = { x: 0, y: 0, z:-(cubeSize * 0.15/2)};
				} else if (shape == "mediumBlock") {
					geometry = new THREE.CubeGeometry(cubeSize * 0.85, cubeSize * 0.85, cubeSize * 0.85, 4, 4, 1, materials);
					offset = { x: 0, y: 0, z:-(cubeSize * 0.15/2)};
				} else if (shape == "smallBlock") {
					geometry = new THREE.CubeGeometry(cubeSize*0.75, cubeSize*0.75, cubeSize*0.75, 4, 4, 1, materials);
					offset = { x: 0, y: 0, z:-(cubeSize * 0.25)/2};
				} else if (shape == "tinyBlock") {
					geometry = new THREE.CubeGeometry(cubeSize*0.50, cubeSize*0.50, cubeSize*0.50, 4, 4, 1, materials);
					offset = { x: 0, y: 0, z:-(cubeSize * 0.50)/2};
				} else if (shape == "floorTile") {
					geometry = new THREE.CubeGeometry(cubeSize, 0, cubeSize*0.75, 4, 4, 1, materials);
					offset = { x: 0, y: 0, z:-(cubeSize/2)};
				} else if (shape == "halfBlock") {
					geometry = new THREE.CubeGeometry(cubeSize, cubeSize*0.5, cubeSize, 4, 4, 1, materials);
					offset = { x: 0, y: 0, z:-(cubeSize*0.5/2)};
				} else if (shape == "verticalTile") {
					geometry = new THREE.CubeGeometry(cubeSize, cubeSize, 0, 4, 4, 1, materials);
				} else if (shape == "cursorBlock") {
					geometry = new THREE.CubeGeometry(cubeSize*1.1, cubeSize*1.1, cubeSize*1.1, 4, 4, 1, materials);
					offset = { x: 0, y: 0, z:(cubeSize*0.1/2)};
				} else {
					geometry = new THREE.CubeGeometry(cubeSize, cubeSize, cubeSize, 4, 4, 1, materials);
				}
				geometry.offset = offset;
				geometries[id] = geometry;
			}
			function material(id, face) {
				var isTransparent = true
				options = {
					depthTest: false,
					map : loader(root + id + "/" + face + ".png")
				};
				if (isTransparent) {
					//options.blending = THREE.AdditiveBlending;
					options.transparent = true;

				}
				return new baseMaterial(options)
			}
			return geometry;
		}

		this.init = function () {
			var canvasStage, canvas;
			this.options(options);

			// todo: get root target from options
			// create stage and point it to the canvas:
			canvas = options.canvas;
			this.blockTypes = options.blockTypes;

			this.canvas = canvas;

			// todo: update how the focus and selection of blocks is done
			container = document.getElementById("isomaton");
//			container.onmousemove = this.onMouseMove;
			container.onmousedown = this.onMouseDown;
//			container.onmouseup = this.onMouseUp;

			// Create place the camera
			var width = window.innerWidth;
			var height = window.innerHeight;

			if (ISOCAM) {
				var cameraSize = 1.1; // 2 is default (not sure what it means)
				camera = new THREE.OrthographicCamera(
						width / - cameraSize,
						width / cameraSize,
						height / cameraSize,
						height / - cameraSize,
						-3000,
						3000
				);
				var offset = 600;
				camera.position.x = -600;
				camera.position.y = 600;
				camera.position.z = -600;
				var pos = {
					x: 0,
					y: 0,
					z: 0
				};
				console.log(camera);
				camera.lookAt( pos );
				var angle = -0;
				camera.scale.x = 0.82;
				camera.scale.y = 0.82;
				camera.up.x = camera.up.x + angle;
				camera.up.y = camera.up.y + angle;
			} else {
				camera = new THREE.PerspectiveCamera(
					40,
					width / height,
					.2,
					10000
				);
				/*
				camera.position.x = -700;
				camera.position.y = 500;
				camera.position.z = -700;
				*/
				camera.position.x = -1700;
				camera.position.y = 1700;
				camera.position.z = -1700;
				var pos = {
					x: -500,
					y: 0,
					z: -500
				};
				camera.lookAt( pos );
			}


			mouse2d = new THREE.Vector3(0, 0, 1);

			scene = new THREE.Scene();

			var light, ambient;

			if (SETTING_FANCYLIGHTING) {
				light = new THREE.SpotLight(0xffffff, 0.8);
				light.position.set(-100, 700, 200);
				light.castShadow = true;
				scene.add(light);
				ambient = new THREE.AmbientLight( 0x888888 );
				scene.add( ambient );
			} else {
				light = new THREE.PointLight(0xffffff, 0.8);
				scene.add(light);
			}

			renderer = new THREE.WebGLRenderer({
				antialias: SETTING_ANTIALIAS
			});

			// Shadow settings
			if (SETTING_FANCYLIGHTING) {
				renderer.shadowCameraNear = 2;
				renderer.shadowCameraFar = camera.far;
				renderer.shadowCameraFov = 90; // Was originally 50
				renderer.shadowMapBias = 0.003885;
				renderer.shadowMapDarkness = 0.35;
				renderer.shadowMapWidth = 1024;
				renderer.shadowMapHeight = 1024;
				renderer.shadowMapSoft = true;
				renderer.shadowMapEnabled = true;
			}

			renderer.setSize( window.innerWidth, window.innerHeight );
			container.innerHTML = "";
			container.appendChild( renderer.domElement );

		};

		this.options = function (_options) {
			_(options).extend(this._options);
			return this._options;
		};


		this.screenPointToRay = function(screenPos) {
			var vector = new THREE.Vector3(screenPos.x, screenPos.y, 1/*0.5*/);
			isograph.projector.unprojectVector(vector, camera);
			return new THREE.Ray(camera.position, vector.subSelf(camera.position).normalize());
		};

		this.onMouseMove = function onMouseMove(e) {
			e.preventDefault();
			if (!e) { e = window.event; }
		};
		this.onMouseDown = function onMouseDown(e) {
			e.preventDefault();
			if (!e) { e = window.event; }
			isograph.mouseIsDown = true;
/* begin */
			var x, y;

			x = e.clientX;
			y = e.clientY;

			x = ( x / window.innerWidth ) * 2 - 1;
			y = ( y / window.innerHeight ) * 2 + 1;

			var
			    startVector = new THREE.Vector3(),
			    endVector = new THREE.Vector3(),
			    dirVector = new THREE.Vector3(),
			    goalVector = new THREE.Vector3(),
			    t;

			startVector.set( x, y, -1.0 );
			endVector.set( x, y, 1.0 );

			var projector = new THREE.Projector();

			// Convert back to 3D world coordinates
			startVector = projector.unprojectVector( startVector, camera );
			endVector = projector.unprojectVector( endVector, camera );

			// Get direction from startVector to endVector
			dirVector.sub( endVector, startVector );
			dirVector.normalize();

			// Find intersection where y = 0
			t = startVector.y / - ( dirVector.y );

			// Find goal point
			goalVector.set(
				startVector.x + t * dirVector.x,
				startVector.y + t * dirVector.y,
				startVector.z + t * dirVector.z );

console.log(goalVector.x/50, parseInt(goalVector.z/50));


/*
			var collisions;
			mouse2d.x = (e.clientX / window.innerWidth) * 2 - 1;
	  		mouse2d.y = -(e.clientY / window.innerHeight) * 2 + 1;
			var vector = new THREE.Vector3( mouse2d.x, mouse2d.y, 0.5 );
			isograph.projector.unprojectVector(vector, camera);
			var ray = new THREE.Ray(camera.position, vector.subSelf(camera.position).normalize());
		   collisions = THREE.Collisions.rayCastNearest(ray);
		   if (collisions) {
			   isograph.mouseTarget = collisions.mesh.block;
		   }
*/

			if (isograph.mouseTarget) {
				isograph.mouseTarget.select();
				isograph.publish("blockSelect", [isograph.mouseTarget]);
			}
		};
		this.onMouseDownOld = function onMouseDown(e) {
			e.preventDefault();
			if (!e) { e = window.event; }
			isograph.mouseIsDown = true;

/*
			var collisions;
			mouse2d.x = (e.clientX / window.innerWidth) * 2 - 1;
	  		mouse2d.y = -(e.clientY / window.innerHeight) * 2 + 1;
			var vector = new THREE.Vector3( mouse2d.x, mouse2d.y, 0.5 );
			isograph.projector.unprojectVector(vector, camera);
			var ray = new THREE.Ray(camera.position, vector.subSelf(camera.position).normalize());
		   collisions = THREE.Collisions.rayCastNearest(ray);
		   if (collisions) {
			   isograph.mouseTarget = collisions.mesh.block;
		   }
*/

			if (isograph.mouseTarget) {
				isograph.mouseTarget.select();
				isograph.publish("blockSelect", [isograph.mouseTarget]);
			}
		};
		this.onMouseUp = function onMouseUp(e) {
			if (!e) { e = window.event; }
			isograph.mouseIsDown = false;
		};
		this.onMouseOver = function onMouseOver(bitmap) {
			bitmap.block.focus();
		};
		this.onMouseOut = function onMouseOut(bitmap) {
			bitmap.block.blur();
		};



		// note: to prevent the "update" event chain from going into a loop
		// this method should not call the ".set" method on blocks
		this.updateBlock = function (block) {
			var model, x, y, z, direction, speed, coord3d;
			speed = 300;
			model = block.isograph.model;
			// If there is a 3D Model (some blocks are invisible)
			if (model) {
				coord3d = this.translateCoordTo3d(block.coord, model);
				x = coord3d.x;
				y = coord3d.y;
				z = coord3d.z;
				direction = block.coord.direction;
				// Remove the animation if the displacment is more than one block
				var distance = block.coord.stepDistanceFrom(block.prevCoord);
				if (distance > 1) {
					speed = 0;
				}
				// Call the animation sequence on the scenegraph
				this.updateBlockModel(model, x, y, z, direction, speed);
			} else {
				// todo: Invisible block such as Spawnpoints are still comming throught this method... why?
//				console.log("isInvisible", block);
			}
		};

		this.updateBlockModel = function(model, x, y, z, direction, speed) {
			var coord, rotation;
			coord = model.position;
			rotation = ((1 - direction) * 90) * (Math.PI / 180);
			if (ANIMATED) {
				Tween
					.get(model.rotation, {
						override: true
					})
					.to({
						y: rotation
					}, speed/2);
				Tween
					.get(coord, {
						override: true
					})
					.to({
						x: x,
						y: y,
						z: z
					}, speed, Transition.ease.in(Transition.quad));
			} else {
				model.rotation.y = rotation;
				coord.x = x;
				coord.y = y;
				coord.z = z;

			}
		};

		this.translateCoordTo3d = function translateCoordTo3d(coord, mesh) {
			var coord3d = {};
			var worldCenterOffset = cubeSize * 10;
			// todo handle different stage offset of x, y , z
			coord3d.x = coord.x * cubeSize - worldCenterOffset + mesh.offset.x;
			coord3d.y = coord.z * cubeSize - worldCenterOffset + mesh.offset.z;
			coord3d.z = coord.y * cubeSize;
			return coord3d;
		};

		this.renderBlock = function renderBlock(block) {
			var model = null;
			if (!block.type.isInvisible) {
				var geometry = getGeometry(block.type);
				var cube = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial() );
				cube.offset = geometry.offset;
				var coord3d = this.translateCoordTo3d(block.coord, cube);
				cube.position.x = coord3d.x;
				cube.position.y = coord3d.y;
				cube.position.z = coord3d.z;
				// Keep a reference to the isograph in the block
				// Add the cube to the scene

				// todo: should be in type settings?
				if (block.type.shape === "floorTile") {
					cube.receiveShadow = true;
				    cube.castShadow = false;
				} else if (block.type.shape === "cursorBlock") {
					cube.receiveShadow = false;
				    cube.castShadow = false;
				} else if (block.type.shape === "verticalTile") {
					cube.receiveShadow = true;
				    cube.castShadow = false;
				} else {
					cube.receiveShadow = true;
				    cube.castShadow = true;
				}
				// back reference to the block
				cube.block = block;
				//Add a colider for this cube, so that mouse2d can detect it
//				THREE.Collisions.colliders.push(THREE.CollisionUtils.MeshOBB(cube));
				scene.add(cube);
				model = cube;
			}
			block.isograph = {
				model: model
			};
		};


		this.bind = function bind(state) {
			this.state = state;
			// blocks should be a temporary selection
			this.state.subscribe("add", function(blocks) {
				// todo: Having to do this sort of if is ridiculous
				if (blocks[0]["class"] === "Block") {
					var i, block;
					for (i in blocks) {
						block = blocks[i];
						isograph.renderBlock(block);
					}
				}
			});

			this.state.subscribe("remove", function(blocks) {
				var i, block;
				if (blocks[0]["class"] === "Block") {
					for (i in blocks) {
						block = blocks[i];
						scene.remove(block.isograph.model);
					}
				}
			});

			this.state.subscribe("update", function(blocks) {
				var i, block;
				if (blocks[0]["class"] === "Block") {
					for (i = 0; i < blocks.length; i = i + 1) {
						block = blocks[i];
						isograph.updateBlock(block);
					}
				}
			});
		};

		/**
		 * Setup the initiale stage of the stage by loading sprites, creating the stage,
		 * containers and initial bitmaps
		 */
		//todo: see if redundant with init
		this.setup = function(state, callback) {
			this.bind(state);
			this.animate();
			callback();
		};

		this.animate = function animate() {
			requestAnimationFrame(isograph.animate);


			// Raycast nearest
/*
			var r = new THREE.Ray();
			r.origin = mouse2d.clone();
			var matrix = camera.matrixWorld.clone();
			matrix.multiplySelf(THREE.Matrix4.makeInvert(camera.projectionMatrix));
			matrix.multiplyVector3(r.origin);
			r.direction = r.origin.clone().subSelf(camera.position);

			var c = THREE.Collisions.rayCastNearest(r);
//			console.log("c:", r, mouse2d.x, mouse2d.y, mouse2d.z, c);
			if (c) {

			}

*/
			isograph.frameStep();
		};

		/**
		 * Go through one frame redraw
		 */
		this.frameStep = function frameStep() {
			renderer.clear();
			renderer.render( scene, camera );
		};

		this.init();
	}

})(Isomaton, _);
