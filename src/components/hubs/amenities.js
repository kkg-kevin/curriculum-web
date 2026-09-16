import WifiIcon from '@mui/icons-material/Wifi';
import PowerIcon from '@mui/icons-material/Power';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import ChairIcon from '@mui/icons-material/Chair';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import VideocamIcon from '@mui/icons-material/Videocam';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import WcIcon from '@mui/icons-material/Wc';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import CoffeeIcon from '@mui/icons-material/Coffee';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import ParkIcon from '@mui/icons-material/Park';

/**
 * Mirrors the admin client's AMENITY_OPTIONS (client/src/modules/learning-hubs/schemas/
 * learningHub.schema.js) — duplicated rather than shared since client/ and digifunzi-landing/
 * don't share code (see CLAUDE.md). A hub's `amenities` array holds these value codes; anything
 * not in this map falls back to its raw code as the label, no icon, grouped under "Other".
 *
 * `category` groups related amenities together on the public hub page instead of one flat,
 * unsorted chip cloud — see AMENITY_CATEGORY_ORDER below for the section order/labels.
 */
export const AMENITY_OPTIONS = [
  { value: 'wifi', label: 'WiFi', Icon: WifiIcon, category: 'connectivity' },
  { value: 'charging_ports', label: 'Charging Ports', Icon: PowerIcon, category: 'connectivity' },
  { value: 'projector', label: 'Projector', Icon: VideocamIcon, category: 'connectivity' },
  { value: 'desks', label: 'Desks', Icon: EventSeatIcon, category: 'workspace' },
  { value: 'chairs', label: 'Chairs', Icon: ChairIcon, category: 'workspace' },
  { value: 'whiteboard', label: 'Whiteboard', Icon: BorderColorIcon, category: 'workspace' },
  { value: 'private_rooms', label: 'Private Rooms', Icon: MeetingRoomIcon, category: 'workspace' },
  { value: 'outdoor_seating', label: 'Outdoor Seating', Icon: ParkIcon, category: 'workspace' },
  { value: 'food_available', label: 'Food Available', Icon: RestaurantIcon, category: 'food' },
  { value: 'coffee_available', label: 'Coffee Available', Icon: CoffeeIcon, category: 'food' },
  { value: 'parking', label: 'Parking', Icon: LocalParkingIcon, category: 'facilities' },
  { value: 'washrooms', label: 'Washrooms', Icon: WcIcon, category: 'facilities' },
];

// Display order + heading for each category, "other" last as a catch-all for any amenity code
// not in AMENITY_OPTIONS (e.g. added in the admin before this map was updated to match).
export const AMENITY_CATEGORY_ORDER = [
  { key: 'connectivity', label: 'Connectivity & Tech' },
  { key: 'workspace', label: 'Seating & Workspace' },
  { key: 'food', label: 'Food & Drink' },
  { key: 'facilities', label: 'Facilities' },
  { key: 'other', label: 'Other' },
];

/** Groups a hub's raw amenity codes into { key, label, items: [{value,label,Icon}] } sections, in AMENITY_CATEGORY_ORDER, skipping empty ones. */
export function groupAmenities(amenities) {
  const byCategory = new Map();
  for (const code of amenities || []) {
    const preset = AMENITY_OPTIONS.find((o) => o.value === code);
    const category = preset?.category || 'other';
    if (!byCategory.has(category)) byCategory.set(category, []);
    byCategory.get(category).push(preset || { value: code, label: code, Icon: null });
  }
  return AMENITY_CATEGORY_ORDER
    .map((c) => ({ ...c, items: byCategory.get(c.key) || [] }))
    .filter((c) => c.items.length > 0);
}

export const PRICING_MODEL_LABEL = { hourly: 'Hourly', daily: 'Daily', fixed: 'Fixed', free: 'Free' };
