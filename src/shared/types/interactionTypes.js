/**
 * Compile-time contracts for existing form and SDK boundaries.
 * This module adds no runtime behavior.
 * @typedef {Error & { response?: { status?: number, data?: { error?: string } } }} RequestError
 * @typedef {{ id: string, status: 'approved' | 'blocked' | 'pending_review' }} ModerationChange
 * @typedef {{ id: string, created_date: string }} ModerationRecord
 * @typedef {{ rating: number, title: string, content: string }} AlbumReviewDraft
 * @typedef {{ title: string, artist: string, type?: string, genre?: string, cover_url?: string, mv_url?: string, release_year?: number, description?: string, tags?: string[] }} MusicDraft
 * @typedef {MusicDraft & { id: string, created_date: string, avg_rating?: number, review_count?: number, tracklist?: string[] }} MusicRecord
 * @typedef {{ name: string, genre: string, description: string, status?: string }} BandForm
 * @typedef {{ name: string, genre: string, description: string, looking_for: string }} BandCreateInput
 * @typedef {{ title: string, host_name: string, category: string, description?: string, cover_url?: string, audio_url?: string, duration_minutes?: number }} PodcastDraft
 */
export {};