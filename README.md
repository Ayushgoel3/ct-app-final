# CT APP — Control Tower escalation & task tracker

Collates escalations (Gmail / Slack / G-Sheets) into buckets with an owner, timeline,
pending duration and status — so the team always knows who is working on what.

**Zero-config version:** no database, no login, no environment variables.
Data is stored in the browser (localStorage). Deploys on Vercel in one click.

## Deploy
1. Put this folder's contents in a GitHub repo
2. vercel.com → Add New → Project → Import the repo → Deploy
3. Done — no settings needed

## Run locally (optional)
```bash
npm install
npm run dev   # http://localhost:3000
```

## Features
- Dashboard: open/overdue/unassigned counts, buckets, per-owner workload, aging with pending duration
- Tracker: filter by bucket / owner / status / source, free-text search, red highlight for overdue or >3 days pending
- Task detail: reassign owner, change status/priority/due date, remarks + auto-logged activity timeline
- Reply at source: compose once → opens Gmail (mailto) / Slack thread / G-Sheet link, copies text, logs it
- Ingest: paste a raw email/Slack message → auto-detects bucket, priority, source → review → save
- Simulated Sync button: pulls realistic sample escalations (production would plug Gmail API / Slack Events API / Sheets API into the same pipeline — see `lib/sampleEscalations.ts`)
- Team page: add members, see per-member load
