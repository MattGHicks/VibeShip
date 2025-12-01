# VibeShip AI Instructions

> Fetched from VibeShip. Always current.

## Quick Start

1. **Source credentials:** `source .vibe/.secrets`
2. **Read context:** `.vibe/vibeship.md`
3. If `.vibe/` missing → run Initial Setup below

## API Commands

```bash
# Read project context
curl -s "$VIBESHIP_ENDPOINT" -H "Authorization: Bearer $VIBESHIP_API_KEY"

# Update project
curl -s -X PATCH "$VIBESHIP_ENDPOINT" \
  -H "Authorization: Bearer $VIBESHIP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"where_i_left_off": "Progress notes", "status": "active"}'

# Upload screenshot (macOS)
screencapture -x /tmp/ss.png && \
printf '{"image":"data:image/png;base64,%s"}' "$(base64 -i /tmp/ss.png | tr -d '\n')" | \
curl -s -X POST "${VIBESHIP_ENDPOINT}/screenshot" \
  -H "Authorization: Bearer $VIBESHIP_API_KEY" \
  -H "Content-Type: application/json" -d @-
```

## Writable Fields

| Field | Type | Description |
|-------|------|-------------|
| `description` | string | Brief project description |
| `where_i_left_off` | string | Current progress, next steps |
| `lessons_learned` | string | Insights from the project |
| `status` | enum | `active`, `paused`, `shipped`, `graveyard` |
| `tags` | array | `[{tag_type: "model"|"framework"|"tool", tag_value: "Name"}]` |

## Initial Setup

Run if `.vibe/` folder doesn't exist:

1. **Analyze codebase:**
   ```bash
   cat README.md package.json 2>/dev/null | head -100
   ls -la && git log --oneline -5 2>/dev/null
   ```

2. **Detect tech stack:**
   - AI Models: anthropic/openai imports → Claude, GPT-4
   - Frameworks: package.json deps → Next.js, React, etc.
   - Tools: config files → Vercel, Supabase, etc.

3. **Update VibeShip** via API with description, status, tags

4. **Capture screenshot** if UI is visible

5. **Sync local** `.vibe/vibeship.md` with API response

## When to Update

**Offer after:**
- `git push` - "Update VibeShip with progress?"
- Completing a feature - "Log this milestone?"
- Fixing a tricky bug - "Add to lessons learned?"
- UI changes - "Capture fresh screenshot?"

**Never:** Interrupt mid-task or update without confirmation.

## Shipping Mindset

- "Nice progress!" not "Task complete"
- "What are we shipping?" not "What do you want?"
- "Hit a snag - working through it" not "Error occurred"

When status → shipped: Celebrate, ask about lessons learned, encourage next project.

## Guidelines

1. **Read `.vibe/` first** - instant context, works offline
2. **Keep synced** - update `vibeship.md` after API calls
3. **Be specific** - file names, function names, next steps
4. **Stay concise** - summaries should be scannable
5. **Encourage shipping** - celebrate progress, maintain momentum
