# Final Sprint - Essential Issues Only

**Sprint Goal:** Launch-ready app med core features + minimal WCAG compliance

**Total Capacity:** ~40-50 timer (1 sprint)

---

## 🔴 CRITICAL - Must Fix (Blockers)

### Issue #140: Fix Keyboard Navigation Blocker

**Branch:** `fix/keyboard-tabindex`

**Problem:** `tabIndex={-1}` på alle buttons = tastaturbrukere kan ikke bruke appen.

**Fix:**
```tsx
// frontend/src/ui/pixelact/button.tsx
// Line 100: Remove tabIndex={-1}
// Lines 46, 53-59: Remove force-blur logic

// Add focus styles:
.pixel__button:focus-visible {
  outline: 3px solid var(--ring);
  outline-offset: 2px;
}
```

**Testing:**
- Tab through app
- Verify all buttons reachable
- Run axe DevTools (should fix 15+ violations)

**Files:** `button.tsx`, `button.css`

**Effort:** 2 timer

---

---

### Issue #141: Guest User as Full Database User

**Branch:** `feat/guest-as-real-user`

**Problem:** Guest user er begrenset og har ikke en faktisk bruker-entry. De skal ha alle samme rettigheter som autentiserte brukere, men være en faktisk bruker i databasen.

**Bonus:** Defeated Pokemon i battle trackes automatisk per bruker i databasen.

**Solution:** Auto-create anonymous user i backend når guest bruker appen.

**Backend Changes:**

```ts
// resolvers.ts - add guest user creation
async function getOrCreateGuestUser(db: Db, guestId: string) {
  const users = db.collection('users');

  let guestUser = await users.findOne({ username: `guest_${guestId}` });

  if (!guestUser) {
    guestUser = {
      username: `guest_${guestId}`,
      password_hash: '', // No password for guests
      is_guest: true,
      created_at: new Date(),
      rare_candy: 0,
      stats: {
        hp: 1, attack: 1, defense: 1,
        spAttack: 1, spDefense: 1, speed: 1,
        clickPower: 1, passiveIncome: 1,
      },
      owned_pokemon_ids: [],
      favorite_pokemon_id: null,
      selected_pokemon_id: 25, // Default Pikachu
    };

    await users.insertOne(guestUser);
  }

  return guestUser;
}

// Modify context to accept guest token
export const context = async ({ req }) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return { db, userId: null };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if guest token
    if (decoded.isGuest) {
      const guestUser = await getOrCreateGuestUser(db, decoded.guestId);
      return { db, userId: guestUser._id.toString() };
    }

    return { db, userId: decoded.userId };
  } catch {
    return { db, userId: null };
  }
};
```

**Frontend Changes:**

```tsx
// AuthContext.tsx - generate guest token on app start
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const existingToken = localStorage.getItem('token');

    if (existingToken) {
      // Verify and load user
      loadUserFromToken(existingToken);
    } else {
      // Create guest token
      const guestId = localStorage.getItem('guest_id') || generateGuestId();
      localStorage.setItem('guest_id', guestId);

      const guestToken = createGuestToken(guestId);
      setToken(guestToken);
      localStorage.setItem('token', guestToken);

      // Load guest user data
      loadUserFromToken(guestToken);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isGuest: user?.is_guest }}>
      {children}
    </AuthContext.Provider>
  );
}

function generateGuestId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

function createGuestToken(guestId: string): string {
  // Simple unsigned token (or sign with special guest secret)
  return btoa(JSON.stringify({ isGuest: true, guestId }));
}

// Update mutations to work with guest token
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { errorPolicy: 'all' },
    query: { errorPolicy: 'all' },
    mutate: { errorPolicy: 'all' },
  },
});

// authLink now always sends token (guest or real)
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

```

