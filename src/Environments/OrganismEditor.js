const Environment = require('./Environment');
const Organism = require('../Organism/Organism');
const GridMap = require('../Grid/GridMap');
const Renderer = require('../Rendering/Renderer');
const CellStates = require('../Organism/Cell/CellStates');
const EditorController = require("../Controllers/EditorController");
const Species = require('../Stats/Species');
const RandomOrganismGenerator = require('../Organism/RandomOrganismGenerator')

class OrganismEditor extends Environment{
    constructor() {
        super();
        this.is_active = true;
        var cell_size = 13;
        this.renderer = new Renderer('editor-canvas', 'editor-env', cell_size);
        this.controller = new EditorController(this, this.renderer.canvas);
        this.grid_map = new GridMap(15, 15, cell_size);
        this.setDefaultOrg();
    }

    update() {
        if (this.is_active){
            this.renderer.renderHighlights();
        }
    }

    changeCell(c, r, state, owner) {
        super.changeCell(c, r, state, owner);
        this.renderFull();
    }

    renderFull() {
        this.renderer.renderFullGrid(this.grid_map.grid);
    }

    // absolute c r, not local
    addCellToOrg(c, r, state) {
        var center = this.grid_map.getCenter();
        var loc_c = c - center[0];
        var loc_r = r - center[1];
        var prev_cell = this.organism.anatomy.getLocalCell(loc_c, loc_r)
        if (prev_cell != null) {
            var new_cell = this.organism.anatomy.replaceCell(state, prev_cell.loc_col, prev_cell.loc_row, false);
            this.changeCell(c, r, state, new_cell);
        }
        else if (this.organism.anatomy.canAddCellAt(loc_c, loc_r)){
            this.changeCell(c, r, state, this.organism.anatomy.addDefaultCell(state, loc_c, loc_r));
        }
        this.organism.species = new Species(this.organism.anatomy, null, 0);
    }

    removeCellFromOrg(c, r) {
        var center = this.grid_map.getCenter();
        var loc_c = c - center[0];
        var loc_r = r - center[1];
        if (loc_c == 0 && loc_r == 0){
            alert("Cannot remove center cell");
            return;
        }
        var prev_cell = this.organism.anatomy.getLocalCell(loc_c, loc_r)
        if (prev_cell != null) {
            if (this.organism.anatomy.removeCell(loc_c, loc_r)) {
                this.changeCell(c, r, CellStates.empty, null);
                this.organism.species = new Species(this.organism.anatomy, null, 0);
            }
        }
    }

    setOrganismToCopyOf(orig_org) {
        this.grid_map.fillGrid(CellStates.empty);
        var center = this.grid_map.getCenter();
        this.organism = new Organism(center[0], center[1], this, orig_org);
        this.organism.updateGrid();
        this.controller.updateDetails();
    }
    
    getCopyOfOrg() {
        var new_org = new Organism(0, 0, null, this.organism);
        return new_org;
    }

    clear() {
        this.grid_map.fillGrid(CellStates.empty);
    }

    setDefaultOrg() {
        this.clear();
        var center = this.grid_map.getCenter();
        this.organism = new Organism(center[0], center[1], this, null);
        this.organism.anatomy.addDefaultCell(CellStates.mouth, 0, 0);
        this.organism.updateGrid();
        this.organism.species = new Species(this.organism.anatomy, null, 0);
    }

    createRandom() {
        this.grid_map.fillGrid(CellStates.empty);

        this.organism = RandomOrganismGenerator.generate(this);
        this.organism.updateGrid();
        this.organism.species = new Species(this.organism.anatomy, null, 0);
    }

    resetWithRandomOrgs(env) {
        let reset_confirmed = env.reset(true, false);
        if (!reset_confirmed) return;
        let numOrganisms = parseInt($('#num-random-orgs').val());

        let size = Math.ceil(8);

        for (let i=0; i<numOrganisms; i++) {
            let newOrganism = RandomOrganismGenerator.generate(this);
            newOrganism.species = new Species(newOrganism.anatomy, null, 0);
            var col = Math.floor(size + (Math.random() * (env.grid_map.cols-(size*2)) ) );
            var row = Math.floor(size + (Math.random() * (env.grid_map.rows-(size*2)) ) );
            env.controller.dropOrganism(newOrganism, col, row);
        }
    }
}

module.exports = OrganismEditor;