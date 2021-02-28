'use strict'

AFRAME.registerComponent('bevelled-tile', {
schema: {
  width:      {type: 'number', default: 2},
  depth:      {type: 'number', default: 2},
  frame:      {type: 'number', default: 0.2},
  framecolor: {type: 'color', default: '#000'},
  facecolor:  {type: 'color', default: '#AAA'}
},

/**
 * Initial creation and setting of the mesh.
 */
init: function () {
  var data = this.data;
  var el = this.el;

  const BIGX = this.data.width / 2;
  const BIGY = 0;
  const BIGZ = this.data.depth / 2;
  const SMALLX = this.data.width / 2 - this.data.frame;
  const SMALLY = -(this.data.frame);
  const SMALLZ = this.data.depth / 2 - this.data.frame;

  this.geometry = new THREE.BufferGeometry();
  // Vertices - we have 8 vertices, 2 at each corner.
  // 1-4 are the inner corners.
  // 5-8 are the outer (lower) corners
  const vertices = new Float32Array( [
     SMALLX,  BIGY, SMALLZ,
     SMALLX,  BIGY, -SMALLZ,
     -SMALLX, BIGY,  -SMALLZ,
     -SMALLX, BIGY,  SMALLZ,

     BIGX,  SMALLY, BIGZ,
     BIGX,  SMALLY, -BIGZ,
     -BIGX,  SMALLY, -BIGZ,
     -BIGX,  SMALLY, BIGZ,

  ] );

  // itemSize = 3 because there are 3 values (components) per vertex
  this.geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

  // Now we define the faces in terms of vertex indices.
  const indices = []

  // 4 bevelled edges.
  createRectangle(0, 4, 5, 1);
  createRectangle(1, 5, 6, 2);
  createRectangle(2, 6, 7, 3);
  createRectangle(3, 7, 4, 0);

  // 1 faces.
  createRectangle(0, 1, 2, 3)

  function createRectangle(a, b, c, d) {
    indices.push(a, b, c);
    indices.push(c, d, a);
  }

  this.geometry.setIndex(indices);
  this.geometry.computeVertexNormals();

  // 4 x 2 = 8 triangles = 24 vertices for the "frame"
  this.geometry.addGroup(0, 24, 0 );
  // 2 triangles = 6 vertices for the face.
  this.geometry.addGroup(24, 6, 1);

  // Create material.
  this.frameMaterial = new THREE.MeshStandardMaterial({color: data.framecolor, roughness: 0.3});
  this.faceMaterial = new THREE.MeshStandardMaterial({color: data.facecolor, roughness: 1.0});

  // Create mesh.
  this.mesh = new THREE.Mesh(this.geometry, [this.frameMaterial, this.faceMaterial]);

  // Set mesh on entity.
  el.setObject3D('mesh', this.mesh);
}
});

AFRAME.registerComponent('tetrisland-floor', {

  init: function () {
    const TILES = 20
    const TILE_SIZE = 1

    for (var ii = 0; ii < TILES; ii++) {
      for (var jj = 0; jj < TILES; jj++) {
        var entityEl = document.createElement('a-entity');
        entityEl.setAttribute("id", `floor${ii}${jj}`);
        entityEl.setAttribute("instanced-mesh-member", "mesh:#floor-mesh1");
        entityEl.object3D.position.x = (ii - TILES/2) * TILE_SIZE + TILE_SIZE/2;
        entityEl.object3D.position.y = 0;
        entityEl.object3D.position.z = (jj - TILES/2) * TILE_SIZE + TILE_SIZE/2;

        this.el.appendChild(entityEl);
      }
    }
  }
});

AFRAME.registerComponent('phase-shift', {
  init: function () {
    var el = this.el
    el.addEventListener('gripdown', function () {
      el.setAttribute('collision-filter', {collisionForces: true})
    })
    el.addEventListener('gripup', function () {
      el.setAttribute('collision-filter', {collisionForces: false})
    })
  }
});

