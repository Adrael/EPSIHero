THREE.EPSIHero =
    (function () {

//        'use strict';

        // Application packaging
        var vm = this;

        vm.settings =
        {
            pause: 'P',
            restart: 'R',
            accelerate: 'A',
            muteSound: false,
            soundVolume: 100,
            keymap: ['Q', 'S', 'L', 'M']
        };

        vm.keymap =
        {
            red: null,
            green: null,
            blue: null,
            yellow: null
        };

        vm.demo = false;

        vm.lifes = 5;
        vm.cubes = [];
        vm.points = 0;
        vm.end = false;
        vm.pause = false;
        vm.playerPosition = 2;
        vm.scoreThreshold = 1;
        vm.giveLifeThreshold = 10;
        vm.speedLineCoefficient = 1;
        vm.isWebcamReversed = false;
        vm.isWebcamInverted = false;
        vm.clock = new THREE.Clock();
        vm.invertWebcamThreshold = 15;
        vm.currentThresholdPoints = 0;
        vm.reverseWebcamThreshold = 50;
        vm.changeColorPositionThreshold = 30;
        vm.changeColorPositionAllowed = false;
        vm.endContainer = document.getElementById('end');
        vm.lifesContainer = document.getElementById('lifes');
        vm.pauseContainer = document.getElementById('pause');
        vm.pointsContainer = document.getElementById('points');

        vm.oneUpSound = 0;
        vm.breakSound = 1;
        vm.successSound = 2;
        vm.changeBlockSound = 3;
        vm.gameOverSound = 4;
        vm.switchColorsSound = 5;
        vm.revertImageSound = 6;
        vm.backgroundSound = 7;

        vm.finishedLoading = finishedLoading;
        vm.createSoundEngine = createSoundEngine;
        vm.startBackgroundSound = startBackgroundSound;

        vm.play = play;
        vm.blend = blend;
        vm.render = render;
        vm.fastAbs = fastAbs;
        vm.restart = restart;
        vm.playDemo = playDemo;
        vm.threshold = threshold;
        vm.hasStream = hasStream;
        vm.createFog = createFog;
        vm.checkAreas = checkAreas;
        vm.initialize = initialize;
        vm.onKeyPress = onKeyPress;
        vm.createScene = createScene;
        vm.createLight = createLight;
        vm.createLines = createLines;
        vm.createStats = createStats;
        vm.setSettings = setSettings;
        vm.shuffleArray = shuffleArray;
        vm.createPlayer = createPlayer;
        vm.hasNotStream = hasNotStream;
        vm.moveCubeLine = moveCubeLine;
        vm.getUserVideo = getUserVideo;
        vm.onKeyRelease = onKeyRelease;
        vm.createCamera = createCamera;
        vm.setPlayerRed = setPlayerRed;
        vm.changeKeymap = changeKeymap;
        vm.clearCubeLine = clearCubeLine;
        vm.createButtons = createButtons;
        vm.setPlayerBlue = setPlayerBlue;
        vm.reverseWebcam = reverseWebcam;
        vm.setPlayerGreen = setPlayerGreen;
        vm.movePlayerLeft = movePlayerLeft;
        vm.createCubeLine = createCubeLine;
        vm.createRenderer = createRenderer;
        vm.createTextures = createTextures;
        vm.movePlayerRight = movePlayerRight;
        vm.setPlayerYellow = setPlayerYellow;
        vm.displayControls = displayControls;
        vm.createUserVideo = createUserVideo;
        vm.createBackground = createBackground;
        vm.processCollisions = processCollisions;
        vm.invertWebcamColors = invertWebcamColors;
        vm.differenceAccuracy = differenceAccuracy;
        vm.createOrbitControls = createOrbitControls;
        vm.displayLifesAndPoints = displayLifesAndPoints;

        return vm;

        /**
         * The render function.
         * @name render
         * @return {Object} this for chaining purposes
         * @function
         */
        function render() {

            vm.stats.update();
            vm.controls.update();

            if (!vm.pause && !vm.end) {

                if (vm.lifes > 0) {

                    if (vm.gameStart && vm.cubes.length > 0) {
                        vm.moveCubeLine();
                        vm.processCollisions();

                        if (vm.demo) {
                            vm.playDemo();
                        }

                    }

                    vm.displayControls();
                    vm.displayLifesAndPoints();

                    vm.blend();
                    vm.checkAreas();

                    vm.renderer.render(vm.scene, vm.camera);

                } else {

                    vm.end = true;
                    if (vm.backgroundSound) {
                        vm.backgroundSoundSource.stop(0);
                    }

                    vm.play(vm.gameOverSound);
                    vm.endContainer.innerHTML = 'Game Over!';

                }

            }

            requestAnimationFrame(vm.render);

            return this;

        }

        /**
         * Set everything up.
         * @name initialize
         * @return {Object} this for chaining purposes
         * @function
         */
        function initialize() {

            vm.createSoundEngine();

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
            vm.createButtons();
            vm.createLines();
            vm.createOrbitControls();

            vm.createCubeLine();

            vm.changeKeymap();

            vm.render();

            return this;

        }

        /**
         * Add a background if no webcam can be use.
         * @name createBackground
         * @return {Object} this for chaining purposes
         * @function
         */
        function createBackground() {

            var img = new THREE.MeshBasicMaterial(
                {
                    map: THREE.ImageUtils.loadTexture('assets/background.jpg')
                }
            );

            var plane = new THREE.Mesh(new THREE.PlaneGeometry(5760, 3240), img);
            plane.position.z = -1000;
            vm.scene.add(plane);

            return this;

        }

        /**
         * Display controls on screen.
         * @name displayControls
         * @return {Object} this for chaining purposes
         * @function
         */
        function displayControls() {

            if (vm.camvideo.readyState === vm.camvideo.HAVE_ENOUGH_DATA) {

                vm.videoContext.drawImage(vm.camvideo, 0, 0, vm.videoCanvas.width, vm.videoCanvas.height);

                if (vm.points >= vm.invertWebcamThreshold || vm.isWebcamInverted) {

                    vm.invertWebcamColors();
                    vm.isWebcamInverted = true;

                }

                if (vm.points >= vm.reverseWebcamThreshold && !vm.isWebcamReversed) {

                    vm.reverseWebcam();
                    vm.isWebcamReversed = true;

                }

                if (vm.changeColorPositionAllowed) {

                    vm.createButtons();
                    vm.changeKeymap();
                    vm.changeColorPositionAllowed = false;

                }

            }

            vm.layer2Context.clearRect(0, 0, vm.layer2Canvas.width, vm.layer2Canvas.height);
            for (var i = 0; i < vm.buttons.length; i++) {

                vm.layer2Context.drawImage(vm.buttons[i].image, vm.buttons[i].x, vm.buttons[i].y, vm.buttons[i].w, vm.buttons[i].h);
                vm.layer2Context.fillStyle = '#ffffff';
                vm.layer2Context.fillText(vm.keymap[vm.buttons[i].name], vm.buttons[i].x + 13, vm.buttons[i].y + 19);

            }

            return this;

        }

        /**
         * Reverse the webcam image.
         * @name reverseWebcam
         * @return {Object} this for chaining purposes
         * @function
         */
        function reverseWebcam() {

            vm.play(vm.revertImageSound);
            vm.videoContext.translate(vm.videoCanvas.width, 0);
            vm.videoContext.scale(-1, 1);

        }

        /**
         * Invert the webcam colors.
         * @name invertWebcamColors
         * @return {Object} this for chaining purposes
         * @function
         */
        function invertWebcamColors() {

            if (!vm.isWebcamInverted) {
                vm.play(vm.switchColorsSound);
            }

            var imageData = vm.videoContext.getImageData(0, 0, vm.videoCanvas.width, vm.videoCanvas.height),
                data = imageData.data;

            for (var i = 0; i < data.length; i += 4) {
                // red
                data[i] = 255 - data[i];
                // green
                data[i + 1] = 255 - data[i + 1];
                // blue
                data[i + 2] = 255 - data[i + 2];
            }

            // overwrite original image
            vm.videoContext.putImageData(imageData, 0, 0);

            return this;

        }

        /**
         * Display player's lifes and points on screen.
         * @name displayLifesAndPoints
         * @return {Object} this for chaining purposes
         * @function
         */
        function displayLifesAndPoints() {

            while (vm.lifesContainer.firstChild) {
                vm.lifesContainer.removeChild(vm.lifesContainer.firstChild);
            }

            for (var i = 0; i < vm.lifes; ++i) {
                var heart = new Image();
                heart.src = 'assets/heart_' + (vm.lifes > 4 ? 4 : vm.lifes) + '.png';
                vm.lifesContainer.appendChild(heart);
            }

            vm.pointsContainer.innerHTML = 'Points: ' + vm.points;

            return this;

        }

        /**
         * Check and process actions on collision.
         * @name processCollisions
         * @return {Object} this for chaining purposes
         * @function
         */
        function processCollisions() {

            var originPoint = vm.player.position.clone();
            for (var vertexIndex = 0; vertexIndex < vm.player.geometry.vertices.length; ++vertexIndex) {

                var localVertex = vm.player.geometry.vertices[vertexIndex].clone();
                var globalVertex = localVertex.applyMatrix4(vm.player.matrix);
                var directionVector = globalVertex.sub(vm.player.position);

                var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());

                var collisionResults = ray.intersectObjects(vm.cubes[0]);
                if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ||
                    vm.cubes[0][vm.playerPosition].position.z >= vm.player.position.z) {

                    if (vm.cubes[0][vm.playerPosition].colorName === vm.actualColor) {

                        vm.play(vm.successSound);
                        vm.points += vm.scoreThreshold;

                        if (vm.points - vm.currentThresholdPoints > vm.giveLifeThreshold) {
                            ++vm.lifes;
                            vm.play(vm.oneUpSound);
                            vm.currentThresholdPoints = vm.points;
                        }

                    } else {

                        --vm.lifes;
                        vm.play(vm.breakSound);

                    }

                    vm.clearCubeLine();
                    vm.createCubeLine();

                    if (Math.floor(Math.random() * 100) > 50) {
                        vm.movePlayerLeft();
                    } else {
                        vm.movePlayerRight();
                    }

                    if (vm.points >= vm.changeColorPositionThreshold) {
                        vm.changeColorPositionAllowed = true;
                    }

                    break;

                }

            }

            return this;

        }

        /**
         * Clear cube line.
         * @name clearCubeLine
         * @return {Object} this for chaining purposes
         * @function
         */
        function clearCubeLine() {

            for (var i in vm.cubes[0]) {
                vm.scene.remove(vm.cubes[0][i]);
            }

            vm.cubes = vm.cubes.slice(1, vm.cubes.length);

            return this;

        }

        /**
         * Move the cube line down.
         * @name moveCubeLine
         * @return {Object} this for chaining purposes
         * @function
         */
        function moveCubeLine() {

            var delta = vm.clock.getDelta();

            // DYNAMIC DIFFICULTY ADJUSTMENT
            var divide = Math.log(vm.points);
            var threshold = (divide > 1 ? divide : 1);
            var speed = (vm.points > 0 ? threshold : 1) * vm.speedLineCoefficient;
            var moveDistanceCoeff = -delta * speed;

            for (var i in vm.cubes) {

                for (var j = 0; j < vm.cubes[i].length; ++j) {

                    vm.cubes[i][j].translateZ(vm.cubes[i][j].position.y * moveDistanceCoeff);

                }

            }

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

            vm.videoContext.translate(vm.videoCanvas.width, 0);
            vm.videoContext.scale(-1, 1);
            vm.videoContext.fillStyle = 'rgba(255, 255, 255, 0)';
            vm.videoContext.fillRect(0, 0, vm.videoCanvas.width, vm.videoCanvas.height);

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

            vm.gameStart = true;
            vm.createBackground();

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

                    if (vm.buttons[b].name == "red") {

                        vm.setPlayerRed();

                    } else if (vm.buttons[b].name == "green") {

                        vm.setPlayerGreen();

                    } else if (vm.buttons[b].name == "blue") {

                        vm.setPlayerBlue();

                    } else if (vm.buttons[b].name == "yellow") {

                        vm.setPlayerYellow();

                    }

                }

            }

        }

        /**
         * Change the player's color to red.
         * @name setPlayerRed
         * @return {Object} this for chaining purposes
         * @function
         */
        function setPlayerRed() {

            vm.cubeMaterial.map = vm.colorRed;
            vm.actualColor = 'red';

        }

        /**
         * Change the player's color to green.
         * @name setPlayerGreen
         * @return {Object} this for chaining purposes
         * @function
         */
        function setPlayerGreen() {

            vm.cubeMaterial.map = vm.colorGreen;
            vm.actualColor = 'green';

        }

        /**
         * Change the player's color to blue.
         * @name setPlayerBlue
         * @return {Object} this for chaining purposes
         * @function
         */
        function setPlayerBlue() {

            vm.cubeMaterial.map = vm.colorBlue;
            vm.actualColor = 'blue';

        }

        /**
         * Change the player's color to yellow.
         * @name setPlayerYellow
         * @return {Object} this for chaining purposes
         * @function
         */
        function setPlayerYellow() {


            vm.cubeMaterial.map = vm.colorYellow;
            vm.actualColor = 'yellow';

        }

        /**
         * Move the player to the left.
         * @name movePlayerLeft
         * @return {Object} this for chaining purposes
         * @function
         */
        function movePlayerLeft() {

            if (vm.player.position.x > -100) {
                vm.player.position.x -= 50;
                --vm.playerPosition;
            }

            return this;

        }

        /**
         * Move the player to the right.
         * @name movePlayerRight
         * @return {Object} this for chaining purposes
         * @function
         */
        function movePlayerRight() {

            if (vm.player.position.x < 100) {
                vm.player.position.x += 50;
                ++vm.playerPosition;
            }

            return this;

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
                numberOfCubesPerLine = 5,
                cubes = [];

            for (var i = 0; i < numberOfCubesPerLine; ++i) {

                var color = getColor();

                var cubeGeometry = new THREE.BoxGeometry(50, 50, 50);
                var cubeMaterial = new THREE.MeshLambertMaterial(
                    {
                        color: 0xffffff,
                        map: color,
                        emissive: 0x333333
                    }
                );

                var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
                cube.position.set(positionX, -150, -1000);
                cube.colorName = color.name;

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
         * @param {Integer} sound The sound to be played
         * @return {Object} this for chaining purposes
         * @function
         */
        function play(sound) {

            var source = vm.audioContext.createBufferSource();
            source.buffer = vm.bufferList[sound];
            source.connect(vm.audioContext.destination);
            source.start(0);

            return this;

        }

        /**
         * Key handler.
         * @name onKeyPress
         * @param {Event} event The associated event
         * @return {Object} this for chaining purposes
         * @function
         */
        function onKeyPress(event) {

//            console.log(event.keyCode);

            if (!vm.end || event.keyCode === 82) {

                switch (event.keyCode) {
                    // d - Demo mode
                    case 68:
                        vm.demo = !vm.demo;
                        break;

                    // Pause
                    case vm.settings.pause.charCodeAt():
                        event.preventDefault();
                        vm.pause = !vm.pause;

                        if (vm.pause) {

                            vm.clock.stop();
                            vm.pauseContainer.innerHTML = 'Pause';
                            if (vm.backgroundSound) {
                                vm.backgroundSoundSource.stop(0);
                            }

                        } else {

                            vm.clock.start();
                            vm.pauseContainer.innerHTML = '';
                            if (vm.backgroundSound) {
                                vm.backgroundSoundSource.play(0);
                            }

                        }

                        break;

                    // Restart
                    case vm.settings.restart.charCodeAt():
                        event.preventDefault();
                        vm.restart();

                        break;

                    case vm.settings.accelerate.charCodeAt():
                        event.preventDefault();
                        vm.speedLineCoefficient = 5;

                        break;

                    // Red
                    case vm.keymap.red.charCodeAt():
                        event.preventDefault();
                        vm.setPlayerRed();
                        break;

                    // Green
                    case vm.keymap.green.charCodeAt():
                        event.preventDefault();
                        vm.setPlayerGreen();
                        break;

                    // Blue
                    case vm.keymap.blue.charCodeAt():
                        event.preventDefault();
                        vm.setPlayerBlue();
                        break;

                    // Yellow
                    case vm.keymap.yellow.charCodeAt():
                        event.preventDefault();
                        vm.setPlayerYellow();
                        break;
                }

            }

            return this;

        }

        /**
         * Key handler.
         * @name onKeyRelease
         * @param {Event} event The associated event
         * @return {Object} this for chaining purposes
         * @function
         */
        function onKeyRelease(event) {

//            console.log(event.keyCode);

            if (!vm.end) {
                switch (event.keyCode) {
                    // Decelerate current line
                    case vm.settings.accelerate.charCodeAt():
                        event.preventDefault();
                        vm.speedLineCoefficient = 1;

                        break;
                }
            }

            return this;

        }

        /**
         * Create and display lines on screen.
         * @name createLines
         * @return {Object} this for chaining purposes
         * @function
         */
        function createLines() {

            var material = new THREE.LineBasicMaterial(
                    {
                        color: 'white'
                    }
                ),
                numberOfLines = 6,
                positionX = -125;

            for (var i = 0; i < numberOfLines; ++i) {

                var geometry = new THREE.Geometry();
                geometry.vertices.push(new THREE.Vector3(positionX, -175, -1000));
                geometry.vertices.push(new THREE.Vector3(positionX, -250, 999999));

                var line = new THREE.Line(geometry, material);

                vm.scene.add(line);

                positionX += 50;

            }

            return this;

        }

        /**
         * Create game buttons.
         * @name createButtons
         * @return {Object} this for chaining purposes
         * @function
         */
        function createButtons() {

            vm.buttons = [];
            var positionY = 10,
                positionsX = vm.shuffleArray([27, 105, 183, 261]);

            /* RED BUTTON */
            var button1 = new Image();
            button1.src = 'assets/buttonRed.png';
            var buttonData1 =
            {
                name: 'red',
                image: button1,
                x: positionsX[0],
                y: positionY,
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
                x: positionsX[1],
                y: positionY,
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
                x: positionsX[2],
                y: positionY,
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
                x: positionsX[3],
                y: positionY,
                w: 32,
                h: 32
            };

            vm.buttons.push(buttonData4);

            return this;

        }

        /**
         * Shuffle given array.
         * @name shuffleArray
         * @param {Array} array The array to shuffle
         * @return {Array} the shuffled array
         * @function
         */
        function shuffleArray(array) {

            var currentIndex = array.length,
                temporaryValue,
                randomIndex;

            while (0 !== currentIndex) {

                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;

                temporaryValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = temporaryValue;

            }

            return array;

        }

        /**
         * Restart the game.
         * @name restart
         * @return {Object} this for chaining purposes
         * @function
         */
        function restart() {

            if (vm.isWebcamReversed) {
                vm.reverseWebcam();
            }

            vm.lifes = 5;
            vm.points = 0;
            vm.end = false;
            vm.demo = false;
            vm.pause = false;
            vm.playerPosition = 2;
            vm.speedLineCoefficient = 1;
            vm.isWebcamReversed = false;
            vm.isWebcamInverted = false;
            vm.clock = new THREE.Clock();
            vm.currentThresholdPoints = 0;
            vm.changeColorPositionAllowed = false;
            vm.endContainer.innerHTML = '';

            if (vm.backgroundSound) {
                vm.backgroundSoundSource.stop(0);
                vm.startBackgroundSound();
            }

            vm.player.position.set(0, -150, 0);

            vm.clearCubeLine();
            vm.createCubeLine();

            return this;

        }

        /**
         * Change the settings of the game.
         * @name setSettings
         * @param {Object} settings The new settings to apply
         * @return {Object} this for chaining purposes
         * @function
         */
        function setSettings(settings) {

            vm.settings = settings;
            changeKeymap();

            return this;

        }

        /**
         * Change the keymap of the game.
         * @name changeKeymap
         * @return {Object} this for chaining purposes
         * @function
         */
        function changeKeymap() {

            if (!vm.settings.keymap || vm.settings.keymap.length < 4) {

                console.error('Missing or invalid keymap!');
                return this;

            }

            var keymap = shuffleArray(vm.settings.keymap);

            vm.keymap.red = keymap[0];
            vm.keymap.blue = keymap[1];
            vm.keymap.green = keymap[2];
            vm.keymap.yellow = keymap[3];

            return this;

        }

        /**
         * Demo mode.
         * @name playDemo
         * @return {Object} this for chaining purposes
         * @function
         */
        function playDemo() {

            if (vm.cubes[0][vm.playerPosition].colorName !== vm.actualColor) {

                switch (vm.cubes[0][vm.playerPosition].colorName) {

                    case 'red':
                        vm.setPlayerRed();
                        break;

                    case 'green':
                        vm.setPlayerGreen();
                        break;

                    case 'blue':
                        vm.setPlayerBlue();
                        break;

                    case 'yellow':
                        vm.setPlayerYellow();
                        break;

                }

            }

            return this;

        }

        /**
         * Create the game sound engine.
         * @name createSoundEngine
         * @return {Object} this for chaining purposes
         * @function
         */
        function createSoundEngine() {

            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            vm.audioContext = new AudioContext();
            vm.bufferLoader = new BufferLoader(
                audioContext,
                [
                    'assets/1-up.wav',       // 0
                    'assets/break.wav',      // 1
                    'assets/coin.wav',       // 2
                    'assets/bump.wav',       // 3
                    'assets/gameover.wav',   // 4
                    'assets/vine.wav',       // 5
                    'assets/powerup.wav',    // 6
                    'assets/song.mp3'        // 7
                ],
                vm.finishedLoading
            );

            vm.bufferLoader.load();

            return this;

        }

        /**
         * Callback when sounds are ready.
         * @name finishedLoading
         * @return {Object} this for chaining purposes
         * @function
         */
        function finishedLoading(bufferList) {

            vm.bufferList = bufferList;
            vm.startBackgroundSound();

            return this;

        }

        /**
         * Play the background sound.
         * @name startBackgroundSound
         * @return {Object} this for chaining purposes
         * @function
         */
        function startBackgroundSound() {

            vm.backgroundSoundSource = vm.audioContext.createBufferSource();
            backgroundSoundSource.buffer = bufferList[7];
            backgroundSoundSource.connect(vm.audioContext.destination);
            backgroundSoundSource.start(0);

            return this;

        }

    })();