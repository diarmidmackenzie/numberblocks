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

AFRAME.registerComponent('ammo-phase-shift', {
  init: function () {
    var el = this.el
    el.addEventListener('gripdown', function () {
      el.setAttribute('ammo-body', {disableCollision: false})
    })
    el.addEventListener('gripup', function () {
      el.setAttribute('ammo-body', {disableCollision: true})
    })
  }
});

const ACTIONS = ["walk", "look", "wave", "turn", "floss", "stop", "turn"];

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
    'rArm' : [[500, " -30 0 -30"], [500, "30 0 -30"]],
    'body' : [[500, " 0 0 0"]],
    'box' : [[500, " 0 0 0"]]
  },

  'panic' : {
    'lLeg' : [[80, "0 0 -10"], [80, " 0 0 5"]],
    'rLeg' : [[80, " 0 0 5"], [80, "0 0 -10"]],
    'lArm' : [[80, " 0 0 50"], [80, "0 0 10"]],
    'rArm' : [[80, " 0 0 -10"], [80, "0 0 -50"]],
    'body' : [[500, " 0 0 0"]],
    'box' : [[500, " 0 0 0"]]
  },

  'wave' : {
    'lLeg' : [[500, "0 0 0"], [2000, " 0 0 0"]],
    'rLeg' : [[500, " 0 0 0"], [2000, "0 0 0"]],
    'lArm' : [[500, " 0 0 30"], [2000, "0 0 30"]],
    'rArm' : [[500, " 0 0 -30"], [500, "0 0 -150"], [500, "0 0 -120"], [500, "0 0 -150"], [500, "0 0 -30"]],
    'body' : [[500, " 0 0 0"]],
    'box'  : [[500, " -20 0 0"], [1000, "-20 0 0"], [1000, "-20 0 0"], [500, "0 0 0"]]

  },

  'stop' : {
    'lLeg' : [[500, "0 0 0"]],
    'rLeg' : [[500, " 0 0 0"]],
    'lArm' : [[500, " 0 0 30"]],
    'rArm' : [[500, " 0 0 -30"]],
    'body' : [[500, " 0 0 0"]],
    'box'  : [[500, " 0 0 0"]]
  },

  'floss' : {
    'lLeg' : [[315, "0 0 -10"], [315, "0 0 10"],[315, "0 0 -10"], [315, "0 0 10"]],
    'rLeg' : [[315, " 0 0 -10"], [315, "0 0 10"],[315, " 0 0 -10"], [315, "0 0 10"]],
    'lArm' : [[315, " 30 0 5"], [315, " -30 0 80"], [315, " -30 0 5"], [315, " 30 0 80"]],
    'rArm' : [[315, " 30 0 -80"], [315, " -30 0 -5"], [315, " -30 0 -80"], [315, "30 0 -5"]],
    'body' : [[315, " 0 0 10"], [315, " 0 0 -10"], [315, " 0 0 10"], [315, "0 0 -10"]],
    'box' : [[315, "0 0 0"]]
  },

  'turn' : {
    'lLeg' : [[500, "0 0 5"], [500, "0 0 -5"]],
    'rLeg' : [[500, " 0 0 -5"], [500, "0 0 5"]],

  }

};

