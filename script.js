console.log('🚀 Script starter...');

// Vent til StreamBIM er lastet før vi kjører koden
function waitForStreamBIM(callback) {
    console.log('⏳ Sjekker om StreamBIM er lastet...');
    if (typeof StreamBIM !== "undefined") {
        console.log('✅ StreamBIM er lastet!');
        callback();
    } else {
        console.log("⏳ Venter på StreamBIM API...");
        setTimeout(() => waitForStreamBIM(callback), 100);
    }
}

// BSDD API konfigurasjon
const bsddConfig = {
    authUrl: 'https://authentication.buildingsmart.org/buildingsmartservices.onmicrosoft.com/b2c_1a_signupsignin_c/oauth2/v2.0/authorize',
    clientId: '144e037f-6a71-41bb-8ce1-4e8554520756',
    redirectUri: 'https://terje.github.io/nvdb-widget/oauth-callback.html', // Endre dette til din faktiske GitHub Pages URL
    scope: 'openid profile email',
    responseType: 'token'
};

// Hjelpefunksjon for å hente access token
async function getBsddToken() {
    // Sjekk om vi allerede har et gyldig token i localStorage
    const token = localStorage.getItem('bsdd_token');
    const tokenExpiry = localStorage.getItem('bsdd_token_expiry');
    
    if (token && tokenExpiry && new Date().getTime() < parseInt(tokenExpiry)) {
        return token;
    }

    try {
        const response = await fetch(bsddConfig.authUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: bsddConfig.clientId,
                client_secret: bsddConfig.clientSecret,
                scope: bsddConfig.scope
            })
        });

        if (!response.ok) {
            throw new Error(`Autentisering feilet: ${response.status}`);
        }

        const data = await response.json();
        const accessToken = data.access_token;
        
        // Lagre token med utløpstid
        const expiryTime = new Date().getTime() + (data.expires_in * 1000);
        localStorage.setItem('bsdd_token', accessToken);
        localStorage.setItem('bsdd_token_expiry', expiryTime.toString());
        
        return accessToken;
    } catch (error) {
        console.error('Feil ved henting av token:', error);
        throw error;
    }
}

// Hjelpefunksjon for å søke i bsdd API
async function searchBsdd(propertyName) {
    try {
        const token = await getBsddToken();
        const response = await fetch('https://api.buildingsmart.org/bsdd/v1/search', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                searchTerm: propertyName,
                includeProperties: true
            })
        });
        
        if (!response.ok) {
            throw new Error(`BSDD API feil: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Feil ved søk i bsdd:', error);
        throw error;
    }
}

// Kjør widgeten når StreamBIM er tilgjengelig
console.log('🔄 Starter widget initialisering...');
waitForStreamBIM(() => {
    console.log("✅ StreamBIM API er lastet inn!");

    console.log('🔌 Prøver å koble til StreamBIM...');
    StreamBIM.connect({
        pickedObject: async function(result) {
            console.log("🟠 pickedObject ble trigget! Resultat:", result);
            
            if (!result || !result.guid) {
                console.warn("⚠️ Ingen gyldig objekt valgt");
                return;
            }

            console.log("🔍 Prøver å finne nvdb-data element...");
            const outputElement = document.getElementById("nvdb-data");
            if (!outputElement) {
                console.error('❌ Kunne ikke finne output element!');
                return;
            }
            console.log("✅ Fant nvdb-data element");
            
            console.log("📝 Oppdaterer innhold i nvdb-data...");
            outputElement.innerHTML = "<p>Laster objektinformasjon...</p>";
            console.log("✅ Oppdaterte innhold i nvdb-data");

            try {
                console.log("🎨 Prøver å fjerne highlight fra alle objekter...");
                StreamBIM.deHighlightAllObjects();
                console.log("✅ Fjernet highlight fra alle objekter");
                
                console.log("🎨 Prøver å highlighte valgt objekt...");
                StreamBIM.highlightObject(result.guid);
                console.log("✅ Highlightet objekt med GUID:", result.guid);

                console.log("🔍 Henter objektinfo...");
                const objectInfo = await StreamBIM.getObjectInfo(result.guid);
                console.log("📌 Mottok objektinfo:", objectInfo);

                if (!objectInfo || !objectInfo.properties) {
                    console.error("❌ Ingen objektinformasjon funnet");
                    outputElement.innerHTML = "<p>Ingen objektinformasjon funnet.</p>";
                    return;
                }

                // Filtrer egenskapssett som starter med 1_VOA_
                let propertySets = (objectInfo.groups || [])
                    .map(group => group.label)
                    .filter(label => label.startsWith("1_VOA_") && label !== "1_VOA_NO");

                console.log("📋 Filtrerte egenskapssett:", propertySets);

                if (propertySets.length > 0) {
                    let html = "<h3>Egenskapssett:</h3><ul>";
                    
                    for (const pset of propertySets) {
                        try {
                            // Søk i bsdd for hvert egenskapssett
                            const bsddResult = await searchBsdd(pset);
                            html += `<li>${pset}`;
                            
                            if (bsddResult && bsddResult.results && bsddResult.results.length > 0) {
                                html += `<ul>`;
                                for (const match of bsddResult.results) {
                                    html += `<li>NVDB kode: ${match.code || 'N/A'}</li>`;
                                    if (match.properties) {
                                        html += `<li>Egenskaper: ${JSON.stringify(match.properties)}</li>`;
                                    }
                                }
                                html += `</ul>`;
                            }
                            
                            html += `</li>`;
                        } catch (error) {
                            console.error(`Feil ved søk for ${pset}:`, error);
                            html += `<li>${pset} (Kunne ikke hente NVDB data)</li>`;
                        }
                    }
                    
                    html += "</ul>";
                    outputElement.innerHTML = html;
                } else {
                    console.warn("⚠️ Ingen relevante egenskapssett funnet");
                    outputElement.innerHTML = "<p>Ingen relevante egenskapssett funnet.</p>";
                }

            } catch (error) {
                console.error("❌ Feil under prosessering:", error);
                outputElement.innerHTML = "<p>En feil oppstod ved henting av objektinformasjon.</p>";
            }
        }
    }).then(() => {
        console.log("✅ StreamBIM er koblet til!");
    }).catch(error => {
        console.error("❌ Feil ved tilkobling til StreamBIM:", error);
    });
});