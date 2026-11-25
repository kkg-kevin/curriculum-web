import { styled } from '@mui/material/styles';

/**
 * A plain <img> that still takes `sx`. Use it instead of `<Box component="img">` whenever the image
 * has a known size: on a Box, `width` and `height` are MUI style props, so they never reach the
 * <img> as attributes — and without them the browser can't keep the image's space before it
 * loads, so the page jumps (Google measures this as Cumulative Layout Shift). Here `width` and
 * `height` are the real attributes; the shown size still comes from `sx`.
 */
const Img = styled('img')({});

export default Img;