**Acceptance:**
- [ ] App auto-creates guest user on first visit
- [ ] Guest user har eget database entry med unique guest_id
- [ ] Guest kan bruke ALL features (clicker, map, battle, profile)
- [ ] Guest progress persisteres i MongoDB (ikke local state)
- [ ] Guest kan convert to real user uten å miste progress
- [ ] "Create Account" banner vises for guests
- [ ] Real users ser ikke guest banner
- [ ] **BONUS:** Defeated Pokemon i battle trackes per guest user

**Schema Changes:**
```graphql
# Add to User type
type User {
  is_guest: Boolean!
  # ... rest
}

# Add mutation
type Mutation {
  convertGuestToUser(username: String!, password: String!): AuthResponse!
}
```

**Files:**
- Backend: `resolvers.ts` (guest creation), `schema.ts` (add is_guest field)
- Frontend: `AuthContext.tsx` (auto guest token), `LoginScreen.tsx` (convert mutation)
- UI: `App.tsx` (guest banner)

**Effort:** 6-8 timer

---

---

## 🟡 HIGH PRIORITY - Core Features & User Experience

### Issue #142: Onboarding Tutorial with Guided Popups

**Branch:** `feat/onboarding-tutorial`

**Priority:** 🔴 **CRITICAL FOR EVALUATION** - Sensors/examiners need to understand how to use features!

**Goal:** First-time users (and examiners!) get interactive guide with arrows pointing to features.

**Why This Is Critical:**
- Examiners/sensors will evaluate the app without prior knowledge
- Clear guidance shows polish and thoughtfulness
- Demonstrates understanding of UX best practices
- Makes complex features (clicker, map, battle) immediately understandable