const ANIMATIONS = {
/*  'walk' : {
    'lLeg' : "property: rotation; from:20 0 0; to: -20 0 0; loop: true;  dir: alternate; easing:easeInOutQuad; dur: 500",
    'rLeg' : "property: rotation; from:-20 0 0; to: 20 0 0; loop: true;  dir: alternate; easing:easeInOutQuad; dur: 500",
    'lArm' : "property: rotation; from:-30 0 30; to: 30 0 30; loop: true;  dir: alternate; easing:easeInOutQuad; dur: 500",
    'rArm' : "property: rotation; from:30 0 -30; to: -30 0 -30; loop: true;  dir: alternate; easing:easeInOutQuad; dur: 500",
*/
  'walk' : {
    'lLeg' : [[500, "-20 0 0"], [500, " 20 0 0"]],
    'rLeg' : [[500, " 20 0 0"], [500, "-20 0 0"]],
    'lArm' : [[500, " 30 0 30"], [500, "-30 0 30"]],
    'rArm' : [[500, " -30 0 -30"], [500, "30 0 -30"]]
  },

  'panic' : {
    'lLeg' : [[80, "0 0 -10"], [80, " 0 0 5"]],
    'rLeg' : [[80, " 0 0 5"], [80, "0 0 -10"]],
    'lArm' : [[80, " 0 0 50"], [80, "0 0 10"]],
    'rArm' : [[80, " 0 0 -10"], [80, "0 0 -50"]]
  },

  'wave' : {
    'lLeg' : [[500, "0 0 0"], [2000, " 0 0 0"]],
    'rLeg' : [[500, " 0 0 0"], [2000, "0 0 0"]],
    'lArm' : [[500, " 0 0 30"], [2000, "0 0 30"]],
    'rArm' : [[500, " 0 0 -30"], [500, "0 0 -150"], [500, "0 0 -120"], [500, "0 0 -150"], [500, "0 0 -30"]]
  },

  'stop' : {
    'lLeg' : [[500, "0 0 0"]],
    'rLeg' : [[500, " 0 0 0"]],
    'lArm' : [[500, " 0 0 30"]],
    'rArm' : [[500, " 0 0 -30"]]
  }
};

