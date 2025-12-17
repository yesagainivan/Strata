/**
 * Height Cache - Shared infrastructure for widget height caching
 * 
 * This module provides a StateField-based cache for storing measured widget heights.
 * Widgets can use this to provide accurate `estimatedHeight` values after their first
 * render, eliminating scroll jumping on subsequent scrolls.
 * 
 * ## Architecture
 * 
 * 1. **Content-based keys**: Heights are keyed by content hash, not position.
 *    This means if you have `$x^2$` in two places, they share the same cached height.
 * 
 * 2. **Lazy measurement**: Widgets measure themselves after render using 
 *    `requestAnimationFrame` and dispatch `heightCacheEffect` to update the cache.
 * 
 * 3. **StateField timing**: Because this is a StateField, the cached heights are
 *    available during viewport computation, solving the ViewPlugin timing issue.
 * 
 * ## Usage
 * 
 * ```typescript
 * // In your widget's toDOM():
 * toDOM(view: EditorView): HTMLElement {
 *     const wrapper = document.createElement('div');
 *     // ... render content ...
 *     
 *     // Schedule height measurement after browser paint
 *     requestAnimationFrame(() => {
 *         const height = wrapper.getBoundingClientRect().height;
 *         if (height > 0) {
 *             view.dispatch({
 *                 effects: heightCacheEffect.of({
 *                     key: this.cacheKey,
 *                     height
 *                 })
 *             });
 *         }
 *     });
 *     
 *     return wrapper;
 * }
 * 
 * // In your widget's estimatedHeight getter:
 * get estimatedHeight(): number {
 *     // Note: Widget doesn't have access to state in getter,
 *     // so we store the lookup result during construction or use fallback
 *     return this.cachedHeight ?? this.fallbackEstimate;
 * }
 * ```
 * 
 * @module heightCache
 */

import { StateEffect, StateField, EditorState, Extension } from '@codemirror/state';

/**
 * Entry in the height cache
 */
export interface HeightCacheEntry {
    /** Measured height in pixels */
    height: number;
    /** Timestamp of measurement (for potential cache eviction) */
    timestamp: number;
}

/**
 * Effect to update a cached height
 * 
 * @example
 * ```typescript
 * view.dispatch({
 *     effects: heightCacheEffect.of({
 *         key: 'math:block:x^2+y^2',
 *         height: 150
 *     })
 * });
 * ```
 */
export const heightCacheEffect = StateEffect.define<{
    /** Unique key for this content (e.g., 'math:block:x^2') */
    key: string;
    /** Measured height in pixels */
    height: number;
}>();

/**
 * Effect to clear specific entries from the cache
 * Useful when content changes significantly
 */
export const clearHeightCacheEffect = StateEffect.define<{
    /** Keys to clear (if empty, clears all) */
    keys?: string[];
}>();

/**
 * StateField storing the height cache
 * 
 * This is a Map from content-based keys to HeightCacheEntry objects.
 * Add this to your editor extensions to enable height caching.
 */
export const heightCache = StateField.define<Map<string, HeightCacheEntry>>({
    create() {
        return new Map();
    },
    update(cache, tr) {
        let newCache = cache;

        for (const effect of tr.effects) {
            if (effect.is(heightCacheEffect)) {
                // Copy-on-write: only create new Map if we're modifying
                if (newCache === cache) {
                    newCache = new Map(cache);
                }
                newCache.set(effect.value.key, {
                    height: effect.value.height,
                    timestamp: Date.now()
                });
            } else if (effect.is(clearHeightCacheEffect)) {
                if (effect.value.keys && effect.value.keys.length > 0) {
                    // Clear specific keys
                    if (newCache === cache) {
                        newCache = new Map(cache);
                    }
                    for (const key of effect.value.keys) {
                        newCache.delete(key);
                    }
                } else {
                    // Clear all
                    newCache = new Map();
                }
            }
        }

        return newCache;
    }
});

/**
 * Get a cached height for a given key, or return the fallback
 * 
 * @param state - The editor state
 * @param key - The cache key (e.g., 'math:block:x^2')
 * @param fallback - Value to return if not cached
 * @returns The cached height or fallback
 * 
 * @example
 * ```typescript
 * const height = getCachedHeight(view.state, 'image:/path/to/img.png', 200);
 * ```
 */
export function getCachedHeight(
    state: EditorState,
    key: string,
    fallback: number
): number {
    const cache = state.field(heightCache, false);
    return cache?.get(key)?.height ?? fallback;
}

