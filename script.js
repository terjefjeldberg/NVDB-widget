// Vent til StreamBIM API-et er klart
StreamBIM.onReady(() => {
    console.log("StreamBIM API er klar!");

    // Lytter etter klikk på 3D-objekter
    StreamBIM.onObjectSelected((event, objectId) => {
    event.preventDefault(); // Forhindrer standard klikk-hendelse
    event.stopPropagation(); // Stopper hendelsen fra å boble opp
    console.log("Objekt klikket:", objectId);

    // Henter NVDB-data basert på objekt-ID
    const nvdbCode = hentNVDBKodeFraObjektId(objectId); // Erstatt med din logikk
    fetchNVDBData(nvdbCode); // Henter NVDB-data for det valgte objektet

    });
});

// Funksjon for å hente NVDB-data via API
async function fetchNVDBData(nvdbCode) {
    const apiUrl = `https://api.bsdd.buildingsmart.org/api/v1/NVDB/${nvdbCode}`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        document.getElementById('nvdb-data').innerText = JSON.stringify(data, null, 2);
    } catch (error) {
        console.error('Feil ved henting av NVDB-data:', error);
    }
}

// Dummy-funksjon for å hente NVDB-kode basert på objekt-ID
function hentNVDBKodeFraObjektId(objectId) {
    // Her må du implementere logikk for å mappe objekt-ID til NVDB-kode
    return '12345'; // Erstatt med faktisk NVDB-kode
}
