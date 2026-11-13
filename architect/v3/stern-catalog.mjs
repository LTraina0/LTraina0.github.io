import {registry} from '../registry.mjs';
import {paletteRegistry} from '../v2/palette.mjs';
import {kitRegistry} from '../v2/kit-shapes.mjs';
import {navalRegistry} from './naval-blocks.mjs';
export const sternCatalog={...navalRegistry,...registry,...paletteRegistry,...kitRegistry};

