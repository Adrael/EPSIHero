
var width = 1000, height = 220;

var camera, scene, renderer;

var counterX = 0,
    counterY = 0,
    velX = 0,
    velY=0,
    targetX = 0,
    targetY = 0,
    xMove = 50,
    yMove = 20,
    logoObject3D,

    logoMaterials = [],
    logoMaterial,
    animating = false,
    lightsOn = false;
    imageFolder = "assets/images/";

var logoImage = new Image();
logoImage.src = imageFolder+'logo.png';

window.addEventListener("load", init3D, false);

function init3D() {

    camera = new THREE.PerspectiveCamera( 27, width / height, 1, 2000 );
    camera.position.z = 280;
    camera.position.y = 20;

    scene = new THREE.Scene();

    scene.add(camera);

    logoObject3D = new THREE.Object3D();

    // make the planes with the logo and the faded logos in the background
    makeLogoPlanes();

    // make a plane in the background - it's kinda dark purple to black radial gradient
    makeGradPlane();

    scene.add(logoObject3D);
    logoObject3D.position.y = -6;

    setupRenderer();

}

function makeLogoPlanes() {

    var geom = new THREE.PlaneGeometry(200,200 * (115/460),2,1);

    for(var i =0; i<(Detector.webgl?20:3); i++)
    {

        material = new THREE.MeshBasicMaterial( {map: THREE.ImageUtils.loadTexture( imageFolder+'logo.png' ),  opacity:(i==0)?0.9:(i>=3)?0.012:0.1, blending :THREE.AdditiveBlending, depthTest:false,transparent:true});//(1-(i/4))*0.2});

        if(i==1) 	geom = new THREE.PlaneGeometry(200,200 * (115/460),1,1);

        var logo = new THREE.Mesh(geom, material);
        logo.position.z=(i>=3)? (i-2)*10 : i*-60;
        logo.position.y=-2;

        logoObject3D.add( logo );
        if(i>0) logoMaterials.push(material);
        else logoMaterial = material;
    }

}

function makeGradPlane() {

    var geom = new THREE.PlaneGeometry(350,200,1,1);
    var gradPlane = new THREE.Mesh(geom, new THREE.MeshBasicMaterial( {map: THREE.ImageUtils.loadTexture( imageFolder+'grad6.jpg' ),blending :THREE.AdditiveBlending, depthTest:false,transparent:true}));

    gradPlane.scale.x=1.5;
    scene.add( gradPlane );

}

function setupRenderer() {

    if(Detector.webgl) {
        renderer = new THREE.WebGLRenderer({antialias:true, clearColor:0x040006});
        setInterval(loop, 1000/30);

    } else if(Detector.canvas) {
        renderer = new THREE.CanvasRenderer({clearColor:0x040006});
        setInterval(loop, 1000/20);

    } else {

        // oh super noes! No canvas or WebGL? WTF!? Best just leave it as a jpg
        return;

    }

    renderer.setSize(  width, height );

    var imgElement = document.getElementById('bannerimg');
    imgElement.parentNode.replaceChild(renderer.domElement, imgElement);

    var canvas = renderer.domElement;

    canvas.style.background = "#020003";

    var canvas = renderer.domElement;
}

function loop() {

    var diffX, diffY, speed = 0.5;

    targetX = Math.sin(counterX) * xMove;
    targetY = Math.cos(counterY) * yMove;

    counterX+=0.012;
    counterY+=0.01;
    speed = 0.01;


    velX *=0.8;
    velY *=0.8;

    diffX =  (targetX-camera.position.x) * speed;
    diffY = (targetY-camera.position.y) * speed;

    velX += diffX;
    velY += diffY;
    camera.position.x += velX;
    camera.position.y += velY;


    if(document.body.scrollTop>250 || window.pageYOffset>250) return;
    camera.lookAt( scene.position );

    if(animating) {
        var rnd = Math.random();
        if(rnd<0.01) {
            lightsOn = true;
        } else if(rnd>0.95) {
            lightsOn = false

        }

        if(lightsOn) {
            logoMaterial.opacity = Math.random()*0.3 + 0.5;//Math.random()*0.025;
        } else  {
            logoMaterial.opacity = Math.random() * 0.01 +0.05;
        }
        //logoMaterials[0].opacity = Math.random()*0.025;
        for(var i = 0;i<logoMaterials.length; i++) {
            logoMaterials[i].opacity = logoMaterial.opacity*0.01;

        }

    }

    renderer.render(scene, camera);
}

