/**
 * Module for constants values
 */
namespace Constant {

    export const DOUBLE_PI = Math.PI * 2;

    export class Color {
        static YELLOW = "yellow";
        static RED = "red";
        static WHITE = "white";
        static GREY = "grey";
        static BLACK = "black";
        static AQUA = "aqua";
        static DARKBLUE = "darkblue";
        static GREEN = "green";
        static LIME = "lime";
    }
    
    export class RequestType {
        static GET = "GET";
        static POST = "POST";
    }
    
    export class MimeType {
        static JSON = "application/json";
    }

    export const MEDIUM_MSPEED: number = 4 * 32 / 1000; // 4 cells per second
    export const VERY_LOW_MSPEED: number = MEDIUM_MSPEED * (1 - 0.90);
    export const LOW_MSPEED: number = MEDIUM_MSPEED * (1 - 0.50);
    export const MEDIUM_LOW_MSPEED: number = MEDIUM_MSPEED * (1 - 0.20);
    export const MEDIUM_HIGH_MSPEED: number = MEDIUM_MSPEED * (1 + 0.20);
    export const HIGH_MSPEED: number = MEDIUM_MSPEED * (1 + 0.50);
    export const VERY_HIGH_MSPEED: number = MEDIUM_MSPEED * (1 + 0.90);

    export const MEDIUM_FREQUENCY: number = 6 / 1000; // 6 animations per second
    export const VERY_LOW_FREQUENCY: number = MEDIUM_FREQUENCY * (1 - 0.90);
    export const LOW_FREQUENCY: number = MEDIUM_FREQUENCY * (1 - 0.50);
    export const MEDIUM_LOW_FREQUENCY: number = MEDIUM_FREQUENCY * (1 - 0.20);
    export const MEDIUM_HIGH_FREQUENCY: number = MEDIUM_FREQUENCY * (1 + 0.20);
    export const HIGH_FREQUENCY: number = MEDIUM_FREQUENCY * (1 + 0.50);
    export const VERY_HIGH_FREQUENCY: number = MEDIUM_FREQUENCY * (1 + 0.90);
    
    export class DialogBox {
        static IMG_BOX_X_OFFSET: number = 0;
        static IMG_BOX_Y_OFFSET: number = 0;
        static IMG_BOX_WIDTH: number = 128;
        static IMG_BOX_HEIGHT: number = 128;
        static IMG_BORDER_CELL_SIZE: number = 16;
        static IMG_BORDER_X_OFFSET: number = 128;
        static IMG_BORDER_Y_OFFSET: number = 0;
        static BORDER_OFFSET: number = 8;
        static WIDTH_PERC: number = 0.8;
        static HEIGHT_PERC: number = 0.2;
    }
    
    export enum MapLayer {
        LOW,
        MID,
        TOP,
        EVENTS
    }
    
    export enum EditMode {
        APPLY,
        ERASE,
        EVENTS
    }
    
    export enum TileEditMode {
        BLOCKS,
        ONTOP
    }
    
    export const enum ZIndex {
        LV0,
        LV1,
        LV2,
        LV3,
        LV4
    }
    
    export const enum Bool {
        NO,
        YES
    }
}