AFRAME.registerComponent('numberblock', {

  init: function() {
    //this.tick = AFRAME.utils.throttleTick(this.tick, 5000, this);
    this.animCount = 0;
    this.grabbed = false;
    this.currentBehaviour = "";

    this.lLeg = document.querySelector("#oneLLeg");
    this.rLeg = document.querySelector("#oneRLeg");
    this.lArm = document.querySelector("#oneLArm");
    this.rArm = document.querySelector("#oneRArm");
    this.whole = document.querySelector("#oneEntity");
    this.body = document.querySelector("#oneBody");
    this.box = document.querySelector("#oneBox");

    this.transitions = [];

    this.cylindrical = new THREE.Cylindrical;
    this.targetPosition = new THREE.Vector3;

    // Final bit of initialization can complete when the physics engine is
    // initialized
    this.el.addEventListener("body-loaded", e => {
      // cache the ammo-body component
      this.ammo = this.el.components["ammo-body"];

    });

    this.listeners = {
      'grabStart': this.grabStart.bind(this),
      'grabEnd': this.grabEnd.bind(this),
    }

    this.callbacks = {
      'stopMovement' : this.stopMovement.bind(this)
    };

    this.el.addEventListener('grab-start', this.listeners.grabStart);
    this.el.addEventListener('grab-end', this.listeners.grabEnd);
  },

  grabStart: function () {
    console.log("Grab start")
    this.grabbed = true;
    this.setLimbsAnimation("panic");
  },

  grabEnd: function () {
    console.log("Grab end")
    this.grabbed = false;
    this.setLimbsAnimation("stop");
  },

  setLimbsAnimation: function (action) {

    // Of the available behaviours, only "wave" is not on repeat...
    if ((action == this.currentBehaviour) &&
        (action !== "wave")) {
          return;
      }

    console.log("Requested action: " + action);
    this.currentBehaviour = action;

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

     case "floss":
       var animData = {
         'easing': "easeInOutQuad",
         'repeat' : true,
         'replace' : true
       }
       this.addKeyFrames(animData, "floss")
       break;


     default:
       console.log("Unexpected action: " + action);
    }
  },

  stopMovement: function () {
    this.setLimbsAnimation("stop");
    this.el.removeAttribute("db-rotation");
    this.el.removeAttribute("db-velocity__vel");
    this.el.removeAttribute("db-velocity__angvel");
  },

  lookLandR: function() {

    // This can (and should) probably be refactored into table data like other
    // movements are...
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
    ["lLeg","rLeg","lArm","rArm","body","box"].forEach((part) => {

      animData.replace = replace;

      ANIMATIONS[action][part].forEach((keyFrame) => {
        animData['msecs'] = keyFrame[0];
        animData['rotation'] = keyFrame[1];
        this[part].emit("addKeyFrame", animData, false);
        animData.replace = false;
      });
    });
  },

  tick: function (time, timeDelta) {
    
    if (((time % 5000) < ((time - timeDelta) % 5000)) &&
        (!this.grabbed))
     {
      // every 5 seconds.
      this.performRandomAction()
    }
  },

  performRandomAction: function() {

    var choice = Math.floor(Math.random() * 5);
    var action = ACTIONS[choice];


    switch (action) {

      case "walk":
        this.setLimbsAnimation("walk");
        var angle = Math.random() * Math.PI * 2;
        var x = 0.3 * Math.sin(angle);
        var z = 0.3 * Math.cos(angle);

        this.el.setAttribute("db-rotation",
                            {'y': (angle * 180 / Math.PI)});
        this.el.setAttribute("db-velocity__vel",
                            {'x': x, 'z': z});
        setTimeout(this.callbacks.stopMovement, Math.random() * 1000 + 1000)

        //this.walkTo(this.targetPosition);
        break;

      case "look":
        this.setLimbsAnimation("stop");
        this.lookLandR();
        break;

      case "wave":
        this.setLimbsAnimation("wave");
        break;

      case "turn":
        this.setLimbsAnimation("turn");
        this.el.setAttribute("db-velocity__angvel",
                             {'y': 5 * Math.sign(Math.random() - 0.5),
                              'angular': true,
                              maxAcceleration: 500});
        setTimeout(this.callbacks.stopMovement, Math.random() * 1000)

        // Note this doesn't affect any existing body/limb animations, which can
        // continue along with the turn.
        break;

      case "floss":
        this.setLimbsAnimation("floss");
        break;

      case "stop":
        this.setLimbsAnimation("stop");
        break;

      default:
        break;
    }
  }
});


