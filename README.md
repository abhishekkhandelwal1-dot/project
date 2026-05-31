# Pre BI Bot — Conversation Viewer

Internal tool for Cars24 to review AI chatbot (Pre BI Bot) conversations.  
Built with **Next.js 16 · TypeScript · Tailwind CSS · App Router**.

## Features

| Feature | Detail |
|---|---|
| Date filter | Pick any date to load that day's conversations |
| Dual data source | Merges live data (Google Sheets) + test sessions (JSON) |
| WhatsApp-style transcript | Bot left · Customer right · Human agent highlighted |
| Search | Filter by customer name, phone, archetype, or outcome |
| Outcome badges | Test Drive Booked · Callback Arranged · Drop-off |
| Pagination | 50 conversations per page, server-side |

## Getting started

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
npm install
cp .env.local.example .env.local   # fill in GSHEET_CSV_URL
npm run dev
```

Open http://localhost:3000.  
Select **2026-05-25** to see the bundled test conversations (no env vars needed).

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `GSHEET_CSV_URL` | Recommended | Published Google Sheet CSV URL |
| `GSHEET_CACHE_TTL_SECONDS` | Optional | Sheet cache TTL in seconds (default 300) |

Without `GSHEET_CSV_URL` the app falls back to the bundled test data in `src/data/conversations.json`.

## Google Sheet setup

The sheet must contain these columns from the Snowflake export:

`ENGAGEMENT_ID · TIMESTAMP_AEST · DIRECTION · CUSTOMER_NAME · CUSTOMER_PHONE · MESSAGE_TEXT · SENDER_OWNER_ID`

> Format columns A (ENGAGEMENT_ID) and E (CUSTOMER_PHONE) as **Plain text** in Google Sheets  
> before pasting data to prevent scientific notation rounding.

How to publish:  
**File → Share → Publish to web → your sheet tab → CSV → Publish → copy URL**

## Deploy to Vercel

```bash
npx vercel --prod
```

Add `GSHEET_CSV_URL` in Vercel Dashboard → Settings → Environment Variables.

## Project structure

```
src/
├── app/api/
│   ├── conversations/route.ts       GET /api/conversations
│   └── conversation/[id]/route.ts   GET /api/conversation/:id
├── components/                      UI components
├── data/conversations.json          Bundled synthetic test sessions
├── lib/
│   ├── data.ts                      JSON source
│   ├── sheets.ts                    Google Sheets source (CSV + cache)
│   ├── queries.ts                   Unified query layer
│   └── utils.ts
└── types/index.ts
```

## Security

- `GSHEET_CSV_URL` is server-only — never exposed to the browser
- All data fetching goes through Next.js API routes
- Real customer data is never committed — `.gitignore` blocks `*.csv` and `*.log`
- `conversations.json` contains synthetic test data only (fictional names/phones)

## Snowflake source query

```sql
USE DATABASE PC_STITCH_DB;

SELECT
    ENGAGEMENT_ID,
    CONVERT_TIMEZONE('Australia/Sydney', PROPERTY_HS_TIMESTAMP)    AS timestamp_aest,
    CASE
        WHEN PROPERTY_HS_COMMUNICATION_BODY LIKE '%SMS Sent%'     THEN 'Sent (Us → CX)'
        WHEN PROPERTY_HS_COMMUNICATION_BODY LIKE '%SMS Received%' THEN 'Received (CX → Us)'
        ELSE 'Unknown'
    END AS direction,
    REGEXP_SUBSTR(PROPERTY_HS_BODY_PREVIEW,
        ' (to|from) ([A-Za-z ]+) on ', 1, 1, 'e', 2)              AS customer_name,
    REGEXP_SUBSTR(PROPERTY_HS_COMMUNICATION_BODY,
        'conversations/[0-9]+/([0-9]+)', 1, 1, 'e', 1)            AS customer_phone,
    REGEXP_SUBSTR(PROPERTY_HS_BODY_PREVIEW,
        'Message: (.+?) Status:', 1, 1, 'e', 1)                    AS message_text,
    PROPERTY_HUBSPOT_OWNER_ID                                       AS sender_owner_id
FROM PC_STITCH_DB.HUBSPOT_ANZ.ENGAGEMENT_COMMUNICATION
WHERE TYPE = 'COMMUNICATION'
  AND PROPERTY_HS_COMMUNICATION_CHANNEL_TYPE = 'SMS'
  AND PROPERTY_HS_COMMUNICATION_BODY LIKE '%Syd - Online Sales Calling #9%'
ORDER BY customer_phone, PROPERTY_HS_TIMESTAMP ASC;
```

---

*Built with [Claude Code](https://claude.ai/claude-code)*
