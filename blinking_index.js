import * as THREE from './three.js-master/build/three.module.js'
import {GLTFLoader} from './three.js-master/examples/jsm/loaders/GLTFLoader.js'
import {OrbitControls} from './three.js-master/examples/jsm/controls/OrbitControls.js'


const canvas = document.querySelector('.webgl')
const scene = new THREE.Scene()
var a = 0,c=0;
var bg_png,bg_png1
var b,threshold;
const loader = new GLTFLoader()
loader.load('assets/furnace.glb', function(glb){
    console.log(glb)
    const root = glb.scene;
    root.scale.set(0.007,0.007,0.007)
    scene.add(root);
},function(xhr){
    console.log((xhr.loaded/xhr.total * 100)+ "% loaded")
}, function(error){
    console.log('An error occurred')
}
)

const loader1 = new THREE.TextureLoader();
loader1.load('assets/red_bg.png', function(texture)
{
    bg_png = texture;
})

const loader2 = new THREE.TextureLoader();
loader2.load('assets/white_bg.png', function(texture)
{
    bg_png1 = texture;
})

scene.background = bg_png1;

const light1 = new THREE.HemisphereLight(0xffffff,4.5)
scene.add(light1)
const directionalLight = new THREE.DirectionalLight( 0xFBFCF6, 4.5 );
//directionalLight.position(1,1,2)
scene.add( directionalLight );

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const camera = new THREE.PerspectiveCamera(45,sizes.width/sizes.height,0.1,1000)
camera.position.set(2,2.1,2)
scene.add(camera)

const renderer = new THREE.WebGL1Renderer({
    canvas:canvas,
    antialias:true,
    alpha:true
    
})

renderer.setSize(sizes.width,sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
renderer.updateShadowMap.enabled = false
renderer.gammaOutput = true

const controls = new OrbitControls(camera, renderer.domElement)
controls.enablePan = false
controls.enableDamping = true

var snd = new Audio('/assets/alert.mp3');
document.getElementById("btnmyNumber").addEventListener("click", myFunctionVar);


function animate(){
    if(a<threshold)
    { 
        snd.pause();
        scene.background = bg_png1

    }
    else if(a>=threshold && a<=2000)
    {  
        
        if(c<60)
        {
            //scene.background = new THREE.Color(0xff4d4d);
            scene.background = bg_png
        }
        else if(c>=60)
        {
            //scene.background = new THREE.Color(0xffffff);
            scene.background = bg_png1
        }  
            
        if(a==b){
            
            snd.play();
            
        }    
        c = c+2;
        if(c==100)
        {
            c = 0
        }         
    }
    
    controls.update();
    requestAnimationFrame(animate)
    renderer.render(scene,camera)
    if(a<=2000)
    {
        a = a+0.5;
        console.log(a);
    }
    else
    {
        a = 0;
    }

}    

function myFunctionVar() {
    threshold = parseInt(document.getElementById("myNumber").value);
    scene.background = new THREE.Color(0xF8F8FF);
    b = threshold+10;
    if(b>10)
    {
        animate()
    }
    
}

myFunctionVar()




