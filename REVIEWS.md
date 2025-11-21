# Review Summary P2: IT2810-H25-T26

*Generated on 2025-11-12*

**Takk for at du leser tilbakemeldingene fra medstudentvurderingene!**
Vi vil gjerne høre din mening om de oppsummerte tilbakemeldingene. Bruk dette [spørreskjemaet](https://nettskjema.no/a/565641). Etter å ha svart på skjemaet har du mulighet til å være med i trekking av 3 gavekort á 200 kroner.

---

## Tilgjengelighet

**Knapper og ARIA-navn – manglende eller uklare tilgjengelighetsnavn**  
Flere tilbakemeldinger peker på at enkelte interaktive elementer mangler klare tilgjengelighetsnavn eller har misbruk av ARIA. Mason og Theo nevner at knapper trenger accessible names, og at ARIA brukes på elementer som ikke bør ha det; Finley10 peker spesielt på Start/Select/A/B og filtre som mangler tilgjengelige navn, og Leo47 noterer feil bruk av aria-tags. Dette kan føre til dårlig lesing av skjermleser og hinder tastaturnavigasjon for disse kontroller. For å avhjelpe bør dere sikre at alle knapper og kontroller har tydelige navn (både synlige navn og ARIA-labels), og rette ARIA-bruken slik den passer interaktivitet. Vera nevner også at det mangler aria-label for å lese opp Pokémon-informasjon; dette bør legges til der det er aktuelt.  
Reviewer(s): [Mason](#tilgjengelighet-mason), [Vera](#tilgjengelighet-vera), [Theo](#tilgjengelighet-theo), [Finley10](#tilgjengelighet-finley10), [Leo47](#tilgjengelighet-leo47)

------------------------------

**Tastaturnavigasjon og navigasjonsmeny**  
Det er variasjon i hvor godt tastaturnavigasjon fungerer, og noen bruker opplever utfordringer med å nå navigasjonsbaren kun med tastaturet. Leo47 påpeker at det ikke er mulig å nå navigasjonsbaren med tastaturet, noe som gjør appen vanskelig å bruke uten mus. Tina beskriver at det går å bruke med tastatur, men opplevelsen er litt vanskelig, selv om Lighthouse-tallet fortsatt er høyt. Dette påvirker brukere som er avhengige av tastaturnavigasjon og skjermlesere dersom de ikke får rask tilgang til hovednavigasjonen. Forslagene innebærer å sikre full tastaturnavigasjon til navigasjonen, forbedre fokusstyring og vurdere skip-to-content-lenker for bedre tilgjengelighet.  
Reviewer(s): [Leo47](#tilgjengelighet-leo47), [Tina](#tilgjengelighet-tina)

------------------------------

**Mangel på semantisk HTML og landemerker**  
Xander48 og Finley10 påpeker at store deler av grensesnittet bruker mange divs og spans, og at det mangler semantiske landemerker samt tydelig overskriftsstruktur. Dette gjør det vanskeligere for skjermlesere å tolke innholdet riktig og gir en mindre god opplevelse for brukere av assistiv teknologi. Forbedring bør være å bruke semantiske elementer (for eksempel header, nav, main, section) og etablere en klar overskriftsrekkefølge slik at innholdet blir lettere å navigere. Dette vil også bidra til bedre konsistens i hele appen.  
Reviewer(s): [Xander48](#tilgjengelighet-xander48), [Finley10](#tilgjengelighet-finley10)

------------------------------

**Fargekontrast og visuell tilgjengelighet**  
Mason og Finley10 peker på kontrastproblemer mellom bakgrunn og tekst eller andre elementer, og gir eksempler der kontrasten ikke oppfyller WCAG AA-krav. Dette gjør det vanskelig å lese innhold, spesielt i situasjoner som GameBoy-skjerm-presentasjon med lys grå tekst mot olivenfarget bakgrunn. Forbedringer inkluderer å justere fargepaletten for bedre kontrast og verifisere kontrastnivåene med relevante verktøy (som Lighthouse eller andre kontrastkalkulatorer).  
Reviewer(s): [Mason](#tilgjengelighet-mason), [Finley10](#tilgjengelighet-finley10)

------------------------------

**Modaler og fokusstyring**  
Finley10 peker på at modaler mangler forutsigbar fokusstyring, noe som fører til uforutsigbar tastaturnavigasjon og skjermleseropplevelse når modale elementer åpnes eller lukkes. Dette påvirker brukeropplevelsen negativt for tastaturnbrukere og de som stoler på skjermlesere. Løsningen bør være å implementere fokusfangst i modaler, flytte fokus til modalen ved åpning og returnere fokus til utløseren ved lukking, i tillegg til å sikre konsekvent modulær fokusstyring i hele applikasjonen.  
Reviewer(s): [Finley10](#tilgjengelighet-finley10)

---

## Funksjonalitet

**Verdens-delen oppleves som kompleks og til tider buggy**  
Verdens-delen er en av de mest ambisiøse delene i prosjektet, men oppleves av noen som kompleks og litt forvirrende å bruke. Theo peker på at det ikke er helt klart hvordan man skal spille i World-delen, mens Leo47 beskriver den som AI-sløp som er buggy og kan fjernes eller erstattes med en enklere løsning. Dette påvirker brukeropplevelsen ved å gjøre en ellers engasjerende del mindre intuitiv. Forbedringer kan være å vurdere forenkling av World-området eller tilby en tydeligere veiledning og en enklere implementasjon som ikke konkurrerer om brukerens oppmerksomhet. Til tross for dette er resten av applikasjonen ofte brukt og roser funksjonalitet i andre deler.

Reviewer(s): [Theo](#funksjonalitet-theo), [Leo47](#funksjonalitet-leo47)

--------------------------------------------------

**Pokedex lastes feil: 500-status påvirker funksjonaliteten**  
Pokedex-siden viser en feil: «Error loading Pokémon (status code 500)», noe som hindrer testing av søk, filtrering og sortering. Dette påvirker påliteligheten til applikasjonen og kan skape frustrasjon hos brukere hvis data ikke lastes korrekt. Det er viktig at feilhåndtering og backend-støtte forbedres slik at Pokedex-funksjonaliteten forblir robust også ved feiltilstander. Målet er at søk, filtrering og sortering fungerer stabilt selv når data ikke lastes perfekt.

Reviewer(s): [Vera](#funksjonalitet-vera)

--------------------------------------------------

**Darkmode: innloggede brukere mister preferansen**  
Darkmode-valget ser ut til å lagres lokalt, men huskes ikke når brukeren er logget inn. Dette skaper inkonsekvent brukeropplevelse mellom privat økt og innlogget tilstand. En løsning er å persistere valget i brukerprofilen eller i server-side lagring slik at det blir konstant uavhengig av økt-status. Dette vil gjøre opplevelsen mer konsistent for innloggede brukere.

Reviewer(s): [Xander48](#funksjonalitet-xander48)

--------------------------------------------------

**Logo som hjem-knapp mangler**  
Vera peker på at Pokéclicker-logoen ikke fungerer som en hjem-knapp, noe som gjør navigasjonen mindre intuitiv. Dette gjør det vanskelig for brukere å komme tilbake til oversikten uten å lete etter lenker. En enkel løsning er å gjøre logoen klikkbar og lenke til startsiden. Dette vil forbedre brukervennligheten betraktelig.

Reviewer(s): [Vera](#funksjonalitet-vera)

--------------------------------------------------

**Favoritt-Pokémon i profilen mangler implementering**  
Vera nevnte at det ikke var mulig å velge eller lagre en favoritt-Pokémon i profilen. Dette begrenser brukerens personlige tilpasning og opplevelsen av samlingen. Implementering av en favoritt-funksjon og persistens i brukerprofilen vil gi en mer personlig og engasjerende opplevelse.

Reviewer(s): [Vera](#funksjonalitet-vera)

--------------------------------------------------

**World fungerer ikke på mobil**  
Finley10 påpeker at World-delen ikke fungerer på mobil, noe som begrenser tilgjengeligheten for mange brukere. Dette påvirker mobilbrukeropplevelsen og kan gjøre appen mindre attraktiv for en betydelig del av brukerne. Løsningen kan være å tilpasse grensesnittet for mobil eller tilby en enklere mobilvennlig World-opplevelse. Dette krever også vurdering av ytelse og responsiv design i World-delen.

Reviewer(s): [Finley10](#funksjonalitet-finley10)

--------------------------------------------------

**Rare Candies-overflyt og tilhørende forbedringer**  
Finley10 advarer om at Rare Candies blir lagret i et signert 32-bits tall, som gir kapasitet bare litt over 2 milliarder enheter og dermed ikke er nok for å kjøpe topp-Pokémon. Dette kan hindre progresjon og føre til logiske feil i spillet. En løsning kan være å bruke større tall eller endre lagringsmåten, og å vurdere prisfiltrering og separat sortering for bedre brukeropplevelse. Dette er et viktig teknisk hinder som også påvirker spillebalansen.

Reviewer(s): [Finley10](#funksjonalitet-finley10)

--------------------------------------------------

---

## Design og utforming

**Begrenset tilgjengelighet og små klikkbare områder**
Denne kommentaren peker på behovet for bedre muse- og berøringsvennlighet i grensesnittet, spesielt rundt elementene Filters, type-badges, NavBar-knapper og “unlock”-funksjonen. Finley10 foreslår å legge til hover-effekter slik brukeren tydelig ser hva som er klikkbart, samt å sikre minst 44x44 piksler som hit area uavhengig av ikon eller tekst. Dette påvirker tilgjengelighet og brukervennlighet, særlig for musbruk og på mindre skjermer hvor målområdene kan være utfordrende å treffe riktig. Hvis forbedringen gjennomføres, vil det sannsynligvis gjøre navigasjonen mer intuitiv og redusere misforståelser om hva som kan trykkes. Forslaget kommer direkte fra Finley10 og knytter seg til eksisterende designdetaljer i interaksjonsområdene.

Reviewer(s): [Finley10](#design-og-utforming-finley10)

--------------------------------

**Mobiltilpasning: bredde og navigasjon på små skjermer**
Leo47 påpeker at på smale skjermer blir filteret bredt ut over skjermen, og siden viser bare én Pokémon per side med en ny meny for å velge blant det første utvalget, noe som oppleves som litt rart. Dette påvirker mobilopplevelsen og gjør det vanskelig å få oversikt og raskt få tilgang til flere elementer. Det blir derfor en mindre strømlinjeformet navigasjon på små enheter. Ingen konkrete løsninger ble nevnt, men kommentaren tyder på at mobilenhet-tilpasningen kan trenge re-evaluering for bedre flyt og konsistens med resten av designet. Den estetiske kvaliteten i designet forblir høy til tross for disse utfordringene. Leo47s kommentar er dermed en advarsel om behovet for å se på mobilnavigasjonen i fremtidige iterasjoner.

Reviewer(s): [Leo47](#design-og-utforming-leo47)

--------------------------------

---

## Bærekraft

**Dark mode bør være standardinnstilling**
Dette temaet handler om at dark mode bør være standardinnstilling ved første besøk. Xander48 uttrykker eksplisitt at darkmode bør være default når man først besøker nettsiden, mens Mason og Vera også nevner dark mode som viktig for bærekraft og brukeropplevelse, og Theo peker på fordelene for energieffektivitet. Når dark mode ikke er standard, kan brukere gå glipp av energieffektive startvalg og må bruke ekstra tid på å aktivere tema manuelt. Dette påvirker både brukeropplevelse og energiforbruk i starten av besøket, spesielt hvis sideinnhold og bilder er optimalisert for mørk modus. Forslaget er å gjøre dark mode til standard på første lasting, og samtidig beholde muligheten til å bytte mellom dark og light mode og lagre brukerpreferansen for senere besøk.

Reviewer(s): [Xander48](#b-rekraft-xander48), [Mason](#b-rekraft-mason), [Vera](#b-rekraft-vera), [Theo](#b-rekraft-theo)

--------------------------

**Energi- og bærekraftseffekter – måling og realisme av påstander**
Dette temaet gjelder energibesparelser og hvor troverdige påstandene er. Mason nevner at dark mode kan gi 60% energibesparelse, men bemerker at dette er omdiskutert fordi brukere ofte øker skjermens lysstyrke. Finley10 trekker fram konkrete tekniske tiltak som reduserer dataoverføringer og energibruk, slik som WebP-bilder, tile-baser kart med LRU-cache og prioritert lasting, samt lazy loading og caching. Theo peker på at slike optimaliseringer gir lavere trafikk og bedre energieffektivitet. Leo47 advarer mot at AI-bruk og store bilder/videoer kan gjøre bærekraftinnsatsen mindre solid. For å gjøre dette tydelig i prosjektet bør måledata og resultatrapporter inn i readme for å underbygge påstandene.

Reviewer(s): [Mason](#b-rekraft-mason), [Finley10](#b-rekraft-finley10), [Theo](#b-rekraft-theo), [Leo47](#b-rekraft-leo47)

--------------------------

**KI-bruk og tunge medieassets påvirker bærekraft**
Dette området tar opp bekymringen om KI-bruk og tunge medieassets som potensielt svekker bærekraften. Leo47 hevder at bruken av kunstig intelligens og av store bilder/videoer trekker betydelig strøm og ikke er spesielt bærekraftig i dagens løsning. Samtidig bemerker han at ressursvisningen begrenser dataoverføring og at det ikke forekommer unødvendige API-kall i søk eller filtrering, hvilket er positivt for bærekraften. Ingen konkrete tiltak ble foreslått av ham for å redusere KI-bruk eller mediebelastning, men kommentaren viser en avveining som må adresseres i videre arbeid.

Reviewer(s): [Leo47](#b-rekraft-leo47)

---

## Bruk av kunstig intelligens

**Kontroll av KI-generert kode for å unngå feil**
Leo47 peker på en potensiell risiko ved at all kode i prosjektet er generert av KI. Selv om bruken og dokumentasjonen er tydelig, kan KI-generert kode inneholde feil som er vanskelige å oppdage og rette opp i, noe som kan påvirke vedlikehold og stabilitet. Dette understreker behovet for strengere kontroll og validering av KI-generert innhold, samt målrettede kvalitetskontroller eller tester som fokuserer på KI-implementasjonen. En tydelig sporbarhet mellom KI-generert og menneskegjort kode vil også gjøre det enklere å spore og rette opp i feil.

Reviewer(s): [Leo47](#bruk-av-kunstig-intelligens-leo47)

Mulige forbedringer i KI-bruken: testing og tilgjengelighet
Finley10 foreslår konkrete områder der KI-bruken kan utvides for å styrke prosjektet. Han nevner autogenererte a11y-sjekklister, ARIA-forslag, semantikk og behandling av Lighthouse-funn, samt muligheten til å generere edge-case-tester, property-based tester, mutasjonstesting og visuelle tester for UI. Dette indikerer at selv om bruken er solid, finnes det rom for å bruke KI mer målrettet i testing og tilgjengelighet. Å implementere disse tilnærmingene vil kunne forbedre brukeropplevelsen og redusere risikoen for manglende tester. Det bør vurderes i neste iterasjon og integreres i arbeidsflyten med klare retningslinjer for hvordan KI-generert testinnhold brukes.

Reviewer(s): [Finley10](#bruk-av-kunstig-intelligens-finley10)

---

## Tekniske valg

**Behov for global state management og arkitekturvurdering**  
Det pekes på at det ikke finnes en tydelig global state management-løsning for bruker- og sesjonsdata. Per i dag brukes hovedsakelig lokale React-hooks for UI-state, mens det planlegges å flytte mer global state til en klient-cache (Redux/Apollo-state) senere. Dette blir sett på som en fornuftig progresjon, men Leo47 advarer om at manglende felles state-management kan gjøre koden mer kompleks og vanskelig å vedlikeholde når appen vokser. Mason bekrefter planen om å bruke Redux/Apollo for global state, noe som gir en konsistent arkitektur, men også migrasjonsarbeidet som følger med. For å dempe risiko bør dere vurdere å implementere en tydelig global state-struktur tidlig og definere grensesnitt mellom UI-state i hooks og server-/brukerstate som planlagt. Reviewer(s): [Mason](#tekniske-valg-mason), [Leo47](#tekniske-valg-leo47)

------------------------------

**Navigasjon uten URL-ruting og dyp lenking**  
Xander48 påpeker at appen bruker en egen navigasjonsløsning (usePageNavigation) i stedet for react-router-dom, noe som gir enkel “single-page” navigasjon uten reell URL-endring. Dette gir fullt kontrollert state, men gjør det vanskelig å støtte dyp-lenking eller browser-navigasjon med back/forward-knapper. Samtidig blir det hevdet at denne løsningen er forståelig for et spill, der man ikke trenger robust URL-routing. Forslaget er å vurdere react-router for en mer robust og standardbasert navigasjon, spesielt hvis behovet for delte ruter eller korrekt back-forward-adferd øker. Reviewer(s): [Xander48](#tekniske-valg-xander48)

------------------------------

**Filstruktur og dokumentasjon – behov for innsikt og forklaring**  
Finley10 peker på at prosjektet har mange frontend-komponentfiler og at det kan være vanskelig å sette seg inn uten en klar forklaring av filstrukturen. Dette kan gjøre onboarding og videre bidrag mindre tilgjengelig for nye utviklere. Forslaget er å tilføre bedre dokumentasjon, inklusive en arkitekturoversikt og kanskje en enkel filstrukturguide som forklarer hovedkategorier og ansvar. Dette vil trolig redusere innslipskostnader og gjøre det lettere å bidra. Reviewer(s): [Finley10](#tekniske-valg-finley10)

------------------------------

**Sikkerhet — JWT-hemmelighet og miljøhåndtering**  
Mason peker på sikkerhetsaspekter som bør styrkes, blant annet at JWT-hemmeligheten ikke bør være hardkodet og må hentes fra miljøvariabler, samt at env-vars og riktig rulling (rate limiting) bør være på plass for å beskytte mot misbruk. Dette har direkte konsekvenser for tettheten og sikkerheten til autentisering og session-håndtering. En løsning vil være å fjerne hardkodede hemmeligheter, implementere miljøbasert konfigurering og sikre at deploy-miljøene har nødvendige variabler satt, samt å bekrefte og muligvis forbedre rate-limiting-strategien. Reviewer(s): [Mason](#tekniske-valg-mason)

------------------------------

**NPM install-varsel – mindre men merkbart**  
Xander48 nevner en liten warning som dukker opp ved kjøring av npm install. Dette er en mindre, ikke-drasiliøs variasjon som ikke graver dypt i prosjektets funksjonalitet, men det kan være lurt å undersøke avhengighetskonfigurasjonen for å rydde opp i advarselen. Reviewer(s): [Xander48](#tekniske-valg-xander48)

---

## Kodekvalitet

**README er for stor og mangler innholdsfortegnelse**
3–6 setninger integrerer hva, hvor, effekt og forslag på naturlig vis. Xander48 roser README for grundighet og arkitektur-dokumentasjon, men peker samtidig på at dokumentasjonen blir litt for stor og kunne hatt en innholdsfortegnelse for lettere navigering. Dette kan gjøre det tidkrevende å finne spesifikk informasjon raskt. Forbedringen vil være å legge til en innholdsfortegnelse og eventuelt gruppere innholdet i klare seksjoner slik at leseren lettere får oversikt. Dette ble nevnt som ett viktig forbedringspunkt.

Reviewer(s): [Xander48](#kodekvalitet-xander48)


**Koding og dokumentasjon: store filer og behov for bedre dokumentasjon**
3–6 setninger integrerer hva, hvor, effekt og forslag på naturlig vis. Mason peker på at PokemonMap.tsx er veldig stor og kunne vært delt opp i flere komponenter, noe som vil lette lesbarhet og vedlikehold. Samtidig påpekes det at koden kunne hatt mer dokumentasjon slik at den blir lettere å forstå for nye bidragsytere. Denne kombinerte tilnærmingen peker mot behov for deling av store filer samt forbedret dokumentasjon i koden. Å bryte opp store komponentfiler og å utvide dokumentasjonen vil sannsynligvis gjøre prosjektet lettere å navigere og vedlikeholde over tid.

Reviewer(s): [Mason](#kodekvalitet-mason)


**Mer detaljerte feilmeldinger**
3–6 setninger integrerer hva, hvor, effekt og forslag på naturlig vis. Vera foreslår at feilmeldinger kunne vært litt mer detaljerte, selv om systemet allerede virker robust i håndtering av feil (f.eks. 500-feil). Økt detaljeringsgrad i feilmeldingene vil forbedre feilsøking og brukeropplevelsen ved feiltilstander. Forslaget strekker seg ikke til spesifikke implementasjonsdetaljer i feedbacken, men indikerer et kvalitetsområde å forbedre i prosjektet.

Reviewer(s): [Vera](#kodekvalitet-vera)


**Delte ressurser og ryddeoppgave: flytt til en fellesmappe**
3–6 setninger integrerer hva, hvor, effekt og forslag på naturlig vis. Leo47 peker på at det finnes mapper for komponenter og hooks utenfor feature-mappene som virker å være generelle ressurser. Dette gjør strukturen litt mindre ryddig. En løsning er å flytte disse til en felles mappe kalt "shared" for bedre oversikt og lettere gjenbruk. Ved å samle delte ressurser i én felles plass reduseres kompleksiteten i prosjektstrukturen og forbedres vedlikeholdbarheten.

Reviewer(s): [Leo47](#kodekvalitet-leo47)

---


# Original Feedback

## Tilgjengelighet

<a id="tilgjengelighet-xander48"></a>
**Reviewer Xander48:**

> Nettsiden er fult mulig å navigere med tastaturen, som er supert med tanke på hvor kompleks appen deres er.
> 
> Alle bildene har alt tekst, som er veldig bra for tilgjengelighet.
> 
> Nettsiden bruker noen semantisk html, men bruker veldig mye divs og spans. Dette kan må forstå da de har utviklet en spillapplikasjon.

<a id="tilgjengelighet-mason"></a>
**Reviewer Mason:**

> Applikasjonen har god tilgjengelighet med semantisk kode, og man kan navigere med tastatur. Når jeg sjekket med lighthouse får applikasjonen score 90 av 100 på tilgjengelighet. Forbedringspoteniale er at knapper bør ha tilgjengelige navn, det er ikke nok kontrast mellom bakgrunn-farge og andre elementer, ARIA brukes på elementer som ikke bør ha det. 

<a id="tilgjengelighet-tina"></a>
**Reviewer Tina:**

> Testet å bruke applikasjonen kun med tastatur, det var mulig men litt vanskelig.
> Testet nettsiden gjennom google lighthouse hvor dere får en veldig god score på tilgjengelighet.
> Accessibility 92
> 
> 

<a id="tilgjengelighet-vera"></a>
**Reviewer Vera:**

> 
> Jeg ser at dere bruker aria-labels, som er veldig bra. Jeg prøvde å sjekke om dere hadde en aria-label som kunne lese opp informasjon om en spesifikk Pokemon, men dette fant ikke det. Det hadde vært kult om dere fikk det til! Ellers virker nettsiden godt tilrettelagt for tilgjengelighet.

<a id="tilgjengelighet-theo"></a>
**Reviewer Theo:**

> Applikasjonen scorer 92 på tilgjengelighet i Lighthouse, noe som viser god bruk av semantisk HTML og generelt høy tilgjengelighet. Det eneste forbedringspunktet er at noen knapper mangler accessible names, men ellers fungerer løsningen godt for ulike brukere.

<a id="tilgjengelighet-finley10"></a>
**Reviewer Finley10:**

> Løsningen har et greit underlag: kjernehandlinger er knapper \(ikke klikkbare div-er\), tastaturnavigasjon \(Tab/Shift+Tab\) fungerer, og debounce/lazy loading gir mindre layout-jitter. Samtidig fungerer ikke skjermleseropplevelsen i praksis: det mangler semantiske landemerker og tydelig overskriftsstruktur, flere kontroller \(Start/Select/A/B, filtre\) har manglende tilgjengelige navn, og dekorative elementer eksponeres for hjelpemidler og skaper støy. Modaler mangler forutsigbar fokusstyring. Enkelte fargekombinasjoner ser ut til å bryte WCAG AA-kontrast. Dere bruker heller ikke så mye semantiske HTML elementer - det er veldig mange divs. Eksempl på fargekombinasjoner: GameBoy-skjerm: når lys grå tekst legges over den olivenfargen, blir kontrasten for lav.

<a id="tilgjengelighet-leo47"></a>
**Reviewer Leo47:**

> Det går ikke an å nå navigasjonbaren med kun tastaturet, noe som gjør det vanskelig å nå. Lighthouse analyse viser at det er ganske høy tilgjengelighet, men med noen mangler. For eksempel er det knapper som ikke kan leses av skjermleser og aria-tags brukt feil. Men det at det brukes mange aria-tags og semantiske tags er positivt.

---

## Funksjonalitet

<a id="funksjonalitet-xander48"></a>
**Reviewer Xander48:**

> Gruppen har laget en webapplikasjon som kombinerer et inkrementelt klikkespill med en søkbar Pokémon-database. 
> 
> Pokédex siden viser pokemons i en grid, hvor man kan gå til neste side til å se flere. 
> Dette er veldig bra med tanke på funksjonalitet.
> 
> Sorterings-, søking- og filtreringsfunksjonalitet fungerer fint, er intuitivt å bruke og er veldig imponerende.
> 
> Nettsiden har funksjonalitet for å registrere nye brukere, og innloggingsfunksjonalitet som fungerer veldig fint.
> 
> Pokémonclickeren fungerer veldig fint og er veldig imponerende!
> 
> Darkmode ser veldig bra ut. Det virker som valg av darkmode huskes lokalt, men huskes ikke når man er logget inn. Altså bør valg av light/darkmode huskes når man er logget inn.
> 
> World siden deres er helt rått! Selv om det er noen bugs med den,er den en veldig 
> utfordrende løsning med tanke på funksjonalitetskravene.
> 
> Konklusjon: Dere har en veldig imponerende app med tanke på funksjonalitet. Alt fungerer som det skal, alt er brukervennlig. Appen deres er også skalerbar med pagination of pokémons i pokédexsiden. Fantastisk jobbet med dette prosjektet! Dere har gått for veldig utfordrende løsninger, og har klart det veldig bra.

<a id="funksjonalitet-mason"></a>
**Reviewer Mason:**

> Gruppen har laget et spill, der man kan unlocke Pokémons av å "tjene" godteri ved å klikke på en klikker side. Man kan også oppgradere Pokémons, og de har også laget en "world" side der man kan gå rundt i et univers, og møte på andre Pokémons som man kan kjempe mot. Det er en veldig godt gjennomført applikasjon, med godt gjennomtenkte valg mtp utforming. På siden der man kan se hvilke Pokémons man har unlocket og ikke, har de en fungerende søkefunksjon som søker automatisk på tastetrykk, og en filtreringsfunksjon som også funker fint, bra! 
> 
> Jeg er spesielt imponert over world siden, der man kan gå rundt, og verdenen oppdateres når man beveger på seg. Det er også Pokémons vilkårlig plassert rundt, og med en gang man er i nærheten av en, får man opp muligheten til å ha en battle. Det er en veldig profesjonell applikasjon, som har gode løsninger. 
> 
> Jeg synes det var en applikasjon som var gøy å utforske, man blir motivert til å bli på siden lenger siden man kan oppgradere Pokémons og gå rundt, og det gir engod brukeropplevelse. 
> 
> Det er tydelig at gruppen har brukt tid på prosjektet, brukt kunstig intelligens på en fornuftig måte for å rekke å lage mye funksjonalitet, og de har gått for mer utfordrende løsninger fremfor trivielle. 

<a id="funksjonalitet-tina"></a>
**Reviewer Tina:**

> Veldig kreativ og kul applikasjon!
> Gode løsninger som ligner profesjonelle clicker spill.
> Alt ser egentlig veldig bra ut og gir en god brukeropplevelse :\)

<a id="funksjonalitet-vera"></a>
**Reviewer Vera:**

> Nettsiden ser veldig bra ut! Jeg ser at dere har lagt inn søk, filtrering og sorterings muligheter. Nettsiden føles rask og responsiv ut. 
> 
> Spillet på World-siden ser ut til å fungere godt, veldig imponerende at dere har fått det til!
> 
> I Pokedex fikk jeg etter hvert en feilmelding: «Error loading Pokémon \(status code 500\)», så fikk ikke sjekket om søking, filtrering og sortering fungerer som det skal.
> 
> 
> Jeg savner at man ikke kan trykke på Pokeclicker-logoen for å komme tilbake til hovedsiden \(oversikten over Pokemon\). Jeg fikk heller ikke valgt favoritt-Pokemon i profilen min, men regner med det er noe dere skal fikse etter hvert. 
> 
> Ellers sykt bra jobba! nettsiden ser veldig bra ut! 
> 

<a id="funksjonalitet-theo"></a>
**Reviewer Theo:**

> Dere har laget et lite dataspill kalt PokeClicker. Jeg synes dere har løst funksjonaliteten veldig bra. Løsningen er responsiv, og all interaksjon foregår veldig smidig, noe som gir en god og behagelig brukeropplevelse. Det eneste jeg ikke helt forsto, var hvordan man skulle spille under kategorien World. Ellers har dere laget et veldig spennende og utfordrende prosjekt! Det ble ikke bare en nettside, men et spill. Bra jobba!

<a id="funksjonalitet-finley10"></a>
**Reviewer Finley10:**

> Dette ligger over det jeg forventer av et student prosjekt beta og ligner en profesjonell applikasjon. Pokedex-delen har tydelig søk + filterpanel og paginering, og detaljvisning gir god videre interaksjon per objekt. Klikker-/oppgradering, verden og profil med favoritt/statistikk dekker kravet om brukergenererte data. Kodebasen \(eget-filter-context, GraphQL-queries/mutations\) tyder på serverstyrt filtering og paginering, bra for skalerbarhet på store datasett. Debounced søk \(300ms\), virtualisert karusell \(reduserer API-kall ~90%\) og IndexedDB viser moden interaksjonsdesign 
> "World"-kartet med tile-basert rendering + LRU cache + prioritert lasting er ambisiøst, interaktiv element som hever helheten
> For å løfte mer:
> Ville også kanskje gjøre det mulig å filtrere på pris. Og kanskje ha sortering ikke bare i sammen med filtrering. Kan ikke spille på "World" på mobil. Pluss ser at rare candy blir lagret i en signed 32-bit integer som bare tillater litt over 2 billioner rare candies og det er ikke nok for å kjøpe top pokemons.

<a id="funksjonalitet-leo47"></a>
**Reviewer Leo47:**

> Siden er et helt spill og har derfor veldig mange funksjonaliteter. Siden for visning av pokemon fungerer veldig bra. Den er veldig ryddig og pagination fungerer fint. Det er også muligheter for å filtrere, søke og sortere på parametere som gir mening, og det er implementert på en brukervennlig måte. Det går også an å se mer detaljer og bla seg igjennom en ressurs om gangen. "Clicker"-funksjonaliteten fungerer også bra.
> 
> Den delen av applikasjonen som heter world er dessverre AI-slop som er veldig forvirrende og buggy. Denne delen kan like gjerne fjernes, og byttes med en forenklet løsning som ikke går ut på å gjenskape et pokemon-spill i nettleseren.

---

## Design og utforming

<a id="design-og-utforming-xander48"></a>
**Reviewer Xander48:**

> Kjempe bra jobbet med designet! Dere har gått for en tidlig 2000 Gameboy/flash era style, og det fungerer veldig fint!
> Dere har også et fullt responsivt design, som passer for skjermer av alle størrelser.
> Darkmode deres ser også bra ut.

<a id="design-og-utforming-mason"></a>
**Reviewer Mason:**

> Siden har en "old school"-look, med et gameboy grensesnitt, og alle sidene har med vilje en retro følelse med lav oppløsning på selve gameboy skjermen, og på bildene av Pokémons. Det gir en nostalgisk følelse, og det er et gjennomført design med en rød tråd på alle sidene. Alle elementer er fornuftig plassert, og det er god affordance i forhold til hva man kan gjøre med de ulike knappene og elementene på sidene. Man har mulighet til å toggle mellom light mode og dark mode, som også er en fin detalj.
> 
> Gruppen har laget et responsivt design, og siden tilpasser seg fint når skjermen blir mindre både i bredden og i høyden. 
> 
> Applikasjonen er alt i alt estetisk tilfredsstillende, med en gjennomført look.

<a id="design-og-utforming-tina"></a>
**Reviewer Tina:**

> Applikasjonen er veldig estetisk og ser veldig bra ut. Synes alt faller godt inn under stilen. Den er veldig responsiv og fungerer på alle oppløsninger. 

<a id="design-og-utforming-vera"></a>
**Reviewer Vera:**

> Designet er sykt imponerende. Ser veldig profesjonelt ut. Liker spesielt godt de pikselerte elementene. Overgangen mellom dark og light mode fungerer godt. Nettsiden er også responsiv. 

<a id="design-og-utforming-theo"></a>
**Reviewer Theo:**

> Når det kommer til design og utforming, er dette løst på en veldig kreativ måte og i tråd med spillets tematikk. Jeg ser helheten, og samtidig virker det ikke overdrevet. Spillet tilpasser seg også ulike skjermstørrelser :\)

<a id="design-og-utforming-finley10"></a>
**Reviewer Finley10:**

> Helheltig GameBoy/pixel-art-estetikk med tydelig visuell identitet, god typografisk hierarki \(store titler, korttittel\). Kort i Pokedex gir ryddig "scanability"; type-badges og fargelagte kort gir rask kategori gjenkjenning. Karusell og "unlock" har tydelig fokusindikator og primærhandling, bra affordance. Mørk/lys bryter  og konsekvent spacing gir et polert inntrykk. Det ser bra ut på både desktop og mobil.
> Forbedringer:
> Legg til hover på "Filters" og NavBar slik man vet hva man har musen over.
> Husk at Filters-knappen, type-badges, NavBar-knapper og "unlock" burde ha minst 44x44 px hit area selv om ikonet/teksten er mindre.

<a id="design-og-utforming-leo47"></a>
**Reviewer Leo47:**

> Siden har et retrotema som ser veldig bra ut og passer perfekt med innholdet på siden. Navigeringen er enkel og brukervennlig, og det går enkelt an å bytte mellom light og dark mode, hvor begge ser bra ut. Siden tilpasser seg forskjellige skjermstørrelser, men på smale skjermer er filteret litt bredere enn skjermen, og det vises bare en pokemon per side, med en ny meny for å velge blant det første utvalget, noe som er litt rart. Men alt i alt ser det estetiske fantastisk ut.

---

## Bærekraft

<a id="b-rekraft-xander48"></a>
**Reviewer Xander48:**

> Gruppen har implementert debounced søk, lazy loading, optimalisert rendering, effektiv dataoverføring og darkmode. React.lazy\(\) for route-based code splitting gjør at bundle size ble betydelig redusert. Gruppen har altså løst kravene med tanke på bærekraftig utvikling.
> 
> Noe som kan forbedres er at darkmode bør være den default theme når man først besøker nettsiden.
> 

<a id="b-rekraft-mason"></a>
**Reviewer Mason:**

> Gruppen har skrevet om bærekraft i readme, som viser at dette er noe de har hatt i bakhodet under utviklingsprosessen. De har fått en bundle size optimalisering som de har skrevet har forbedret bundle size betydelig, fra 623 kB til 12 kB. Dette gir mindre dataoverføring og dermed lavere energiforbruk på nettverket, kortere CPU-tid på enheter, og lavere CO₂-utslipp fra datasentre. Bra!
> 
> De har også skrevet at muligheten for dark mode kan gi 60% energi-reduksjon. Dette er et omdiskutert tema om det faktisk hjelper å ha dark mode i forhold til energi-sparing, spesielt fordi brukere da ofte har på høyere lysstyrke på skjermen. Men, siden gruppen har mulighet til å toggle mellom light mode og dark mode er dette uansett et fint tiltak for bærekraft. 
> 
> Gruppen har også brukt lazy loading, at hver feature kun lastes når den trengs. Det er veldig bra! Dette kombinert med god caching-strategi sparer mye energi. 
> 
> Alt I alt en godt gjennomtenkt bruk av strategier for å sikre bærekraft i prosjektet. 

<a id="b-rekraft-tina"></a>
**Reviewer Tina:**

> Synes dere har tatt gode valg.
> Dere bruker lazy loaded components, som er veldig bra.
> Måten dere gjør kall til databasen er løst på en veldig god måte slik at dere ikke unødvendige kall.
> Dere har også en veldig god caching for å spare minne.

<a id="b-rekraft-vera"></a>
**Reviewer Vera:**

> Bra fokus på ytelse og bærekraft! Dere har tenkt på ting som lazy loading, caching og dark mode for å gjøre siden mer bærekraftig.  Bra!

<a id="b-rekraft-theo"></a>
**Reviewer Theo:**

> Dere har valgt effektive og bærekraftige løsninger, blant annet gjennom caching som reduserer datatrafikk og bruk av lette verktøy som Tailwind CSS. Bilder og design er brukt med måte, og dark mode viser omtanke for både brukeropplevelse og energieffektivitet.

<a id="b-rekraft-finley10"></a>
**Reviewer Finley10:**

> Gruppen har dokumentert veldig bra rundt bærekraft.
> WebP-bilder og tile-basert kart med LRU-cache og prioritert lasting, gir mindre bytes, færre forespørsler og kun synlige tiles lastes.
> Lazy loading + code splitting \(stor reduksjon av initial bundle\). Det har stor effekt på energi/data.
> Virtualisert karusell kutter 90% av API-kall ved detaljvisning. Blir mindre nettverk og raskere UI
> MongoDB metadata og PokeAPI med 20 detaljer per side er skalerbart og effektivt 
> God praksis rundt rate limiting, lazy loading av tunge moduler og dokumenterte måltall \(latens/forbedringer\)
> Bærekraftsarbeidet er veldig bra for gruppe 26, dere har tenkt på "green web" for denne underveisinnlevering.
> 

<a id="b-rekraft-leo47"></a>
**Reviewer Leo47:**

> Gruppen har brukt veldig mye KI i prosjektet som ikke er veldig bærekraftig ettersom det bruker veldig mye strøm. Siden bruker også veldig mye store bilder og videoer som heller ikke er spesielt bærekraftig. 
> 
> Det er brukt mange farger og custom font, men dette er viktig for brukeropplevelsen av siden. 
> 
> I ressursvisningen lastes det kun inn et utvalg ressurser som begrenser dataoverføring. Det gjøres heller ikke unødvendige API-kall i søk eller filtrering.

---

## Bruk av kunstig intelligens

<a id="bruk-av-kunstig-intelligens-xander48"></a>
**Reviewer Xander48:**

> Gruppen har brukt veldig mye KI i dette prosjektet. Dette er klart dokumentert, og de har klart dokumentert hvordan de har utviklet med KI. All kode fra KI har blitt gjennomgått.

<a id="bruk-av-kunstig-intelligens-mason"></a>
**Reviewer Mason:**

> Gruppen har skrevet omfattende om bruk av AI i readme. De har brukt Claude code til å skrive mesteparten av koden, og gruppemedlemmene har kvalitetstesten og tatt design-valg og definert krav. Basert på hvor mye gruppen har fått gjort, viser det at de har tatt kloke valg når det kommer til bruk av AI. Siden AI allerede har stått for det meste av kodebasen, er det nok ikke noe måte de kunne brukt det mer effektivt. Jeg syns appen har en fin rød tråd, og det er tydelig at de har laget klare krav for utviklingen som gjøre bruken av AI lettere.  

<a id="bruk-av-kunstig-intelligens-tina"></a>
**Reviewer Tina:**

> Veldig god dokumentasjon på bruk av AI.
> Dere har veldig god oversikt, og bruken dere beskriver er god. Liker spesielt godt at dere har dokumentert hvordan bruken kan forbedres på senere prosjekter.

<a id="bruk-av-kunstig-intelligens-vera"></a>
**Reviewer Vera:**

> Dere har brukt AI på en fornuftig måte, det virker som dere har kontroll på hva som faktisk er generert og hva dere har gjort selv. 

<a id="bruk-av-kunstig-intelligens-theo"></a>
**Reviewer Theo:**

> Bruk av kunstig intelligens er tydelig og klart dokumentert i README fil. 

<a id="bruk-av-kunstig-intelligens-finley10"></a>
**Reviewer Finley10:**

> Gruppen beskriver en klar og ansvarlig KI-prosess: Omfattende bruk av Claude Code til kodegenerering \(frontend, GraphQL, DB-lag, tester\) kombinert med menneskelig tilsyn, manuell inspeksjon, iterativ forbedring og eksplisitt kvalitetskontroll \(sikkerhet, ytelse, edge cases. Rollen til KI vs teamet er tydelig: KI håndterer implementasjonsdetaljer, teamet eier arkitektur og UX. Dette er en modern modell for KI-samutvikling og gir god forklaring på hvordan og hvorfor KI ble brukt.
> Forslag til hvor dere kunne ha brukt KI til å forbedre jobbingen:
> Sjekke tilgjengelighet: Autogenererte a11y-sjekklister, forslag til ARIA, semantikk, og automatisk behandling av Lighthouse-funn.
> Videre kan den brukes til å generere edge-case-tester, property-based-tester, enkel mutasjonstesting og visuelle tester for UI.

<a id="bruk-av-kunstig-intelligens-leo47"></a>
**Reviewer Leo47:**

> Gruppen har brukt KI til all kode i prosjektet.\(Og dokumentasjon virker det som\). Dette er dokumentert, samt hvordan gruppen har jobbet med KI for å sørge for at det ble et bra produkt. For mer effektiv KI bruk kunne man vurdert enda mer nøye hva som ble lagt inn sånn at man ikke legger inn feil i kodebasen, som er vanskelig å finne og rette opp i.

---

## Tekniske valg

<a id="tekniske-valg-xander48"></a>
**Reviewer Xander48:**

> Som sagt er deres prosjekt veldig imponerende med tanke på både funksjonalitet og tekniske valg.
> 
> Dere bruker et søkefelt med debouncing for case-insensitive søk, dette er veldig bra!
> 
> Veldig bra at dere bruker React.lazy\(\) + Suspense, som gir code splitting, reduserer bundle size og forbedrer initial load time.
> 
> Svært god bruk av React Hooks og Context API, som useAuth, useOnboarding og usePokemonModal.
> 
> Appen deres bruker en egen som er usePageNavigation i stedet for react-router-dom. Dette gir enklere “single-page” navigasjon uten reell URL-endring. Dette gir fullt kontrollert state, men man har ingen dyp-lenking eller browser-navigasjon med back/forward-knapper.
> Dette er forståelig for et spill, der dere ikke har noe særlig behov for URL-routing. Uansett bør dere vurderer react-router for mer robust navigasjon.
> 
> Dere har et komplekst onboarding-system som har stegvis progresjon \(step, nextStep, previousStep\). Dette er en kul løsning for en gamifisert app.
> 
> Man får en liten warning når man kjører npm install.
> 
> Alt i alt er appen deres veldig imponerende med tanke på tekniske valg, og veldig robust.

<a id="tekniske-valg-mason"></a>
**Reviewer Mason:**

> De bruker “vanlig” React-hooks til state nå, og skriver at Redux/Apollo-state er planlagt for bruker-/sesjonsdata. Det er en fornuftig progresjon: lokal UI-state i hooks, mer global autorisasjon/profil i klient-cache senere. Det viser at de har skilt mellom “ephemeral UI-state” og “server-/brukerstate”.
> 
> React.lazy + Suspense for rute-baserte views er helt riktig når appen består av tunge deler \(clicker, detaljmodal, login\). 98 % reduksjon i initial bundle tyder på at de faktisk har målt og optimalisert, ikke bare snakket om det.
> 
> Valget av MongoDB er godt begrunnet: én bruker betyr ett dokument med stats + eide Pokémon + noen arrays, så da passer dokumentdatabase bedre enn postgreSQL med mulighet for relasjonelle joins.
> 
> To-nivå-cache \(24t for statiske Pokémon-data, 5 min for brukerdata\) er også et modent valg: lang TTL på det som ikke endres, kort TTL på det som gjør det.
> 
> Når det kommer til sikkerhet er det også tatt gode valg: fjerne hardkodet JWT-secret, kreve env-vars, rate limiting tilpasset clicker-spill \(mange requests, men fortsatt beskyttelse\) – dette er gjennomtenkt.
> 
> Alt I alt er det tatt gode valg som viser god forståelse. 

<a id="tekniske-valg-tina"></a>
**Reviewer Tina:**

> Her synes jeg dere har tatt gode valg! 
> Dere har et godt oppsett for å ikke gjøre unødvendige kall til databasen. Veldig smart å kun bruke PokeAPI når det er helt nødvendig. Dokumentasjonen deres viser hvordan dette fungerer veldig bra, det er ingen tvil om at dere har god forståelse.

<a id="tekniske-valg-vera"></a>
**Reviewer Vera:**

> React + TypeScript + MongoDB + GraphQL er gode valg. Virker som dere har god kontroll på arkitekturen. Ser dere bruker Lazy loading og Suspense som er bra. Jeg liker at dere har delt opp appen i tydelige features \(auth, clicker, map, profile osv\). 

<a id="tekniske-valg-theo"></a>
**Reviewer Theo:**

> Prosjektet viser god forståelse for moderne webutvikling. Dere har brukt React med TypeScript og strukturert koden med egne mapper for komponenter, hooks og contexts, noe som tyder på god håndtering av state og logikk. Bruken av caching i backend forbedrer ytelsen og reduserer unødvendige kall mot API-et. Dere har også tatt i bruk tredjepartsbiblioteker som Tailwind CSS, ESLint og Vitest, som bidrar til bedre design, kodekvalitet og testing. Alt i alt viser prosjektet gjennomtenkte tekniske valg som passer godt til oppgavens omfang.

<a id="tekniske-valg-finley10"></a>
**Reviewer Finley10:**

> Dere har gjort gjennomtenkte og modne valg for innleveringen:
> GraphQL-backend med MongoDB-metadata og PokeAPI-detaljer er riktig grep: Spørring, filtering og sortering skjer i DB, og kun 20 detaljer hentes per side. Dette skalerer og unngår "last alt, filtrer i klienten".
> Fornuftig bruk av Apollo Client og egne contexts og hooks \(auth, pokedex, clicker\). Klient state i hooks og server-state via Apollo er en ren separasjon. IndexedDB for tile-cache og node-cache på server gir gode latensgevinster.
> Gode grep som code splitting, lazy loading, debounced søk, virtuell rendering i karusell og en ambisiøs tile-basert map motor med LRU-cache.
> Ikke særlig forslag til forbedringer, men siden dere har så mye er det vanskelig å sette seg inni prosjektet uten en forklaring av hvordan filstrukturen i prosjektet fungerer. For eksempel så har dere mange components filer inni frontend. Uansett så har dere forklart veldig bra om alt dere har gjort, likte forklaringene på spesifikke issues.

<a id="tekniske-valg-leo47"></a>
**Reviewer Leo47:**

> Prosjektet bruker node-cache for caching, og det er godt beskrevet hvordan det brukes. Det virker ikke å være brukt 3. parts komponenter, men dette kan være fordi designet på siden er ganske unikt, og det derfor er lettere å KI-generere dem. React programmeringen er god, men har ofte veldig komplisert og veldig vanskelig å sette seg inn i. Det brukes ingen state management biblioteker, dette bør vurderes for å forenkle koden.

---

## Kodekvalitet

<a id="kodekvalitet-xander48"></a>
**Reviewer Xander48:**

> 
> 
> Dere skiller klart mellom backend- og frontendfunksjonalitet ved bruk av backend og frontend mapper. Dette er bra.
> 
> Koden er ryddig og lesebar. Navn til filene gir mening, og det er lett å finne det man letter etter \(komponenter er i en egen mappe, samme for hooks osv.\).
> 
> README deres er fantastisk. Jeg skal basere vår README på deres. Dere har en full log av alle endringene som ble gjort under hvert underveisinnlevering. Dere har dokumentert alle valgene deres, og dere har til og med arkitektur diagram, som er på nivået av det man forventer i Programvarearkitektur!
> Derimot er README deres litt stor, så det kunne ha vært fint med en innholdsfortegnelse/table of contents.

<a id="kodekvalitet-mason"></a>
**Reviewer Mason:**

> Prosjektet er organisert fint i mapper, med egen frontend og backend mappe, som viser god struktur og ryddighet. Gruppen har ikke lagt inn sider i pages, men heller laget features, og har egne komponenter og hooks inne i hver mappe for hver side. Det fungerer fint fordi all koden for hver side da blir samlet på et sted. Gruppen har god bruk av komponenter og hooks for å gir mulighet for lettere gjenbruk av kode. 
> Fordelene med feature basert struktur er: 
> - Klar separasjon av bekymringer \(separation of concerns\)
> - Lett å finne relatert kode
> - Skalerbar struktur som vokser med prosjektet
> - Følger Bulletproof React best practices
> 
> Gruppen har også konsistent navngivning og god bruk av komponenter. Et forbedringspotensiale gruppen har, er at noen filer er litt store. For eksempel er PokemonMap.tsx veldig stor, og kunne vært delt inn i flere komponenter. Siste pirk er at koden kunne hatt mer dokumentasjon så den hadde vært lettere å forstå:\) 
> 

<a id="kodekvalitet-tina"></a>
**Reviewer Tina:**

> Synes kodebasen er oversiktlig og dere har fine gjenbrukbare komponenter.
> Ser dere også bruker prettier for holde god linjeoversikt i filer.
> Navn på filer følger best practise og dere har fine kommentarer i filer som gjøre de lesbare.

<a id="kodekvalitet-vera"></a>
**Reviewer Vera:**

> Koden er ryddig og oversiktlig, man ser at det er struktur i prosjektet. Fin mappestruktur. Dere håndterer feil på en fin måte \( eks den 500-feilen\), så det virker robust. Kunne kanskje hatt litt mer detaljerte feilmeldinger, men ellers supert.

<a id="kodekvalitet-theo"></a>
**Reviewer Theo:**

> Koden er ryddig og godt organisert med tydelig struktur i mapper for komponenter, hooks og contexts. Navngivingen er konsistent, og komponentene virker gjenbrukbare og lett å forstå. Løsningen følger god praksis for React og viser fokus på kvalitet og struktur.

<a id="kodekvalitet-finley10"></a>
**Reviewer Finley10:**

> Det som er veldig bra: 
> Feature-first struktur \(features/pokedex|map ...\) med egne componets, hooks, utils per feature. Blir lav kobling/høy samhørighet. Eget datalag i lib/graphql og delte hooks/contexts for tverrgående state. Testoppsett på frontend og backend, mapper som __tests__ og test/ er tydelig. 
> Dere bruker flere kvalitetsverktøy: ESLint, Prettier, Husky og lint-staged, og Playwright for e2e. 
> God dokumentasjon med docs/ og driftarkitekturer. PNPM-workspace og tydelige env-filer gjør det reproduserbar.
> Dere har barrel-filer \(index.ts\) i alle undermapper for ryddige imports og enklere refaktorering. Dere har PascalCase for komponentfiler og camelCase for hooks og unngår å mikse.
> Har egentlig ingenting å kommentere på forbedringer, dere har tenkt på kodekvalitet.

<a id="kodekvalitet-leo47"></a>
**Reviewer Leo47:**

> Prosjektet har egne mapper for ulike features. Inni mappene ligger det alle komponenter eller custom hooks som hører til disse featurene. Dette er best practice mappestruktur for prosjekter som er så store som dette. Men det er også mapper for komponenter og hooks utenfor som virker å være for delte ressurser. Disse kan legges i en mappe med navn "shared" for mer ryddighet. Mye av koden er ganske komplisert, men virker å ha grei struktur.

---


---

**Takk for at du leste tilbakemeldingene!**
Husk å fylle ut [https://nettskjema.no/a/565641]!
