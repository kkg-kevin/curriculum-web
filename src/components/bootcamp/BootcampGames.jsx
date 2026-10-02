import { createElement, useState } from 'react';
import { alpha, lighten } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import FlipIcon from '@mui/icons-material/Flip';
import Reveal from '../common/Reveal.jsx';
import { resolveMediaUrl } from '../../utils/media.js';
import { gameIcon } from './gameIcons.js';

const FALLBACK_COLOR = '#25476a';
const EASE = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

// A game's own colour is chosen to carry white text on the card front. Used as TEXT on the back
// of the card it has to read on the page's paper colour instead — lightened on the dark theme.
const inkOn = (color) => (theme) => (theme.palette.mode === 'dark' ? lighten(color, 0.6) : color);

/**
 * "Chess, Monopoly +1" — the one-line version, for a listing card or the booking panel.
 * `games` only needs { name }.
 */
export function gamesSummary(games = [], shown = 2) {
  const names = games.slice(0, shown).map((g) => g.name).join(', ');
  const more = games.length - shown;
  return more > 0 ? `${names} +${more}` : names;
}

/**
 * One of the games line icons (see gameIcons.js — the same set the admin app picks from), in
 * the current text colour.
 */
export function GameIcon({ name, size = 24, strokeWidth = 2, sx }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      sx={{ display: 'block', flexShrink: 0, width: size, height: size, ...sx }}
    >
      {gameIcon(name).shapes.map(([tag, attrs], i) => createElement(tag, { key: i, ...attrs }))}
    </Box>
  );
}

/**
 * One game as a playing card. The front is the game itself — its icon (or photo) on its own
 * colour; tapping flips it to show what the children do and what it builds. Cards sit slightly
 * askew, as if just dealt, and straighten when picked up (hover/focus).
 *
 * A real <button>, so it flips from the keyboard too. With reduced motion the two faces swap
 * without the turn, and the tilt is dropped.
 */
