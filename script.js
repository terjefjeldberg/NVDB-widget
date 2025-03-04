function onStreamBimReady(api) {
    console.log("StreamBIM is ready!");

    // Overstyr standardoppførsel for objektklikk
    api.events.pickedObject.subscribe(async (result) => {
        if (!result.guid) return; // Hopp over klikk på tomme områder

        const objectId = result.guid; // GUID for det klikkede objektet
        console.log(`Objekt klikket: ${objectId}`);

        try {
            // Hent egenskapsinformasjon fra API
            const objectInfo = await api.getObjectInfo(objectId);
            console.log("Objektinformasjon:", objectInfo);

            // Finn egenskapssett som starter med "1_VOA_", men ekskluder "1_VOA_NO"
            let propertySets = Object.keys(objectInfo.properties || {})
                .filter(pset => pset.startsWith("1_VOA_") && pset !== "1_VOA_NO");

            console.log("Filtrerte egenskapssett:", propertySets);

            // Hvis det finnes flere egenskapssett enn "1_VOA_Kum_83", fjern også denne
            if (propertySets.length > 1 && propertySets.includes("1_VOA_Kum_83")) {
                propertySets = propertySets.filter(pset => pset !== "1_VOA_Kum_83");
            }

            console.log("Endelig liste med egenskapssett:", propertySets);

            // Vis resultatet i widgeten
            const outputElement = document.getElementById("nvdb-data");
            outputElement.innerHTML = propertySets.length > 0
                ? `<p>Egenskapssett: ${propertySets.join(", ")}</p>`
                : "<p>Ingen relevante egenskapssett funnet.</p>";

        } catch (error) {
            console.error("Feil ved henting av objektinformasjon:", error);
            document.getElementById("nvdb-data").innerHTML = "<p>En feil oppstod ved henting av objektinformasjon.</p>";
        }
    });

    console.log("Widget klar!");
}

// Koble til StreamBIM riktig slik demo-widgeten gjør
StreamBIM.connectToParent().then(onStreamBimReady).catch(console.error);
