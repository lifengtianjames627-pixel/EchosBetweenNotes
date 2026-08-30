// A member's chosen display name takes precedence over the platform-set
// full_name (which can't be changed via updateMe). Falls back to email so a
// brand-new account still shows something sensible.
export function displayName(user) {
  if (!user) return '';
  const chosen = typeof user.display_name === 'string' ? user.display_name.trim() : '';
  if (chosen) return chosen;
  return user.full_name || user.email || '';
}