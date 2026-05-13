import { Share } from 'react-native';

const BASE_URL = 'https://gifty.cloud';
const APP_SCHEME = 'gifty';

// ─────────────────────────────────────────────
// Zostaví web URL pre wish
// gifty.cloud/wish/abc123
// ─────────────────────────────────────────────
export function buildWishWebUrl(wishId) {
  return `${BASE_URL}/wish/${wishId}`;
}

// ─────────────────────────────────────────────
// Zostaví deep link pre appku
// gifty://wish/abc123
// ─────────────────────────────────────────────
export function buildDeepLink(wishId) {
  return `${APP_SCHEME}://wish/${wishId}`;
}

// ─────────────────────────────────────────────
// Zdieľaj wish cez natívny share sheet
// (WhatsApp, Messenger, SMS, email, ...)
//
// Ak má príjemca appku → gifty.cloud/wish/id otvorí appku
// Ak nemá → otvorí web fallback stránku s download buttonmi
// ─────────────────────────────────────────────
export async function shareWish(wish) {
  if (!wish?.id) throw new Error('Wish ID chýba');

  const url = buildWishWebUrl(wish.id);
  const title = wish.title || 'Moje prianie';
  const amount = wish.targetAmount ? `€${wish.targetAmount.toFixed(0)}` : '';

  const message = amount
    ? `🎁 Zbierame na: ${title} (${amount})\nPrispej cez Gifty: ${url}`
    : `🎁 Pozri si moje prianie na Gifty: ${url}`;

  try {
    const result = await Share.share(
      {
        title: `Gifty — ${title}`,
        message,
        url,  // iOS používa url, Android message
      },
      {
        dialogTitle: `Zdieľať prianie`,
      }
    );
    return result;
  } catch (e) {
    throw new Error('Zdieľanie zlyhalo: ' + e.message);
  }
}

// ─────────────────────────────────────────────
// Zdieľaj profil / invite link (budúce použitie)
// ─────────────────────────────────────────────
export async function shareProfile(userId, displayName) {
  const url = `${BASE_URL}/u/${userId}`;
  const message = `👋 Pridaj ma na Gifty: ${displayName}\n${url}`;

  try {
    await Share.share({ title: 'Gifty pozvánka', message, url });
  } catch (e) {
    throw new Error('Zdieľanie zlyhalo: ' + e.message);
  }
}
