import SmartToyIcon from '@mui/icons-material/SmartToy';
import ExtensionIcon from '@mui/icons-material/Extension';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CableIcon from '@mui/icons-material/Cable';
import RouteIcon from '@mui/icons-material/Route';
import SensorsIcon from '@mui/icons-material/Sensors';
import InsightsIcon from '@mui/icons-material/Insights';
import HomeIcon from '@mui/icons-material/Home';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import MemoryIcon from '@mui/icons-material/Memory';

/**
 * One source of truth for a catalogue item's colour + glyph, shared by the
 * Projects section and the Store so an item looks the same on its card and its
 * detail page. Items with no photo lean on this for their visual, so within a
 * kind we vary the glyph (a slug hash, or an explicit `item.icon`) to keep a
 * grid of imageless cards from looking like one repeated tile.
 */

export const KIND_META = {
  project: { label: 'Project', accent: '#2E7D32' },
  kit: { label: 'Robot / kit', accent: '#1565C0' },
  bundle: { label: 'Bundle', accent: '#DC6E00' },
  accessory: { label: 'Accessory', accent: '#6A4C93' },
};

const ICONS = {
  robot: SmartToyIcon,
  arm: PrecisionManufacturingIcon,
  chip: MemoryIcon,
  puzzle: ExtensionIcon,
  route: RouteIcon,
  sensor: SensorsIcon,
  data: InsightsIcon,
  home: HomeIcon,
  box: Inventory2Icon,
  cable: CableIcon,
};

// Per-kind glyph rotation for imageless items (index chosen by slug hash).
const KIND_GLYPHS = {
  project: ['puzzle', 'sensor', 'data', 'home', 'route'],
  kit: ['robot', 'arm', 'chip'],
  bundle: ['box'],
  accessory: ['cable', 'chip'],
};

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** @returns {{ label: string, accent: string, Icon: React.ComponentType }} */
export function catalogVisual(item) {
  const meta = KIND_META[item.kind] || KIND_META.kit;
  const explicit = item.icon && ICONS[item.icon];
  const pool = KIND_GLYPHS[item.kind] || KIND_GLYPHS.kit;
  const Icon = explicit || ICONS[pool[hash(item.slug) % pool.length]] || ExtensionIcon;
  return { ...meta, Icon };
}