AFRAME.registerComponent('numberblock', {

  init: function() {
    this.tick = AFRAME.utils.throttleTick(this.tick, 5000, this);

    this.lLeg = document.querySelector("#oneLLeg");
    this.rLeg = document.querySelector("#oneRLeg");
    this.lArm = document.querySelector("#oneLArm");
    this.rArm = document.querySelector("#oneRArm");
    this.whole = document.querySelector("#oneEntity");

    this.transitions = [];

    this.cylindrical = new THREE.Cylindrical;
    this.targetPosition = new THREE.Vector3;

  },
/*
  play: function () {
    this.targetPosition.set(0.5, 0 -0.5);
    this.walkTo(this.targetPosition);
  },*/

  setLimbsAnimation: function (action) {

    var animData

    switch (action) {
      case "walk":

        animData = {
          'easing': "easeInOutQuad",
          'repeat' : true,
          'replace' : true
        }

        this.addKeyFrames(animData, "walk")
        break;

      case "panic":
        var animData = {
          'easing': "easeInOutQuad",
          'repeat' : true,
          'replace' : true
        }

        this.addKeyFrames(animData, "panic")
        break;

      case "wave":
        var animData = {
          'easing': "easeInOutQuad",
          'repeat' : false,
          'replace' : true
        }
        this.addKeyFrames(animData, "wave")
        break;

     case "stop":
       animData = {
         'easing': "easeInOutQuad",
         'repeat' : false,
         'replace' : true
       }
       this.addKeyFrames(animData, "stop")
       break;

     default:
       console.log("Unexpected action: " + action);
    }
  },

  walkTo: function(position) {

    this.setLimbsAnimation("walk");

    // Turn to rotation...  we want to take the shorter
    // (less than PI radians) direction of rotation.
    this.turnTo(position);

    var animData = {
      'msecs': (position.length() * 10000),
      'easing': "easeInOutQuad",
      'repeat' : false,
      'replace' : false,
      'position': `${this.el.object3D.position.x + position.x}
                   ${this.el.object3D.position.y}
                   ${this.el.object3D.position.z + position.z}`
    }

    this.whole.emit("addKeyFrame", animData, false);
  },

  turnTo: function(position) {
    this.cylindrical.setFromVector3(position);
    var targetAngle = this.cylindrical.theta
    if (targetAngle - this.whole.object3D.rotation.y > Math.PI) {
      targetAngle -= (2 * Math.PI);
    }

    var animData = {
      'msecs': 500,
      'easing': "easeInOutQuad",
      'repeat' : false,
      'replace' : false,
      'rotation': `0 ${targetAngle * 180 / Math.PI} 0`
    }

    this.whole.emit("addKeyFrame", animData, false);
  },

  lookLandR: function() {
    var animData = {
      'msecs': 500,
      'easing': "easeInOutQuad",
      'repeat' : false,
      'replace' : false,
      'rotation': `0 ${this.whole.object3D.rotation.y * 180 / Math.PI + 20} 0`
    }
    this.whole.emit("addKeyFrame", animData, false);
    animData = {
      'msecs': 500,
      'easing': "easeInOutQuad",
      'repeat' : false,
      'replace' : false,
      'rotation': `0 ${this.whole.object3D.rotation.y * 180 / Math.PI - 20} 0`
    }
    this.whole.emit("addKeyFrame", animData, false);

    animData = {
      'msecs': 500,
      'easing': "easeInOutQuad",
      'repeat' : false,
      'replace' : false,
      'rotation': `0 ${this.whole.object3D.rotation.y * 180 / Math.PI} 0`
    }
    this.whole.emit("addKeyFrame", animData, false);
  },

  addKeyFrames: function(animData, action) {

    var replace = animData.replace;
    ["lLeg","rLeg","lArm","rArm"].forEach((part) => {

      animData.replace = replace;

      ANIMATIONS[action][part].forEach((keyFrame) => {
        animData['msecs'] = keyFrame[0];
        animData['rotation'] = keyFrame[1];
        this[part].emit("addKeyFrame", animData, false);
        animData.replace = false;
      });
    });
  },

  tick: function () {
    // only ticks every 5 seconds.

    var choice = Math.floor(Math.random() * 4);

    switch (choice) {
      case 0: // walk.
        var x = Math.random() - 0.5;
        var z = Math.random() - 0.5;
        this.targetPosition.set(x, 0, z);
        this.walkTo(this.targetPosition);
        break;

      case 1: // look
        this.setLimbsAnimation("stop");
        this.lookLandR();

        break;

      case 2: // wave
        this.setLimbsAnimation("wave");
        break;

      case 3: // turn
        var x = Math.random() - 0.5;
        var z = Math.random() - 0.5;
        this.targetPosition.set(x, 0, z);
        this.turnTo(this.targetPosition);
        break;
    }
  }

});


