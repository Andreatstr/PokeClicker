# Sustainable Web Development

**[Home](../README.md)** | **[Setup](./setup.md)** | **[Architecture](./architecture.md)** | **[Testing](./testing.md)** | **[Security](./security.md)** | **[Sustainability](./sustainability.md)** | **[Development Workflow](./development-workflow.md)** | **[AI Usage](./ai-usage.md)**

---

This document describes the sustainability and performance optimizations implemented in the PokéClicker project to reduce energy consumption, data transfer, and resource usage.

## Code Splitting and Lazy Loading

### Issue #69: Code Splitting Implementation

**Problem**: Large initial bundle size led to slow load times.

**Solution**: Implemented React.lazy() for route-based and component-level code splitting.

**Lazy Loaded Components**:
- **Routes**: PokeClicker, LoginScreen, ProfileDashboard, PokedexPage, PokemonMap
- **Heavy Components**: PokemonDetailModal, SearchBar, FiltersAndCount, PokemonCard
- **Dependencies**: Apollo Client, UI libraries split into separate chunks

**Results**:
- Smaller initial bundle
- Improved time-to-interactive
- Only load features when accessed

## Virtual Rendering Optimization

### Issue #81: Virtual Rendering for Carousel Navigation

**Problem**: Opening Pokemon modal with 50 filtered Pokemon resulted in 500+ unnecessary GraphQL queries (50 Pokemon × 10 evolution queries each).

**Solution**: Virtual rendering with render window - only renders Pokemon within currentIndex ± 1 (3 Pokemon total). Evolution chains load on-demand when Pokemon becomes visible.

**Results**:
- Eliminates rate limiting issues
- Faster modal opening
- Significantly reduced memory and network usage

## Caching Strategy

### Backend Caching (node-cache)

**API-cache (24h TTL)**: Pokemon data from PokéAPI (static data)
**User-cache (5min TTL)**: User data and owned Pokemon (frequently changing)

### Frontend Image Caching (IndexedDB)

- Batch loading: 10 sprites in parallel per batch
- 1 second delay between batches (prevents rate limiting)
- Persistent caching across sessions
- Automatic retry on failed loads

**Performance Impact**: Cached requests served from memory, reduces repeated API calls

## Database Query Optimization

See [architecture.md](./architecture.md) for details on MongoDB pagination and indexing strategy.

**Key Benefits**:
- Query time: O(log n) with indexes
- Only fetch 20 Pokemon per page instead of all 1025
- Significantly reduces data transfer

## Debouncing and Throttling

### Search Debouncing (300ms)

Without debounce: Typing 10 characters = 10 API calls
With 300ms debounce: Typing 10 characters = 1 API call

**Benefits**: Reduces server load, less network traffic, improved scalability

## Data Transfer Optimization

### GraphQL Benefits

- Clients request only needed fields (no over-fetching)
- Single request instead of multiple REST endpoints
- Example: Pokedex list only fetches `id`, `name`, `sprite` (not all stats/abilities)

### Image Optimization

- Use sprite images (small file sizes ~10KB)
- Lazy load images as users scroll
- IndexedDB caching
- Fallback to placeholder during load

## Environmental Impact

### Energy Savings

**Dark Mode**: Reduces energy consumption on OLED/AMOLED displays. Users can toggle based on device type and preference.

**Code Splitting**: Less JavaScript to parse/execute → reduced CPU usage → lower battery consumption on mobile

**Caching**: Fewer network requests → reduced server load → lower data center energy consumption

**Virtual Rendering**: Only render visible components → reduced DOM manipulation → lower CPU/memory usage

**Debouncing**: Reduces unnecessary API calls and server processing

### Data Transfer Reduction

MongoDB pagination reduces bandwidth usage:
- Fetch only 20 Pokemon IDs per page
- Then fetch full details for those 20 from PokéAPI
- Avoids fetching all 1025 Pokemon upfront

**Benefits**: Lower bandwidth usage, faster page loads, better mobile experience

## Performance Monitoring

**Tools Used**:
- Bundle analyzer (rollup-plugin-visualizer)
- Browser DevTools (Network, Performance tabs)
- React DevTools Profiler

## Future Optimization Opportunities

1. **Service Workers** - Offline support and advanced caching
2. **WebP Images** - Smaller file sizes than PNG
3. **Resource Hints** - Preload, prefetch, preconnect
4. **Brotli Compression** - Even smaller transfers

## Best Practices Applied

- Lazy load non-critical resources
- Minimize initial bundle size
- Cache aggressively with appropriate TTLs
- Use efficient data structures (MongoDB indexes)
- Debounce user inputs
- Virtual rendering for large lists
- Progressive enhancement
