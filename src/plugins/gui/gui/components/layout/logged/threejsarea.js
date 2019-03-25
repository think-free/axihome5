import Head from 'next/head'
import React from 'react'
import Radium from 'radium';
import fetch from 'isomorphic-unfetch';
import { connect } from 'react-redux'
import { ReactReduxContext } from 'react-redux'
import { setValue } from '../../redux/store.js'

import mainStyle from '../../../styles/global.js'

/* Devices */

const ThreeJSStyle = {

}

const mapStateToProps = (state) => {
    return {

    }
}

class ThreeJSArea extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
		};
		
		this.setMaterial=this.setMaterial.bind(this);
		this.setMaterialColor=this.setMaterialColor.bind(this);
		this.parseScene=this.parseScene.bind(this);
		this.load=this.load.bind(this);
		this.postLoadAction=this.postLoadAction.bind(this);
		this.subscribeStore=this.subscribeStore.bind(this);
	}
	
	/* Setup ThreeJS */
	/* ********************************************************************************************** */

    async componentDidMount() {

		var me = this;
		me.collection = [];

		if ( WEBGL.isWebGLAvailable() === false ) {

			document.body.appendChild( WEBGL.getWebGLErrorMessage() );

		}

		var container, stats, clock, controls;
		var camera, renderer, mixer;

		init();
		animate();

		function init() {

			// Create Three

			container = document.getElementById( 'container' );

			camera = new THREE.PerspectiveCamera( 25, window.innerWidth / window.innerHeight, 1, 1000 );
			camera.position.set( 15, 10, - 15 );
			
			clock = new THREE.Clock();

			me.scene = new THREE.Scene();
			me.loader = new THREE.ColladaLoader();	

			// Grid

			var gridHelper = new THREE.GridHelper( 25, 25 );
			me.scene.add( gridHelper );

			// Lights

			var ambientLight = new THREE.AmbientLight( 0xffffff, 0.8 );
			me.scene.add( ambientLight );


			// Render

			renderer = new THREE.WebGLRenderer( { antialias: true } );
			renderer.setPixelRatio( window.devicePixelRatio );
			renderer.setSize( window.innerWidth, window.innerHeight );
			renderer.setClearColor( 0x1f1f27, 1 );
			container.appendChild( renderer.domElement );

			// Control

			controls = new THREE.OrbitControls( camera, renderer.domElement );
			controls.screenSpacePanning = true;
			controls.minDistance = 5;
			controls.maxDistance = 50;
			controls.target.set( 0, 2, 0 );
			controls.update();


			// Resize window event

			window.addEventListener( 'resize', onWindowResize, false );

			me.getScene();
		}

		function onWindowResize() {

			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();

			renderer.setSize( window.innerWidth, window.innerHeight );
		}

		function animate() {

			requestAnimationFrame( animate );

			render();
		}

		function render() {

			var delta = clock.getDelta();

			if ( mixer !== undefined ) {

				mixer.update( delta );

			}

			renderer.render( me.scene, camera );
		}

	}


	/* Load scene */
	/* ********************************************************************************************** */

	async getScene(){
        var url = this.props.url;

        fetch(url)
        .then(response => response.json())
        .then(data => this.parseScene(data))
	}

	parseScene(json) {

		// Reset internal states
		this.totalCount = json.length;
		this.count = 0;
	
		this.values = {};
		this.animations = [];

		// Parse each elements
		for (var i = 0; i < json.length; i++) { 
			
			if (json[i].animations != undefined){
				
				for (var j=0; j< json[i].animations.length; j++){

					json[i].animations[j].object = json[i].name
					this.animations.push(json[i].animations[j])
				}
			}

			console.log(json[i].dae)
			this.load(json[i].dae, json[i].name)
		}
	}

	load (dae, name) {

		var me = this;

		this.loader.load(dae, function (collada) {

			var item = collada.scene;

			item.traverse(function (node) {

				if (node.isSkinnedMesh) {

					node.frustumCulled = false;
				}
			});

			me.collection[name] = item;
			me.scene.add(item);
			me.count = me.count + 1;
			console.log("Loaded : " + me.count + "/" + me.totalCount);

			if (me.count === me.totalCount){
				me.postLoadAction();
			}
		});
	}

	postLoadAction() {

		console.log(this.animations);

		this.subscribeStore();

		this.props.dispatch(setValue("@TEST", "test"));
	}
	
	subscribeStore() {

		var me = this;

		me.context.store.subscribe(function(){

			let states = me.context.store.getState()

			for (var i = 0; i < states.length; i++) { 

				let k = states[i].variable;
				let v = states[i].value;

				if (me.values[k] != v) {

					me.values[k] = v;

					// Check if any elements should be animated by this k/v pair and run associated animation

					for (var j=0; j < this.animations.length; j++) {

						var animation = this.animations[j];

						if (animation.variable == k) {

							if (this.compare(v, animation.operand, animation.value)){

								console.log("Should run the animation :")
								console.log(animation)
							}
						}
					}
				}
			}
		});
	}

	compare(post, operator, value) {
		switch (operator) {
		  case '>':   return post > value;
		  case '<':   return post < value;
		  case '>=':  return post >= value;
		  case '<=':  return post <= value;
		  case '==':  return post == value;
		  case '!=':  return post != value;
		  case '===': return post === value;
		  case '!==': return post !== value;
		}
	  }

	/* Animations */
	/* ********************************************************************************************** */

	setMaterialColor(item, color){

		this.setMaterial(item, new THREE.MeshBasicMaterial({ color: color }));
	}

	setMaterial (node, material) {
		node.material = material;
		if (node.children) {
			for (var i = 0; i < node.children.length; i++) {
				this.setMaterial(node.children[i], material);
			}
		}
	}

	/* Render */
	/* ********************************************************************************************** */
    render() {

        return (
			<div>
				<Head>
					<script src="/static/threejs/three.js"></script>
					<script src="/static/threejs/ColladaLoader.js"></script>
					<script src="/static/threejs/OrbitControls.js"></script>
					<script src="/static/threejs/WebGL.js"></script>
					<script src="/static/threejs/stats.min.js"></script>
				</Head>   

				<div id="container"></div>
			</div>
        )
    }
}

/* Export */

ThreeJSArea.contextType = ReactReduxContext; 

ThreeJSArea = Radium(ThreeJSArea);
export default connect(mapStateToProps)(ThreeJSArea);
