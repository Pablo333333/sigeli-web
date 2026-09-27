# Talento — Web console

Operational console for **Talento**, the local-employment system used by mining companies and the communities in their influence area. This app is where a company runs a vacancy, a community board watches whether local people are being hired, and an auditor reviews trust and complaints.

Comuneros do not use this site. A session with role `COMUNERO` is rejected at login and sent back to the mobile app, which is their interface.

Stack: Next.js (App Router), Tailwind CSS. The UI talks to the Talento API (default `http://localhost:3001`).

## Who sees what

The sidebar is filtered by role. The same routes exist; items the role cannot use are hidden.

| Screen | ADMIN | EMPRESA | DIRECTIVA | AUDITOR | What the screen is for |
|---|---|---|---|---|---|
| Dashboard | yes | yes | yes | yes | Employment picture for the year |
| Heat maps | yes | yes | yes | yes | Where people, offers, and contracts sit in Áncash |
| Offers | yes | yes | yes | | Vacancies and the labor matrix |
| Applications | yes | yes | yes | | Pipeline from CV to hire |
| Contracts | yes | yes | yes | | Formalized hires |
| Communications | yes | yes | yes | | Evidence of messages on an application |
| Training | yes | yes | yes | | CV courses and the partner training program |
| Transparency | yes | | yes | yes | Trust traffic light of each community and company |
| Complaints | yes | yes | | | Inbox and official replies |
| Comuneros | yes | yes | yes | | Roster and CVs of community members |

The panel title changes with the role: company panel, community-board panel, or administrative panel.

## Dashboard

The home screen answers “how is local employment going this year?”. Filters are sector, gender, labor type, year, and company.

It shows:

- registered comuneros, split by sex and by age band (18–20, 21–25, 26–30, 31–35, over 35)
- offers and contracts over the months
- labor type (unskilled through professional internships)
- how many people report having gone through the partner labor-training program

Those cuts exist because local-employment commitments are reported by territory, by gender, and by skill level, not as a single headcount.

## Heat maps

Population centers in the influence area (Huari, San Marcos, Huarmey, Chavín, Huaraz, and others) are drawn on a map. Layers switch between comuneros, open offers, and active contracts so a board or a company can see which towns are supplying labor and which are not.

## Offers

A company (or an admin) publishes a vacancy. The form is the labor matrix that later becomes the contract: job title, company, sector, labor type, salary, regime, duration, schedule, work system, vacancies, closing date, and requirements.

The board can open this screen to see what is being offered in its territory. An offer past its closing date is treated as finished and no longer accepts applications.

## Applications

This screen is the hiring pipeline. Each application belongs to one comunero and one offer, and it moves only forward:

```
CV submitted
  → Security review
  → Employer CV review
  → Interview
  → Medical exam
  → Induction
  → Hired (start of work)
```

Rejection is possible from any stage before hire and ends the process. The board may submit an application in a comunero's name when that person cannot do it themselves; the record keeps who submitted it. Company, board, and admin advance the stage. The timeline on the card is the audit of that process: who moved it, the sub-status (approved, observed, failed medical, and so on), and the deadline.

## Contracts

Once someone is hired, the contract form is filled from the offer and the comunero (name, DNI, age, sex, sector) plus the labor terms. Company and admin are the roles that create contracts on the API. The list is the register of who is working, for which company, under which regime, and until when.

A contract also carries a stability index: months already worked by that person on previous contracts in the system.

## Communications

Messages are tied to an application, not to a free-floating chat. Each message has a sender, a recipient, and a state (`PENDIENTE`, `LEIDO`, `RESPONDIDO`). The screen is the evidence trail of how a vacancy was discussed between the worker, the board, and the company.

## Training

Two programs share this area and must not be mixed:

- **CV history**: courses the comunero already has. Certification adds a verified skill and 100 points on their balance.
- **Labor-training program**: the partner program (Antamina or another contractor). The survey (year, partner, hours, topics, certificate) is what the dashboard counts as “trained by the program.”

## Transparency and complaints

Each community and each company has a trust level: green, yellow, or red. Changing it requires a written reason, and the history is kept. The level is public inside the console and also lowers a worker's or a tenant's rank in candidate matching on the API.

The complaints inbox is the mediation queue. A complaint is filed against a company (usually the mining tenant), starts as pending, and is closed with an official reply. The community board watches the trust screen; the company and admin work the inbox.

## Comuneros

Directory of community members: identity (DNI), sector, CV, skills, and experience. Company and board use it to find people for a vacancy. The board does not edit CVs here; that write belongs to the comunero (on mobile), the company, or an admin.

## Run

```bash
npm install
npm run dev
```

Set the API base URL in the web API client to the running Talento backend. Sign in with a non-comunero account (the seed admin is `test@admin.com` / `1234`). Authenticated users landing on `/` are sent to `/admin`.
