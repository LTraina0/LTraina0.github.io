"""Refresh the versioned numerical catalog with python + Pillow. Images stay in the private cache."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from urllib.request import urlopen
from time import sleep
import hashlib
import json
import math
import re
import statistics
from PIL import Image

SITE = Path(__file__).resolve().parents[1]
VERSION = "v1.26.60.5"
ROOT = f"https://raw.githubusercontent.com/Mojang/bedrock-samples/{VERSION}/"
CACHE = SITE.parents[1] / ".local" / "architect-palette" / VERSION
OUTPUT = SITE / "architect" / "v2" / "palette-data.json"

# A working set with known forms. A complete metadata index is recorded by count.
FAMILIES = {
    "wood": """mangrove_planks mangrove_stairs mangrove_slab stripped_mangrove_log bamboo_planks
        bamboo_trapdoor cherry_planks cherry_stairs cherry_slab stripped_cherry_log cherry_trapdoor
        stripped_spruce_log spruce_planks spruce_stairs spruce_slab spruce_trapdoor
        stripped_warped_stem warped_planks warped_stairs warped_slab warped_trapdoor""",
    "stone": """deepslate_bricks deepslate_brick_stairs deepslate_brick_slab
        polished_blackstone_bricks polished_blackstone_brick_stairs polished_blackstone_brick_slab
        stone_bricks stone_brick_stairs stone_brick_slab tuff tuff_stairs tuff_slab polished_tuff
        polished_tuff_stairs polished_tuff_slab calcite chiseled_tuff_bricks quartz_bricks dark_prismarine
        dark_prismarine_stairs dark_prismarine_slab prismarine_bricks prismarine_bricks_stairs
        prismarine_brick_slab cut_sandstone granite amethyst_block""",
    "ceramic": """red_nether_brick red_nether_brick_stairs red_nether_brick_slab nether_brick
        nether_brick_stairs nether_brick_slab red_terracotta orange_terracotta pink_terracotta magenta_terracotta
        blue_terracotta purple_terracotta yellow_terracotta brick_block brick_stairs brick_slab""",
    "metal": """waxed_oxidized_cut_copper waxed_oxidized_cut_copper_stairs waxed_oxidized_cut_copper_slab
        waxed_cut_copper waxed_cut_copper_stairs waxed_cut_copper_slab waxed_weathered_cut_copper
        waxed_weathered_cut_copper_stairs waxed_weathered_cut_copper_slab waxed_chiseled_copper
        waxed_oxidized_chiseled_copper raw_gold_block""",
    "organic": "moss_block packed_mud honeycomb_block",
    "pigment": "light_blue_concrete white_concrete pink_wool purple_wool purple_concrete yellow_concrete",
    "light": "glowstone",
}

def source(name):
    path = CACHE / name
    if not path.exists():
        path.parent.mkdir(parents=True, exist_ok=True)
        for attempt in range(3):
            try:
                with urlopen(ROOT + name, timeout=35) as response:
                    data = response.read()
                break
            except OSError:
                if attempt == 2:
                    raise
                sleep(1 + attempt)
        path.write_bytes(data)
    return path

def read_json(name):
    text = source(name).read_text("utf-8-sig")
    return json.loads(re.sub(r",\s*([\]}])", r"\1", re.sub(r"(?m)^\s*//.*$", "", text)))

def oklab(rgb):
    linear = [((c / 255 + .055) / 1.055) ** 2.4 if c > 10 else c / 3294.6 for c in rgb]
    r, g, b = linear
    l = (.4122214708*r + .5363325363*g + .0514459929*b) ** (1/3)
    m = (.2119034982*r + .6806995451*g + .1073969566*b) ** (1/3)
    s = (.0883024619*r + .2817188376*g + .6299787005*b) ** (1/3)
    return (.2104542553*l+.793617785*m-.0040720468*s,
            1.9779984951*l-2.428592205*m+.4505937099*s,
            .0259040371*l+.7827717662*m-.808675766*s)

def measure(path):
    file = source("resource_pack/" + path)
    with Image.open(file) as image:
        w,h = image.size
        if h < w or h % w:
            raise ValueError(f"Formato de textura não suportado: {path} {w}x{h}")
        pixels = list(image.convert("RGBA").crop((0,0,w,w)).getdata())
    colors = [oklab(p[:3]) if p[3] >= 128 else None for p in pixels]
    valid = sorted((c for c in colors if c), key=lambda c:c[0])
    mean = lambda arr: [round(statistics.fmean(v),5) for v in zip(*arr)]
    split = max(1,len(valid)//4)
    def edges(step):
        deltas = [math.dist(colors[i], colors[i+step]) for i in range(len(colors)-step)
                  if (step!=1 or (i+1)%w) and colors[i] and colors[i+step]]
        return round(statistics.fmean(deltas),5) if deltas else 0
    return path, {
        "lab":mean(valid), "shade":mean(valid[:split]), "highlight":mean(valid[-split:]),
        "grain":[edges(1),edges(w)], "coverage":round(len(valid)/len(colors),5),
        "frames":h//w, "sha256":hashlib.sha256(file.read_bytes()).hexdigest()
    }

def main():
    raw = read_json("metadata/vanilladata_modules/mojang-blocks.json")
    ids = {b["name"]:b for b in raw["data_items"]}
    props = {p["name"]:[v["value"] for v in p["values"]] for p in raw["block_properties"]}
    definitions = read_json("resource_pack/blocks.json")
    atlas = read_json("resource_pack/textures/terrain_texture.json")["texture_data"]
    lang = dict(line.split("=",1) for line in source("resource_pack/texts/pt_BR.lang").read_text("utf-8-sig").splitlines() if "=" in line)
    materials, paths = {}, set()
    for family,names in FAMILIES.items():
        for short in names.split():
            ident = "minecraft:"+short
            meta,entry = ids[ident],definitions[short]
            nameset = [p["name"] for p in meta["properties"]]
            shape = "log" if nameset == ["pillar_axis"] else next((v for k,v in [("_stairs","stairs"),("_slab","slab"),("_trapdoor","trapdoor")] if short.endswith(k)), "cube")
            valid = {"cube":[], "log":["pillar_axis"], "stairs":["minecraft:corner","upside_down_bit","weirdo_direction"],
                     "slab":["minecraft:vertical_half"], "trapdoor":["direction","open_bit","upside_down_bit"]}
            if set(nameset)!=set(valid[shape]):
                raise ValueError(f"Forma não mapeada {ident}: {nameset}")
            tex = entry["textures"]
            if isinstance(tex,str):
                tex = {k:tex for k in ("side","up","down")}
            elif "side" not in tex:
                sides = {tex[k] for k in ("north","south","east","west")}
                if len(sides)!=1: raise ValueError(f"Faces assimétricas {ident}")
                tex = {**tex,"side":sides.pop()}
            texture = {}
            for face in ("side","up","down"):
                entry=atlas[tex[face]]["textures"]
                if isinstance(entry,list):
                    if len(entry)!=1 and not(short=="stone_brick_stairs" and entry[0]=="textures/blocks/stonebrick"):
                        raise ValueError(f"Variantes sem mapeamento {ident}: {entry}")
                    entry=entry[0]
                texture[face]=entry+".png"
            paths.update(texture.values())
            key = meta["serialization_id"]+".name"
            if short=="spruce_planks": key="tile.planks.spruce.name"
            materials[ident] = {"label":lang[key].split("\t")[0], "shape":shape,"family":family,"texture":texture,
                                "states":{n:props[n] for n in nameset},"emission":15 if short=="glowstone" else 0}
    with ThreadPoolExecutor(max_workers=8) as pool:
        images = dict(pool.map(measure,sorted(paths)))
    output = {"version":VERSION, "sourceBlockCount":len(ids),"blocks":materials,"images":images}
    OUTPUT.parent.mkdir(parents=True,exist_ok=True)
    OUTPUT.write_text(json.dumps(output,ensure_ascii=False,sort_keys=True,separators=(",",":"))+"\n","utf-8")
    # Discovery includes technical IDs. Rendering support is established separately.
    index = []
    for ident, entry in sorted(ids.items()):
        label = lang.get(entry.get("serialization_id", "") + ".name", "").split("\t")[0]
        index.append([ident, label, [prop["name"] for prop in entry.get("properties", [])]])
    OUTPUT.with_name("block-index.json").write_text(
        json.dumps({"version": VERSION, "entries": index}, ensure_ascii=False, separators=(",", ":"))+"\n", "utf-8")
    print(f"{len(materials)} blocos, {len(images)} texturas, {len(ids)} IDs na fonte.")

if __name__=="__main__":
    main()

