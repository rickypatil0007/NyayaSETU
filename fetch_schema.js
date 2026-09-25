const fs = require('fs');

async function getSupabaseSchema() {
  const url = "https://htkughxcaxiluozxoewd.supabase.co/rest/v1/?apikey=YOUR_SUPABASE_KEY_HERE";
  try {
    const res = await fetch(url);
    const data = await res.json();
    
    const auditsSchema = data.definitions.audits.properties;
    const findingsSchema = data.definitions.findings.properties;
    
    console.log("Audits columns:", Object.keys(auditsSchema));
    console.log("Findings columns:", Object.keys(findingsSchema));
    
  } catch (e) {
    console.error("Error fetching schema", e);
  }
}

getSupabaseSchema();
