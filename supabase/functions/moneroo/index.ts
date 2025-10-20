import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
    ? (Deno.env.get('ALLOWED_ORIGIN') || 'https://payhuk.com')
    : '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'true',
};

const MONEROO_API_URL = 'https://api.moneroo.io/v1';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const monerooApiKey = Deno.env.get('MONEROO_API_KEY');
    
    if (!monerooApiKey) {
      console.error('MONEROO_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Configuration API manquante' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, data } = await req.json();
    console.log('Moneroo request:', { action });

    let endpoint = '';
    let method = 'POST';
    let body = data;

    // Route vers les différents endpoints Moneroo
    switch (action) {
      case 'create_payment':
        endpoint = '/payments';
        method = 'POST';
        break;
      
      case 'get_payment':
        endpoint = `/payments/${data.paymentId}`;
        method = 'GET';
        body = null;
        break;
      
      case 'create_checkout':
        endpoint = '/checkout/initialize';
        method = 'POST';
        break;
      
      case 'verify_payment':
        endpoint = `/payments/${data.paymentId}/verify`;
        method = 'GET';
        body = null;
        break;
      
      default:
        return new Response(
          JSON.stringify({ error: 'Action non supportée' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Appel à l'API Moneroo avec timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes timeout
    
    const monerooResponse = await fetch(`${MONEROO_API_URL}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${monerooApiKey}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : null,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    const responseData = await monerooResponse.json();
    
    if (!monerooResponse.ok) {
      console.error('Moneroo API error:', responseData);
      return new Response(
        JSON.stringify({ error: 'Erreur Moneroo', details: responseData }),
        { 
          status: monerooResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Moneroo response success:', { action, status: monerooResponse.status });

    return new Response(
      JSON.stringify({ success: true, data: responseData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in moneroo function:', error);
    
    // Gestion spécifique des timeouts
    if (error instanceof Error && error.name === 'AbortError') {
      return new Response(
        JSON.stringify({ error: 'Timeout: La requête a pris trop de temps' }),
        { status: 408, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erreur interne' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