**Implementation:**
```tsx
// hooks/useOnboarding.ts
export function useOnboarding() {
  const [step, setStep] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('onboarding_completed');
    if (!hasSeenTutorial) {
      setIsActive(true);
    }
  }, []);

  const nextStep = () => setStep((s) => s + 1);
  const skipTutorial = () => {
    setIsActive(false);
    localStorage.setItem('onboarding_completed', 'true');
  };

  // Allow manual restart for demo purposes
  const restartTutorial = () => {
    localStorage.removeItem('onboarding_completed');
    setStep(0);
    setIsActive(true);
  };

  return { step, isActive, nextStep, skipTutorial, restartTutorial };
}

// components/OnboardingOverlay.tsx
const STEPS = [
  {
    target: 'navbar',
    title: 'Welcome to PokeClicker!',
    description: 'Navigate between Pokedex, Clicker, World, and Profile here',
    position: 'bottom',
    highlight: true,
  },
  {
    target: 'search-bar',
    title: 'Search Pokemon',
    description: 'Type to find your favorite Pokemon. Try searching for "Pikachu"!',
    position: 'bottom',
  },
  {
    target: 'pokemon-card',
    title: 'Collect Pokemon',
    description: 'Click on cards to view details. Unlock Pokemon with Rare Candy!',
    position: 'top',
    highlight: true,
  },
  {
    target: 'clicker-nav',
    title: 'Earn Rare Candy',
    description: 'Visit the Clicker to earn currency by clicking and upgrading your trainer',
    position: 'bottom',
    highlight: true,
  },
  {
    target: 'world-nav',
    title: 'Explore the World',
    description: 'Walk around the map to encounter wild Pokemon and battle them!',
    position: 'bottom',
  },
  {
    target: 'profile-button',
    title: 'Your Profile',
    description: 'Track your collection, stats, and set your favorite Pokemon',
    position: 'bottom',
  },
];

export function OnboardingOverlay({ step, onNext, onSkip }: Props) {
  const currentStep = STEPS[step];
  if (!currentStep) return null;

  const targetElement = document.querySelector(`[data-onboarding="${currentStep.target}"]`);
  if (!targetElement) return null;

  const rect = targetElement.getBoundingClientRect();

  return (
    <>
      {/* Backdrop with high z-index */}
      <div
        className="fixed inset-0 bg-black/70 z-[9998]"
        onClick={onSkip}
        style={{ pointerEvents: 'auto' }}
      />

      {/* Spotlight on target element */}
      <div
        className="fixed z-[9999] border-4 border-yellow-400 rounded-lg pointer-events-none animate-pulse"
        style={{
          top: rect.top - 8,
          left: rect.left - 8,
          width: rect.width + 16,
          height: rect.height + 16,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 20px rgba(255, 215, 0, 0.8)',
        }}
      />

      {/* Popup with arrow */}
      <div
        className="fixed z-[9999] pixel-box p-4 max-w-xs shadow-2xl"
        style={{
          top: currentStep.position === 'bottom' ? rect.bottom + 24 : rect.top - 160,
          left: Math.min(rect.left, window.innerWidth - 350),
        }}
      >
        {/* Step indicator */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-muted-foreground">
            Step {step + 1} of {STEPS.length}
          </span>
          <button
            onClick={onSkip}
            className="text-xs hover:text-destructive"
            aria-label="Skip tutorial"
          >
            ✖ Skip
          </button>
        </div>

        <h3 className="pixel-font text-sm mb-2 text-yellow-400">
          {currentStep.title}
        </h3>
        <p className="text-xs mb-4 leading-relaxed">
          {currentStep.description}
        </p>

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={onNext}
            className="flex-1"
          >
            {step === STEPS.length - 1 ? '🎉 Finish' : 'Next →'}
          </Button>
          {step > 0 && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setStep(step - 1)}
            >
              ← Back
            </Button>
          )}
        </div>

        {/* Animated Arrow pointing to element */}
        <div
          className="absolute w-0 h-0 animate-bounce"
          style={{
            [currentStep.position]: '-20px',
            left: '50%',
            transform: 'translateX(-50%)',
            borderLeft: '12px solid transparent',
            borderRight: '12px solid transparent',
            [currentStep.position === 'bottom' ? 'borderTop' : 'borderBottom']:
              '20px solid var(--card)',
            filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))',
          }}
        />
      </div>
    </>
  );
}

// App.tsx - integrate
const { step, isActive, nextStep, skipTutorial, restartTutorial } = useOnboarding();

// Add manual restart button in Profile or Settings
<Button onClick={restartTutorial}>
  📚 Restart Tutorial
</Button>

return (
  <>
    {/* ... existing app */}

    {isActive && (
      <OnboardingOverlay
        step={step}
        onNext={() => {
          if (step === STEPS.length - 1) {
            skipTutorial();
          } else {
            nextStep();
          }
        }}
        onSkip={skipTutorial}
      />
    )}
  </>
);

// Add data-onboarding attributes to ALL target elements
<Navbar data-onboarding="navbar" ... />
<SearchBar data-onboarding="search-bar" ... />
<PokemonCard data-onboarding="pokemon-card" ... /> // First card only
<Button data-onboarding="clicker-nav" onClick={() => onPageChange('clicker')}>
<Button data-onboarding="world-nav" onClick={() => onPageChange('map')}>
<Button data-onboarding="profile-button" onClick={() => onPageChange('profile')}>
```

**Enhanced Features for Evaluation:**

1. **Pulsing Spotlight:** Yellow border animates to draw attention
2. **Clear Arrows:** Animated arrows point directly to features
3. **Step Counter:** "Step X of 6" shows progress
4. **Back Button:** Examiners can go back if they missed something
5. **Skip Option:** Easy to dismiss but defaults to showing
6. **Manual Restart:** Add button in Profile to replay tutorial for demo
7. **High Z-index:** Ensures tutorial appears above all content
8. **Glowing Effect:** Shadow effects make tutorial unmissable

**Acceptance:**
- [ ] Shows automatically on first visit
- [ ] 6 steps covering ALL major features (Pokedex, Clicker, World, Profile)
- [ ] Pulsing spotlight effect on target element
- [ ] Animated arrow pointing to feature
- [ ] Next/Back/Skip buttons
- [ ] Step counter (X of 6)
- [ ] Saves completion to localStorage
- [ ] Can manually restart from Profile (for demo/evaluation)
- [ ] Works on mobile (responsive popups)
- [ ] High contrast, impossible to miss

