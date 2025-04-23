Reality Volatility Index (RVI): Methodology
What is the RVI?
The Reality Volatility Index (RVI) is a live, data-driven signal that reflects the instability, unpredictability, and narrative tension in the world at any given time.

It is calculated using real-time data from Adjacent News API which aggregates prediction markets data across multiple platforms (Kalshi, Polymarket, Metaculus, etc.)

The RVI will act as a VIX of belief - instead of tracking financial instrument volatility, it tracks future expectation volatility.

It has one primary purpose:

Public Signal — a macro measure of how "weird," tense, or chaotic the world currently feels.
This can be turned into a speculative instrument, a synthetic token like $RVI, that can be traded on chain

Index Construction
The RVI is constructed from a set of active binary prediction markets. Each market contributes to the final index based on a combination of:

Impact(Significance),
Urgency (time horizon),
Volatility (probability standard deviation),
Engagement (liquidity or forecaster count),
Consensus Breadth (platform diversity)
and the Probability of the Event Occurring
These are aggregated first into a market-level score, and then into category-level sub-indices before forming the final Reality Volatility Index.

Core Formula
The RVI is calculated at two levels:

Market-level contribution:

Market RVI Contribution = Probability × Geometric Mean of 5 Signal Scores
Index-level aggregation using category-weighted averaging:

RVI = Σ [ Category RVI × (Category Share of Total Markets) ]
This ensures that each thematic risk category (e.g. Geopolitics, Tech, Climate) contributes proportionally to its footprint in the dataset — no single category dominates unless it is both large and volatile.

Normalisation
Each category’s RVI is computed and then weighted based on how many markets fall into that category. The final RVI is the market-weighted average of all category RVIs.

This ensures:

Interpretability over time
Comparability across updates
Proper reflection of issue salience
The full index remains scaled between 0–100 for consistency.
Composite Weight: Scoring Dimensions
Each market is scored across five axes. These scores are combined into a single composite weight for that market:

Dimension	Description
Impact Severity	How consequential the event is if it occurs
Time Horizon	How soon the event will resolve
Volatility	How much the market’s probability has fluctuated recently
Liquidity	How actively traded the market is
Platform Diversity	Whether the market is mirrored across platforms (consensus)
Note: All dimension scores are individually normalized to [0, 1], and combined using a geometric mean. This ensures that no single factor can dominate the composite score, and markets with weak signals in any dimension are appropriately down-weighted.

1. Impact Severity Score (0.3 – 1.0)
The most subjective component, and one calculated by heuristics, which reflects how disruptive or significant an event would be if it happened.

A. Base Score by Topic Tags
Each market starts with a base score based on its core theme (inferred from tags or keywords):

Topic Area	Base Score
Existential / Global Catastrophe (nuclear, AGI, pandemic, collapse)	1.0
Geopolitical / Systemic Risk (war, recession, default, elections)	0.8
Institutional / Regulatory Change (Fed, policy, Meta breakup, crypto)	0.6
Cultural / Symbolic / Media Events (Oscars, TikTok, TV, Elon tweets)	0.4
Trivial / Ephemeral Topics (memes, streaming, internet celebrities)	0.3
B. Scope Modifier
This adjusts the score based on how widely the outcome would be felt:

Scope	Modifier
Global (e.g. UN, Humanity, Multinational)	+0.15
National (e.g. USA, China, EU, Fed)	+0.10
Subnational / Company-specific (Meta, Texas)	+0.05
Individual / Local (Elon, one state)	+0.00
Example:
“Will the US default on its debt?” → national → +0.10
“Will Meta be forced to spin off Instagram?” → company → +0.05

C. Phrasing Signal Boost
Some wording in a market title implies higher consequence or system stress. We add a small boost if it signals systemic disruption.

Trigger Phrases Found in Title	Boost
collapse, invade, nuclear, emergency, shutdown, ban, break up, default	+0.10
step down, resign, investigate, fine, indict	+0.05
tweet, appear, nominate, stream, interview	0.00
Total Score = Base + Scope + Phrasing Boost
Clamped between 0.3 and 1.0

Examples:
“Will China invade Taiwan before 2026?”

Base: war, geopolitics → 0.8

Scope: national/global → +0.1

Phrasing: “invade” → +0.1

→ Final Score = 1.0

“Will Meta be forced to sell Instagram or WhatsApp in 2025?”

Base: tech, regulation → 0.6

Scope: company-level → +0.05

Phrasing: “forced to sell” → +0.1

→ Final Score = 0.75

“Will another MSNBC show be cancelled before July?”

Base: media, culture → 0.4

Scope: national-ish (but limited impact) → +0.05

Phrasing: “cancelled” → 0

→ Final Score = 0.45

2. Time Horizon Score (0.2 – 1.0)
Shorter-term markets are weighted more heavily because:

They reflect current tension or resolution cycles
They contribute more to immediate volatility
Time Until Resolution	Score
< 30 days	1.0
1–3 months	0.8
3–6 months	0.6
6–12 months	0.4
> 1 year	0.2
3. Volatility Score (0.5 – 1.0)
This measures how “twitchy” a market is — the standard deviation of the market’s probability over the past 48–72 hours. Higher volatility leads to a higher contribution to RVI.

