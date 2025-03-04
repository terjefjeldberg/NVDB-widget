function onStreamBimReady(api) {
    console.log("StreamBIM is ready!");

    // Abonner på 'pickedObject' event (som er dokumentert i demo-widgeten)
    api.events.pickedObject.subscribe(async (result) => {
        const objectId = result.guid; // GUID for det klikkede objektet

        try {
            // Hent objektinformasjon (dokumentert i demo-widgeten)
            const objectInfo = await api.getObjectInfo(objectId);
            console.log("Objektinformasjon:", objectInfo);

            // Finn "V770_Kode" under "0_element" (basert på din beskrivelse)
            let v770Kode = null;
            if (objectInfo.properties && objectInfo.properties["0_element"]) {
                v770Kode = objectInfo.properties["0_element"]["V770_Kode"];
            }

            // Vis resultatet
            if (v770Kode !== null) {
                console.log("V770_Kode:", v770Kode);
                document.getElementById("output").textContent = `V770_Kode: ${v770Kode}`;
            } else {
                console.log("Fant ikke V770_Kode på objektet.");
                document.getElementById("output").textContent = "Ingen V770_Kode funnet.";
            }

        } catch (error) {
            console.error("Feil ved henting av objektinformasjon:", error);
            document.getElementById("output").textContent = "En feil oppstod ved henting av objektinformasjon.";
        }
    });
}
