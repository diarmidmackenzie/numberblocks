'use strict'

AFRAME.registerComponent('framed-block', {
schema: {
  height:     {type: 'number', default: 2},
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

  // Create geometry.
  //this.geometry = new THREE.BoxBufferGeometry(data.width, data.height, data.depth);

  const BIGX = this.data.width / 2
  const BIGY = this.data.height / 2
  const BIGZ = this.data.depth / 2
  const SMALLX = this.data.width / 2 - this.data.frame
  const SMALLY = this.data.height / 2 - this.data.frame
  const SMALLZ = this.data.depth / 2 - this.data.frame

  this.geometry = new THREE.BufferGeometry();
  // Vertices - we have 3 vertices for each of the 8 corners of the cube.
  // Every vertex has two "small" components, and one big one.
  const vertices = new Float32Array( [
     SMALLX,  SMALLY,    BIGZ,
     SMALLX,    BIGY,  SMALLZ,
     BIGX,    SMALLY,  SMALLZ,

     SMALLX,  SMALLY,   -BIGZ,
     SMALLX,    BIGY, -SMALLZ,
     BIGX,    SMALLY, -SMALLZ,

     SMALLX, -SMALLY,    BIGZ,
     SMALLX,   -BIGY,  SMALLZ,
     BIGX,   -SMALLY,  SMALLZ,

     SMALLX, -SMALLY,   -BIGZ,
     SMALLX,   -BIGY, -SMALLZ,
     BIGX,   -SMALLY, -SMALLZ,

    -SMALLX,  SMALLY,    BIGZ,
    -SMALLX,    BIGY,  SMALLZ,
    -BIGX,    SMALLY,  SMALLZ,

    -SMALLX,  SMALLY,   -BIGZ,
    -SMALLX,    BIGY, -SMALLZ,
    -BIGX,    SMALLY, -SMALLZ,

    -SMALLX, -SMALLY,    BIGZ,
    -SMALLX,   -BIGY,  SMALLZ,
    -BIGX,   -SMALLY,  SMALLZ,

    -SMALLX, -SMALLY,   -BIGZ,
    -SMALLX,   -BIGY, -SMALLZ,
    -BIGX,   -SMALLY, -SMALLZ,
  ] );

  // itemSize = 3 because there are 3 values (components) per vertex
  this.geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

  // Now we define the faces in terms of vertex indices.
  const indices = []

  // 8 corner triangles.
  indices.push(0, 2, 1,
               3, 4, 5,
               6, 7, 8,
               9, 11, 10,
               12, 13, 14,
               15, 17, 16,
               18, 20, 19,
               21, 22, 23);

  // 12 edges.
  createRectangle(1, 2, 4, 5)
  createRectangle(0, 1, 12, 13)
  createRectangle(2, 0, 8, 6)
  createRectangle(4, 3, 16, 15)
  createRectangle(3, 5, 9, 11)
  createRectangle(7, 6, 19, 18)
  createRectangle(8, 7, 11, 10)
  createRectangle(9, 10, 21, 22)
  createRectangle(12, 14, 18, 20)
  createRectangle(14, 13, 17, 16)
  createRectangle(17, 15, 23, 21)
  createRectangle(19, 20, 22, 23)

  // 6 faces.
  createRectangle(6, 0, 18, 12)
  createRectangle(3, 9, 15, 21)
  createRectangle(1, 4, 13, 16)
  createRectangle(10, 7, 22, 19)
  createRectangle(5, 2, 11, 8)
  createRectangle(14, 17, 20, 23)

  function createRectangle(a, b, c, d) {
    indices.push(a, b, c);
    indices.push(c, b, d);
  }

  this.geometry.setIndex(indices);
  this.geometry.computeVertexNormals();

  // 8 + 2 x 12 = 32 triangles = 96 vertices for the "frame"
  this.geometry.addGroup(0, 96, 0 );
  // 2 x 6 = 12 triangles = 36 vertices for the faces.
  this.geometry.addGroup(96, 36, 1);

  // Create material.
  this.frameMaterial = new THREE.MeshStandardMaterial({color: data.framecolor, roughness: 0.3});
  this.faceMaterial = new THREE.MeshStandardMaterial({color: data.facecolor, roughness: 1.0});

  // Create mesh.
  this.mesh = new THREE.Mesh(this.geometry, [this.frameMaterial, this.faceMaterial]);

  // Set mesh on entity.
  el.setObject3D('mesh', this.mesh);
}
});

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

