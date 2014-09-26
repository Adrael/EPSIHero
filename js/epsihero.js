THREE.EPSIHero =
    (function () {

//        'use strict';

        // Application packaging
        var vm = this;

        vm.cubes = [];
        vm.lifes = 4;
        vm.points = 0;
        vm.currentThresholdPoints = 0;

        vm.endContainer = document.getElementById('end');
        vm.lifesContainer = document.getElementById('lifes');
        vm.pointsContainer = document.getElementById('points');
        vm.clock = new THREE.Clock();

        vm.backgroundSound = new Audio('assets/song.mp3');
        vm.breakSound = 'assets/break.wav';
        vm.successSound = 'assets/coin.wav';
        vm.gameOverSound = 'assets/gameover.wav';

        vm.blend = blend;
        vm.fastAbs = fastAbs;
        vm.threshold = threshold;
        vm.checkAreas = checkAreas;
        vm.differenceAccuracy = differenceAccuracy;

        vm.play = play;
        vm.render = render;
        vm.hasStream = hasStream;
        vm.createFog = createFog;
        vm.initialize = initialize;
        vm.createScene = createScene;
        vm.createLight = createLight;
        vm.createStats = createStats;
        vm.createPlayer = createPlayer;
        vm.hasNotStream = hasNotStream;
        vm.getUserVideo = getUserVideo;
        vm.createCamera = createCamera;
        vm.createCubeLine = createCubeLine;
        vm.createRenderer = createRenderer;
        vm.createTextures = createTextures;
        vm.createUserVideo = createUserVideo;
        vm.createOrbitControls = createOrbitControls;

        return vm;

        /**
         * The render function.
         * @name render
         * @return {Object} this for chaining purposes
         * @function
         */
        function render() {

            if (vm.lifes > 0) {

                var delta = vm.clock.getDelta();

                if (vm.gameStart && vm.cubes.length > 0) {

                    for (var i in vm.cubes) {

                        for (var j = 1; j < vm.cubes[i].length; ++j) {

                            var divide = vm.points / 20;
                            var threshold = (divide > 1 ? divide : 1);
                            var speed = (vm.points > 0 ? threshold : 1);
                            var moveDistance = vm.cubes[i][j].position.y * -delta * speed;
                            vm.cubes[i][j].translateZ(moveDistance);

                        }

                    }

                    var originPoint = vm.player.position.clone();
                    for (var vertexIndex = 0; vertexIndex < vm.player.geometry.vertices.length; ++vertexIndex) {

                        var localVertex = vm.player.geometry.vertices[vertexIndex].clone();
                        var globalVertex = localVertex.applyMatrix4(vm.player.matrix);
                        var directionVector = globalVertex.sub(vm.player.position);

                        var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
                        var cubes = vm.cubes[0].slice(1, vm.cubes[0].length);

                        var collisionResults = ray.intersectObjects(cubes);
                        if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {

                            if (vm.cubes[0][0].color === vm.actualColor) {

                                vm.play(vm.successSound);
                                vm.points += 10;

                                if(vm.points - vm.currentThresholdPoints > 100) {
                                    vm.currentThresholdPoints = vm.points;
                                    ++vm.lifes;
                                }

                            } else {

                                vm.play(vm.breakSound);

                                if (vm.points > 0) {
                                    vm.points -= 5;
                                }

                                --vm.lifes;

                            }

                            for (var i in cubes) {
                                vm.scene.remove(cubes[i]);
                            }

                            vm.cubes = vm.cubes.slice(1, vm.cubes.length);
                            vm.createCubeLine();
                            break;

                        }

                    }
                }

                while (vm.lifesContainer.firstChild) {
                    vm.lifesContainer.removeChild(vm.lifesContainer.firstChild);
                }

                for (var i = 0; i < vm.lifes; ++i) {
                    var heart = new Image();
                    heart.src = 'assets/heart_' + (vm.lifes > 4 ? 4 : vm.lifes) + '.png';
                    vm.lifesContainer.appendChild(heart);
                }

                vm.pointsContainer.innerHTML = 'Points: ' + vm.points;

                vm.stats.update();
                vm.controls.update();

                vm.renderer.render(vm.scene, vm.camera);

                if (vm.camvideo.readyState === vm.camvideo.HAVE_ENOUGH_DATA) {

                    vm.videoContext.drawImage(vm.camvideo, 0, 0, vm.videoCanvas.width, vm.videoCanvas.height);

                    for (var i = 0; i < buttons.length; i++) {

                        vm.layer2Context.drawImage(vm.buttons[i].image, vm.buttons[i].x, vm.buttons[i].y, vm.buttons[i].w, vm.buttons[i].h);

                    }

                }

                vm.blend();
                vm.checkAreas();

                requestAnimationFrame(vm.render);
            } else {

                vm.backgroundSound.pause();
                vm.play(vm.gameOverSound);
                vm.endContainer.innerHTML = 'GAME OVER!';

            }

            return this;

        }

        /**
         * Set everything up.
         * @name initialize
         * @return {Object} this for chaining purposes
         * @function
         */
        function initialize() {

            vm.backgroundSound.play();

            vm.createUserVideo();
            vm.getUserVideo();

            vm.createScene();
            vm.createFog();
            vm.createLight();
            vm.createStats();
            vm.createCamera();
            vm.createRenderer();
            vm.createTextures();
            vm.createPlayer();
            vm.createOrbitControls();

            vm.createCubeLine();

            vm.render();

            return this;

        }

        /**
         * Create the application's light.
         * @name createLight
         * @return {Object} this for chaining purposes
         * @function
         */
        function createLight() {

            vm.light = new THREE.PointLight(0xffffff);
            vm.light.position.set(-100, 250, 100);
            vm.scene.add(vm.light);

            return this;

        }

        /**
         * Create the application's fog.
         * @name createFog
         * @return {Object} this for chaining purposes
         * @function
         */
        function createFog() {

            vm.scene.fog = new THREE.FogExp2(0x9999ff, 0.00025);

            return this;

        }

        /**
         * Create the application's scene.
         * @name createScene
         * @return {Object} this for chaining purposes
         * @function
         */
        function createScene() {

            vm.scene = new THREE.Scene();
            return this;

        }

        /**
         * Create the application's camera.
         * @name createCamera
         * @return {Object} this for chaining purposes
         * @function
         */
        function createCamera() {

            var NEAR = 0.1,
                FAR = 20000,
                VIEW_ANGLE = 45,
                SCREEN_WIDTH = window.innerWidth,
                SCREEN_HEIGHT = window.innerHeight,
                ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT;

            vm.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
            vm.scene.add(vm.camera);
            vm.camera.position.set(0, 150, 400);
            vm.camera.lookAt(vm.scene.position);

            return this;

        }

        /**
         * Create the application's renderer.
         * @name createRenderer
         * @return {Object} this for chaining purposes
         * @function
         */
        function createRenderer() {

            if (Detector.webgl) {

                vm.renderer = new THREE.WebGLRenderer({ antialias: true });

            } else {

                vm.renderer = new THREE.CanvasRenderer();

            }

            var SCREEN_WIDTH = window.innerWidth,
                SCREEN_HEIGHT = window.innerHeight;

            vm.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

            document.body.appendChild(vm.renderer.domElement);

            return this;

        }

        /**
         * Create the application's OrbitControls.
         * @name createOrbitControls
         * @return {Object} this for chaining purposes
         * @function
         */
        function createOrbitControls() {

            vm.controls = new THREE.OrbitControls(vm.camera);

            return this;

        }

        /**
         * Create the application's statistics.
         * @name createStats
         * @return {Object} this for chaining purposes
         * @function
         */
        function createStats() {

            vm.stats = new Stats();
            vm.stats.domElement.style.position = 'absolute';
            vm.stats.domElement.style.bottom = '0px';
            vm.stats.domElement.style.zIndex = 100;

            document.body.appendChild(vm.stats.domElement);

            return this;

        }

        /**
         * Create the application's player.
         * @name createPlayer
         * @return {Object} this for chaining purposes
         * @function
         */
        function createPlayer() {

            var cubeGeometry = new THREE.BoxGeometry(50, 50, 50);
            vm.cubeMaterial = new THREE.MeshLambertMaterial(
                {
                    color: 0xffffff,
                    map: vm.colorGray,
                    emissive: 0x333333
                }
            );

            vm.player = new THREE.Mesh(cubeGeometry, vm.cubeMaterial);
            vm.player.position.set(0, -150, 0);
            vm.scene.add(vm.player);

            return this;

        }

        /**
         * Create the application's textures.
         * @name createTextures
         * @return {Object} this for chaining purposes
         * @function
         */
        function createTextures() {

            vm.colorRed = THREE.ImageUtils.loadTexture("assets/SquareRed.png");
            vm.colorRed.name = 'red';

            vm.colorGreen = THREE.ImageUtils.loadTexture("assets/SquareGreen.png");
            vm.colorGreen.name = 'green';

            vm.colorBlue = THREE.ImageUtils.loadTexture("assets/SquareBlue.png");
            vm.colorBlue.name = 'blue';

            vm.colorYellow = THREE.ImageUtils.loadTexture("assets/SquareYellow.png");
            vm.colorYellow.name = 'yellow';

            vm.colorGray = THREE.ImageUtils.loadTexture("assets/SquareGray.png");
            vm.colorGray.name = 'gray';

            return this;

        }

        /**
         * Set up the user's webcam.
         * @name createUserVideo
         * @return {Object} this for chaining purposes
         * @function
         */
        function createUserVideo() {

            vm.videoCanvas = document.getElementById('videoCanvas');
            vm.videoContext = vm.videoCanvas.getContext('2d');

            vm.layer2Canvas = document.getElementById('layer2');
            vm.layer2Context = layer2Canvas.getContext('2d');

            vm.blendCanvas = document.getElementById('blendCanvas');
            vm.blendContext = blendCanvas.getContext('2d');

            vm.videoContext.translate(320, 0);
            vm.videoContext.scale(-1, 1);
            vm.videoContext.fillStyle = 'white';
            vm.videoContext.fillRect(0, 0, vm.videoCanvas.width, vm.videoCanvas.height);

            vm.buttons = [];
            var y = 10;

            /* RED BUTTON */
            var button1 = new Image();
            button1.src = 'assets/buttonRed.png';
            var buttonData1 =
            {
                name: 'red',
                image: button1,
                x: 27,
                y: y,
                w: 32,
                h: 32
            };

            vm.buttons.push(buttonData1);

            /* GREEN BUTTON */
            var button2 = new Image();
            button2.src = 'assets/buttonGreen.png';
            var buttonData2 =
            {
                name: 'green',
                image: button2,
                x: 105,
                y: y,
                w: 32,
                h: 32
            };

            vm.buttons.push(buttonData2);

            /* BLUE BUTTON */
            var button3 = new Image();
            button3.src = 'assets/buttonBlue.png';
            var buttonData3 =
            {
                name: 'blue',
                image: button3,
                x: 183,
                y: y,
                w: 32,
                h: 32
            };

            vm.buttons.push(buttonData3);

            /* YELLOW BUTTON */
            var button4 = new Image();
            button4.src = 'assets/buttonYellow.png';
            var buttonData4 =
            {
                name: 'yellow',
                image: button4,
                x: 261,
                y: y,
                w: 32,
                h: 32
            };

            vm.buttons.push(buttonData4);

            return this;

        }

        /**
         * Play with the user's webcam.
         * @name getUserVideo
         * @return {Object} this for chaining purposes
         * @function
         */
        function getUserVideo() {

            navigator.getUserMedia =
                navigator.getUserMedia ||
                navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia;

            if (!navigator.getUserMedia) {

                console.error('Sorry, navigator.getUserMedia()is not available.');
                return this;

            }

            vm.camvideo = document.getElementById('monitor');
            navigator.getUserMedia({ video: true }, hasStream, hasNotStream);

            return this;

        }

        /**
         * Callback when there is video.
         * @name hasStream
         * @param {??} stream The video stream
         * @return {Object} this for chaining purposes
         * @function
         */
        function hasStream(stream) {

            window.URL = window.URL || window.webkitURL;

            if (window.URL) {

                vm.camvideo.src = window.URL.createObjectURL(stream);

            } else {

                vm.camvideo.src = stream;

            }

            vm.gameStart = true;

            vm.camvideo.onerror = function (e) {

                stream.stop();

            };

            stream.onended = vm.hasNotStream;

            return this;

        }

        /**
         * Callback when there is no video.
         * @name hasNotStream
         * @param {Event} event The event
         * @return {Object} this for chaining purposes
         * @function
         */
        function hasNotStream(event) {

            var msg = 'No camera available.';

            if (event.code == 1) {

                msg = 'User denied access to use camera.';

            }

            console.error(msg);

            return this;

        }

        /**
         * Check the difference between two images in order to check if a button has been triggered.
         * @name blend
         * @return {Object} this for chaining purposes
         * @function
         */
        function blend() {

            var width = vm.videoCanvas.width,
                height = vm.videoCanvas.height;

            // get current webcam image data
            var sourceData = vm.videoContext.getImageData(0, 0, width, height);

            // create an image if the previous image doesn’t exist
            if (!vm.lastImageData) {
                vm.lastImageData = vm.videoContext.getImageData(0, 0, width, height);
            }

            // create a ImageData instance to receive the blended result
            var blendedData = vm.videoContext.createImageData(width, height);

            // blend the 2 images
            vm.differenceAccuracy(blendedData.data, sourceData.data, vm.lastImageData.data);

            // draw the result in a canvas
            vm.blendContext.putImageData(blendedData, 0, 0);

            // store the current webcam image
            vm.lastImageData = sourceData;

            return this;

        }

        /**
         * Compute the difference between two images.
         * @name differenceAccuracy
         * @param {Array} target
         * @param {Array} data1
         * @param {Array} data2
         * @return {Object} this for chaining purposes
         * @function
         */
        function differenceAccuracy(target, data1, data2) {

            if (data1.length !== data2.length) {
                return this;
            }

            var i = 0;
            while (i < (data1.length * 0.25)) {

                var average1 = (data1[4 * i] + data1[4 * i + 1] + data1[4 * i + 2]) / 3;
                var average2 = (data2[4 * i] + data2[4 * i + 1] + data2[4 * i + 2]) / 3;
                var diff = vm.threshold(vm.fastAbs(average1 - average2));
                target[4 * i] = diff;
                target[4 * i + 1] = diff;
                target[4 * i + 2] = diff;
                target[4 * i + 3] = 0xFF;
                ++i;

            }

            return this;

        }

        /**
         * Fastly compute the abs of a given value.
         * @name fastAbs
         * @return {Integer} the abs
         * @function
         */
        function fastAbs(value) {

            return (value ^ (value >> 31)) - (value >> 31);

        }

        /**
         * Check the given value against a threshold.
         * @name threshold
         * @return {Integer} the threshold
         * @function
         */
        function threshold(value) {

            return (value > 0x15) ? 0xFF : 0;

        }

        /**
         * Check if white region from blend overlaps area of interest (e.g. triggers).
         * @name checkAreas
         * @return {Object} this for chaining purposes
         * @function
         */
        function checkAreas() {

            for (var b = 0; b < vm.buttons.length; b++) {

                // get the pixels in a note area from the blended image
                var blendedData = vm.blendContext.getImageData(vm.buttons[b].x, vm.buttons[b].y, vm.buttons[b].w, vm.buttons[b].h);

                // calculate the average lightness of the blended data
                var i = 0,
                    sum = 0,
                    countPixels = blendedData.data.length * 0.25;

                while (i < countPixels) {

                    sum += (blendedData.data[i * 4] + blendedData.data[i * 4 + 1] + blendedData.data[i * 4 + 2]);
                    ++i;

                }

                // calculate an average between of the color values of the note area [0-255]
                var average = Math.round(sum / (3 * countPixels));

                // more than 20% movement detected
                if (average > 50) {

//                    console.log("Button " + buttons[b].name + " triggered.");

                    if (buttons[b].name == "red") {

                        vm.cubeMaterial.map = vm.colorRed;
                        vm.actualColor = 'red';

                    } else if (buttons[b].name == "green") {

                        vm.cubeMaterial.map = vm.colorGreen;
                        vm.actualColor = 'green';

                    } else if (buttons[b].name == "blue") {

                        vm.cubeMaterial.map = vm.colorBlue;
                        vm.actualColor = 'blue';

                    } else if (buttons[b].name == "yellow") {

                        vm.cubeMaterial.map = vm.colorYellow;
                        vm.actualColor = 'yellow';

                    }

                }

            }

        }

        /**
         * Create a cube line (barrier) with a door.
         * @name createCubeLine
         * @return {Object} this for chaining purposes
         * @function
         */
        function createCubeLine() {

            function getColor() {
                var c = colors[Math.round(Math.random() * colors.length)];
                while (!c) {
                    c = colors[Math.round(Math.random() * colors.length)];
                }
                return c;
            }

            var positionX = -100,
                colors = [vm.colorBlue, vm.colorRed, vm.colorGreen, vm.colorYellow],
                color = getColor(),
                numberOfCubesPerLine = 5,
                cubes = [
                    {color: color.name}
                ];

            for (var i = 0; i < numberOfCubesPerLine; ++i) {

                var cubeGeometry = new THREE.BoxGeometry(50, 50, 50);
                var cubeMaterial = new THREE.MeshLambertMaterial(
                    {
                        color: 0xffffff,
                        map: (i === Math.floor(numberOfCubesPerLine / 2) ? color : getColor()),
                        emissive: 0x333333
                    }
                );

                var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
                cube.position.set(positionX, -150, -1000);
                vm.scene.add(cube);
                cubes.push(cube);

                positionX += 50;

            }

            vm.cubes.push(cubes);

            return this;

        }

        /**
         * Play the given sound.
         * @name play
         * @param {String} sound The sound to be played
         * @return {Object} this for chaining purposes
         * @function
         */
        function play(sound) {

            console.log('Trying to play:', sound);

            var audio = new Audio();

            audio.addEventListener('loadeddata',
                function () {
                    console.log('Loaded and playing:', sound);
                    audio.play();
                }
                , false);

            audio.src = sound;

            return this;

        }

    })();