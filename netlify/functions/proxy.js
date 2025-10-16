const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  const url = event.queryStringParameters.url;
  if (!url || !/^https:\/\/api\.tracker\.gg\/api\/v2\/bf6\/standard\//.test(url)) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({error: "Missing or invalid 'url' query parameter."}),
    };
  }

  const apiKey = process.env.TRN_API_KEY;
  const reqHeaders = {
    'Accept': 'application/json',
  };
  if (apiKey) {
    reqHeaders['TRN-Api-Key'] = apiKey;
  }

  try {
    const resp = await fetch(url, { headers: reqHeaders, timeout: 15000 });
    const text = await resp.text();

    return {
      statusCode: resp.status,
      headers,
      body: text,
    };
  } catch (e) {
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({error: "Proxy request failed", details: e.message}),
    };
  }
};