// Actions map directly to animations.
const ACTIONS = ["walk", "panic", "wave", "stop", "floss", "turn", "jump", "look"];
// Behaviours are what the numberblock chooses from, when stable & grounded.
const BEHAVIOURS = ["walk", "look", "wave", "turn", "floss"]
const PARTS = ["lLeg", "rLeg", "lArm", "rArm", "body", "box"];
const PROPERTIES = ["rotation", "position"];
const BLOCK_SIZE = 0.1;
const LEGS_HEIGHT = 0.065;

// Arm heights from center of blocks, in block units
// Indices match number block, so NB 1 is in index position 1.
// Doesn't allow for the fact that 8 has 3 sets of arms...
const ARM_HEIGHTS = [0, -0.25, -0.25, 0.25, -0.5, 1, -0.75, 1.75, 0, 0.4, 3.2];

const ANIMATIONS = {
/*  'walk' : {
    'lLeg' : "property: rotation; from:20 0 0; to: -20 0 0; loop: true;  dir: alternate; easing:easeInOutQuad; dur: 500",
    'rLeg' : "property: rotation; from:-20 0 0; to: 20 0 0; loop: true;  dir: alternate; easing:easeInOutQuad; dur: 500",
    'lArm' : "property: rotation; from:-30 0 30; to: 30 0 30; loop: true;  dir: alternate; easing:easeInOutQuad; dur: 500",
    'rArm' : "property: rotation; from:30 0 -30; to: -30 0 -30; loop: true;  dir: alternate; easing:easeInOutQuad; dur: 500",
*/
  'walk' : {
    'rotation': {
      'lLeg' : [[500, "-20 0 0"], [500, " 20 0 0"]],
      'rLeg' : [[500, " 20 0 0"], [500, "-20 0 0"]],
      'lArm' : [[500, " 30 0 30"], [500, "-30 0 30"]],
      'rArm' : [[500, " -30 0 -30"], [500, "30 0 -30"]],
      'body' : [[500, " 0 0 0"]],
      'box' : [[500, " 0 0 0"]]
    }
  },

  'panic' : {
    'rotation': {
      'lLeg' : [[80, "0 0 -10"], [80, " 0 0 5"]],
      'rLeg' : [[80, " 0 0 5"], [80, "0 0 -10"]],
      'lArm' : [[80, " 0 0 50"], [80, "0 0 10"]],
      'rArm' : [[80, " 0 0 -10"], [80, "0 0 -50"]],
      'body' : [[500, " 0 0 0"]],
      'box' : [[500, " 0 0 0"]]
    }
  },

  'wave' : {
    'rotation': {
      'lLeg' : [[500, "0 0 0"], [2000, " 0 0 0"]],
      'rLeg' : [[500, " 0 0 0"], [2000, "0 0 0"]],
      'lArm' : [[500, " 0 0 30"], [2000, "0 0 30"]],
      'rArm' : [[500, " 0 0 -30"], [500, "0 0 -150"], [500, "0 0 -120"], [500, "0 0 -150"], [500, "0 0 -30"]],
      'body' : [[500, " 0 0 0"]],
      'box'  : [[500, " -20 0 0"], [1000, "-20 0 0"], [1000, "-20 0 0"], [500, "0 0 0"]]
    }
  },

  'stop' : {
    'rotation': {
      'lLeg' : [[500, "0 0 0"]],
      'rLeg' : [[500, " 0 0 0"]],
      'lArm' : [[500, " 0 0 30"]],
      'rArm' : [[500, " 0 0 -30"]],
      'body' : [[500, " 0 0 0"]],
      'box'  : [[500, " 0 0 0"]]
    },
    //'position': {
    //  'lLeg' : [[500, "0.02 -0.0075 0"]],
    //  'rLeg' : [[500, "-0.02 -0.0075 0"]],
    //}
  },

  'floss' : {
    'rotation': {
      'lLeg' : [[315, "0 0 -10"], [315, "0 0 10"],[315, "0 0 -10"], [315, "0 0 10"]],
      'rLeg' : [[315, " 0 0 -10"], [315, "0 0 10"],[315, " 0 0 -10"], [315, "0 0 10"]],
      'lArm' : [[315, " 30 0 5"], [315, " -30 0 80"], [315, " -30 0 5"], [315, " 30 0 80"]],
      'rArm' : [[315, " 30 0 -80"], [315, " -30 0 -5"], [315, " -30 0 -80"], [315, "30 0 -5"]],
      'body' : [[315, " 0 0 10"], [315, " 0 0 -10"], [315, " 0 0 10"], [315, "0 0 -10"]],
      'box' : [[315, "0 0 0"]]
    },
    //'position': {
    //  'lLeg' : [[315, "0.03 -0.0075 0"], [315, "0.01 -0.0075 0"]],
    //  'rLeg' : [[315, "-0.01 -0.0075 0"], [315, "-0.03 -0.0075 0"]],
    //}
  },

  'turn' : {
    'rotation': {
      'lLeg' : [[500, "0 0 5"], [500, "0 0 -5"]],
      'rLeg' : [[500, " 0 0 -5"], [500, "0 0 5"]],
    }
  },

  'jump' : {
    'rotation': {
      'lLeg' : [[1000, "30 0 0"], [200, "-30 0 0"], [1000, "0 0 0"]],
      'rLeg' : [[1000, " 30 0 0"], [200, "-30 0 0"], [1000, "0 0 0"]],
      'lArm' : [[1000, " 80 0 30"], [200, "-80 0 30"], [1000, "0 0 30"]],
      'rArm' : [[1000, " 80 0 -30"], [200, "-80 0 -30"], [1000, "0 0 -30"]],
    }
  },

  'look' : {
    'rotation': {
      'body' : [[500, "0 20 0"], [500, "0 -20 0"], [1000, "0 0 0"]]
    }
  },


};

