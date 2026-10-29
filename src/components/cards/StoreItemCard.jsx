import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import StoreCardShell from './StoreCardShell.jsx';
import { storeItemPath } from '../../utils/storePaths.js';

const CATEGORY_LABEL = { kit: 'Robots & kits', bundle: 'Bundle', accessory: 'Accessory' };
const STOCK_LABEL = { available: 'Available now', preorder: 'Pre-order', coming_soon: 'Coming soon' };

/**
 * A good in the Store grid (`/store`) — a shared `inventory` row the curriculum team flipped
 * "For sale" in the portal. Drawn by StoreCardShell, like ProjectCard. Links to /store/:slug.
 *
 * Data shape: { id, slug, name, tagline, storeCategory, badge, stockStatus, image, photoCount,
 * price, highlightCount } (see usePublicStore.js).
 */
export default function StoreItemCard({ item }) {
  const { id, slug, name, tagline, storeCategory, badge, stockStatus, image, price } = item;

  const notAvailable = stockStatus && stockStatus !== 'available';
  const buyable = Boolean(price) && stockStatus !== 'coming_soon';

  return (
    <StoreCardShell
      to={storeItemPath(slug)}
      image={image}
      photoCount={item.photoCount}
      kicker={(CATEGORY_LABEL[storeCategory] || 'Store').toUpperCase()}
      name={name}
      tagline={tagline || 'A hands-on kit from the Digifunzi store.'}
      price={price}
      facts={[notAvailable ? STOCK_LABEL[stockStatus] : 'In stock', 'Pickup or delivery']}
      motif={<SmartToyOutlinedIcon />}
      badge={notAvailable ? { label: STOCK_LABEL[stockStatus], muted: true } : badge ? { label: badge } : null}
      buy={buyable ? { kind: 'store_item', item: { id, slug, name, image, price } } : null}
    />
  );
}
