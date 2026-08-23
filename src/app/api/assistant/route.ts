import { NextResponse } from 'next/server';

const AARKAAI_STREAM_URL = process.env.AARKAAI_STREAM_URL || 'http://127.0.0.1:5000/prompt/stream';

// Blocklist approach: block clearly off-topic categories instead of allowlisting finance terms.
// If a query doesn't match any blocked category, it passes through to the AI backend.
const BLOCKED_TOPICS_REGEX = /\b(movie|movies|film|films|cinema|bollywood|hollywood|tollywood|kollywood|actor|actress|actors|actresses|celebrity|celebrities|gossip|song|songs|music|singer|singers|album|albums|lyrics|playlist|spotify|concert|band|bands|rap|rapper|hip\s*hop|pop\s+music|rock\s+music|jazz\s+music|entertainment|entertain|tv\s+show|tv\s+series|television|sitcom|drama\s+series|netflix|amazon\s+prime|disney|hulu|anime|manga|cartoon|cartoons|web\s+series|reality\s+show|bigg\s+boss|game\s+of\s+thrones|marvel|avengers|dc\s+comics|superhero|cricket|football|soccer|basketball|tennis|hockey|baseball|rugby|wrestling|wwe|fifa|ipl|world\s+cup|olympics|athlete|athletes|sports|sport|player|players|team|teams|match|tournament|stadium|goalkeeper|batsman|bowler|recipe|recipes|cooking|cook|chef|cuisine|baking|bake|ingredient|ingredients|kitchen|dish|dishes|food\s+blog|restaurant|restaurants|dating|relationship|relationships|boyfriend|girlfriend|marriage|wedding|divorce|love\s+life|tinder|bumble|astrology|horoscope|zodiac|tarot|numerology|palmistry|psychic|supernatural|paranormal|ghost|ghosts|alien|aliens|ufo|conspiracy|flat\s+earth|gaming|video\s+game|video\s+games|fortnite|minecraft|pubg|valorant|gta|playstation|xbox|nintendo|esports|streamer|twitch|youtube\s+gaming|fashion|makeup|cosmetics|skincare|beauty|salon|hairstyle|outfit|wardrobe|clothing|dress|dresses|jewelry|jewellery|watch\s+brand|perfume|fragrance|porn|pornography|sex|sexual|nude|naked|xxx|adult\s+content|nsfw|violence|gore|murder|kill|suicide|self.harm|drug|drugs|narcotics|cocaine|heroin|meth|weed|marijuana|cannabis|abuse|weapon|weapons|gun|guns|bomb|hack|hacking|exploit|piracy|pirate|torrent|crack|keygen|jailbreak|phishing|malware|virus|ransomware|joke|jokes|meme|memes|riddle|riddles|trivia|puzzle|funny|humor|comedy|stand.up|prank|pranks|roast|political\s+party|election\s+campaign|vote\s+for|propaganda|religion|religious|prayer|worship|church|mosque|temple|bible|quran|hindu|muslim|christian|buddhist|weather|forecast|temperature|rain|sunny|cloudy|storm|hurricane|earthquake|tsunami|volcano|pet|pets|dog|dogs|cat|cats|puppy|kitten|parrot|fish\s+tank|aquarium|gardening|garden|plants|flower|flowers|travel|vacation|holiday|tourism|tourist|hotel|hotels|resort|flight|flights|airline|backpacking|itinerary|destination)\b/i;

const OFF_TOPIC_RESPONSE = "I am specialized strictly as your FinGenIQ Financial Assistant. I provide in-depth analysis on finance, investments, valuation models, corporate finance, personal wealth management, capital markets, SEBI credentials, and your platform curriculum. Please ask any financial or course-related question.";

export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'fingeniq-aarkaa-live-assistant' });
}

export async function POST(request: Request) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      try {
        const text = await request.text();
        body = JSON.parse(text);
      } catch {
        body = {};
      }
    }

    const rawQuery = (body.message || body.query || '').toString().trim();

    if (!rawQuery) {
      return NextResponse.json({ success: false, error: 'Query is required' }, { status: 400 });
    }

    const cleanLower = rawQuery.toLowerCase();

    // 1. Basic Greeting
    if (/^(hi|hello|hey|greetings|good\s+(morning|afternoon|evening)|namaste)\b/i.test(cleanLower) && cleanLower.split(' ').length <= 4) {
      return NextResponse.json({
        success: true,
        response: "Hello! I am your **FinGenIQ Financial Assistant** powered by **Aarkaa AI**.\n\nAsk me any question about financial modeling, valuation (DCF, Multiples), corporate finance, portfolio strategy, investment analysis, or your platform curriculum.",
        source: 'aarkaa-ai',
      });
    }

    // 2. Blocklist Guardrail: only reject clearly off-topic queries
    const isBlockedTopic = BLOCKED_TOPICS_REGEX.test(cleanLower);
    if (isBlockedTopic) {
      return NextResponse.json({
        success: true,
        response: OFF_TOPIC_RESPONSE,
        source: 'guardrail',
      });
    }

    // 3. Send query directly to Aarkaa AI Engine /prompt/stream and collect real live dynamic response
    try {
      const aarkaaRes = await fetch(AARKAAI_STREAM_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `You are FinGenIQ Financial Assistance, an institutional financial analysis and educational intelligence engine. Answer thoroughly with detailed explanations, exact formulas, step-by-step calculations, and financial insights for: ${rawQuery}`,
          model_override: 'aarka-2.0',
        }),
        signal: AbortSignal.timeout(45000), // 45s timeout for deep LLM reasoning
      });

      if (aarkaaRes.ok && aarkaaRes.body) {
        const reader = aarkaaRes.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let fullAiResponse = '';
        let done = false;

        while (!done) {
          const { value, done: streamDone } = await reader.read();
          done = streamDone;
          if (value) {
            const chunkText = decoder.decode(value, { stream: !done });
            const lines = chunkText.split('\n');
            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith('data:')) {
                try {
                  const dataObj = JSON.parse(trimmed.slice(5).trim());
                  if (dataObj.type === 'content' && typeof dataObj.token === 'string') {
                    fullAiResponse += dataObj.token;
                  }
                } catch {
                  // ignore non-json SSE lines (e.g. [DONE])
                }
              }
            }
          }
        }

        if (fullAiResponse.trim().length > 30) {
          return NextResponse.json({
            success: true,
            response: fullAiResponse.trim(),
            source: 'aarkaa-ai-live',
          });
        }
      }
    } catch (aarkaaErr) {
      console.error('[Assistant API] Error calling Aarkaa AI stream:', aarkaaErr);
    }

    // Fallback only if model fails to connect
    return NextResponse.json({
      success: true,
      response: `The AI financial reasoning engine is currently processing high load. Please ask your financial question again in a moment.`,
      source: 'aarkaa-ai-fallback',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