**Files:**
- `hooks/useOnboarding.ts` (new)
- `components/OnboardingOverlay.tsx` (new)
- `App.tsx` (add overlay + restart button)
- `Navbar.tsx` (add data-onboarding="navbar")
- `SearchBar.tsx` (add data-onboarding="search-bar")
- `PokemonCard.tsx` (add data-onboarding="pokemon-card" to first card)
- `ProfileDashboard.tsx` (add "Restart Tutorial" button)

**Testing Checklist:**
- [ ] Test on desktop (Chrome, Firefox, Safari)
- [ ] Test on mobile (responsive)
- [ ] Verify all 6 steps work
- [ ] Verify arrows point correctly
- [ ] Verify spotlight follows elements
- [ ] Test skip functionality
- [ ] Test manual restart
- [ ] Test localStorage persistence

**Effort:** 5-6 timer

**⚠️ DEMO TIP:** Add a "Restart Tutorial" button in Profile so examiners/sensors can replay the guide if needed!

---

### Issue #143: Auto-Award Candy After Battle

**Branch:** `fix/battle-candy-auto-award`

**Problem:** "Continue" button fungerer som BOTH redeem candy AND close modal. Candy skal automatisk legges til balance ved battle win, mens "Continue" kun skal lukke modal og returnere til map.

**Current Behavior:**
```tsx
// BattleResult.tsx - Continue button does BOTH
<Button onClick={() => {
  addCandy(candyEarned); // ❌ Candy added on button click
  onClose();
}}>
  Continue
</Button>
```

**Desired Behavior:**
```tsx
// BattleResult.tsx or BattleView.tsx
useEffect(() => {
  if (battleResult === 'win' && candyEarned > 0) {
    // ✅ Auto-add candy when battle is won
    addCandy(candyEarned);
  }
}, [battleResult, candyEarned]);

// Continue button ONLY closes modal
<Button onClick={onClose}>
  Continue
</Button>
```

**Implementation:**

```tsx
// BattleView.tsx (or wherever battle logic lives)
const [battleResult, setBattleResult] = useState<'win' | 'lose' | null>(null);
const [candyEarned, setCandyEarned] = useState(0);

// When battle ends
function handleBattleEnd(result: 'win' | 'lose') {
  setBattleResult(result);

  if (result === 'win') {
    const earned = calculateCandyReward(wildPokemon);
    setCandyEarned(earned);
  }
}

// Auto-award candy on win
useEffect(() => {
  if (battleResult === 'win' && candyEarned > 0) {
    // Add candy immediately to user's balance
    if (isAuthenticated) {
      updateRareCandyMutation({ variables: { amount: candyEarned } });
    } else {
      // Guest user: update local state
      addCandyToGuestState(candyEarned);
    }
  }
}, [battleResult, candyEarned, isAuthenticated]);

// BattleResult.tsx - Continue button just closes
<div className="text-center">
  <p className="text-lg mb-2">
    {battleResult === 'win' ? 'Victory!' : 'Defeated!'}
  </p>

  {battleResult === 'win' && (
    <p className="text-sm mb-4">
      +{candyEarned} Rare Candy added to your balance!
    </p>
  )}

  <Button onClick={onClose}>
    Continue
  </Button>
</div>
```

**Acceptance:**
- [ ] Candy automatisk legges til balance når battle er vunnet
- [ ] Ingen behov for å klikke knapp for å claime candy
- [ ] "Continue" knapp kun lukker modal og returnerer til map
- [ ] Fungerer for både authenticated og guest users
- [ ] UI viser tydelig at candy ble lagt til

**Files:**
- `BattleView.tsx` (add useEffect for auto-award)
- `BattleResult.tsx` (remove candy logic from button, update text)

**Effort:** 30 min - 1 time

---

