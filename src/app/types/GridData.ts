/**
 * Describes parsed config_grid.xml data structure
 */
export interface GridData {
  _attributes: {
    version: string // current 2.0
  }
  help: TextNode
  grids: Grids
  _comment: string[]
  domains: Domains
  required_gridmaps: RequiredGridmaps
  gridmaps: Gridmaps
}

export interface TextNode {
  _text: string
}

export interface Domains {
  domain: Domain[]
  _comment: string[]
}

export interface Domain {
  _attributes: DomainAttributes
  _comment?: string[] | string
  nx: TextNode
  ny: TextNode
  file?: FileElement[] | FileElement
  desc: TextNode
  support?: TextNode
}

export interface DomainAttributes {
  name: string
}

export interface FileElement {
  _text: string
  _attributes?: FileAttributes
}

export interface FileAttributes {
  grid?: string // current 'atm|lnd' | 'ocnice'
  mask?: string
}

export interface Gridmaps {
  _comment: string[]
  gridmap: Gridmap[]
}

export interface Gridmap {
  _attributes: GridmapAttributes
  map: MapElement[] | MapElement
  _comment?: string
}

export interface GridmapAttributes {
  atm_grid?: string
  ocn_grid?: string
  lnd_grid?: string
  wav_grid?: string
  rof_grid?: string
  glc_grid?: string
}

export interface MapElement {
  _attributes: DomainAttributes
  _text: string
}

export interface Grids {
  model_grid_defaults: ModelGridDefaults
  model_grid: ModelGrid[]
  _comment: string[]
}

export interface ModelGrid {
  _attributes: ModelGridAttributes
  grid: MapElement[] | MapElement
  support?: TextNode
  mask?: TextNode
}

export interface ModelGridAttributes {
  alias: string
  compset?: Compset
  not_compset?: NotCompset
}

export enum Compset {
  Cism = '_CISM',
  DatmClm = 'DATM.+CLM',
  DatmDrof = 'DATM.+DROF',
  DocnSaquapDocnDaquap = '_DOCN%SAQUAP|DOCN%DAQUAP',
  Drof = '_DROF',
  Ww3Dwav = '_WW3|DWAV',
}

export enum NotCompset {
  Cam = '_CAM',
  Pop = '_POP',
  PopClm = '_POP|_CLM',
}

export interface ModelGridDefaults {
  grid: GridElement[]
}

export interface GridElement {
  _attributes: PurpleAttributes
  _text: string
}

export interface PurpleAttributes {
  name: string
  compset: string
}

export interface RequiredGridmaps {
  required_gridmap: RequiredGridmap[]
  _comment: string[]
}

export interface RequiredGridmap {
  _attributes: RequiredGridmapAttributes
  _text: string
}

export interface RequiredGridmapAttributes {
  grid1: Grid1
  grid2: string
}

export enum Grid1 {
  ATMGrid = 'atm_grid',
  LndGrid = 'lnd_grid',
  OcnGrid = 'ocn_grid',
}
