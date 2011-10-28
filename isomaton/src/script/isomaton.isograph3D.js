/*
todo:
- Mouse events
- Textures for all cube blocks
- Mesh for invisible blocks
- Mesh for flat items, non blocks (shortweeds, flowers)
- Textures for letters and hearts
- Variations on the size of blocks (material vs knight vs sidekick)
- Rotate block in the appropriate directions
- Remove blocks on "remove" event
-
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
		var container, camera, scene, renderer;

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
				if (shape == "liquidBlock") {
					geometry = new THREE.CubeGeometry(cubeSize, cubeSize*0.85, cubeSize, 4, 4, 1, materials);
				} else if (shape == "mediumBlock") {
					geometry = new THREE.CubeGeometry(cubeSize*0.85, cubeSize*0.85, cubeSize*0.85, 4, 4, 1, materials);
				} else if (shape == "smallBlock") {
					geometry = new THREE.CubeGeometry(cubeSize*0.75, cubeSize*0.75, cubeSize*0.75, 4, 4, 1, materials);
				} else if (shape == "floorTile") {
					geometry = new THREE.CubeGeometry(cubeSize, 0, cubeSize*0.75, 4, 4, 1, materials);
				} else if (shape == "verticalTile") {
					geometry = new THREE.CubeGeometry(cubeSize, cubeSize, 0, 4, 4, 1, materials);
				} else {
					geometry = new THREE.CubeGeometry(cubeSize, cubeSize, cubeSize, 4, 4, 1, materials);
				}
				geometries[id] = geometry;
			}
			function material(id, face) {
				return new baseMaterial({ map : loader(root + id + "/" + face + ".png") })
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

			/*
			todo:
			canvasStage = this.canvasStage = new Stage(canvas);
			canvasStage.mouseEnabled = true;
			*/

			// attach mouse handlers directly to the source canvas:
			/*
			todo:
			canvas.onmousemove = this.onMouseMove;
			canvas.onmousedown = this.onMouseDown;
			canvas.onmouseup = this.onMouseUp;
			 */

			// todo: update how the focus and selection of blocks is done

			container = document.getElementById("isomaton");

			// Create place the camera
			var cameraSize = 1.2; // 2 is default (not sure what it means)
			camera = new THREE.OrthographicCamera( window.innerWidth / - cameraSize, window.innerWidth / cameraSize, window.innerHeight / cameraSize, window.innerHeight / - cameraSize, - 4000, 4000 );
			camera.position.x = 700;
			camera.position.y = 600;
			camera.position.z = 700;

			scene = new THREE.Scene();


			var light;
			light = new THREE.PointLight(0xffffff, 0.6);
			light.position.set(300, 300, 700);
			scene.add(light);
			light = new THREE.PointLight(0xffffff, 0.8);
			light.position.set(1000, 1000, 1000);
			scene.add(light);

			//
			//renderer = new THREE.CanvasRenderer();
			renderer = new THREE.WebGLRenderer({
				antialias: true
			});
			renderer.setSize( window.innerWidth, window.innerHeight );
			container.innerHTML = "";
			container.appendChild( renderer.domElement );

		};

		this.options = function (_options) {
			_(options).extend(this._options);
			return this._options;
		};

		this.onMouseMove = function onMouseMove(e) {
			if (!e) { e = window.event; }
			isograph.mouseX = e.pageX - this.offsetLeft;
			isograph.mouseY = e.pageY - this.offsetTop;
		};
		this.onMouseDown = function onMouseDown(e) {
			if (!e) { e = window.event; }
			isograph.mouseIsDown = true;
			if (isograph.mouseTarget) {
				isograph.mouseTarget.block.select();
				isograph.publish("blockSelect", [isograph.mouseTarget.block]);
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
			x = block.coord.x * cubeSize - 500;
			z = block.coord.y * cubeSize - 500;
			y = block.coord.z * cubeSize;
			direction = block.coord.direction;
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
				cube.position.x = block.coord.x * cubeSize - (cubeSize * 10);
				cube.position.z = block.coord.y * cubeSize - (cubeSize * 10);
				cube.position.y = block.coord.z * cubeSize;
				// Keep a reference to the isograph in the block
				// Add the cube to the scene
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
			isograph.frameStep();
		};

		/**
		 * Go through one frame redraw
		 */
		this.frameStep = function frameStep() {
			// Reposition the camera
			camera.lookAt( scene.position );
			// Render the scene with the camera
			renderer.render( scene, camera );
		};

		this.init();
	}

})(Isomaton, _);