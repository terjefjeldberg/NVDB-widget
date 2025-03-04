function onStreamBimReady(api) {
    console.log("StreamBIM is ready!");

    // Abonner på endringer i objektvalg
    api.events.selectionChanged.subscribe(async (selectedObjects) => {
        if (selectedObjects.length === 0) {
            console.log("Ingen objekt valgt.");
            document.getElementById("output").textContent = "Ingen objekt valgt.";
            return;
        }

        const objectId = selectedObjects[0].objectId;

        try {
            // Hent egenskapene til det valgte objektet
            const properties = await api.getProperties(objectId);
            console.log("Egenskaper for objekt:", properties);

            // Finn "V770_Kode" under "0_element"
            let v770Kode = null;
            properties.forEach(propSet => {
                if (propSet.name === "0_element") {
                    propSet.properties.forEach(prop => {
                        if (prop.name === "V770_Kode") {
                            v770Kode = prop.value;
                        }
                    });
                }
            });

            // Vis resultatet
            if (v770Kode !== null) {
                console.log("V770_Kode:", v770Kode);
                document.getElementById("output").textContent = `V770_Kode: ${v770Kode}`;
            } else {
                console.log("Fant ikke V770_Kode på objektet.");
                document.getElementById("output").textContent = "Ingen V770_Kode funnet.";
            }

        } catch (error) {
            console.error("Feil ved henting av egenskaper:", error);
            document.getElementById("output").textContent = "En feil oppstod ved henting av egenskaper.";
        }
    });
}