### Issue #144: Separate Trainer Stats from Pokemon Stats

**Branch:** `feat/trainer-vs-pokemon-stats`

**Problem:** Mental model er uklar - stats er blandet mellom "trainer" (clicker) og "pokemon" (battle). Vi må separere disse tydeligere.

**Mental Model:**
- **Trainer Stats** (Clicker) = Click Power & Passive Income
- **Pokemon Stats** (Battle) = HP, Attack, Defense, etc.

**Current State:**
```tsx
// user.stats i database inneholder alt mixed sammen:
stats: {
  hp: 1,              // Battle stat
  attack: 1,          // Battle stat
  defense: 1,         // Battle stat
  clickPower: 1,      // Trainer stat ❌ Mixed!
  passiveIncome: 1,   // Trainer stat ❌ Mixed!
}

// UpgradesPanel.tsx sier "Pokemon Upgrades" men upgrader trainer
<h2>Pokemon Upgrades</h2> // ❌ Forvirrende!
```

**Desired State:**

**1. Rename UI i Clicker:**
```tsx
// UpgradesPanel.tsx
<h2 className="pixel-font text-xl mb-4">
  Trainer Upgrades
</h2>

// Stats skal vise:
- Click Power: X candy per click
- Passive Income: X candy per second
```

**2. Profile skal vise TRAINER stats (clicker stats):**
```tsx
// ProfileDashboard.tsx
<section className="pixel-box p-6">
  <h2 className="pixel-font text-2xl mb-4">Trainer Stats</h2>

  <div className="grid grid-cols-2 gap-4">
    <div>
      <p className="text-sm text-muted-foreground">Click Power</p>
      <p className="text-2xl font-bold">{user.stats.clickPower}</p>
      <p className="text-xs">Candy per click</p>
    </div>

    <div>
      <p className="text-sm text-muted-foreground">Passive Income</p>
      <p className="text-2xl font-bold">{user.stats.passiveIncome}</p>
      <p className="text-xs">Candy per second</p>
    </div>

    <div>
      <p className="text-sm text-muted-foreground">Total Earned</p>
      <p className="text-2xl font-bold">{user.rare_candy}</p>
      <p className="text-xs">Rare Candy</p>
    </div>

    <div>
      <p className="text-sm text-muted-foreground">Pokemon Owned</p>
      <p className="text-2xl font-bold">{user.owned_pokemon_ids.length}</p>
      <p className="text-xs">Collected</p>
    </div>
  </div>
</section>

// Optional: Show battle stats separately if needed
<section className="pixel-box p-6 mt-4">
  <h2 className="pixel-font text-2xl mb-4">Battle Stats</h2>
  <p className="text-xs text-muted-foreground">
    Coming soon: Track your Pokemon battle performance
  </p>
</section>
```

**3. Update GraphQL Query:**
```graphql
# schema.ts - ensure stats are clear
type UserStats {
  # Battle stats (for Pokemon)
  hp: Int!
  attack: Int!
  defense: Int!
  spAttack: Int!
  spDefense: Int!
  speed: Int!

  # Trainer stats (for Clicker)
  clickPower: Int!
  passiveIncome: Int!
}
```

**4. Ensure stats update immediately:**
```tsx
// useGameMutations.ts - after upgrade
const [upgradeStat] = useMutation(UPGRADE_STAT_MUTATION, {
  onCompleted: (data) => {
    // Update Apollo cache immediately
    client.cache.updateQuery({ query: ME_QUERY }, (cachedData) => ({
      me: data.upgradeStat,
    }));

    // Also update AuthContext user
    updateUser(data.upgradeStat);
  }
});
```

**Implementation Checklist:**

**UI Updates:**
- [ ] `UpgradesPanel.tsx` → Change "Pokemon Upgrades" to "Trainer Upgrades"
- [ ] `ProfileDashboard.tsx` → Show Click Power & Passive Income prominently
- [ ] `ProfileDashboard.tsx` → Add "Candy per click" and "Candy per second" labels
- [ ] `ProfileDashboard.tsx` → Show Total Earned and Pokemon Owned