AFRAME.registerComponent('keyframe-animation', {

  init: function() {

    this.time = 0;
    this.animEndTime = 0;
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

    //console.log("KeyFrames: " + this.keyFrames.length);

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
      //console.log(`Anim Count (pos) Incremented on: ${this.el.id} at ${this.time}`);
      this.animEndTime = Math.max(this.animEndTime, this.time + keyFrame.msecs);
    }
    if (keyFrame.rotation != null) {
      this.animateToKeyFrameComponent("rotation",
                                      `${this.el.object3D.rotation.x * 180 / Math.PI}
                                       ${this.el.object3D.rotation.y * 180 / Math.PI}
                                       ${this.el.object3D.rotation.z * 180 / Math.PI}`,
                                       keyFrame);
      this.animCount++;
      //console.log(`Anim Count (rot) Incremented on: ${this.el.id} at ${this.time}`);
      this.animEndTime = Math.max(this.animEndTime, this.time + keyFrame.msecs);
    }
    if (keyFrame.scale != null) {
      this.animateToKeyFrameComponent("scale",
                                      `${this.el.object3D.scale.x}
                                       ${this.el.object3D.scale.y}
                                       ${this.el.object3D.scale.z}`,
                                        keyFrame);
      this.animCount++;
      //console.log(`Anim Count (sca) Incremented on: ${this.el.id} at  ${this.time}`);
      this.animEndTime = Math.max(this.animEndTime, this.time + keyFrame.msecs);
    }

    // If the keyFrame is to be repeated, add it to the end of the list.
    if (keyFrame.repeat) {
      //console.log("Adding keyFrame to end of list")
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

    //console.log(`Animation on ${this.el.id} set as follows...`)
    //console.log(attribName);
    //console.log(attribString);

    // Remove animation attribute before setting it, as recommended workaround for
    // https://github.com/aframevr/aframe/issues/4810 where identical
    // animations can't be requested consecutively.
    // for the moving-dynamic-body component (which takes care of physics sync)
    // we need to ensure this is immediately next in the components call order
    // so we add this atthe same time.
    // (note this component does nothing for entities that have no physics
    // dynamic-body component).
    this.el.removeAttribute(attribName);
    this.el.removeAttribute("moving-dynamic-body");
    this.el.setAttribute(attribName, attribString);
    this.el.setAttribute("moving-dynamic-body", "");

  },

  animationComplete: function() {

    //console.log(`Anim Count Decremented on: ${this.el.id} at ${this.time}`);
    this.animCount--;

    if (this.animCount <= 0) {
      this.animCount = 0;

      // Completed all requested animations, so move on to the next.
      this.animateToFirstKeyFrame();

    }
  },

  tick: function(time, timeDelta) {

    this.time = time;

    if (this.animCount <= 0) {
      // animation requested, but none playing.  Start the first.
      this.animateToFirstKeyFrame();
    }
    else
    {
      if (this.animEndTime > this.time + 1000) {
        // Failed to receive timely animation end event.
        console.warn(`Animation End Event Lost!  Anim count: ${this.AnimCount}, object: ${this.el.id}`);
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

/* Velocity (linear or angular) on a dynamic body - assumed to be an Ammo body
   of type dynamic.
   This component allows for:
   - The fact that the dynamic body is under management of the Ammo physics
     engine.
   - Maintaining the velocity even in the face of external forces, which
     might include friction, gravity & collisions...
   - But doing so subject to a configurable maximum acceleration in m/s/s.    */
AFRAME.registerComponent('db-velocity', {

  // Multiple allowed so that both angular and linear velocity components can
  // be configured on a single entity.
  multiple: true,

  schema: {
    x:      {type: 'number', default: NaN},
    y:      {type: 'number', default: NaN},
    z:      {type: 'number', default: NaN},
    // Max Acceleration m/s^2.  Default is approx 1.5G - enough to counter gravity.
    // For implementation simplicity & performance, this is applied independently
    // in each axis (XYZ) so true max acceleration can be higher than this if
    // accelerating in all axes at once.
    maxAcceleration: {type: 'number', default: 15},
    // True for angular velocity, false for linear velocity.
    angular: {type: 'boolean', default: false}
  },

  init: function () {

    if (this.el.components["ammo-body"]) {
      this.initialize();
    }
    else {
      this.el.addEventListener("body-loaded", e => {
        // cache the ammo-body component
        this.initialize();
      });
    }
  },

  initialize: function () {
    this.ammo = this.el.components["ammo-body"];

    // A vector to use for velocity (saving costly reallocations)
    const data = this.data;
    this.velocityConfig = new Ammo.btVector3(data.x, data.y, data.z);
    this.velocity = new Ammo.btVector3();
  },

  update: function () {
    const data = this.data;
    if (this.ammo) {
      this.velocityConfig.setValue(data.x, data.y, data.z);
    }
  },

  // Looks at z, y & z components of b.
  // for any that are not NaN, apply them to a.
  // but don't exceed maxDelta change from a.
  applyValidData: function (a, b, maxDelta) {

    if (!isNaN(b.x())) {
      a.setX(a.x() + allowedDelta(a.x(), b.x(), maxDelta));
    }

    if (!isNaN(b.y())) {
      a.setY(a.y() + allowedDelta(a.y(), b.y(), maxDelta));
    }
    if (!isNaN(b.z())) {
      a.setZ(a.z() + allowedDelta(a.z(), b.z(), maxDelta));
    }

    function allowedDelta(a, b, maxDelta) {
      var velDelta = b - a;

      if (Math.abs(velDelta) > maxDelta) {
        velDelta = Math.sign(velDelta) * maxDelta;
      }

      return(velDelta);
    }
  },

  tick: function(time, timeDelta) {
    const data = this.data;

    // How much velocity can change by depends on timeDelta + max acceleration
    const maxVelocityChange  = (data.maxAcceleration * timeDelta)/1000

    if (this.ammo) {

      if (data.angular) {
        this.velocity = this.el.body.getAngularVelocity();
      }
      else
      {
        this.velocity = this.el.body.getLinearVelocity();
      }
      this.applyValidData(this.velocity,
                          this.velocityConfig,
                          maxVelocityChange);
      if (data.angular) {
        this.el.body.setAngularVelocity(this.velocity);
      }
      else
      {
        this.el.body.setLinearVelocity(this.velocity);
      }
      this.el.body.activate(true);
    }
  },

  remove: function() {
    if (this.velocityConfig) {
      Ammo.destroy(this.velocityConfig)
    }
    if (this.velocity) {
      Ammo.destroy(this.velocity)
    }
  }
});

/* Set position on a dynamic body - assumed to be an Ammo body
   of type dynamic.
   This component allows for:
   - The fact that the dynamic body is under management of the Ammo physics
     engine.
   - Moving as swiftly as possible to the desired position, subject to the
     impacts and constraints of the physical world.
   - Respecting configured limits on both acceleration and velocity. */

AFRAME.registerComponent('db-position', {

  schema: {
    x:      {type: 'number', default: NaN},
    y:      {type: 'number', default: NaN},
    z:      {type: 'number', default: NaN},
    // Max Acceleration m/s^2.  Default is approx 1.5G - enough to counter gravity.
    // For implementation simplicity & performance, this is applied independently
    // in each axis (XYZ) so true max acceleration can be higher than this if
    // accelerating in all axes at once.
    maxAcceleration: {type: 'number', default: 15},

    // Max Speed.  Default is 5m/s (18kph).
    // For implementation simplicity & performance, this is applied independently
    // in each axis (XYZ) so true max speed can be higher than this if
    // moving in all axes at once.
    maxSpeed: {type: 'number', default: 5},

  },

  init: function () {
    this.vector = new THREE.Vector3();
  },

  tick: function(time, timeDelta) {

    var data = this.data;

    // assess delta from current position to desired position.
    this.vector.setX(constrain(data.x - this.el.object3D.position.x, data.maxSpeed));
    this.vector.setY(constrain(data.y - this.el.object3D.position.y, data.maxSpeed));
    this.vector.setZ(constrain(data.z - this.el.object3D.position.z, data.maxSpeed));

    function constrain(component, maxSpeed) {
      var vel = component;
      if (Math.abs(vel) > maxSpeed) {
        vel = Math.sign(vel) * maxSpeed;
      }
      return(vel);
    }

    // this.vector now contains the desired straight line movement towards the
    // target for axes specified, and NaNs where no target position was specified.
    this.el.setAttribute("db-velocity__vel",
                         {'x': this.vector.x,
                          'y': this.vector.y,
                          'z': this.vector.z,
                          'maxAcceleration': data.maxAcceleration});

    // As position gets to the specified position, velocity should naturally drop
    // to zero.
  }
});


  /* Set rotation on a dynamic body - assumed to be an Ammo body
     of type dynamic.
     This component allows for:
     - The fact that the dynamic body is under management of the Ammo physics
       engine.
     - Moving as swiftly as possible to the desired orientation, subject to the
       impacts and constraints of the physical world.
     - Respecting configured limits on both angular acceleration and
       angular velocity. */

  AFRAME.registerComponent('db-rotation', {

    schema: {
      x:      {type: 'number', default: NaN},
      y:      {type: 'number', default: NaN},
      z:      {type: 'number', default: NaN},
      // Max Acceleration rad/s^2.  Default is 3.  No particular reason, just seems
      // reasonable...
      maxAcceleration: {type: 'number', default: 1000},

      // Max Angular Speed in radians/second.  Default is 1.5 (approx a half-turn)
      // For implementation simplicity & performance, this is applied independently
      // in each axis (XYZ) so true max speed can be higher than this if
      // moving in all axes at once.
      maxSpeed: {type: 'number', default: 500},

    },

    init: function () {
      this.vector = new THREE.Vector3();
      //  this.euler = new THREE.Euler();
    },

    tick: function(time, timeDelta) {

      var data = this.data;
      const objectRotation = foo();

      // assess delta from current position to desired position.
      // check for NaN's first to avoid unecessary calculations.
      if (!isNaN(data.x)) {
        this.vector.setX(rotation(objectRotation('x', this.el.object3D.quaternion), degToRad(data.x), data.maxSpeed));
      }

      if (!isNaN(data.y)) {
        this.vector.setY(rotation(objectRotation('y',  this.el.object3D.quaternion), degToRad(data.y), data.maxSpeed));
      }
      if (!isNaN(data.z)) {
        this.vector.setZ(rotation(objectRotation('z',  this.el.object3D.quaternion), degToRad(data.z), data.maxSpeed));
      }

      // If you just take the rotation value from the Euler, in the default XYZ order
      // you may find e.g. that Y rotation never goes past +/- PI/2.
      // so we explicitly decompose to an Euler with the desired axis primary.
      function foo() {

        var euler = new THREE.Euler();

        return (function(value, quaternion) {
          var rotation

          switch (value) {

            case 'x':
              euler.setFromQuaternion(quaternion, "XYZ");
              rotation = euler.x;
              break;

            case 'y':
              euler.setFromQuaternion(quaternion, "YZX");
              rotation = euler.y;
              break;

            case 'z':
              euler.setFromQuaternion(quaternion, "ZXY");
              rotation = euler.z;
              break;
          }

          return(rotation);
        });
      }

      function degToRad(deg) {
        return (deg * Math.PI / 180);
      }

      function rotation(from, to, max) {

        // Not matching exact revolutions.  Find fastest rotation
        // We can turn in either direction and 1, 361, 721 etc.
        // all mean the same thing.
        var rotation = (to - from) % (Math.PI * 2);
        if (Math.abs(rotation) > Math.PI ) {
          rotation = rotation - Math.PI * 2;
        }

        return(rotation * 20);
      }

      // this.vector now contains the desired rotation for axes specified,
      // and NaNs where no target position was specified.
      // Apply it to the object using the db-velocity component, applying
      // angular velocity.
      this.el.setAttribute("db-velocity__angvel",
                           {'x': this.vector.x,
                            'y': this.vector.y,
                            'z': this.vector.z,
                            'maxAcceleration': data.maxAcceleration,
                            'angular': true});
    }
});
