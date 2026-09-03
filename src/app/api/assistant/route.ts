import { NextResponse } from 'next/server';

const AARKAAI_STREAM_URL = process.env.AARKAAI_STREAM_URL || 'http://127.0.0.1:5000/prompt/stream';

// Blocklist approach: block clearly off-topic categories instead of allowlisting finance terms.
// If a query doesn't match any blocked category, it passes through to the AI backend.
const BLOCKED_TOPICS_REGEX = /\b(movie|movies|film|films|cinema|bollywood|hollywood|tollywood|kollywood|actor|actress|actors|actresses|celebrity|celebrities|gossip|song|songs|music|singer|singers|album|albums|lyrics|playlist|spotify|concert|band|bands|rap|rapper|hip\s*hop|pop\s+music|rock\s+music|jazz\s+music|entertainment|entertain|tv\s+show|tv\s+series|television|sitcom|drama\s+series|netflix|amazon\s+prime|disney|hulu|anime|manga|cartoon|cartoons|web\s+series|reality\s+show|bigg\s+boss|game\s+of\s+thrones|marvel|avengers|dc\s+comics|superhero|cricket|football|soccer|basketball|tennis|hockey|baseball|rugby|wrestling|wwe|fifa|ipl|world\s+cup|olympics|athlete|athletes|sports|sport|player|players|team|teams|match|tournament|stadium|goalkeeper|batsman|bowler|recipe|recipes|cooking|cook|chef|cuisine|baking|bake|ingredient|ingredients|kitchen|dish|dishes|food\s+blog|restaurant|restaurants|dating|relationship|relationships|boyfriend|girlfriend|marriage|wedding|divorce|love\s+life|tinder|bumble|astrology|horoscope|zodiac|tarot|numerology|palmistry|psychic|supernatural|paranormal|ghost|ghosts|alien|aliens|ufo|conspiracy|flat\s+earth|gaming|video\s+game|video\s+games|fortnite|minecraft|pubg|valorant|gta|playstation|xbox|nintendo|esports|streamer|twitch|youtube\s+gaming|fashion|makeup|cosmetics|skincare|beauty|salon|hairstyle|outfit|wardrobe|clothing|dress|dresses|jewelry|jewellery|watch\s+brand|perfume|fragrance|porn|pornography|sex|sexual|nude|naked|xxx|adult\s+content|nsfw|violence|gore|murder|kill|suicide|self.harm|drug|drugs|narcotics|cocaine|heroin|meth|weed|marijuana|cannabis|abuse|weapon|weapons|gun|guns|bomb|hack|hacking|exploit|piracy|pirate|torrent|crack|keygen|jailbreak|phishing|malware|virus|ransomware|joke|jokes|meme|memes|riddle|riddles|trivia|puzzle|funny|humor|comedy|stand.up|prank|pranks|roast|political\s+party|election\s+campaign|vote\s+for|propaganda|religion|religious|prayer|worship|church|mosque|temple|bible|quran|hindu|muslim|christian|buddhist|weather|forecast|temperature|rain|sunny|cloudy|storm|hurricane|earthquake|tsunami|volcano|pet|pets|dog|dogs|cat|cats|puppy|kitten|parrot|fish\s+tank|aquarium|gardening|garden|plants|flower|flowers|travel|vacation|holiday|tourism|tourist|hotel|hotels|resort|flight|flights|airline|backpacking|itinerary|destination)\b/i;

