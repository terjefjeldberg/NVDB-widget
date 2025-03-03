// Dette er et eksempel på hvordan du kan hente NVDB-data via API
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

// Eksempel: Hent NVDB-data for en spesifikk kode
fetchNVDBData('12345'); // Erstatt '12345' med faktisk NVDB-kode

// Lytter etter klikk på 3D-objekter i StreamBIM
window.addEventListener('streamBIMObjectClicked', (event) => {
    const objectId = event.detail.objectId; // Henter objekt-ID
    const nvdbCode = hentNVDBKodeFraObjektId(objectId); // Erstatt med din logikk
    fetchNVDBData(nvdbCode); // Henter NVDB-data for det valgte objektet
});

// Dummy-funksjon for å hente NVDB-kode basert på objekt-ID
function hentNVDBKodeFraObjektId(objectId) {
    // Her må du implementere logikk for å mappe objekt-ID til NVDB-kode
    return '12345'; // Erstatt med faktisk NVDB-kode
}