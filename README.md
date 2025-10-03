# PokéClicker App

A React-based Pokémon clicker game and Pokédex application built with TypeScript that features an interactive GameBoy-style clicker interface and comprehensive Pokémon browsing functionality.

## Link to webpage

[Live Demo](http://it2810-26.idi.ntnu.no/project2/)

Make sure to connect to edoram VPN if you are accessing from outside NTNU.

## Project Overview

This project is part of the NTNU IT2810 web development course (Project 2), demonstrating modern React development practices, state management, local storage persistence, responsive design, and comprehensive user interaction patterns. The application combines gaming mechanics with data browsing, showcasing both interactive entertainment and information display capabilities.

### Course Learning Objectives Demonstrated

- **Advanced React Patterns**: Complex state management with localStorage persistence
- **Component Architecture**: Reusable components with proper TypeScript interfaces
- **User Interaction Design**: Click mechanics, animations, and responsive feedback
- **Data Management**: Local storage for game progress and session state
- **Responsive Design**: Mobile-first design with GameBoy-inspired retro aesthetics
- **Performance Optimization**: Debounced search, pagination, and efficient rendering
- **Accessibility Features**: ARIA labels, keyboard navigation, and semantic HTML
- **Modern Development Tools**: Vite, ESLint, Tailwind CSS, and Radix UI
- **TypeScript Implementation**: Strict typing with custom interfaces and type safety

## Features

### Core Functionality

#### PokéClicker Game
- **Interactive GameBoy Console**: Authentic retro design with click-responsive Charizard
- **Incremental Mechanics**: Earn rare candy through clicking and passive income
- **Stat Upgrades**: Six different stats (HP, Attack, Defense, Sp. Attack, Sp. Defense, Speed)
- **Progress Persistence**: Automatic saving to localStorage with state restoration
- **Visual Feedback**: Click animations, floating candy effects, and stat visualization

#### Pokédex Browser
- **Comprehensive Pokemon Grid**: Browse through extensive Pokémon collection
- **Real-time Search**: Debounced search with instant filtering results
- **Advanced Filtering**: Filter by region, type, and sorting options
- **Load More Pagination**: Progressive loading with fade-in animations
- **Detailed Modal Views**: In-depth Pokémon information with stats and evolution chains

### Technical Features

- **Dual-mode Interface**: Seamless navigation between clicker game and Pokédex
- **State Persistence**: localStorage integration for game progress retention
- **Responsive Design**: Optimized for mobile, tablet, and desktop experiences
- **Performance Optimization**: Debounced inputs and efficient rendering patterns
- **Retro Aesthetics**: Pixel-perfect GameBoy styling with authentic feel
- **Type Safety**: Comprehensive TypeScript interfaces and strict typing

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Custom CSS
- **UI Components**: Radix UI + pixel-retroui
- **Routing**: React Router DOM
- **State Management**: React hooks with localStorage persistence
- **Icons**: Lucide React
- **Code Quality**: ESLint + TypeScript ESLint

## Getting Started

### Prerequisites

- Node.js v18.0.x or higher
- npm v8.x or higher / pnpm v7.x or higher

### Installation

1. Clone the repository

```bash
git clone https://git.ntnu.no/IT2810-H25/T26-Project-2.git
cd T26-Project-2
```

2. Install dependencies

```bash
pnpm install
```

Alternatively, you can use npm:

```bash
npm install
```

3. Start the development server

```bash
pnpm run dev
```

Alternatively, you can use npm:

```bash
npm run dev
```

## Available Scripts

- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run preview` - Preview production build
- `pnpm run lint` - Check for linting errors

Can also use npm instead of pnpm for all scripts.
Check `package.json` for details and quick access.

## Project Structure

```
src/
├── components/          # React components
│   ├── PokeClicker.tsx  # Main clicker game component
│   ├── PokemonCard.tsx  # Individual Pokémon display
│   ├── Navbar.tsx       # Navigation component
│   └── ui/              # Reusable UI components
├── data/                # Data and type definitions
│   └── mockData.ts      # Pokémon data and interfaces
├── lib/                 # Utility functions
└── styles/              # CSS stylesheets
```

## Game Mechanics

### PokéClicker System

The clicker game implements a sophisticated incremental progression system:

#### Earning Mechanics
- **Click Rewards**: Base reward calculated from Attack + (Sp. Attack × 0.5)
- **Passive Income**: Continuous earnings from HP × 0.5 + Defense × 0.3 per second
- **Visual Feedback**: Floating candy animations and click effects

#### Upgrade System
- **Exponential Costs**: Upgrade costs follow the formula: `10 × 1.5^(level-1)`
- **Stat Effects**:
  - **HP**: Increases passive income generation
  - **Attack**: Direct multiplier for click rewards
  - **Defense**: Contributes to passive income
  - **Sp. Attack**: Bonus multiplier for click rewards
  - **Sp. Defense & Speed**: Planned for future features

#### Persistence
- **Auto-Save**: Game state automatically saved to localStorage
- **Cross-Session**: Progress maintained between browser sessions
- **State Recovery**: Graceful handling of corrupted or missing save data

### Pokédex Features

#### Search and Filtering
- **Debounced Search**: 300ms delay prevents excessive filtering
- **Real-time Results**: Instant visual feedback on search queries
- **Filter Categories**: Region (Kanto/Johto/Hoenn), Type, and Sort options
- **Result Counting**: Live display of filtered results

#### Pagination System
- **Load More**: Progressive loading with 20 Pokémon per page
- **Performance**: Prevents overwhelming initial load
- **Smooth Transitions**: Fade-in animations for new content
- **Responsive Grid**: Auto-adjusting layout for different screen sizes

## Design Decisions and Architecture

### Game Design Philosophy

**Decision**: Retro GameBoy aesthetic with modern functionality

**Rationale**: Creates nostalgic appeal while maintaining usability and accessibility

**Implementation**:
- Authentic GameBoy color palette and button layout
- Pixel-perfect sprites and fonts
- Responsive design that maintains visual integrity

### State Management Strategy

**Decision**: React hooks with localStorage persistence

**Rationale**: Lightweight solution for game state without external dependencies

**Implementation**:
- Custom hooks for game mechanics
- Automatic serialization/deserialization
- Error handling for localStorage failures

### Component Architecture

**Decision**: Single-page application with conditional rendering

**Rationale**: Maintains game state while allowing smooth navigation

**Implementation**:
- Navbar-driven page switching
- Preserved state across mode changes
- Optimized re-rendering patterns

### Performance Optimizations

**Decision**: Progressive loading and debounced interactions

**Rationale**: Maintains smooth user experience with large data sets

**Implementation**:
- 300ms debounce on search inputs
- 20-item pagination with load more
- Optimized filtering algorithms
- Efficient re-render prevention

### Responsive Design Strategy

**Decision**: Mobile-first with GameBoy-inspired breakpoints

**Rationale**: Ensures usability across all device types while maintaining theme

**Implementation**:
- **Mobile**: Single-column layout with stacked components
- **Tablet**: Improved spacing and larger interactive areas
- **Desktop**: Side-by-side layout for clicker and upgrades

### Accessibility Implementation

**Decision**: WCAG 2.1 AA compliance with gaming considerations

**Rationale**: Ensure inclusive access to both game and information features

**Implementation**:
- ARIA labels for all interactive elements
- Keyboard navigation support
- Screen reader friendly descriptions
- High contrast ratios in retro color scheme

## Component Design Decisions

#### PokeClicker Component

**Decision**: Authentic GameBoy replica with functional controls

**Rationale**: Creates immersive retro gaming experience

**Implementation**:
- Detailed hardware recreation (D-pad, A/B buttons, speaker holes)
- Functional screen with click interactions
- Authentic color scheme and proportions
- Responsive scaling for different devices

#### PokemonCard Component

**Decision**: Minimalist card design focusing on essential information

**Rationale**: Quick browsing without information overload

**Implementation**:
- Type-based color coding
- Clean typography hierarchy
- Hover effects for interactivity
- Consistent aspect ratios

#### Modal System

**Decision**: Detailed overlay for in-depth Pokémon information

**Rationale**: Maintains browsing context while providing comprehensive data

**Implementation**:
- Full stat displays and evolution chains
- Navigation between related Pokémon
- Responsive layout adaptation
- Escape key and overlay click dismissal

## Browser and Device Compatibility

### Browser Testing

The application has been tested in development mode across modern browsers:

- **Chrome** (Recommended)
- **Firefox**
- **Edge**
- **Safari**

### Device Testing

- **Mobile**: iPhone and Android devices (responsive design)
- **Tablet**: iPad and Android tablets (optimized layout)
- **Desktop**: Multiple resolutions (1920x1080, 1366x768, ultrawide)

### Responsive Breakpoints

- **Mobile**: 480px and below
- **Tablet**: 481px to 1023px
- **Desktop**: 1024px and above

## Data Structure

### Pokemon Interface

```typescript
interface Pokemon {
  id: number;
  name: string;
  types: string[];
  sprite: string;
  pokedexNumber: string;
  height?: string;
  weight?: string;
  genderRatio?: string;
  habitat?: string;
  abilities?: string[];
  stats?: {
    hp: number;
    attack: number;
    defense: number;
    spAttack: number;
    spDefense: number;
    speed: number;
  };
  evolution?: number[];
}
```

### Game State Structure

```typescript
interface GameState {
  rareCandy: number;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    spAttack: number;
    spDefense: number;
    speed: number;
  };
}
```

## Future Enhancements

### Planned Features

- **Battle System**: Turn-based combat mechanics
- **Achievement System**: Progress tracking and rewards
- **More Pokémon**: Expanded to later generations
- **Enhanced Animations**: More sophisticated visual effects
- **Sound Effects**: Authentic GameBoy audio experience
- **Multiplayer Elements**: Leaderboards and sharing

### Technical Improvements

- **Unit Testing**: Comprehensive test coverage
- **PWA Features**: Offline functionality and app installation
- **Performance Monitoring**: Analytics and optimization
- **Internationalization**: Multi-language support

## Development Notes

### LocalStorage Usage

The application utilizes localStorage for:
- Game progress persistence (rare candy count and stat levels)
- Search term retention across sessions
- Theme preferences (dark/light mode)

### Performance Considerations

- Debounced search prevents excessive filtering operations
- Pagination reduces initial load time and memory usage
- Efficient re-rendering through proper React patterns
- Optimized image loading with proper sizing

### Code Quality

- Comprehensive TypeScript typing throughout
- ESLint configuration for consistent code style
- Component composition for reusability
- Separation of concerns between game logic and UI

This project demonstrates modern React development practices while creating an engaging user experience that combines gaming elements with information browsing in a cohesive, accessible application.