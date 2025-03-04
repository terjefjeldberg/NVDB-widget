function onStreamBimReady(api) {
    console.log("StreamBIM is ready!");

    // Prøv å hindre StreamBIM fra å håndtere klikkene
    if (api.interceptEvents) {
        api.interceptEvents(true);
        console.log("Intercepting StreamBIM events to prevent default handling.");
    }

    api.events.pickedObject.subscribe(async (result) => {
        if (!result.guid) return; // Hopp over klikk på tomme områder

        console.log("pickedObject event:", result);

        try {
            const objectInfo = await api.getObjectInfo(result.guid);
            console.log("Objektinformasjon:", objectInfo);

            let propertySets = Object.keys(objectInfo.properties || {})
                .filter(pset => pset.startsWith("1_VOA_") && pset !== "1_VOA_NO");

            if (propertySets.length > 1 && propertySets.includes("1_VOA_Kum_83")) {
                propertySets = propertySets.filter(pset => pset !== "1_VOA_Kum_83");
            }

            console.log("Endelig liste med egenskapssett:", propertySets);

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

// Koble til StreamBIM API
StreamBIM.connectToParent().then(onStreamBimReady).catch(console.error);
