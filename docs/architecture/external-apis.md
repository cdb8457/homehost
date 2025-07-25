# External APIs

## Steam Web API

- **Purpose:** Game metadata, user authentication, and server verification
- **Documentation:** https://steamcommunity.com/dev
- **Base URL:** `https://api.steampowered.com`
- **Authentication:** Steam Web API key
- **Rate Limits:** 100,000 requests per day

**Key Endpoints Used:**
- `GET /ISteamApps/GetAppList/v2` - Get list of Steam applications
- `GET /ISteamUser/GetPlayerSummaries/v2` - Get Steam user profiles
- `GET /IGameServersService/GetServerList/v1` - Verify dedicated servers

**Integration Notes:** Used for automatic game discovery, user authentication, and server verification

## Discord API

- **Purpose:** Community integration and social features
- **Documentation:** https://discord.com/developers/docs
- **Base URL:** `https://discord.com/api/v10`
- **Authentication:** Bot token and OAuth2
- **Rate Limits:** Variable per endpoint, 5-10 requests per second typical

**Key Endpoints Used:**
- `POST /webhooks/{webhook.id}/{webhook.token}` - Send server status updates
- `GET /users/@me/guilds` - List user's Discord servers
- `POST /channels/{channel.id}/messages` - Send notifications

**Integration Notes:** Optional integration for community notifications and member verification

## Payment Processing (Stripe)

- **Purpose:** Plugin marketplace transactions and community monetization
- **Documentation:** https://stripe.com/docs/api
- **Base URL:** `https://api.stripe.com/v1`
- **Authentication:** Secret key with webhook signing
- **Rate Limits:** 100 requests per second

**Key Endpoints Used:**
- `POST /payment_intents` - Process plugin purchases
- `POST /customers` - Create customer profiles
- `POST /accounts` - Create developer payout accounts
- `POST /transfers` - Revenue sharing transfers

**Integration Notes:** Revenue sharing between plugin developers and HomeHost platform