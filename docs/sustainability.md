# Sustainable Web Development

**[Home](../README.md)** | **[Setup](./setup.md)** | **[Architecture](./architecture.md)** | **[Testing](./testing.md)** | **[Security](./security.md)** | **[Sustainability](./sustainability.md)** | **[Development Workflow](./development-workflow.md)** | **[AI Usage](./ai-usage.md)**

---

This document describes the sustainability and performance optimizations implemented in the PokéClicker project.

## Overview

Sustainable web development is about reducing energy consumption, data transfer, and resource usage while maintaining a good user experience. This project implements several strategies to achieve this goal.

## Code Splitting and Lazy Loading

### Issue #69: Code Splitting Implementation

**Problem**: Large initial bundle size led to slow load times.

**Solution**: Implemented React.lazy() for route-based code splitting.

**Results**:
- Components loaded on-demand instead of upfront
- Improved initial load time
- Smaller initial bundle

### Lazy Loaded Components

The following components are loaded only when needed:
- **PokeClicker** - Only when user navigates to clicker
- **LoginScreen** - Only when authentication is needed
- **PokemonDetailModal** - Only when Pokemon details are opened
- **ProfileDashboard** - Only when viewing profile
- **PokedexPage** - Only when browsing Pokedex
- **PokemonMap** - Only when viewing map
- **Pokedex sub-components** - SearchBar, FiltersAndCount, PokemonCard

### Code Splitting Strategy

- Main bundle contains core app shell and routing
- Feature bundles loaded on-demand (Clicker, Auth, Pokedex)
- Heavy dependencies (Apollo, UI library) split into separate chunks
- Lazy loading prevents loading unused features

### Suspense Boundaries

Implemented loading states with GameBoy aesthetics:
- Contextual loading messages
- Seamless transition when components load
- Better user experience during loading

## Virtual Rendering Optimization

### Issue #81: Virtual Rendering for Carousel Navigation

**Problem**:
- Opening Pokemon modal with 50 filtered Pokemon resulted in 500+ GraphQL queries
- Each Pokemon ran 10 evolution queries = 50 × 10 = 500 queries
- Carousel rendered all Pokemon simultaneously

**Root Cause**:
- All Pokemon in carousel were rendered simultaneously
- Each Pokemon fetched evolution chains immediately
- Massive unnecessary API calls

**Solution**: Implemented virtual rendering with render window
- Only renders Pokemon within currentIndex ± 1 (3 Pokemon total)
- Dynamic loading of evolution chains only when Pokemon is visible
- Significantly reduces API calls (only loads data for visible Pokemon)

**Results**:
- Eliminates rate limiting problems
- Faster modal opening (no unnecessary API calls)
- Smoother navigation (on-demand data loading)
- Significantly reduced memory usage and network traffic

## Caching Strategy

To reduce unnecessary data transfer and server load:

### Backend Caching (node-cache)

**API-cache (24 hour TTL):**
- Individual Pokémon cached per ID
- Type lists (all Pokémon URLs per type)
- Long TTL because PokéAPI data is static

**User-cache (5 minute TTL):**
- User's owned Pokémon
- Shorter TTL because data updates more frequently
- Automatically invalidated on changes

**Performance Impact**:
- Cached requests served from memory (significantly faster)
- Reduces repeated API calls to PokéAPI
- Type filtering benefits from caching

### Frontend Image Caching (IndexedDB)

**Batch Loading Strategy**:
- Load 10 sprites in parallel per batch
- 1 second delay between batches (60 sprites/min max)
- Prevents API rate limiting
- IndexedDB for persistent caching across sessions

**Performance**:
- Batch parallel loading (10 images per batch)
- Sequential fallback for rate limit compliance
- Automatic retry on failed loads
- Initial preload: 20 Pokemon (1 page)

## Database Query Optimization

### Efficient Pagination

Instead of fetching all Pokemon and filtering client-side:
```javascript
// Inefficient - loads everything
const allPokemon = await fetchPokemon({limit: 1025});
return allPokemon.filter(...).slice(0, 20);

// Efficient - only loads what's needed
const pokemonMeta = await collection
  .find({generation: 'kanto'})
  .limit(20)
  .toArray();
```

