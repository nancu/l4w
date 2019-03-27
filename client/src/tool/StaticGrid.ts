import { AbstractGrid, GridTypeEnum } from "../core/AbstractGrid"
import { Utils } from "../core/util/Utils"
import { IRange } from "../core/util/Commons"
import { ICell, IRectangle } from "../../../common/src/model/Commons";

/**
 * Module for managing canvas autosizing
 */
export class StaticGrid extends AbstractGrid {

    private rowsList: number[];
    private columnsList: number[];
    private canvasScales: number[];
    private overriddenProps: Map<string, number>;
    
    constructor(
        canvas: HTMLCanvasElement,
        onCompleted: { (grid: StaticGrid): void },
        gridType: GridTypeEnum,
        overriddenProperties?: Map<string, number>
        ) {
        super(canvas, <{ (grid: AbstractGrid): void }> onCompleted, gridType);
        if(overriddenProperties !== undefined) {
            this.overriddenProps = overriddenProperties;
        } else {
            this.overriddenProps = new Map<string, number>();
        }
    }

    protected deferredInit(props: Map<string, number>) {
        if (!Utils.isEmpty(this.overriddenProps)) {
            props = Utils.mergeMaps(this.overriddenProps, props);
        }
        StaticGrid.prototype; //This fixes a mysterious Babel transpilation problem
        super.deferredInit(props);

        switch (this.gridType) {
            case GridTypeEnum.mapper:
                this.canvasScales = [];
                this.canvasScales.push(props.get("canvasScaleD")!);
                this.canvasScales.push(props.get("canvasScaleC")!);
                this.canvasScales.push(props.get("canvasScaleB")!);
                this.canvasScales.push(props.get("canvasScaleA")!);

                let totCanvasScales = this.canvasScales.length;
                this.rowsList = new Array(totCanvasScales);
                this.columnsList = new Array(totCanvasScales);

                let selectedScaleId = totCanvasScales - 1;
                for (let i = 0; i < totCanvasScales; i++) {
                    this.rowsList[i] = Math.floor(this.rows / this.canvasScales[i]);
                    this.columnsList[i] = Math.floor(this.columns / this.canvasScales[i]);
                }
                this.selectScale(selectedScaleId);
                break;
            case GridTypeEnum.tilePicker:
                this.scaleX = 1;
                this.scaleY = 1;
                // Use the canvas size, which have been set according to the tile
                this.updateSize(this.canvas.width,this.canvas.height);
        }
    }

    /**
     * Usato quando cambia la scala
     */
    selectScale(scaleId: number) {
        this.rows = this.rowsList[scaleId];
        this.columns = this.columnsList[scaleId];
        this.updateSizingDerivates();
        this.scaleX = this.canvasScales[scaleId];
        this.scaleY = this.canvasScales[scaleId];
    }
    
    /**
     * Usato quando cambia la dimensione 
     */
    updateSize(widthPx: number, heightPx: number) {
        this.rows = Math.floor(heightPx / this.cellH);
        this.columns = Math.floor(widthPx / this.cellW);
        this.updateSizingDerivates();
    }

    getBoundariesX(focusX: number, columns: number, pointer?: ICell, selectionArea?: IRectangle): IRange {
        if(pointer !== undefined) {
            // First of all, check if there is a selection area
            if(selectionArea !== undefined) {
                return {
                    min: pointer.i,
                    max: pointer.i + selectionArea.w
                }
            } else {
                // If there is no selection area, return only the cell where the pointer is 
                return {
                    min: pointer.i,
                    max: pointer.i
                }
            }
        } else {
            // Redraw the whole visible canvas area
            return super.getBoundariesX(focusX, columns);
        }
    }

    getBoundariesY(focusY: number, rows: number, pointer?: ICell, selectionArea?: IRectangle): IRange {
        if(pointer !== undefined) {
            // First of all, check if there is a selection area
            if(selectionArea !== undefined) {
                return {
                    min: pointer.j,
                    max: pointer.j + selectionArea.h
                }
            } else {
                // If there is no selection area, return only the cell where the pointer is 
                return {
                    min: pointer.j,
                    max: pointer.j
                }
            }
        } else {
            // Redraw the whole visible canvas area
            return super.getBoundariesY(focusY, rows);
        }
    }

    /**
     * Given an input Rectangle, return an output Rectangle <= input,
     * which is entirely contained in the visible area of the canvas
     */
    getVisibleRectangle(r: IRectangle, maxW: number, maxH: number): IRectangle {
        let xRange = this.checkBoundariesLimit(r.x, r.x + r.w, maxW, true);
        let yRange = this.checkBoundariesLimit(r.y, r.y + r.h, maxH, true);

        return {
            x: xRange.min,
            y: yRange.min,
            w: xRange.max - xRange.min,
            h: yRange.max - yRange.min
        };
    }

    refresh() {
        super.refresh();

    }
}