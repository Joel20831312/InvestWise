const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // CORS Headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Nur POST erlauben
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { amount, risk, timeHorizon } = JSON.parse(event.body);

    // Validierung
    if (!amount || !risk || !timeHorizon) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required parameters' })
      };
    }

    const timeHorizonText = {
      'short': 'kurzfristig (weniger als 1 Jahr)',
      'medium': 'mittelfristig (1-5 Jahre)',
      'long': 'langfristig (mehr als 5 Jahre)'
    };

    const riskText = {
      'conservative': 'konservativ (sicherheitsorientiert)',
      'moderate': 'moderat (ausgewogen)',
      'aggressive': 'aggressiv (wachstumsorientiert)'
    };

    const prompt = `Du bist ein erfahrener Finanzberater. Ein Kunde möchte CHF ${amount} investieren.

Kundendetails:
- Investitionsbetrag: CHF ${amount}
- Risikoprofil: ${riskText[risk]}
- Anlagehorizont: ${timeHorizonText[timeHorizon]}

Bitte erstelle eine detaillierte, personalisierte Investitionsempfehlung mit folgenden Punkten:

1. Portfolio-Allokation: Gib eine konkrete prozentuale Aufteilung auf verschiedene Anlageklassen (z.B. Aktien, Anleihen, ETFs, Gold, Cash)

2. Konkrete Beispiele: Nenne 3-5 spezifische Investitionsmöglichkeiten mit Namen (z.B. bestimmte ETFs, Indexfonds)

3. Risiko-Bewertung: Erkläre die Risiken dieser Strategie

4. Erwartete Rendite: Gib eine realistische Einschätzung der möglichen Rendite

5. Nächste Schritte: Was sollte der Kunde als nächstes tun?

Bitte antworte auf Deutsch und strukturiere die Antwort übersichtlich.`;

    // API Request zu Groq
    console.log('Attempting Groq API call with model: llama-3.1-70b-versatile');
    console.log('API Key present:', !!process.env.GROQ_API_KEY);
    console.log('API Key length:', process.env.GROQ_API_KEY?.length);
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Groq API Error Status:', response.status);
      console.error('Groq API Error Body:', errorData);
      throw new Error(`Groq API Error ${response.status}: ${errorData}`);
    }

    const data = await response.json();
    
    // Format response to match expected structure
    const formattedResponse = {
      content: [{
        text: data.choices[0].message.content
      }]
    };
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(formattedResponse)
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    };
  }
};