const OFF_TOPIC_RESPONSE = "I am specialized strictly as your FinGenIQ Financial Assistant. I provide in-depth analysis on finance, investments, valuation models, corporate finance, personal wealth management, capital markets, professional credentials, and your platform curriculum. Please ask any financial or course-related question.";

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
    const rawModel = (body.model || body.model_override || '').toString().trim().toLowerCase();
    
    // Model Selection: support Gemini 3.7 and Aarkaa 2.0
    let modelOverride = 'gemini-3.7';
    if (rawModel.includes('aarka')) {
      modelOverride = 'aarka-2.0';
    } else if (rawModel.includes('gemini-3.7') || rawModel.includes('3.7')) {
      modelOverride = 'gemini-3.7';
    } else if (rawModel.includes('gemini-2.0') || rawModel.includes('2.0')) {
      modelOverride = 'gemini-2.0-flash';
    } else if (rawModel) {
      modelOverride = rawModel;
    }

    if (!rawQuery) {
      return NextResponse.json({ success: false, error: 'Query is required' }, { status: 400 });
    }

    const cleanLower = rawQuery.toLowerCase();

    // 1. Basic Greeting
    if (/^(hi|hello|hey|greetings|good\s+(morning|afternoon|evening)|namaste)\b/i.test(cleanLower) && cleanLower.split(' ').length <= 4) {
      const modelDisplayName = modelOverride.includes('gemini') ? 'Google Gemini 3.7' : 'Aarkaa AI 2.0';
      return NextResponse.json({
        success: true,
        response: `Hello! I am your **FinGenIQ Financial Assistant** powered by **${modelDisplayName}**.\n\nAsk me any question about financial modeling, valuation (DCF, Multiples), corporate finance, portfolio strategy, investment analysis, or your platform curriculum.`,
        source: 'aarkaa-ai',
        model: modelOverride,
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

    // 3. Instant Knowledge Fast-Path for Core Financial Concepts (0ms response)
    const financialKnowledgeMap: { keywords: string[]; answer: string }[] = [
      {
        keywords: ['what is money', 'money', 'currency', 'fiat'],
        answer: "In financial economics and wealth psychology, **money** is fundamentally an institutional technology that solves the friction of barter. It performs three indispensable functions:\n\n1. **Medium of Exchange**: Eliminates the inefficiencies of the double coincidence of wants, enabling frictionless trade and commerce.\n2. **Unit of Account**: Provides a standardized, universal metric to price goods, services, corporate assets, and debt obligations.\n3. **Store of Value**: Allows purchasing power to be accumulated, preserved, and deferred across future time horizons.\n\nIn modern financial systems, money also serves as a legal tender for debt settlement and capital formation across global markets.",
      },
      {
        keywords: ['compounding', 'compound interest', 'time value of money'],
        answer: "**Compound interest** is interest calculated on both the initial principal and the accumulated interest from preceding periods:\n\n$$A = P \\left(1 + \\frac{r}{n}\\right)^{nt}$$\n\nWhere $P$ is principal, $r$ is nominal interest rate, $n$ is compounding frequency per year, and $t$ is time in years. In wealth creation, exponential compounding rewards patience and regular capital reinvestment.",
      },
      {
        keywords: ['dcf', 'discounted cash flow'],
        answer: "**Discounted Cash Flow (DCF)** is an intrinsic valuation methodology that forecasts a firm's Unlevered Free Cash Flows ($FCFF$) and discounts them to the present using the Weighted Average Cost of Capital ($WACC$):\n\n$$\\text{Enterprise Value} = \\sum_{t=1}^{N} \\frac{FCFF_t}{(1 + WACC)^t} + \\frac{\\text{Terminal Value}}{(1 + WACC)^N}$$\n\nIt establishes what a company is fundamentally worth based on its capacity to generate future cash for capital providers.",
      },
      {
        keywords: ['wacc', 'cost of capital'],
        answer: "**WACC (Weighted Average Cost of Capital)** is the blended hurdle rate representing a firm's total cost of financing across equity and debt:\n\n$$WACC = \\left(\\frac{E}{V} \\times K_e\\right) + \\left(\\frac{D}{V} \\times K_d \\times (1 - t)\\right)$$\n\nWhere $E/V$ is the equity weight, $K_e$ is Cost of Equity (via CAPM: $R_f + \\beta(R_m - R_f)$), $D/V$ is debt weight, $K_d$ is pretax cost of debt, and $t$ is the corporate tax rate.",
      },
      {
        keywords: ['ebitda', 'operating income'],
        answer: "**EBITDA (Earnings Before Interest, Taxes, Depreciation, and Amortization)** measures operating profitability before capital structure, tax policy, and depreciation methods:\n\n$$\\text{EBITDA} = \\text{EBIT} + \\text{Depreciation} + \\text{Amortization}$$\n\nIt is widely used in corporate valuation multiples ($EV/EBITDA$) to compare firms operating under divergent tax codes and debt levels.",
      },
      {
        keywords: ['npv', 'net present value'],
        answer: "**Net Present Value (NPV)** measures capital budgeting efficiency by comparing the present value of expected future cash flows against the initial capital outlay:\n\n$$NPV = \\sum_{t=1}^{T} \\frac{C_t}{(1 + r)^t} - C_0$$\n\nA positive NPV ($> 0$) demonstrates that a project creates enterprise value above the minimum hurdle rate.",
      },
      {
        keywords: ['inflation', 'cpi', 'purchasing power'],
        answer: "**Inflation** represents the sustained, systemic increase in the overall price level of goods and services, reducing the purchasing power of each unit of currency.\n\n$$\\text{Real Return} \\approx \\text{Nominal Return} - \\text{Inflation Rate}$$\n\nTo preserve wealth over generational horizons, investments must generate real after-tax returns that consistently outpace headline CPI.",
      },
      {
        keywords: ['mindset', 'wealth psychology', 'behavioral finance'],
        answer: "**Financial Mindset & Wealth Psychology** study how cognitive biases, risk tolerance, and emotional discipline impact financial decisions.\n\nKey behavioral pitfalls include loss aversion, recency bias, and lifestyle creep. Cultivating a disciplined wealth mindset requires decoupling self-worth from consumption, prioritizing delayed gratification, and viewing capital as an instrument of autonomy.",
      }
    ];

    // Check fast-path matches first
    for (const item of financialKnowledgeMap) {
      if (item.keywords.some(kw => cleanLower.includes(kw))) {
        return NextResponse.json({
          success: true,
          response: item.answer,
          source: 'aarkaa-tutor-knowledge',
          model: modelOverride,
        });
      }
    }

    // 4. Dynamic query to Aarkaa Engine with 5-second deadline
    let fullAiResponse = '';
    try {
      const tutorPrompt = `As FinGenIQ Financial Tutor, explain clearly and concisely in 2 paragraphs: ${rawQuery}`;

      const aarkaaRes = await fetch(AARKAAI_STREAM_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: tutorPrompt,
          model_override: modelOverride,
          mode: 'general',
        }),
        signal: AbortSignal.timeout(5000), // 5s fast deadline
      });

      if (aarkaaRes.ok && aarkaaRes.body) {
        const reader = aarkaaRes.body.getReader();
        const decoder = new TextDecoder('utf-8');
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
                  // ignore non-json SSE lines
                }
              }
            }
          }
        }

        if (fullAiResponse.trim().length > 20) {
          return NextResponse.json({
            success: true,
            response: fullAiResponse.trim(),
            source: 'aarkaa-ai-live',
            model: modelOverride,
          });
        }
      }
    } catch {
      // Handled gracefully below
    }

    if (fullAiResponse.trim().length > 20) {
      return NextResponse.json({
        success: true,
        response: fullAiResponse.trim(),
        source: 'aarkaa-ai-live',
        model: modelOverride,
      });
    }

    // Contextual educational response
    const lessonTopic = rawQuery.replace(/.*Context:\s*/i, '').replace(/\.\s*User question:.*/i, '').trim();
    const userQ = rawQuery.includes('User question:') ? rawQuery.split('User question:')[1].trim() : rawQuery;

    const contextualAnswer = `In financial economics and educational analysis, understanding **${userQ}** requires connecting foundational accounting mechanics with investment principles.\n\nWithin **${lessonTopic || 'this lesson'}**, analyze how this concept affects cash flow dynamics, risk management, and capital allocation. Feel free to ask for a specific formula or numerical case study!`;

    return NextResponse.json({
      success: true,
      response: contextualAnswer,
      source: 'aarkaa-tutor-knowledge',
      model: modelOverride,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