/**
 * Check if a height is cached for the given key
 * 
 * @param state - The editor state
 * @param key - The cache key
 * @returns True if the height is cached
 */
export function hasHeightCached(state: EditorState, key: string): boolean {
    const cache = state.field(heightCache, false);
    return cache?.has(key) ?? false;
}

/**
 * Get all cached entries (for debugging or serialization)
 * 
 * @param state - The editor state
 * @returns Map of all cached heights
 */
export function getAllCachedHeights(
    state: EditorState
): Map<string, HeightCacheEntry> {
    return state.field(heightCache, false) ?? new Map();
}

// ============================================================================
// Serialization API (for app-level persistence)
// ============================================================================

/**
 * Serialize the height cache to JSON for persistence
 * 
 * Apps can use this to save the cache alongside document metadata
 * and restore it when reopening a note.
 * 
 * @param state - The editor state
 * @returns JSON string of the cache
 * 
 * @example
 * ```typescript
 * // Save cache when closing note
 * const cacheJSON = serializeHeightCache(view.state);
 * localStorage.setItem(`note-${noteId}-heights`, cacheJSON);
 * ```
 */
export function serializeHeightCache(state: EditorState): string {
    const cache = state.field(heightCache, false);
    if (!cache || cache.size === 0) {
        return '{}';
    }

    const obj: Record<string, HeightCacheEntry> = {};
    for (const [key, entry] of cache) {
        obj[key] = entry;
    }
    return JSON.stringify(obj);
}

/**
 * Create an extension that initializes the height cache from saved JSON
 * 
 * Use this when creating a new editor to restore cached heights.
 * 
 * @param json - JSON string from serializeHeightCache
 * @returns Extension to add to the editor
 * 
 * @example
 * ```typescript
 * // Restore cache when opening note
 * const savedCache = localStorage.getItem(`note-${noteId}-heights`);
 * const extensions = [
 *     heightCache,
 *     savedCache ? restoreHeightCache(savedCache) : [],
 *     // ... other extensions
 * ];
 * ```
 */
export function restoreHeightCache(json: string): Extension {
    try {
        const parsed = JSON.parse(json) as Record<string, HeightCacheEntry>;
        const initialCache = new Map<string, HeightCacheEntry>();

        for (const [key, entry] of Object.entries(parsed)) {
            if (typeof entry.height === 'number' && entry.height > 0) {
                initialCache.set(key, {
                    height: entry.height,
                    timestamp: entry.timestamp ?? Date.now()
                });
            }
        }

        // Override the create function with our pre-populated cache
        return StateField.define<Map<string, HeightCacheEntry>>({
            create() {
                return initialCache;
            },
            update(cache, tr) {
                let newCache = cache;

                for (const effect of tr.effects) {
                    if (effect.is(heightCacheEffect)) {
                        if (newCache === cache) {
                            newCache = new Map(cache);
                        }
                        newCache.set(effect.value.key, {
                            height: effect.value.height,
                            timestamp: Date.now()
                        });
                    } else if (effect.is(clearHeightCacheEffect)) {
                        if (effect.value.keys && effect.value.keys.length > 0) {
                            if (newCache === cache) {
                                newCache = new Map(cache);
                            }
                            for (const key of effect.value.keys) {
                                newCache.delete(key);
                            }
                        } else {
                            newCache = new Map();
                        }
                    }
                }

                return newCache;
            }
        });
    } catch {
        // Invalid JSON, return empty extension
        return [];
    }
}

// ============================================================================
// Utility Functions for Key Generation
// ============================================================================

/**
 * Generate a cache key for math content
 * 
 * @param tex - The LaTeX string
 * @param isBlock - Whether this is block math ($$...$$) vs inline ($...$)
 * @returns Cache key string
 */
export function mathCacheKey(tex: string, isBlock: boolean): string {
    return `math:${isBlock ? 'block' : 'inline'}:${tex}`;
}

/**
 * Generate a cache key for image content
 * 
 * @param src - The image source URL or path
 * @returns Cache key string
 */
export function imageCacheKey(src: string): string {
    return `image:${src}`;
}

/**
 * Generate a cache key for table content
 * 
 * @param from - Start position of the table
 * @param rowCount - Number of rows in the table
 * @returns Cache key string
 */
export function tableCacheKey(from: number, rowCount: number): string {
    // Position-based because table content can be complex
    // Row count helps with invalidation when table structure changes
    return `table:${from}:rows${rowCount}`;
}
