THREE.menu =
    (function () {

//        'use strict';

        // Application packaging
        var vm = this;

        vm.render = render;
        vm.initialize= initialize;
        vm.createScene = createScene;
        vm.createLight = createLight;
        vm.createCamera = createCamera;
        vm.createRenderer = createRenderer;

        vm.createText = createText;
        vm.createMenu = createMenu;

        vm.title = {
            font : "droid serif",
            weight : "bold",
            size : 50,
            height : 20
        };

        vm.item = {
            font : "droid serif",
            size : 30,
            height : 10
        };

        vm.createProjector = createProjector;
        vm.projector = null;
        vm.collidableMeshList = [];
        vm.onDocumentMouseMove = onDocumentMouseMove;

        vm.clickedBox = clickedBox;


        return vm;

        /**
         * The render function.
         * @name render
         * @return {Object} this for chaining purposes
         * @function
         */
        function render() {

            vm.renderer.render(vm.scene, vm.camera);
            return this;

        }

        /**
         * Set everything up.
         * @name initialize
         * @return {Object} this for chaining purposes
         * @function
         */
        function initialize() {

            vm.createScene();
            vm.createLight();
            vm.createCamera();
            vm.createRenderer();
            vm.createMenu();
            vm.createProjector();
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
         * Create 3D Text.
         * @name createText
         * @param {string} text to create
         * @param {JSON} type of text (title, item)
         * @return {Object} 3D Text mesh
         * @function
         */
        function createText(text, type) {

            return new THREEx.Text(text, type);

        }

        /**
         * Create a clickable box from a text mesh
         * @name createBoxFromText
         * @param textMesh
         * @function
         */
        function createBoxFromText(textMesh, name) {
            var size = new THREE.Box3().setFromObject(textMesh).size();
            var textBoxGeometry = new THREE.BoxGeometry(size.x+5,
                                                        size.y+2,
                                                        size.z);
            var textBoxMaterial = new THREE.MeshLambertMaterial({
                transparent: true,
                color:'red',
                opacity: 0
            });
            var textBox = new THREE.Mesh(textBoxGeometry, textBoxMaterial);

            textBox.position.set(textMesh.position.x,
                                 textMesh.position.y + size.y/2,
                                 textMesh.position.z);

            textBox.rotation.set(textMesh.rotation.x,
                                 textMesh.rotation.y,
                                 textMesh.rotation.z);

            textBox.name = name;

            vm.scene.add(textBox);
            vm.collidableMeshList.push(textBox);
        }

        /**
        * Create the application's menu.
        * @name createMenu
        * @return {Object} this for chaining purposes
        * @function
        */
        function createMenu() {

            var title = createText("EPSIHero", vm.title);
            title.position.set(0,100,0);
            title.material = new THREE.MeshPhongMaterial();

            vm.scene.add(title);
            createBoxFromText(title,"title");

            var webcamText = createText("Webcam",vm.item);
            webcamText.position.set(-240,0,0);
            webcamText.rotateY(0.4);
            webcamText.rotateX(-0.1);
            webcamText.material = new THREE.MeshPhongMaterial();
            vm.scene.add(webcamText);
            createBoxFromText(webcamText,"webcam");

            var controlsText = createText("Controls", vm.item);
            controlsText.position.set(250,-100,0);
            controlsText.rotateY(-0.5);
            controlsText.rotateX(-0.1);
            controlsText.material = new THREE.MeshPhongMaterial();
            vm.scene.add(controlsText);
            createBoxFromText(controlsText,"controls");

            return this;
        }

        /**
         * Create the application's projector
         * @name createProjector
         * @function
         */
        function createProjector() {

            vm.projector = new THREE.Projector();

            return this;

        }

        function onDocumentMouseMove(event){

            var victor = new THREE.Vector3(
                (event.clientX / window.innerWidth)*2-1,
                -(event.clientY / window.innerHeight)*2+1,
                0.5);

            vm.projector.unprojectVector(victor, vm.camera);

            var raycaster = new THREE.Raycaster(vm.camera.position, victor.sub(vm.camera.position).normalize());

            var intersects = raycaster.intersectObjects(vm.collidableMeshList);

            if(intersects.length > 0) {
                console.log(intersects[0].object.name);
                vm.clickedBox(intersects[0].object.name);
            }
            event.preventDefault();

            return this;
        }

        function clickedBox(boxname){

            if(boxname == "webcam") {
                window.location = "epsihero_cam.html";
            } else if(boxname == "") {
                window.location = "epsihero_controls.html";
            }

        }

    })();