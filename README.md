# Ordner

Zentrales Management- und Steuerungssystem für Abteilungen, Themen und Aufgaben in einem
Unternehmen — kein To-do-Tool, sondern eine operative Steuerungszentrale, die jederzeit
schnell beantwortet: Welche Themen laufen? Wer ist verantwortlich? Was ist der Stand?
Was ist als Nächstes zu tun?

## Architektur

- **Next.js 15 (App Router) + React 19 + TypeScript** — Server Components für Datenanzeige,
  Server Actions für alle Schreiboperationen (kein separates REST/GraphQL-API nötig).
- **Tailwind CSS v4 + eigene, schlanke shadcn/ui-artige Komponentenbibliothek** (`src/components/ui`)
  auf Basis von Radix UI — konsistentes, reduziertes Business-UI.
- **Prisma ORM + SQLite** (`prisma/schema.prisma`) — relationales Datenmodell, das 1:1 auf
  PostgreSQL/Supabase migrierbar ist (Provider in `prisma/schema.prisma` austauschen).
- **Auth.js (NextAuth v5) mit Credentials-Provider** — Login per E-Mail/Passwort (bcrypt-Hash),
  JWT-Session, rollenbasierte Middleware (`src/middleware.ts`, `src/auth.config.ts`).
- **Server Actions** (`src/actions/*.ts`) kapseln alle Schreibvorgänge inkl. automatischer
  Aktivitätshistorie (`ActivityLogEntry`) und interner Benachrichtigungen (`Notification`).

## Datenmodell

```
Department 1───* Topic *───* User (participants, via TopicParticipant)
                 │  └── 1 Owner (User)
                 │
                 └── 1───* Task *───* User (participants, via TaskParticipant)
                              │  └── 1 Owner (User)
                              └── 1───* Comment (Statusverlauf)

Topic/Task ── 1───* ActivityLogEntry (automatische Änderungshistorie)
User ── 1───* Notification
```

Zentrale Entitäten (siehe `prisma/schema.prisma`): `User`, `Department`, `Topic`,
`TopicParticipant`, `Task`, `TaskParticipant`, `Comment`, `ActivityLogEntry`, `Notification`.
Jedes Topic/jede Task hat genau einen `ownerId` (Hauptverantwortlicher) und beliebig viele
Participants (Beteiligte) — visuell im UI klar unterschieden (Ring/Badge „V“ für verantwortlich).

## Seitenstruktur

| Route | Zweck |
|---|---|
| `/login` | Anmeldung |
| `/dashboard` | Persönliches Dashboard: Heute relevant, Meine Verantwortung, Kommende Aufgaben, Wartet auf Rückmeldung, Kritische Themen |
| `/my-tasks` | Meine Aufgaben (verantwortlich/beteiligt, Filter, Fälligkeit) |
| `/topics`, `/topics/[id]` | Themenübersicht (Tabelle + Kanban) und Themen-Detail mit Tabs (Übersicht, Aufgaben, Aktivität/Status, Dateien, Informationen) |
| `/tasks`, `/tasks/[id]` | Aufgabenübersicht und Aufgaben-Detail inkl. Statusverlauf/Kommentare |
| `/departments`, `/departments/[id]` | Abteilungsverwaltung |
| `/people`, `/people/[id]` | Personenverzeichnis mit Auslastung |
| `/notifications` | Benachrichtigungen |
| `/admin` | Nutzerverwaltung & Rollen (nur Administrator) |

Globale Suche über Themen, Aufgaben, Personen, Abteilungen und Kommentare via `⌘K` /
`Strg+K` (Command Palette, `src/components/search/command-palette.tsx`).

## Rollen

- **Administrator** — voller Zugriff, Nutzerverwaltung.
- **Führungskraft** — verwaltet Themen/Aufgaben der eigenen Abteilung.
- **Mitarbeiter** — bearbeitet eigene Aufgaben, kommentiert, aktualisiert Status.

Berechtigungslogik zentral in `src/lib/permissions.ts` — leicht erweiterbar.

## Lokale Entwicklung

```bash
npm install
cp .env.example .env        # AUTH_SECRET ggf. mit `openssl rand -base64 32` neu erzeugen
npx prisma migrate dev      # legt prisma/dev.db an
npx prisma db seed          # Demo-Daten (11 Abteilungen, 16 Nutzer, 12 Themen, 36 Aufgaben)
npm run dev
```

App läuft unter [http://localhost:3000](http://localhost:3000).

### Demo-Zugänge

| E-Mail | Passwort | Rolle |
|---|---|---|
| admin@ordner.app | admin123 | Administrator |
| anna.krause@ordner.app | demo123 | Führungskraft (Vertrieb) |
| jan.weber@ordner.app | demo123 | Mitarbeiter (Vertrieb) |

Weitere Nutzer siehe `prisma/seed.ts`, alle Mitarbeiter-/Führungskraft-Konten nutzen `demo123`.

## Nützliche Befehle

```bash
npm run build   # Produktions-Build (inkl. Typecheck & Lint)
npm run lint    # ESLint
npx prisma studio  # Datenbank-Browser
```