**Cache Updates:**
- [ ] `useGameMutations.ts` → Update Apollo cache immediately after upgrade
- [ ] Verify no stale data from cache

**Testing:**
- [ ] Upgrade clickPower in clicker → Profile updates instantly
- [ ] Upgrade passiveIncome in clicker → Profile updates instantly
- [ ] Profile shows correct current values
- [ ] No console errors or cache warnings

**Acceptance:**
- [ ] Clicker says "Trainer Upgrades" (not "Pokemon Upgrades")
- [ ] Profile prominently displays Click Power and Passive Income
- [ ] Profile shows "X candy per click" and "X candy per second"
- [ ] Stats update IMMEDIATELY after upgrade (no refresh needed)
- [ ] Mental model is clear: Trainer = Clicker, Pokemon = Battle

**Files:**
- `frontend/src/features/clicker/components/UpgradesPanel.tsx` (rename heading)
- `frontend/src/features/profile/components/ProfileDashboard.tsx` (redesign stats display)
- `frontend/src/features/clicker/hooks/useGameMutations.ts` (fix cache updates)

**Effort:** 2-3 timer (includes debugging time)

---

### Issue #145: Logo Click Returns to Home

**Branch:** `feat/logo-home-navigation`

**Problem:** Clicking "PokeClicker" logo does nothing - should return to Pokedex.

**Solution:**
```tsx
// Navbar.tsx:49
<h1
  className="text-sm sm:text-lg ... cursor-pointer hover:opacity-80 transition-opacity"
  style={{color: 'var(--foreground)'}}
  onClick={() => onPageChange('pokedex')}
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onPageChange('pokedex');
    }
  }}
  aria-label="Return to Pokedex home"
>
  PokeClicker
</h1>
```

**Acceptance:**
- [ ] Click logo navigates to Pokedex
- [ ] Keyboard accessible (Enter/Space)
- [ ] Hover effect shows it's clickable

**Files:** `Navbar.tsx`

**Effort:** 30 min

---

### Issue #91: Global Leaderboard System with Two Leagues

**Branch:** `feat/leaderboard`

