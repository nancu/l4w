/// <reference path="../AbstractStaticScene.ts" />
/// <reference path="MapperPage.ts" />

/**
 * Scene implementation for managing Mapper logics
 */
class MapperScene extends AbstractStaticScene {

    public static LOWER_LEVEL_OPACITY: number = 0.8;
    public static UPPER_LEVEL_OPACITY: number = 0.4;

    private activeLayer: Constant.MapLayer;
    private editMode: Constant.EditMode;

    private tilePicker: TilePickerScene;

    constructor(grid: StaticGrid, callback: { (scene: MapperScene): void }) {
        super(grid);
        this.activeLayer = Constant.MapLayer.MID;
        (<HTMLButtonElement>document.getElementById(MapperPage.BUTTON_ID_LAYER + this.activeLayer)).disabled = true;
        callback(this);
    }

    protected renderPointer() {
        if (this.pointer.i != null && this.pointer.j != null) {
            var selectionArea: IRectangle = this.getSelectionArea();
            if (Utils.isEmpty(selectionArea)) {
                super.renderPointer();
            } else {
                // Pointer with selected tile cells
                this.context.save();
                this.context.globalAlpha = 0.4;
                this.context.fillStyle = Constant.Color.GREY;
                this.context.fillRect(
                    this.pointer.i * this.grid.cellW,
                    this.pointer.j * this.grid.cellH,
                    (selectionArea.x2 - selectionArea.x1 + 1) * this.grid.cellW,
                    (selectionArea.y2 - selectionArea.y1 + 1) * this.grid.cellH);
                this.context.restore();
            }
        }
    }

    select(i: number, j: number) {
        super.select(i, j);
    }

    apply(i_apply: number, j_apply: number): boolean {
        let changed: boolean = false;
        let pickerArea: IRectangle = this.tilePicker.getSelectionArea();
        let changedCell: number = i_apply + j_apply * this.map.width;
        if (Utils.isEmpty(this.map.layers[this.activeLayer].data)) {
            this.map.layers[this.activeLayer].data = [];
        }
        switch (this.editMode) {
            case Constant.EditMode.APPLY:
                if (Utils.isEmpty(pickerArea)) {
                    return false;
                }
                let tileColumns: number = Math.floor(this.map.tileset.imagewidth / this.grid.cellW); //TODO questa non cambia mai, ottimizzabile
                let appliedTile: number = pickerArea.x1 + pickerArea.y1 * tileColumns;
                for (let j = 0; j <= pickerArea.y2 - pickerArea.y1; j++) {
                    for (let i = 0; i <= pickerArea.x2 - pickerArea.x1; i++) {
                        if (i_apply + i < this.map.width) {
                            let appliedTileOffset: number = i + j * tileColumns;
                            let changedCellOffset: number = i + j * this.map.width;
                            if (this.map.layers[this.activeLayer].data[changedCell + changedCellOffset] !== appliedTile + appliedTileOffset) {
                                changed = true;
                                this.map.layers[this.activeLayer].data[changedCell + changedCellOffset] = appliedTile + appliedTileOffset;
                            }
                        }
                    }
                }
                break;
            case Constant.EditMode.ERASE:
                if (Utils.isEmpty(pickerArea)) {
                    pickerArea = {
                        x1: 0, x2: 0, y1: 0, y2: 0
                    };
                }
                for (let j = 0; j <= pickerArea.y2 - pickerArea.y1; j++) {
                    for (let i = 0; i <= pickerArea.x2 - pickerArea.x1; i++) {
                        if (i_apply + i < this.map.width) {
                            let changedCellOffset: number = i + j * this.map.width;
                            if (this.map.layers[this.activeLayer].data[changedCell + changedCellOffset] !== null) {
                                changed = true;
                                this.map.layers[this.activeLayer].data[changedCell + changedCellOffset] = null;
                            }
                        }
                    }
                }
                break;
            case Constant.EditMode.EVENTS:
                let result: boolean = this.selectEvent(i_apply, j_apply);
                if(result) {
                    this.renderingConfiguration.selectEventCell = {
                        i: i_apply,
                        j: j_apply    
                    }
                }
                break;
            default:
                console.error("Unexpected case");
        }
        //TODO gestisci trascinamento del picker
        return changed;
    }

    selectEvent(i: number, j: number): boolean {
        let confirmed: boolean = MapperPage.confirmCloseEventDetails();
        if(!confirmed) {
            return false;
        }
        let event: IEvent;
        if(!Utils.isEmpty(this.map.events)) {
            for(let e of this.map.events) {
                if(e.i === i && e.j === j) {
                    event = e;
                    break;    
                }
            }
        }
        if(event === undefined) {
            event = EventManager.getNewEvent();
            event.i = i;
            event.j = j;  
        }
        MapperPage.loadEvent(event, false);
        return true;
    }

    getSelectionArea(): IRectangle {
        if (!Utils.isEmpty(this.tilePicker)) {
            return this.tilePicker.getSelectionArea();
        } else {
            return null;
        }
    }

    protected renderDynamicElements(minRow, maxRow, minColumn, maxColumn, i, j, onTop) {
        // Render events
        if (!Utils.isEmpty(this.map.events)) {
            for (let event of this.map.events) {
                try {
                    EventManager.render(this.grid, event, this.context, false);
                } catch(e) {
                    console.error(e);    
                }
            }
        }
    }

    protected applyLayerCustomizations(layerIndex: number) {
        // Layers below the currently selected layer will be partially transparent
        if (layerIndex > this.activeLayer) {
            this.context.globalAlpha = MapperScene.UPPER_LEVEL_OPACITY;
        } else if (layerIndex < this.activeLayer) {
            this.context.globalAlpha = MapperScene.LOWER_LEVEL_OPACITY;
        }
    };

    protected removeLayerCustomizations(layerIndex: number) {
        this.context.globalAlpha = 1;
    };

    resizeMap(rows: number, columns: number) {
        MapManager.resizeMap(this.map, rows, columns);
    }
    
    changeMap(map: IMap, callback: { (scene: AbstractScene): void }): boolean {
        // Check if changing map would discard changes
        if(this.editMode === Constant.EditMode.EVENTS) {
            if(!MapperPage.confirmCloseEventDetails()) { 
                return false;
            }
        }
        super.changeMap(map, callback);
        return true;   
    }

    setTilePicker(tilePicker: TilePickerScene) {
        this.tilePicker = tilePicker;
    }

    setActiveLayer(activeLayer: Constant.MapLayer) {
        this.activeLayer = activeLayer;
    }

    setSelectedEventCell(cell: ICell) {
        this.renderingConfiguration.selectEventCell = cell;    
    }
    
    setEditMode(editMode: Constant.EditMode) {
        this.editMode = editMode;
    }
    getMap(): IMap {
        return this.map;
    }
}