function GameCard({ game, index }) {
  const [flipped, setFlipped] = useState(false);
  const color = game.color || FALLBACK_COLOR;
  const skills = game.skills || [];
  const canFlip = Boolean(game.description || skills.length);
  const image = resolveMediaUrl(game.image);
  const tilt = index % 2 === 0 ? -2.2 : 2;

  const face = {
    position: 'absolute',
    inset: 0,
    borderRadius: 4,
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  return (
    <Box
      component={canFlip ? 'button' : 'div'}
      type={canFlip ? 'button' : undefined}
      onClick={canFlip ? () => setFlipped((v) => !v) : undefined}
      aria-pressed={canFlip ? flipped : undefined}
      aria-label={canFlip ? `${game.name}. ${flipped ? 'Showing what it builds' : 'Flip to see what it builds'}` : undefined}
      sx={{
        display: 'block',
        position: 'relative',
        width: '100%',
        height: 216,
        p: 0,
        border: 0,
        bgcolor: 'transparent',
        font: 'inherit',
        color: 'inherit',
        textAlign: 'left',
        cursor: canFlip ? 'pointer' : 'default',
        borderRadius: 4,
        transformStyle: 'preserve-3d',
        transition: `transform 620ms ${EASE}`,
        transform: flipped ? 'rotateY(180deg)' : `rotate(${tilt}deg)`,
        '&:hover, &:focus-visible': flipped ? {} : { transform: 'rotate(0deg) translateY(-6px)' },
        '&:hover .game-icon': { transform: 'scale(1.1) rotate(-6deg)' },
        '&:focus-visible': { outline: '3px solid', outlineColor: 'primary.main', outlineOffset: 4 },
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',
          transform: 'none',
          '&:hover, &:focus-visible': { transform: 'none' },
        },
      }}
    >
      {/* front */}
      <Box
        aria-hidden={flipped}
        sx={{
          ...face,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          p: 2,
          color: '#fff',
          background: image
            ? `linear-gradient(180deg, ${alpha('#000', 0.05)} 30%, ${alpha('#000', 0.72)} 100%), center / cover no-repeat url(${image})`
            : `radial-gradient(circle at 30% 18%, ${alpha('#fff', 0.28)}, transparent 46%), linear-gradient(145deg, ${color}, ${alpha(color, 0.78)})`,
          boxShadow: `0 10px 24px ${alpha(color, 0.35)}, inset 0 0 0 4px ${alpha('#fff', 0.16)}`,
          '@media (prefers-reduced-motion: reduce)': { opacity: flipped ? 0 : 1 },
        }}
      >
        {!image && (
          // The icon on a soft disc, like the emblem in the middle of a card.
          <Box
            className="game-icon"
            sx={{
              width: 84,
              height: 84,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              bgcolor: alpha('#fff', 0.16),
              boxShadow: `inset 0 0 0 1.5px ${alpha('#fff', 0.35)}`,
              transition: `transform 320ms ${EASE}`,
              '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
            }}
          >
            <GameIcon name={game.icon} size={46} strokeWidth={1.6} />
          </Box>
        )}
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: '1.05rem',
            lineHeight: 1.2,
            textAlign: 'center',
            mt: image ? 'auto' : 0.5,
            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
          }}
        >
          {game.name}
        </Typography>
        {canFlip && (
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, opacity: 0.85 }}>
            <FlipIcon sx={{ fontSize: 13 }} />
            <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Flip me
            </Typography>
          </Box>
        )}
      </Box>

      {/* back */}
      {canFlip && (
        <Box
          aria-hidden={!flipped}
          sx={{
            ...face,
            transform: 'rotateY(180deg)',
            p: 2,
            gap: 1,
            bgcolor: 'background.paper',
            border: '2px solid',
            borderColor: inkOn(color),
            boxShadow: `0 10px 24px ${alpha(color, 0.22)}`,
            '@media (prefers-reduced-motion: reduce)': { transform: 'none', opacity: flipped ? 1 : 0 },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: inkOn(color) }}>
            <GameIcon name={game.icon} size={18} />
            <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.2, color: 'text.primary' }}>
              {game.name}
            </Typography>
          </Box>
          {game.description && (
            <Typography
              sx={{
                fontSize: 12.5,
                lineHeight: 1.5,
                color: 'text.secondary',
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: skills.length ? 4 : 7,
                overflow: 'hidden',
              }}
            >
              {game.description}
            </Typography>
          )}
          {skills.length > 0 && (
            <Box sx={{ mt: 'auto' }}>
              <Typography sx={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.disabled', mb: 0.5 }}>
                Builds
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {skills.slice(0, 4).map((skill) => (
                  <Box
                    key={skill}
                    component="span"
                    sx={{
                      px: 1,
                      py: 0.25,
                      borderRadius: 5,
                      fontSize: 11,
                      fontWeight: 700,
                      color: inkOn(color),
                      bgcolor: (t) => alpha(inkOn(color)(t), 0.12),
                      border: '1px solid',
                      borderColor: (t) => alpha(inkOn(color)(t), 0.35),
                    }}
                  >
                    {skill}
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

/**
 * "More than lessons" — the games and play that come with a bootcamp, as a hand of cards dealt
 * onto the page one after another when the section scrolls into view. On a phone the hand
 * becomes a row to swipe through.
 *
 * `games`: [{ id, name, description, skills, icon, color, image }] in the order to show them;
 * `note`: the bootcamp's own line on how play fits into the day. Renders nothing without games.
 */
export default function BootcampGames({ games = [], note = '' }) {
  if (!games.length) return null;
  const anyFlips = games.some((g) => g.description || (g.skills || []).length);

  return (
    <Box sx={{ mb: 7 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <SportsEsportsIcon sx={{ fontSize: 22, color: 'primary.main' }} />
        <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
          More than lessons
        </Typography>
      </Box>
      <Typography sx={{ color: 'text.secondary', lineHeight: 1.7, mb: 2.5, maxWidth: 620 }}>
        {note || 'Learning sticks when it’s fun, so every bootcamp makes time to play. These games come with this one.'}
        {anyFlips && ' Flip a card to see what each game builds.'}
      </Typography>

      <Box
        component="ul"
        sx={{
          listStyle: 'none',
          m: 0,
          // Room for the tilt and the lift, so neither is clipped by the scroll container.
          px: 0.75,
          py: 1.5,
          display: { xs: 'flex', sm: 'grid' },
          gridTemplateColumns: { sm: 'repeat(auto-fill, minmax(168px, 1fr))' },
          gap: 2.25,
          overflowX: { xs: 'auto', sm: 'visible' },
          scrollSnapType: { xs: 'x mandatory', sm: 'none' },
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {games.map((game, index) => (
          <Reveal
            as="li"
            key={game.id || `${game.name}-${index}`}
            // Dealt one after another; capped so a long hand doesn't keep the last cards waiting.
            delay={Math.min(index, 7) * 90}
            y={30}
            sx={{ flex: { xs: '0 0 64%', sm: 'initial' }, maxWidth: { xs: 240, sm: 'none' }, scrollSnapAlign: 'center', perspective: '1000px' }}
          >
            <GameCard game={game} index={index} />
          </Reveal>
        ))}
      </Box>
    </Box>
  );
}