Std Deviation (in % points)	Score
≥ 12	1.0
8–11	0.85
4–7	0.7
< 4	0.5
4. Liquidity Score (0.5 – 1.0)
Reflects how much money or activity is behind the market — more liquidity = more signal.

Volume Rank (platform-relative)	Score
Top 10%	1.0
Top 25%	0.8
Top 50%	0.6
Bottom 50%	0.5
5. Platform Diversity Score (1.0 – 1.2)
We give a small multiplier to markets that appear on multiple platforms, as they reflect shared belief across communities (e.g. Kalshi + Polymarket + Metaculus).

Platforms Hosting the Market	Score
3+ platforms	1.2
2 platforms	1.1
1 platform	1.0
Why These Numbers?
Vibes — but principled.

Each scoring dimension in the RVI system uses thresholds and ranges that are tuned for signal quality, interpretability, and narrative sensitivity. They are inspired by real world forecasting, narrative theory, and financial volatility modelling. As opposed to being mathematically pure - we want to reflect peoples belief, and how they experience uncertainty and tension.

1. Impact Severity Score (0.3–1.0)
Why not 0?
If we allowed a score of 0, a market could be completely excluded or misinterpreted due one low dimension, which can be risky as probability ≠ value. A soft floor of 0.3 means that something can matter, but not much.

Why these tiers?
They reflect symbolic → systemic importance:

0.3 = trivial/meme
0.4–0.6 = cultural/institutional
0.8–1.0 = systemic, existential
Inspired by:

DHS threat modelling - Gives impact scale from 1-5 and avoids binary risk (threat / no threat)
Gartner-style rating frameworks - Subjective but repeatable labels (low / medium / high)
Insurance risk scales - Risk = probability x severity (where severity cannot = 0)
2. Time Horizon Score (0.2–1.0)
Why shorter = higher?
Short term resolutions means more tension, we care about what is coming soon.

Why these buckets?

Time	Score	Why
<30 days	1.0	Maximum urgency and newsworthiness
1–3 months	0.8	Actively monitored
3–6 months	0.6	Still visible
6–12 months	0.4	Low ambient tension
>1 year	0.2	Too distant to matter yet
Inspired by:
Options pricing - Short-term volume = premium
Newsroom calendars
Election cycle pacing - More tension in media as we get closer to election day
3. Volatility Score (0.5–1.0)
Why standard deviation?
It’s the cleanest, most direct measure of uncertainty, mirroring real swings in belief.

Why these thresholds?

Std Dev (%)	Score	Why
≥12	1.0	Major churn, narrative in flux
8–11	0.85	Active contestation
4–7	0.7	Noticeable twitch
<4	0.5	Flat, settled
Inspired by:
VIX methodology - Use volatility as core market sentiment signal
Metaculus forecast volatility - They track forecast swings over time
4. Liquidity Score (0.5–1.0)
Why use percentiles?
Absolute volume is misleading — we care about relative engagement on a given platform.

Why this structure?

Percentile	Score	Why
Top 10%	1.0	High signal
Top 25%	0.8	Strong interest
Top 50%	0.6	Moderately relevant
Bottom 50%	0.5	Weak signal, but still counts
Inspired by:
Token metrics - Percentile ranks are common in crypto
Behavioral finance models - Attention as a signal for strength - more volume - more people care - more relevance in RVI
5. Platform Diversity Score (1.0–1.2)
This is a multiplier, and boosts markets that are mirrored across communities — evidence of shared salience.

Why 1.1 and 1.2?
Platforms	Score	Why
1	1.0	No alignment bonus
2	1.1	Some narrative overlap
3+	1.2	Broad consensus or shared concern
Inspired by:
Cross-source corroboration in journalism
Multi-exchange market spreads
Final Notes
This design is intentional. The RVI doesn’t just track risk — it tracks narrative weight and the belief of events occurring.

Market Selection by Category
Markets are grouped into thematic categories for sub-indexing and narrative insights.

Category Tag Mapping
Category	Example Tags
Geopolitics	geopolitics, war, nuclear, conflict
Governance Risk	elections, shutdown, fed, policy
Tech Disruption	ai, openai, automation, privacy
Climate Risk	climate, carbon, environment
Health/Bio Risk	pandemic, virus, disease
Financial Instability	recession, banking, inflation
Info/Culture Chaos	misinformation, deepfakes, media, tiktok
These categories are inferred from Adjacent API market tags and are used for breakdowns and visualizations.

RVI by Category
Each market is mapped into a risk category such as Geopolitics, Tech Disruption, Climate Risk, etc. This allows us to create sub-indices and track which domains are contributing most to global narrative tension.

Each sub-index uses the same geometric mean formula and normalisation, and their weighted average forms the final RVI.

This design enables:

Thematic dashboards (e.g. RVI_Tech, RVI_Geo)
Narrative analysis over time
Tokenization of sub-sectors (e.g. $RVITech, $RVIClimate)