AFRAME.registerComponent('numberblock', {

  schema: {
    debug: {type: 'boolean', default: false},
    size: {type: 'number', default: 1}
  },

  init: function() {
    //this.tick = AFRAME.utils.throttleTick(this.tick, 5000, this);
    this.animCount = 0;

    this.state = {
     'grabbed' : false,
     'currentBehaviour' : "",
     'upright' : true,
     'grounded' : true,
     'jumpingUp' : false
    }

    this.createBodyParts(this.data.size);
    this.whole = this.el;  // do we need this?  suspect not...

    this.transitions = [];

    this.cylindrical = new THREE.Cylindrical;
    this.targetPosition = new THREE.Vector3;

    // Final bit of initialization can complete when the physics engine is
    // initialized
    this.el.addEventListener("body-loaded", e => {
      // cache the ammo-body component
      this.ammo = this.el.components["ammo-body"];

      // get started with moving
      // hitting problems with physics init, so wait before starting...
      // actions will be triggered by tick soon enough...
      //this.performRandomAction()
    });

    this.listeners = {
      'grabStart': this.grabStart.bind(this),
      'grabEnd': this.grabEnd.bind(this),
      'animationComplete': this.animationComplete.bind(this)
    }

    this.callbacks = {
      'stopMovement' : this.stopMovement.bind(this),
      'stopRotation' : this.stopRotation.bind(this),
      'jumpUp' : this.jumpUp.bind(this)
    };

    this.el.addEventListener('grab-start', this.listeners.grabStart);
    this.el.addEventListener('grab-end', this.listeners.grabEnd);

    // commenting out while trying async after object creation.
    // That doesn't seem to have made a difference, though...
    //this.createAnimations();
  },

  createBodyParts: function(size) {

    // Some calculations based on size.
    // For now these assume all blocks stacked vertically
    // Will need revising for correct 4/6/8 shapes.
    const blocksWidth = this.rowLengthFromSize(size);
    const blocksHeight = Math.ceil(size / blocksWidth);
    const bodyHeight = blocksHeight * BLOCK_SIZE;
    const height = bodyHeight + LEGS_HEIGHT;
    const width = blocksWidth * BLOCK_SIZE;

    // store generally useful data for use elsewhere.
    this.blocksHeight = blocksHeight;
    this.blocksWidth = blocksWidth;
    this.height = height;

    // Set attributes on main entity.
    // Position, rotation assumed to be set externally.
    this.el.setAttribute("ammo-body", {'type': 'dynamic',
                                       'mass': size * 5});
    this.el.setAttribute("ammo-shape", {'type': 'box',
                                        'fit': 'manual',
                                        'halfExtents': {'x': width / 2,
                                                        'y': height / 2,
                                                        'z': 0.05}});
    this.el.setAttribute("grabbable", 'constraintComponentName', 'ammo-constraint');

    const id = this.el.id;
    this.animatedPartsToLoad = 6;

    // Create the body.  This includes the blocks & arms, but not the legs.
    // Just a container, with minimal of its own attributes.
    this.body = document.createElement('a-entity');
    this.body.setAttribute('id', id + "-body");
    this.body.setAttribute('body-part-loaded', `part: body; entity: #${id}`);
    this.body.object3D.position.set(0, LEGS_HEIGHT/2, 0);
    this.el.appendChild(this.body);

    // Create the box.  This includes the blocks as children.
    this.box = document.createElement('a-entity');
    this.box.setAttribute('id', id + "-box");
    this.box.setAttribute('body-part-loaded', `part: box; entity: #${id}`);
    this.body.appendChild(this.box);

    // Create the blocks.  This includes the blocks as children.
    // Just one block for now - will need to extend for larger numbers.
    this.blocks = [];
    var posx = (blocksWidth - 1)/2 * BLOCK_SIZE;
    var posy = 0;
    for (var ii = 0; ii < blocksHeight; ii++) {
      for (var jj = 0; jj < blocksWidth; jj++) {
        var block =  document.createElement('a-entity');
        block.setAttribute('id', `${id}-block-${ii}`);
        block.setAttribute('mixin', `block${this.mixinFromSizeAndIndex(size, ii * blocksWidth + jj)}`);
        const xpos = ((width - BLOCK_SIZE) / 2) - (jj * BLOCK_SIZE)
        const ypos = (ii * BLOCK_SIZE) - ((bodyHeight - BLOCK_SIZE) / 2);
        block.object3D.position.set(xpos, ypos, 0);
        this.box.appendChild(block);
        this.blocks.push(block);
      }
    }

    // The face is a child of the box, so it can cover multiple blocks.
    this.face = document.createElement('a-entity');
    this.face.setAttribute('id', id + "-face");
    this.face.setAttribute('gltf-model', '#face1');
    this.face.object3D.scale.set(0.05, 0.05, 0.05);
    // face center is half a block below the top of the block.
    this.face.object3D.position.set(0, bodyHeight/2 - 0.05, 0.05);
    this.box.appendChild(this.face);

    // The arms are children of the body (but not the box).
    this.lArm = document.createElement('a-entity');
    this.lArm.setAttribute('id', id + "-lArm");
    this.lArm.setAttribute('gltf-model', '#limb1');
    this.lArm.object3D.scale.set(0.05, 0.05, 0.05);
    this.lArm.object3D.position.set(width/2, this.armsHeightFromSize(size), 0);
    this.lArm.object3D.rotation.set(0, 0, THREE.Math.degToRad(30));
    this.lArm.setAttribute('body-part-loaded', `part: lArm; entity: #${id}`);
    this.body.appendChild(this.lArm);

    this.rArm = document.createElement('a-entity');
    this.rArm.setAttribute('id', id + "-rArm");
    this.rArm.setAttribute('gltf-model', '#limb1');
    this.rArm.object3D.scale.set(0.05, 0.05, 0.05);
    this.rArm.object3D.position.set(-width/2, this.armsHeightFromSize(size), 0);
    this.rArm.object3D.rotation.set(0, 0, THREE.Math.degToRad(-30));
    this.rArm.setAttribute('body-part-loaded', `part: rArm; entity: #${id}`);
    this.body.appendChild(this.rArm);

    // The legs are children of the entity (but not the box or body).
    this.lLeg = document.createElement('a-entity');
    this.lLeg.setAttribute('id', id + "-lLeg");
    this.lLeg.setAttribute('gltf-model', '#limb1');
    this.lLeg.object3D.scale.set(0.05, 0.05, 0.05);
    this.lLeg.object3D.position.set(width/5, LEGS_HEIGHT - height/2, 0);
    this.lLeg.setAttribute('body-part-loaded', `part: lLeg; entity: #${id}`);
    this.el.appendChild(this.lLeg);

    this.rLeg = document.createElement('a-entity');
    this.rLeg.setAttribute('id', id + "-rLeg");
    this.rLeg.setAttribute('gltf-model', '#limb1');
    this.rLeg.object3D.scale.set(0.05, 0.05, 0.05);
    this.rLeg.object3D.position.set(-width/5, LEGS_HEIGHT - height/2, 0);
    this.rLeg.setAttribute('body-part-loaded', `part: rLeg; entity: #${id}`);
    this.el.appendChild(this.rLeg);

  },

  mixinFromSizeAndIndex: function(size, index) {

    var id;

    switch (size) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 8:
        id = size;
        break;

      case 7:
        id = index + 1;
        break;

      case 9:
        id = Math.floor(index/3) + 9;
        break;

      case 10:
      default:
        id = 12;
        break;
    }

    return(id);
  },

  rowLengthFromSize: function(size) {

    var row;

    switch (size) {
      case 1:
      case 2:
      case 3:
      case 5:
      case 7:
      case 10:
        row = 1;
        break;

      case 4:
      case 6:
      case 8:
        row = 2;
        break;

      case 9:
        row = 3;
        break;
    }

    return(row);
  },

  // Arm height relative to center of the box.
  armsHeightFromSize: function(size) {
    return(ARM_HEIGHTS[size] * BLOCK_SIZE);
  },



  update: function() {
    if (this.data.debug  && !this.debugLogger) {
      this.debugLogger = document.createElement('a-plane');
      this.debugLogger.object3D.position.set(0, 0.3, 0)
      this.debugLogger.setAttribute("width", 0.4);
      this.debugLogger.setAttribute("height", 0.4);
      this.debugLogger.setAttribute("material", "color:black; transparent: true; opacity: 0.7");
      this.debugLogger.setAttribute("text", "color:white;side:double;wrapCount: 20");
      this.debugLogger.setAttribute("rotate-to-face-player", "camera:#camera; parent:#oneEntity");
      this.el.appendChild(this.debugLogger);
    }
  },

  /* ANIMATION FUNCTIONALITY */

  // We create all animations on the object at soon as it is loaded, and then trigger
  // them using events.
  createBodyPartAnimations: function(part) {

    ACTIONS.forEach((action) => {
      PROPERTIES.forEach((property) => {
        if (ANIMATIONS[action][property]) {
          if (ANIMATIONS[action][property][part]) {
            ANIMATIONS[action][property][part].forEach((keyFrame, index) => {
              this.addKeyFrameAnimation(part, action, property, index);
            });
          }
        }
      });
    });
  },

  addKeyFrameAnimation: function(part, action, property, index) {

    const target = this[part];
    const attribName = `animation__${action}_${part}_${property}_${index}`
    const attribObject = {'property': property,
                          'to': ANIMATIONS[action][property][part][index][1],
                          'easing': "easeInOutQuad",
                          'dur': ANIMATIONS[action][property][part][index][0],
                          'autostart': false,
                          'startEvents': `start-anim-${action}_${part}_${property}_${index}`};
    this[part].setAttribute(attribName, attribObject);

    this[part].addEventListener(`animationcomplete__${action}_${part}_${property}_${index}`, this.listeners.animationComplete);

  },

  startAnimation: function(action) {

    // Never override panic action on a grabbed entity
    // (this path can happen due to timers popping after the grab)
    if (this.grabbed) {
      action = "panic";
    }

    if (this.state.currentBehaviour == action) {
      // already doing this animation.
      return;
    }

    this.state.currentBehaviour = action;

    PARTS.forEach((part) => {
      PROPERTIES.forEach((property) => {
        this.startPartPropertyAnimation(part, action, property, 0);
      });
    });
  },

  startPartPropertyAnimation: function(part, action, property, index) {

    this[part].emit(`start-anim-${action}_${part}_${property}_${index}`, null, false);
  },

  animationComplete: function(event) {

    // "animation__" is 11 characters.
    const animData = event.detail.name.substr(11).split("_")
    const action = animData[0]
    const part = animData[1]
    const property = animData[2]
    var index = parseInt(animData[3]);

    index++;
    if (index >= ANIMATIONS[action][property][part].length) {
      index = 0;
    }

    // continue with this animation?
    if (this.state.currentBehaviour == action) {
      this.startPartPropertyAnimation(part, action, property, index);
    }
  },

  /* BEHAVIOUR FUNCTIONALITY */

  grabStart: function () {
    console.log("Grab start")
    this.state.grabbed = true;
    this.startAnimation("panic");
  },

  grabEnd: function () {
    console.log("Grab end")
    this.state.grabbed = false;
    this.startAnimation("stop");
  },

  stopMovement: function () {
    this.startAnimation("stop");
    this.el.removeAttribute("db-rotation");
    this.el.removeAttribute("db-velocity__vel");
    this.el.removeAttribute("db-velocity__angvel");
    this.el.removeAttribute("db-velocity__angvel_turn");
    this.state.jumpingUp = false;
  },

  tick: function (time, timeDelta) {

    this.syncStateFromPosition();

    // Use a random gap between actions, or you get creepy synchronization
    // between different numberblock instances.
    const thisGap = Math.random() * 7000;
    if (((time % thisGap) < ((time - timeDelta) % thisGap)) &&
        (!this.state.grabbed))
     {
      // every 5 seconds.

      if (this.state.upright && this.state.grounded) {
        // standing on the ground
        this.performRandomAction();

      }
      else if (!this.state.upright)
      {
        // Probably lying on the ground.
        // note that "grounded" is determined by what is below the
        // feet, so ignore "grounded" when not upright.
        this.jumpUpFromGround();
      }
    }

    if (this.state.grounded &&
        this.state.upright &&
        !this.state.grabbed) {
      // tall blocks have a tendency to fall over.  Keep stable.
      this.keepBalance();
    }
    else if (!this.state.upright &&
             !this.state.jumpingUp) {
      // if no longer upright, and not in the process of jumping up, stop moving.
      // (continuing to turn/move while lying on the floor looks spooky...)
      this.stopMovement();
    }

    if (this.data.debug && this.debugLogger) {

      this.debugLogger.setAttribute("text",
                            `value: grabbed : ${this.state.grabbed}\n
                             currentBehaviour : ${this.state.currentBehaviour}\n
                             upright :  ${this.state.upright}\n
                             grounded :  ${this.state.grounded}\n`);

    }
  },

  jumpUpFromGround: function() {

    // swing arms and legs.
    this.startAnimation("jump");
    this.state.jumpingUp = true;

    // After 1000 msecs...
    setTimeout(this.callbacks.jumpUp, 1000)

  },

  keepBalance: function() {
    this.el.setAttribute("db-rotation",
                         {'x': 0, 'z': 0,
                          'maxAcceleration': 100,
                          'maxSpeed': 1});


    setTimeout(this.callbacks.stopRotation, 100)
  },

  stopRotation: function() {
    this.el.removeAttribute("db-rotation");
  },

  jumpUp: function() {

    // jump up to a horizontal position.
    // keeping max acceleration low-ish means that tall blocks like 7 & 10
    // don't ping themselves into the air ridiculously high.
    // This still needs some tuning, together with "keepBalance" to get
    // reasonable behaviour for 7-block & 10-block.
    this.el.setAttribute("db-rotation",
                         {'x': 0, 'z': 0,
                          'maxAcceleration': 3000 / this.blocksHeight,
                          'maxSpeed': 5});

    // small jump as well as the rotation.  Not clear this is actually necessary
    // since the rotation itself results in significant up-thrust.
    // const velocity = new Ammo.btVector3(0, 10, 0);
    // this.el.body.setLinearVelocity(this.velocity);
    // Ammo.destroy(velocity);

    // Stop movement so we don't repeat the jump animation.
    setTimeout(this.callbacks.stopMovement, 500);
  },

  performRandomAction: function() {

    if (!this.ammo || !Ammo.asm.$) {
      // physics engine not activated yet.
      return true;
    }

    var choice = Math.floor(Math.random() * 5);
    var action = BEHAVIOURS[choice];

    switch (action) {

      case "walk":
        this.startAnimation("walk");
        var angle = Math.random() * Math.PI * 2;
        var x = 0.3 * Math.sin(angle);
        var z = 0.3 * Math.cos(angle);

        this.el.setAttribute("db-rotation",
                            {'x': 0,
                            'y': (angle * 180 / Math.PI),
                            'z': 0,
                            'maxAcceleration': 150 - (5 * this.blocksHeight),
                            'maxSpeed': 3});

        this.el.setAttribute("db-velocity__vel",
                            {'x': x, 'z': z});
        setTimeout(this.callbacks.stopMovement, Math.random() * 1000 + 1000)

        break;

      case "look":
        this.startAnimation("stop");
        this.startAnimation("look");
        setTimeout(this.callbacks.stopMovement, 1000);
        break;

      case "wave":
        this.startAnimation("wave");
        // Only wave once.
        setTimeout(this.callbacks.stopMovement, 2000)
        break;

      case "turn":
        // Turning for a random period up to 2 seconds.
        this.startAnimation("turn");
        // pick unique name to not clash with balance / jump-up angvel,
        // triggered via db-rotation
        this.el.setAttribute("db-velocity__angvel_turn",
                             {'x': 0, 'y': 5 * Math.sign(Math.random() - 0.5),
                              'z': 0,
                              'angular': true,
                              maxAcceleration: 150 - (5 * this.blocksHeight),
                              maxSpeed: 3});

                              //maxAcceleration: 700 / this.blocksHeight,
                              //maxSpeed: 10 / (this.blocksWidth * this.blocksHeight)}); /// this.blocksWidth
        setTimeout(this.callbacks.stopMovement, Math.random() * 500 * this.blocksHeight); // taller blocks move more slowly, so need to turn for longer.

        // Note this doesn't affect any existing body/limb animations, which can
        // continue along with the turn.
        break;

      case "floss":
        this.startAnimation("floss");
        break;

      default:
        break;
    }
  },

  /* PHYSICS-RELATED FUNCTION */

  syncStateFromPosition: function () {

    // 1st paramaters is half the height of the character.
    // 0.002 is the tolerance.
    this.state.grounded = this.isSupportedBelow(this.height / 2, 0.002);
    this.state.upright = this.isUpright(0.5);  // 0.5 rad is about 29 degrees.

  },

  isUpright: (function(tolerance) {

   var vector = new THREE.Vector3();
   var spherical = new THREE.Spherical();

   return function(tolerance) {

     var upright = false;
     vector.set(0, 1, 0);
     vector.applyQuaternion(this.el.object3D.quaternion);
     spherical.setFromVector3(vector);

     if (Math.abs(spherical.phi) < tolerance) {
       upright = true;
     }

     return(upright);
   }
 })(),

  /* Determine whether the object has a supporting object immediately below.
     Note, "below" means under its feet, so a freefalling upside down object
     with another object immediately above it would come out as "Supported"
     (but would not be marked as upright!)
     Method used here comes from:
     https://gamedev.stackexchange.com/questions/58012/detect-when-a-bullet-rigidbody-is-on-ground
     Modified to allow for the body not being vertical */
  isSupportedBelow: function(myHeight, sensitivity) {

    if (!this.ammo || !Ammo.asm.$) {
      // physics engine not activated yet.
      return true;
    }

    var onGround = false;
    // Create a ray to check for a colliding object.
    // From point is the object center.
    const btFrom = new Ammo.btVector3(this.el.object3D.position.x,
                                      this.el.object3D.position.y,
                                      this.el.object3D.position.z);

    // To point depends on the objects orientation.
    // In the default orientation, it is straight down.
    var toVector = new THREE.Vector3(0, -1, 0);
    toVector.applyQuaternion(this.el.object3D.quaternion);
    toVector.add(this.el.object3D.position);

    const btTo = new Ammo.btVector3(toVector.x,
                                    toVector.y,
                                    toVector.z);

    var res = new Ammo.ClosestRayResultCallback(btFrom, btTo);

    this.ammo.system.driver.physicsWorld.rayTest(btFrom, btTo, res);

    if(res.hasHit()){
      const distance = this.el.object3D.position.y - res.get_m_hitPointWorld().y();
      if (distance < myHeight + sensitivity)
        onGround = true;
    }

    Ammo.destroy(btFrom);
    Ammo.destroy(btTo);
    Ammo.destroy(res);

    return (onGround);
  }
});

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

    if (this.el.components["ammo-body"]
        && Ammo.asm.$) {
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
/* Not currently in use.
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
}); */


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

// This component only works for elements in the world reference.
// Only affects rotation about y axis, not x & z.
AFRAME.registerComponent('rotate-to-face-player', {

  schema : {
    camera: {type: 'selector', default: "#camera"}
  },

  tick: function() {
    this.trackCamera();
  },

  trackCamera: (function() {

    var vectorToCamera = new THREE.Vector3();
    var cylindrical = new THREE.Cylindrical();
    var quaternion = new THREE.Quaternion();
    var position = new THREE.Vector3();

    return function() {
      // Get Camera World Position.
      var camera = this.data.camera;
      camera.object3D.updateMatrixWorld();
      vectorToCamera.setFromMatrixPosition(camera.object3D.matrixWorld);

      // and object world position - and the vector between them.
      this.el.object3D.getWorldPosition(position);
      vectorToCamera.sub(position);

      // Factor in rotation of parent to get a rotation in the object's own space.
      this.el.object3D.parent.getWorldQuaternion(quaternion);
      quaternion.invert();
      vectorToCamera.applyQuaternion(quaternion);

      // Determine angle to camera, and set this rotation on the object.
      cylindrical.setFromVector3(vectorToCamera);
      this.el.object3D.rotation.y = cylindrical.theta;

    }
  })()
});

/* Loading animations onto entities before they are loaded seems to have problems
   So we delay this process, and load the animations once the entity is loaded */
AFRAME.registerComponent('body-part-loaded', {
  schema: {
    part: {type: 'string'},
    entity: {type: 'selector'}
  },
  init: function () {
    // This will be called after the entity has properly attached and loaded.
    this.data.entity.components['numberblock'].createBodyPartAnimations(this.data.part);
  }
});
