/// <reference path="Commons.ts" />

// Event core model (only persistent data)
interface IEventData extends ICell {
    name: string; // String assigned to name field in editor
    states: IEventState[]; // Array of states of this Event
    memory: {}; // Map of generic key -> value pairs
    script: string; // Script Class which contains the methods used by this event
}

// Event extended model (include transient data)
interface IEvent extends IEventData  {
    index?: number; // Index of this event in the map.events Array
    currentState?: number; // Index of current valid state
    position?: IPoint; // Exact coordinate in pixels (derived from event.i, event.j)
    movementStartTime?: number; // ms since last step started
    movementDirection?: DirectionEnum; // Direction of current step
    target?: IPoint; // Current destination in pixels
    newTarget?: IPoint; // New destination in pixels
    path?: DirectionEnum[]; // Path computed for current target
}

interface IEventState extends ICharacter {
    condition: string; // Name of function that returns true if this state can be active (see Activators.ts)
    trigger: number; // Type of interaction which will start the action
    action: string; // Method of the script that will be invoked by the trigger
}