AFRAME.registerComponent('keyframe-animation', {

  init: function() {

    this.time = 0;
    this.keyFrames = [];
    this.listeners = {
      addKeyFrame: this.addKeyFrame.bind(this),
      animationComplete: this.animationComplete.bind(this)
    }

    this.animCount = 0;

    this.attachEventListeners();
  },

  attachEventListeners: function () {

    this.el.addEventListener('addKeyFrame', this.listeners.addKeyFrame, false);
    this.el.addEventListener('animationcomplete__rotation', this.listeners.animationComplete, false);
    this.el.addEventListener('animationcomplete__position', this.listeners.animationComplete, false);
    this.el.addEventListener('animationcomplete__scale', this.listeners.animationComplete, false);
  },

  addKeyFrame: function(event) {

    var keyFrame = {
      'position' : event.detail.position,
      'rotation' : event.detail.rotation,
      'scale' : event.detail.scale,
      'msecs': event.detail.msecs,
      'easing': event.detail.easing,
      'repeat' : event.detail.repeat
    }

    if (event.detail.replace) {
      this.keyFrames = [];
    }

    this.keyFrames.push(keyFrame);

    console.log("KeyFrames: " + this.keyFrames.length);

  },

  animateToFirstKeyFrame: function() {

    if (this.keyFrames.length <= 0) {
      // No animations queued up.
      return;
    }

    this.animCount = 0;
    const keyFrame = this.keyFrames[0];

    if (keyFrame.position != null) {
      this.animateToKeyFrameComponent("position",
                                      `${this.el.object3D.position.x}
                                       ${this.el.object3D.position.y}
                                       ${this.el.object3D.position.z}`,
                                      keyFrame);
      this.animCount++;
      this.animEndTime = Math.max(this.animEndTime, this.time + keyFrame.msecs);
    }
    if (keyFrame.rotation != null) {
      this.animateToKeyFrameComponent("rotation",
                                      `${this.el.object3D.rotation.x * 180 / Math.PI}
                                       ${this.el.object3D.rotation.y * 180 / Math.PI}
                                       ${this.el.object3D.rotation.z * 180 / Math.PI}`,
                                       keyFrame);
      this.animCount++;
      this.animEndTime = Math.max(this.animEndTime, this.time + keyFrame.msecs);
    }
    if (keyFrame.scale != null) {
      this.animateToKeyFrameComponent("scale",
                                      `${this.el.object3D.scale.x}
                                       ${this.el.object3D.scale.y}
                                       ${this.el.object3D.scale.z}`,
                                        keyFrame);
      this.animCount++;
      this.animEndTime = Math.max(this.animEndTime, this.time + keyFrame.msecs);
    }

    // If the keyFrame is to be repeated, add it to the end of the list.
    if (keyFrame.repeat) {
      this.keyFrames.push(keyFrame);
    }

    // Remove it from the start of the list (since it is now playing)
    this.keyFrames.splice(0, 1);

  },

  animateToKeyFrameComponent: function(component, current, keyFrame) {

    const target = keyFrame[component];
    const attribName = `animation__${component}`
    const attribString = `property: ${component};
                          from: ${current};
                          to: ${target};
                          easing: ${keyFrame.easing};
                          dur: ${keyFrame.msecs}`
    this.el.setAttribute(attribName, attribString);

  },

  animationComplete: function() {

    this.animCount--;

    if (this.animCount <= 0) {
      this.animCount = 0;

      // Completed all requested animations, so move on to the next.
      this.animateToFirstKeyFrame();

    }
  },

  tick: function(time, timeDelta) {

    this.time = time;

    if (this.animCount == 0) {
      // animation requested, but none playing.  Start the first.
      this.animateToFirstKeyFrame();
    }
    else
    {
      if (this.animEndTime > time + 1000) {
        // Failed to receive timely animation end event.
        console.warning("Animation End Event Lost!")
        this.animCount = 0;
      }
    }
  }
});


/* Animations design....

Need concept of keyframes for e.g. waving.
Only need rotation for limbs, and position & rotation for block itself.
Also position for eyeball?
Some animations repeat.  Others are one-time (e.g. get up, turn).

For each component object...
- Queue of animation key-frames to hit at particular times.
- Step through them.
- Queue can be flushed at any time.

Behaviours... at number block level.
- Defines a series of keyframes to hit, for each element.
- Can set multiple in advance.
- Can flush existing queue to make things happen instantly.

Do continuing behaviours need to be implemented repeatedly, or can they program to
loop?
- Maybe: keyframes can be given a "repeat" or "discard" property.  Once expired
  they then get added to the end of the queue (or not) automatically...

So...

"add-keyframe" event.
With detail including:
- position
- rotation
- scale
- timeout to get there
- add to end, or act immediately? (replace or concatenate)
- repeat when expired, or discard?
- easing?  E.g. jumping up from falling over should not happen linearly...
-- Could achieve with help of physics, and set the body velocity?  https://github.com/n5ro/aframe-physics-system/issues/124
  https://github.com/n5ro/aframe-physics-system/issues/124

keyframe-animation component...
- parameters...  none?



*/
