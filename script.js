function onStreamBimReady(api) {
    console.log("StreamBIM is ready!");

    api.events.pickedObject.subscribe(async (result) => {
        const objectId = result.guid; // GUID for det klikkede objektet

        try {
            const objectInfo = await api.getObjectInfo(objectId);
            console.log("Objektinformasjon:", objectInfo);

            // Filtrer ut egenskapssett
            const propertySets = Object.keys(objectInfo.properties || {})
                .filter(pset => pset.startsWith("1_VOA_") && pset !== "1_VOA_NO");

            console.log("Filtrerte egenskapssett:", propertySets);

            // Hvis det finnes flere egenskapssett enn "1_VOA_Kum_83", ekskluder også denne
            if (propertySets.length > 1 && propertySets.includes("1_VOA_Kum_83")) {
                propertySets.splice(propertySets.indexOf("1_VOA_Kum_83"), 1);
            }

            console.log("Endelig liste med egenskapssett:", propertySets);

            // Vis resultatet i HTML
            const outputElement = document.getElementById("nvdb-data");
            outputElement.innerHTML = propertySets.length > 0
                ? `<p>Egenskapssett: ${propertySets.join(", ")}</p>`
                : "<p>Ingen relevante egenskapssett funnet.</p>";

        } catch (error) {
            console.error("Feil ved henting av objektinformasjon:", error);
            document.getElementById("nvdb-data").innerHTML = "<p>En feil oppstod ved henting av objektinformasjon.</p>";
        }
    });
}

// Vent på at StreamBIM APIet blir tilgjengelig
if (window.StreamBIM) {
    StreamBIM.connectToParent().then(onStreamBimReady).catch(console.error);
} else {
    console.error("StreamBIM API er ikke tilgjengelig.");
}
