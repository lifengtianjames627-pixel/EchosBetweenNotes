/**
 * Successful chatDirectory response, matching the existing server contract.
 * @typedef {Object} DirectoryConversation
 * @property {string} peer_email
 * @property {string} peer_name
 * @property {string} last_message
 * @property {string} last_at
 * @property {boolean} from_me
 * @property {number} unread
 *
 * @typedef {Object} DirectoryPeer
 * @property {string} id
 * @property {number|null} lat
 * @property {number|null} lng
 * @property {boolean} online
 * @property {string|null} last_active
 * @property {string|null} location_updated
 * @property {string} email
 * @property {string} picture_url
 * @property {string} name
 * @property {string} city
 * @property {string} school
 * @property {'band'|'musician'|null} kind
 * @property {string} title
 * @property {boolean} same_network
 * @property {number|null} distance_km
 *
 * @typedef {Object} ChatDirectory
 * @property {DirectoryConversation[]} conversations
 * @property {DirectoryPeer[]} nearby
 * @property {string} my_city
 * @property {boolean} matched_city
 * @property {boolean} located
 * @property {'manual'|'device'|'ip'|null} location_source
 * @property {boolean} network_active
 * @property {number|null} my_lat
 * @property {number|null} my_lng
 * @property {number} located_count
 */
export {};