**Note:** ⚠️ Eksisterende issue (#91) - sjekk eksisterende implementasjon/branch først.

**Hvis ikke implementert enda, se eksisterende issue for detaljer.**

**Quick Implementation Guide:**

Backend additions needed:
- GraphQL schema: `LeaderboardEntry` type
- Query: `leaderboard(limit: Int)`
- Resolver: Sort users by `rare_candy DESC`

Frontend additions needed:
- `LeaderboardPage.tsx` component
- Add route in `App.tsx`
- Add button in `Navbar.tsx`

**Acceptance:**
- [ ] Shows top 100 users ranked by rare candy
- [ ] Current user highlighted in list
- [ ] Guest users can view leaderboard
- [ ] Responsive design

**Effort:** 4-5 timer (if implementing from scratch)

---

### Issue #146: Rename "Favorite" to "World" in Profile

**Branch:** `fix/rename-favorite-to-world`

**Problem:** I Profile tab, "Favorite Pokemon" section skal hete "World" for å indikere at det er den Pokemon du møter i World/Map.

**Current State:**
```tsx
// ProfileDashboard.tsx
<h2>Favorite Pokemon</h2> // ❌ Forvirrende navn
```

**Desired State:**
```tsx
// ProfileDashboard.tsx
<h2>World Pokemon</h2> // ✅ Tydelig at dette er for World/Map feature

// Or alternative:
<h2>Selected Pokemon</h2>
<p className="text-xs">This Pokemon will appear in the World</p>
```

**Implementation:**

Find all references to "Favorite Pokemon" in ProfileDashboard and rename:

```tsx
// ProfileDashboard.tsx - update heading
<section className="pixel-box p-6">
  <h2 className="pixel-font text-2xl mb-4">World Pokemon</h2>
  <p className="text-xs text-muted-foreground mb-4">
    Select a Pokemon to appear in the World map
  </p>

  {/* Existing favorite pokemon selector */}
  <FavoritePokemonSelector ... />
</section>
```

**Alternative naming options:**
- "World Pokemon" (shows purpose)
- "Selected Pokemon" (neutral)
- "Map Companion" (fun)

**Acceptance:**
- [ ] "Favorite Pokemon" renamed to "World Pokemon" (or equivalent)
- [ ] Clarifying description added
- [ ] No functional changes - only text/labeling
- [ ] Consistent throughout profile page

**Files:**
- `ProfileDashboard.tsx` (rename heading and description)

**Effort:** 5-10 minutter

---

### Issue #147: Music Player with Multiple Songs

**Branch:** `feat/music-player-controls`

**Current:** BackgroundMusic.tsx plays one song on loop.

**New Features:**
- Multiple songs in playlist
- Next/Previous buttons
- Skip to random song
- Volume control

```tsx
// BackgroundMusic.tsx
const PLAYLIST = [
  { title: 'Pallet Town', src: '/project2/music/pallet-town.mp3' },
  { title: 'Route 1', src: '/project2/music/route-1.mp3' },
  { title: 'Battle Theme', src: '/project2/music/battle.mp3' },
  { title: 'Viridian City', src: '/project2/music/viridian.mp3' },
];

export function BackgroundMusic({ isDarkMode }: { isDarkMode: boolean }) {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [isExpanded, setIsExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % PLAYLIST.length);
  };

  const prevTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + PLAYLIST.length) % PLAYLIST.length);
  };

  const randomTrack = () => {
    const random = Math.floor(Math.random() * PLAYLIST.length);
    setCurrentTrack(random);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Auto-play next track when current ends
  const handleEnded = () => {
    nextTrack();
  };

  return (
    <div
      className={`fixed bottom-4 right-4 pixel-box p-2 transition-all ${
        isExpanded ? 'w-64' : 'w-16'
      }`}
    >
      {/* Collapsed: Just music note icon */}
      {!isExpanded && (
        <button onClick={() => setIsExpanded(true)} className="w-full">
          🎵
        </button>
      )}

      {/* Expanded: Full controls */}
      {isExpanded && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-xs truncate">{PLAYLIST[currentTrack].title}</span>
            <button onClick={() => setIsExpanded(false)}>✖️</button>
          </div>

          {/* Controls */}
          <div className="flex gap-1 justify-between">
            <Button size="sm" onClick={prevTrack}>⏮</Button>
            <Button
              size="sm"
              onClick={() => {
                if (isPlaying) {
                  audioRef.current?.pause();
                } else {
                  audioRef.current?.play();
                }
                setIsPlaying(!isPlaying);
              }}
            >
              {isPlaying ? '⏸' : '▶️'}
            </Button>
            <Button size="sm" onClick={nextTrack}>⏭</Button>
            <Button size="sm" onClick={randomTrack}>🔀</Button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2">
            <span className="text-xs">🔊</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="flex-1"
            />
          </div>
        </div>
      )}

      <audio
        ref={audioRef}
        src={PLAYLIST[currentTrack].src}
        loop={false}
        autoPlay={isPlaying}
        onEnded={handleEnded}
      />
    </div>
  );
}
```

**Assets needed:**
- Download 4-5 Pokemon music tracks (MP3, <2MB each)
- Place in `public/project2/music/`

**Acceptance:**
- [ ] 4+ songs in rotation
- [ ] Next/prev/random controls
- [ ] Volume slider
- [ ] Collapsed/expanded state
- [ ] Auto-advance to next track
- [ ] State persists across pages

**Files:** `BackgroundMusic.tsx`, music assets in `public/`

**Effort:** 3-4 timer

---

**Note:** ⚠️ Moved to HIGH PRIORITY (Issue #142 above)

---

## 🟢 NICE TO HAVE - If Time Permits

### Issue #71: Automated Accessibility Testing

**Branch:** `test/accessibility-testing`

**Note:** ⚠️ Eksisterende issue (#71) - sjekk eksisterende implementasjon først.

**Minimal testing setup hvis ikke implementert:**

```bash
# Install
npm install --save-dev @axe-core/react

# Add to test setup
// src/test/setup.ts
if (process.env.NODE_ENV !== 'production') {
  import('@axe-core/react').then((axe) => {
    axe.default(React, ReactDOM, 1000);
  });
}
```

**Manual Lighthouse checklist:**
- [ ] Run Lighthouse on /pokedex
- [ ] Run Lighthouse on /clicker
- [ ] Run Lighthouse on /login
- [ ] Accessibility score 80+
- [ ] Performance score 70+
- [ ] Fix any critical issues found

**Files:** `test/setup.ts`

**Effort:** 2 timer

---

## Sprint Planning

### Week 1 (22-24h)
**Mon-Tue:** Critical Blockers
- #140 Fix tabIndex (2h)
- #141 Guest as real database user (8h)

**Wed-Thu:** Core Features
- #143 Auto-award candy (0.5-1h)
- #144 Trainer vs Pokemon stats (2-3h)
- #145 Logo navigation (0.5h)
- #91 Leaderboard - check existing issue (4-5h)

**Fri:** Polish & UX
- #146 Rename Favorite→World (10min)
- START #142 Onboarding tutorial (3-4h initial work)

### Week 2 (20-25h)
**Mon-Tue:** UX Polish & Features
- #142 Onboarding tutorial (5-6h) ⚠️ MOVED TO WEEK 1 PRIORITY
- #147 Music player (4h)

**Wed:** Testing & Polish
- #71 Accessibility testing (2h)
- Bug fixes and refinement (4h)

**Fri:** Final testing
- End-to-end manual testing (4h)
- Documentation updates (2h)
- Deployment prep (2h)

---

## Success Criteria

**Functional:**
- ✅ All 9 user-requested features implemented
- ✅ Guest users can explore full app
- ✅ Critical navigation bugs fixed
- ✅ Leaderboard working
- ✅ Onboarding for new users

**Technical:**
- ✅ Keyboard navigation works
- ✅ Lighthouse Accessibility 80+
- ✅ No console errors
- ✅ Mobile responsive

**Launch Ready:**
- ✅ Can demo app to examiners/stakeholders
- ✅ **Onboarding tutorial guides new users** 🔴 CRITICAL
- ✅ Guest mode shows full functionality
- ✅ User experience is polished
- ✅ "Restart Tutorial" available for demos

---

## Out of Scope (For Future)

These are good ideas but **not** for final sprint:
- ❌ Comprehensive test coverage (52% → 80%)
- ❌ Extensive accessibility testing automation
- ❌ Performance optimizations (video, fonts, images)
- ❌ Code refactoring (inline styles, JSDoc)
- ❌ Advanced Playwright E2E tests

These can be addressed post-launch if needed.

---

## Notes

**🔴 CRITICAL FOR EVALUATION:**
- **Onboarding tutorial (#142)** - MUST HAVE! Examiners need clear guidance to understand features
  - Pulsing spotlights with arrows
  - "Restart Tutorial" button for demos
  - This separates good projects from great ones

**💡 Core Priorities:**
- **Guest mode is MVP-critical** (#141) - examiners can try without signup
- **Fix critical a11y blocker** (#140) - keyboard navigation must work
- **Trainer vs Pokemon stats** (#144) - clear mental model shows thoughtfulness
- **Music player** - fun feature that enhances experience

**⚠️ DON'T over-engineer:**
- Basic Lighthouse testing is enough
- Focus on features examiners will see/test
- Code quality matters less than UX in evaluation

**Total estimated effort: 39-45 hours** - realistic for 1 sprint with buffer for bugs.
