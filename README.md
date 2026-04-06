# BFHL - Hierarchy Analyzer

SRM Full Stack Engineering Challenge submission.

## Live Links

- Frontend: `https://karan-dhillon-ra-2311026010156-bfhl.vercel.app/`
- Backend Base URL: `https://karan-dhillon-ra-2311026010156-bfhl.vercel.app`
- API Endpoint: `POST /bfhl`

## Tech Stack

- Node.js
- Express
- Vanilla HTML/CSS/JS
- Vercel (deployment)

## Run Locally

```bash
npm install
npm start
```

Server runs at `http://localhost:3000`.

## API Contract

### Request

`POST /bfhl`

```json
{
  "data": ["A->B", "A->C", "B->D"]
}
```

### Response

Returns:
- `user_id`
- `email_id`
- `college_roll_number`
- `hierarchies`
- `invalid_entries`
- `duplicate_edges`
- `summary`

## Quick Test

```bash
curl -i -X POST "http://localhost:3000/bfhl" \
  -H "Content-Type: application/json" \
  -d '{"data":["A->B","A->C","B->D"]}'
```

## Submission Details

- Name: Karan Dhillon
- Email: kd2803@srmist.edu.in
- Roll Number: RA2311026010156
