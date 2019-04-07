import Head from 'next/head'
import React from 'react'
import Radium from 'radium';
import fetch from 'isomorphic-unfetch';
import { connect } from 'react-redux'
import { ReactReduxContext } from 'react-redux'
import { setValue } from '../../redux/store.js'

import mainStyle from '../../../styles/global.js'

const mapStateToProps = (state) => {
    return {

    }
}

class ThreeJSArea extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
		};
		
		this.parseScene=this.parseScene.bind(this);
		this.load=this.load.bind(this);
        this.postLoadAction=this.postLoadAction.bind(this);
        this.createAnimationMethods=this.createAnimationMethods.bind(this);
		this.subscribeStore=this.subscribeStore.bind(this);
		this.getStates=this.getStates.bind(this);
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
			camera.position.set( 15, 10, -50 );
			
			clock = new THREE.Clock();

			me.scene = new THREE.Scene();
            me.loader = new THREE.ColladaLoader();	
            
            me.raycaster = new THREE.Raycaster();
            me.mouseDown = new THREE.Vector2();
            me.mouseUp = new THREE.Vector2();

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
			controls.maxDistance = 80;
			controls.target.set( 0, 2, 0 );
			controls.update();


			// Resize window event

            window.addEventListener( 'resize', onWindowResize, false );
            window.addEventListener( 'mousedown', function(event) {

                me.mouseDown.x = ( event.clientX / window.innerWidth ) * 2 - 1;
                me.mouseDown.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

            }, false );

            window.addEventListener( 'mouseup', function(event) {

                me.mouseUp.x = ( event.clientX / window.innerWidth ) * 2 - 1;
                me.mouseUp.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

            }, false );

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

            if (me.mouseDown.x == me.mouseUp.x && me.mouseDown.y == me.mouseUp.y){

                me.mouseDown.x = -1;
                me.mouseDown.y = -1;

                me.raycaster.setFromCamera( me.mouseUp, camera );
                var intersects = me.raycaster.intersectObjects( me.scene.children, true );
    
                for ( var i = 0; i < intersects.length; i++ ) {
	
                    if (intersects[i].object.name !== "") {
						console.log(intersects[i].object.name)
						
						// Looking the interactions array if we have to do something
						var inter = me.interactions[intersects[i].object.name];
						if (inter !== undefined) {
							for ( var j=0; j < inter.length; j++ ){

								if (inter[j].event == "leftMouse" || inter[j].event == "touchend"){
									me.props.dispatch(setValue(inter[j].storeKey, inter[j].storeValue));
								}
							}
						}

                        break;
                    }                    
                }
            }


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
		this.interactions = {};

		// Parse each elements
		for (var i = 0; i < json.length; i++) { 
			
			// Register animations
			if (json[i].animations != undefined){
				
				for (var j=0; j< json[i].animations.length; j++){

					json[i].animations[j].object = json[i].name
					this.animations.push(json[i].animations[j])
				}
			}

			// Register interaction
			if (json[i].interactions != undefined){
				
				this.interactions[json[i].name] = json[i].interactions
			}

			// Load dae
			console.log(json[i].dae)
			this.load(json[i].dae, json[i].name)
		}
	}

	load (dae, name) {

		var me = this;

		this.loader.load(dae, function (collada) {

			var item = collada.scene;

			// Userfull ?
			item.traverse(function (node) {

				if (node.isSkinnedMesh) {

                    node.frustumCulled = false;
				}
			});

			// Setting name to item's childrens
			for (var i = 0; i < item.children.length; i++) { 
				item.children[i].name = name;
			}			

			// Registering item
            item.name = name;
			me.collection[name] = item;
			me.scene.add(item);
			me.count = me.count + 1;
			console.log("Loaded " + name + " : " + me.count + "/" + me.totalCount);

			if (me.count === me.totalCount){
				me.postLoadAction();
			}
		});
	}

	postLoadAction() {

		this.createAnimationMethods()
        this.subscribeStore();

		//this.props.dispatch(setValue("@TEST", "test"));
    }
    
    createAnimationMethods() {

        var me = this;

        me.animationMethods = {};

        // Opacity animation
        me.animationMethods["opacity"] = function(item, params, value) {

            console.log("Running opacity animation for " + item)

            var targetValue = params;
            if (targetValue === "$value") {

                if (value < 1) {
                    targetValue = value;
                } else {
                    targetValue = value / 100
                }                
            }

            var node = me.collection[item];
            if (node.children) {
                for (var i = 0; i < node.children.length; i++) {
					node.children[i].material.opacity = targetValue;
					
					/*if (targetValue == 0)
						node.children[i].visible = false;
					else
						node.children[i].visible = true;*/
                }
            }
        }

        // Intensity animation
        me.animationMethods["intensity"] = function(item, params, value) {

            console.log("Running intensity animation for " + item)

            var targetValue = params;
            if (targetValue === "$value") {

                if (value < 1) {
                    targetValue = value;
                } else {
                    targetValue = value / 100
                }                
            }

            var node = me.collection[item];
            if (node.children) {
                for (var i = 0; i < node.children.length; i++) {
                    node.children[i].intensity = targetValue;
                }
            }
        }        

        // Color animation
        me.animationMethods["color"] = function(item, params, value) {

            console.log("Running color animation for " + item)

            var targetValue = params;
            if (targetValue === "$value") {
                targetValue = value;
            }

            var node = me.collection[item];
            if (node.children) {
                for (var i = 0; i < node.children.length; i++) {
                    node.children[i].material.color.set(targetValue);
                }
            }
        }
    }
	
	subscribeStore() {

		var me = this;

		me.context.store.subscribe(me.getStates);

		setTimeout(me.getStates, 1000);
    }
    
	/* Get states from store and run animations if needed */
	/* ********************************************************************************************** */

	getStates() {

		var me = this;

        // Loop throught all received states
		let states = me.context.store.getState()

        for (const [k, v] of Object.entries(states)) {

            // Checking if value has changed
			if (me.values[k] != v) {
                me.values[k] = v;
                
				// Check if any elements should be animated by this k/v pair and run associated animation
				for (var j=0; j < this.animations.length; j++) {

                    // Checking if the animation is associated with the current variable
					var animation = this.animations[j];
					if (animation.variable == k) {

                        // We've found an animation, checking if we have to animate depending of the value and the condition
						if (this.compare(v, animation.operand, animation.value)){

                            console.log("Running the animation : " + animation.animation)
                            try {
                                me.animationMethods[animation.animation](animation.object, animation.parameters, v)
                            } catch(err) {
                                console.log(err)
                            }							
						}
					}
				}
			}
		}
	}

    /* Animation compare value */
    /* ********************************************************************************************** */
    
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

export default connect(mapStateToProps)(ThreeJSArea);
