import { AbstractStaticScene } from "./AbstractStaticScene"
import { StaticGrid } from "./StaticGrid"
import { IRectangle } from "../../../common/src/model/Commons";
import { MapManager } from "../core/manager/MapManager";

/**
 * Abstract scene for managing Tileset logics
 */
export abstract class AbstractTileScene extends AbstractStaticScene {

    constructor(grid: StaticGrid, heightPx: number, widthPx: number) {
        super(grid);
        this.map = MapManager.getNewMap("tileSetter");
        this.map.height = Math.floor(heightPx / grid.cellH);
        this.map.width = Math.floor(widthPx / grid.cellW);
    }

    updateSize(widthPx: number, heightPx: number) {
        this.map.width = Math.floor(widthPx / this.grid.cellW);
        this.map.height = Math.floor(heightPx / this.grid.cellH);
        
        (<StaticGrid> this.grid).updateSize(this.map.width, this.map.height);
        this.requestedNewFrame = true;
    }

    protected getRedrawArea(redrawAll?: boolean): IRectangle {
        let selectionArea = this.getSelectionArea();
        return super.getRedrawArea(redrawAll, selectionArea);
    }

    select(i?: number, j?: number) {
        super.select(i, j);
        // On select redraw all, in order to clean old selections
        this.requestedNewFrame = true;
    }
}