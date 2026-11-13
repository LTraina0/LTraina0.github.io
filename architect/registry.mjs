// Schema and texture paths from the tagged Bedrock samples. Images stay at their source.
export const bedrockVersion = '1.26.60.5';
export const resourceRoot = `https://raw.githubusercontent.com/Mojang/bedrock-samples/v${bedrockVersion}/resource_pack/`;

const bit = Object.freeze([false, true]);
const direction = Object.freeze([0, 1, 2, 3]);
const statesByShape = {
  cube: {},
  log: { pillar_axis: Object.freeze(['y', 'x', 'z']) },
  slab: { 'minecraft:vertical_half': Object.freeze(['bottom', 'top']) },
  stairs: {
    'minecraft:corner': Object.freeze(['none', 'inner_left', 'inner_right', 'outer_left', 'outer_right']),
    upside_down_bit: bit,
    weirdo_direction: direction,
  },
  trapdoor: { direction, open_bit: bit, upside_down_bit: bit },
};
for (const states of Object.values(statesByShape)) Object.freeze(states);

// +X = east, +Z = south. Stair numbers designate the high side; trapdoor
// numbers designate the opposite wall occupied by the leaf when open.
export const stairHighSide = Object.freeze(['east', 'west', 'south', 'north']);
export const openTrapdoorWall = Object.freeze(['west', 'east', 'north', 'south']);

function material(id, label, shape, side, end = side) {
  const png = (name) => `textures/blocks/${name}.png`;
  const texture = Object.freeze({ side: png(side), up: png(end), down: png(end) });
  return [`minecraft:${id}`, Object.freeze({ label, shape, texture, states: statesByShape[shape] })];
}

export const registry = Object.freeze(Object.fromEntries([
  material('stripped_mangrove_log', 'Tora de Mangue Descascada', 'log', 'stripped_mangrove_log_side', 'stripped_mangrove_log_top'),
  material('mangrove_planks', 'Tábuas de Mangue', 'cube', 'mangrove_planks'),
  material('mangrove_stairs', 'Escadas de Mangue', 'stairs', 'mangrove_planks'),
  material('bamboo_planks', 'Tábuas de Bambu', 'cube', 'bamboo_planks'),
  material('bamboo_trapdoor', 'Alçapão de Bambu', 'trapdoor', 'bamboo_trapdoor'),
  material('deepslate_bricks', 'Tijolos de Ardosiabissal', 'cube', 'deepslate/deepslate_bricks'),
  material('deepslate_brick_stairs', 'Escadas de Tijolos de Ardosiabissal', 'stairs', 'deepslate/deepslate_bricks'),
  material('deepslate_brick_slab', 'Laje de Tijolos de Ardosiabissal', 'slab', 'deepslate/deepslate_bricks'),
  material('polished_blackstone_bricks', 'Tijolos de Pedra-Negra Polida', 'cube', 'polished_blackstone_bricks'),
  material('polished_blackstone_brick_stairs', 'Escadas de Tijolos de Pedra-Negra Polida', 'stairs', 'polished_blackstone_bricks'),
  material('polished_blackstone_brick_slab', 'Laje de Tijolos de Pedra-Negra Polida', 'slab', 'polished_blackstone_bricks'),
  material('waxed_oxidized_cut_copper', 'Cobre Lapidado Oxidado Encerado', 'cube', 'oxidized_cut_copper'),
  material('waxed_oxidized_cut_copper_stairs', 'Escada de Cobre Lapidado Oxidado Encerado', 'stairs', 'oxidized_cut_copper'),
  material('waxed_oxidized_cut_copper_slab', 'Laje de Cobre Lapidado Oxidado Encerado', 'slab', 'oxidized_cut_copper'),
  material('waxed_cut_copper', 'Cobre Lapidado Encerado', 'cube', 'cut_copper'),
]));
