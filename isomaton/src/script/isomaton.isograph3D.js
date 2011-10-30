/*
todo:
- Mouse events
- Show offstage blocks
- Textures for letters
- Texture for life hearts
 */
(function IsomatonIsographPackage(Isomaton, _, undefined){
	var fps = 12;
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
		var baseMaterial = THREE.MeshLambertMaterial;
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
			container.onmousemove = this.onMouseMove;
			container.onmousedown = this.onMouseDown;
			container.onmouseup = this.onMouseUp;

			// Create place the camera
			var cameraSize = 1.3; // 2 is default (not sure what it means)
			var width = window.innerWidth;
			var height = window.innerHeight;
			camera = new THREE.OrthographicCamera(
					width / - cameraSize,
					width / cameraSize,
					height / cameraSize,
					height / - cameraSize,
					-3000,
					3000
			);
/*
			camera = new THREE.Camera(
				35,
				width / height,
				.2,
				10000
			);
*/
			camera.position.x = -700;
			camera.position.y = 600;
			camera.position.z = -700;

			mouse2d = new THREE.Vector3(0, 0, 1);

			scene = new THREE.Scene();


			var ambient = new THREE.AmbientLight( 0x888888 );
			scene.add( ambient );

			var light;

//			light = new THREE.PointLight(0xffffff, 0.8);
			light = new THREE.SpotLight(0xffffff, 0.8);
			light.position.set(-100, 700, 200);
			light.castShadow = true;
			scene.add(light);

			//
			//renderer = new THREE.CanvasRenderer();
			renderer = new THREE.WebGLRenderer({
				antialias: true
			});

			// Shadow settings
			renderer.shadowCameraNear = 2;
			renderer.shadowCameraFar = camera.far;
			renderer.shadowCameraFov = 90; // Was originally 50
			renderer.shadowMapBias = 0.003885;
			renderer.shadowMapDarkness = 0.35;
			renderer.shadowMapWidth = 1024;
			renderer.shadowMapHeight = 1024;
			renderer.shadowMapEnabled = true;
			renderer.shadowMapSoft = true;

			renderer.setSize( window.innerWidth, window.innerHeight );
			container.innerHTML = "";
			container.appendChild( renderer.domElement );

		};

		this.options = function (_options) {
			_(options).extend(this._options);
			return this._options;
		};

		this.projector = new THREE.Projector();

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
			var model, x, y, z, direction, speed;
			speed = 300;
			model = block.isograph.model;
			x = (block.coord.x * cubeSize - 500 + model.offset.x);
			z = (block.coord.y * cubeSize - 500 + model.offset.y);
			y = block.coord.z * cubeSize + model.offset.z;
			direction = block.coord.direction;
			// Remove the animation if the displacment is more than one block
			if (block.coord.stepDistanceFrom(block.prevCoord) > 1) speed = 0;
			// Call the animation sequence on the scenegraph
			this.updateBlockBitmap(model, x, y, z, direction, speed);
		};

		this.updateBlockBitmap = function(model, x, y, z, direction, speed) {
			var coord = model.position;
			// If the bitmap if moving higher/forward the z index
			// update the z-ordering first
			Tween
				.get(model.rotation, {
					override: true
				})
				.to({
					y: ((1 - direction) * 90) * (Math.PI / 180)
				}, speed/2, Transition.ease.in(Transition.quad));
			Tween
				.get(coord, {
					override: true
				})
				.to({
					x: x,
					y: y,
					z: z
				}, speed, Transition.ease.in(Transition.quad));
		};

		this.renderBlock = function renderBlock(block) {
			var model = null;
			if (!block.type.isInvisible) {
				var geometry = getGeometry(block.type);
				var cube = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial() );
				cube.offset = geometry.offset;
				cube.position.x = block.coord.x * cubeSize - (cubeSize * 10) + cube.offset.x;
				cube.position.z = block.coord.y * cubeSize - (cubeSize * 10) + cube.offset.y;
				cube.position.y = block.coord.z * cubeSize + cube.offset.z;
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
				THREE.Collisions.colliders.push(THREE.CollisionUtils.MeshOBB(cube));
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
		var r, f, dist;
		dist = 1000;
		r = 1;
		f = -10;
		this.frameStep = function frameStep() {
			// Reposition the camera
			/*
			r = r + 1/400;
			camera.position.x = dist * Math.cos(r);
			camera.position.y = dist * Math.sin(f);
			camera.position.z = dist * Math.sin(r);
			*/
			camera.lookAt( scene.position );
			// Render the scene with the camera
			renderer.clear();
			renderer.render( scene, camera );
		};

		this.init();
	}

})(Isomaton, _);
