// Rainbow palette for nearby people — the same color is used for a person's
// map marker and their row in the list, so they're easy to match up.
export const PEER_COLORS = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#06b6d4', '#3b82f6', '#a855f7'];

export const peerColor = (i) => PEER_COLORS[i % PEER_COLORS.length];