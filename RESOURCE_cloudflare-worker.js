// Copy this code into your Cloudflare Worker script.

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    // Let browsers check whether this Worker accepts the request.
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Use POST to send a chat message.' }), {
        status: 405,
        headers: corsHeaders
      });
    }

    // Add OPENAI_API_KEY as a Worker secret in Cloudflare; never put it in this file.
    const apiKey = env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'The Worker is missing its API secret.' }), {
        status: 500,
        headers: corsHeaders
      });
    }

    let userInput;
    try {
      userInput = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Send a valid JSON request body.' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    if (!Array.isArray(userInput.messages)) {
      return new Response(JSON.stringify({ error: 'Include a messages array in the request body.' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const requestBody = {
      model: 'gpt-4.1',
      messages: userInput.messages,
      max_completion_tokens: 300
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: corsHeaders
    });
  }
};
