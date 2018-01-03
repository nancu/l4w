/// <reference path="Commons.ts" />

// Character core model (only persistent data)
interface ICharacterData {
    visible?: boolean; // Whether Character should be rendered
    opacity?: number; //Character rendering opacity
    rotation?: RotationEnum; //Define Character rotation
    speed?: ScaleEnum; // Movement speed
    frequency?: ScaleEnum; // Animation change speed
    direction?: DirectionEnum; // Current direction
    onTop?: number; // Integer > 0 if this Character should be rendered on top
    block?: boolean; // False if Character does not block movement (you can walk through it)
    charaset?: string; // Name of the charaset (alternative to GID)
    gid?: number; // GID from a Tilemap (alternative to charaset)
}

// Character extended model (include transient data)
interface ICharacter extends ICharacterData {
    mSpeed?: number; // Speed (as pixels/milliseconds)
    frequencyVal?: number; // Animation change speed (frame/milliseconds)
    animationStartTime?: number; // ms since last animation change
}