**Benefits**:
- Significantly reduces data transfer
- Faster response times
- Lower memory usage
- Efficient pagination

### Index Optimization

MongoDB indexes on frequently queried fields:
- `name` - For search queries
- `generation` - For region filtering
- `types` - For type filtering

**Performance Impact**:
- Query time: O(log n) instead of O(n)
- Fast query times with indexed lookups

## Debouncing and Throttling

### Search Debouncing (300ms)

Prevents excessive API calls during typing:
```javascript
// Without debounce: 10 characters = 10 API calls
// With 300ms debounce: 10 characters = 1 API call
```

**Benefits**:
- Significantly reduces server load
- Less network traffic
- Improved server scalability

## Data Transfer Optimization

### GraphQL Benefits

Using GraphQL instead of REST:
- Clients request only needed fields
- No over-fetching of data
- Single request instead of multiple endpoints

**Example**:
```graphql
# Only fetch what's needed
query {
  pokedex {
    id
    name
    sprite
  }
}
```

Instead of fetching entire Pokemon objects with all stats, abilities, etc.

### Image Optimization

- Use sprite images (small file sizes)
- Lazy load images as users scroll
- Cache images in IndexedDB
- Fallback to placeholder during load

## Reducing Client-Side Processing

### Server-Side Filtering

MongoDB handles filtering instead of client:
- Reduces data transfer
- Faster results
- Lower client CPU usage
- Better battery life on mobile devices

## Environmental Impact

### Energy Savings

**Dark Mode:**
- Dark mode can reduce energy consumption on OLED and AMOLED displays
- Energy savings depend on:
  - Display technology (OLED displays show higher savings, LCD displays show minimal savings)
  - Screen brightness settings
  - Ratio of dark pixels on screen
- Our dark mode implementation uses dark backgrounds with light text, maximizing dark pixel coverage
- Users can toggle between light and dark mode based on preference and device type

**Code Splitting Benefits**:
- Less JavaScript to parse and execute
- Reduced CPU usage
- Lower battery consumption on mobile devices

**Caching Benefits**:
- Fewer network requests
- Reduced server load
- Lower energy consumption in data centers

**Virtual Rendering Benefits**:
- Renders only visible components
- Reduced DOM manipulation
- Lower CPU and memory usage

**Other Efficiency Measures**:
- Lazy loading for Pokemon images
- Debounced search (reduces unnecessary API calls)
- Efficient MongoDB indexes for fast queries
- Sprite-based graphics (smaller file sizes than high-res images)
- Code splitting for on-demand loading

### Data Transfer Reduction

MongoDB-based pagination significantly reduces API calls:
- Only fetch Pokemon IDs from database (20 per page)
- Then fetch full details for those 20 from PokéAPI
- Avoids fetching all Pokemon data upfront

Benefits:
- Lower bandwidth usage
- Faster page loads
- Better mobile experience

## Performance Monitoring

Performance optimizations implemented:
- Code splitting reduces initial load
- Caching minimizes repeated API calls
- Virtual rendering limits DOM nodes
- Debouncing reduces server requests

## Future Optimization Opportunities

1. **Service Workers** - Offline support and advanced caching
2. **WebP Images** - Modern image formats for smaller file sizes
3. **HTTP/2 Server Push** - Proactive resource delivery
4. **Resource Hints** - Preload, prefetch, preconnect
5. **Tree Shaking** - Further reduce unused code
6. **Compression** - Brotli compression for even smaller transfers

## Best Practices Applied

- Lazy load non-critical resources
- Minimize initial bundle size
- Cache aggressively with appropriate TTLs
- Use efficient data structures (indexes)
- Debounce user inputs
- Virtual rendering for large lists
- Progressive enhancement
- Responsive images

## Measuring Impact

Available tools for performance monitoring:
- Bundle analyzer (rollup-plugin-visualizer)
- Browser DevTools (Network tab, Performance tab)
- React DevTools Profiler
