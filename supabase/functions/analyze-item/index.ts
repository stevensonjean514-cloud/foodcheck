import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  itemName: string;
  restaurantName: string;
  description: string;
  honestPercent: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { itemName, restaurantName, description, honestPercent }: RequestBody = await req.json();

    const prompt = `You are a sarcastic food advertising analyst. Analyze this fast food item's advertising honesty.

Item: ${itemName}
Restaurant: ${restaurantName}
Description: ${description}
Community Honesty Rating: ${honestPercent}%

Provide a funny, slightly sarcastic analysis in the following format (respond ONLY with valid JSON):
{
  "honestyScore": <number 0-100>,
  "worstOffense": "<one sentence describing the worst advertising offense>",
  "redeemingQuality": "<one sentence about something positive>",
  "adTactics": ["<tactic 1>", "<tactic 2>", "<tactic 3>"]
}

Keep it witty and entertaining. The honestyScore should roughly align with the community rating but can vary by 10-15%.`;

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');

    if (!anthropicApiKey) {
      return new Response(
        JSON.stringify({
          honestyScore: honestPercent,
          worstOffense: "The portion size looks like it was photographed with a fisheye lens from space.",
          redeemingQuality: "At least they're consistent with their creative interpretation of reality.",
          adTactics: [
            "Strategic lighting to hide all imperfections",
            "Photoshop wizardry worthy of a Hollywood production",
            "Selective focus to distract from the sad reality"
          ]
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Claude API request failed');
    }

    const data = await response.json();
    const analysisText = data.content[0].text;

    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse analysis');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify(analysis),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error('Analysis error:', error);

    return new Response(
      JSON.stringify({
        honestyScore: 45,
        worstOffense: "The lighting in the ad photo could make a mud pie look appetizing.",
        redeemingQuality: "Hey, at least it's food... technically.",
        adTactics: [
          "Professional food styling with tweezers and glue",
          "Filters stacked higher than the burger claims to be",
          "Camera angles that would make a real estate agent jealous"
        ]
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
