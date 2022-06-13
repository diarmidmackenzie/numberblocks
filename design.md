

!! Using Anime directly is difficult because about half the logic of the animation component is dedicated to making vectors in "0 0 0" form work 	with anime.js.  So maybe easier to stick with current function & wrap the animation component with keyframes function, rather than trying to use native anime.js keyframes function....



Animations in GLTF clips (Blender) vs using anime.js?  General principles:

- Use Blender where geometry is complex
- Use anime.js where flexibility is desirable, and there are an unpredictable and/or large number of animations.



A single entity can use both types of animation, e.g.

- Arm / Leg are blender shapes (complex geometry)
- They can swing using anime.js, which is a simple rotation about the pivot point (the hip/shoulder joint)
- They can bend using GLTF clips.



We want a presentation layer that

- masks whether it's a GLTF clip or anime.js animation under the covers...
- allows animations for multiple objects to be grouped together and applied collectively.



Terminology:

- Body part

  - A single A-Frame entity that represents a body part
  - Examples:
    - Body (a single block for One, multiple blocks for other numbers)
    - Block
    - Left leg
    - Mouth
  - Body parts can have other body parts as children (e.g. blocks are children of body; also eyes and mouth may be children of body so they stay attached when the body moves).
  - Each numberblock has a fixed set of body parts, arranged in a fixed hierarchy.

- clip: a GLTF clip.  Defined on & plays on a single object.

  - Contains keyframes  & timing info (though these are opaque to our code).
  - Examples: mouth smiles, arm bends.
  - Multiple GLTF models may have the same named clip (e.g. "smile" may be applicable to many different mouth models)
    - Use A-Frame animation mixer for this as it does all we need.
    - https://github.com/n5ro/aframe-extras/blob/master/src/loaders/README.md
    - Just need to store a timestamp offset, and a set of parameters to pass to animation-mixer (which in the simplest case is just the script name).
    - an object data structure might be cleaner/more performant than a string, though.  And more consistent with what we're doing for Animes.

- anime: an animation on a single object implemented using anime.js.

  - Contains keyframes, timing info etc.
  - Anime.js does support application to multiple targets, but I don't see cases where we'd use that... even in co-ordinated movements like arms/legs for walking, animations are different for each limb.
  - Values are absolute, not relative, but we use object hierarchies to avoid having to know exactly where in space objects are to apply animations
  - Examples: right leg swing for walking; eye roll.

- Cycle

  - A set of clips & animes applied to a set of body parts of a single numberblock.
  - It looks the same every time (no random elements).
  - E.g. walk-cycle, panic-cycle, wave
  - It may or may not loop (e.g. walk-cycle loops, wave does not)
    - !! This is equivalent to an anime timeline (which can affect multiple objects, but can't control clips)
    - !! What does an anime timeline look like as JSON?  Is that a plausible mechanism for storing these?

- Action

  - Actions are the level that is exposed on the API.  They combine cycles together.
  - An action applies to a single numberblock.

  - (TBC how this concept evolves when we merge/split numberblocks)

  - Current assumption is that a numberblock can only perform one action at atime (TBC if necessary - why not e.g. smile + walk?)

  - Examples:

    - wait - stops all behaviours, periodically triggers a random action like "look around" or "wave"
    - walk to X - turn towards X, start walk-cycle, move towards X, stop walk-cycle when X is reached
    - wave - trigger the wave cycle once.
    - panic - start the panic cycle, and loop it indefinitely.

    

Identifiers...

- Body parts are A-Frame Entities, referenced by id.  Naming scheme TBC, but expected to be
  - Unique body part id( within a number block) + Unique numberblock id.
- Behaviours have a name, plus optional parameters
  - E.g. "panic" has no parameters
  - E.g. "walk" has a position to walk to.
  - Behaviours apply to the whole numberblock, not a body part
  - Behaviours are configured using properties on the numberblock component.
- Mapping from Behaviours to animes/clips
  - This mapping is defined globally for the Behaviour.  It applies to all numberblocks by default.
  - Individual numberblocks may need to be able to override this with custom functions (TBD!!!?)
    - (e.g 8-block has 4 pairs of arms/legs...?)



Proposed interface:

- numberblock = "behaviour: walk; targetPosition:1 0 1";
- numberblock = "behaviour: panic";
- This is set by the numberblock itself - e.g. on grab event, behaviour is set to "panic".  e.g. on landing on back, behaviour is set to "jumpUpFromBack".  And at random, behaviour may be set to "walk", "wave" etc.
- But it can also be set externally, e.g. for test scripts to test specific behaviour.



Cycle definitions:

- Array of affected body parts
- Each has a list of animes, in sequence... (may be empty)
- .. and a list of clips, in sequence... (may also be empty)

```
'walk-cycle' : [
'rLeg': [[]]
]
```

