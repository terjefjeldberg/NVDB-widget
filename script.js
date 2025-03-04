// Vent til StreamBIM er lastet før vi kjører koden
function waitForStreamBIM(callback) {
    if (typeof StreamBIM !== "undefined") {
        callback();
    } else {
        console.log("Venter på StreamBIM API...");
        setTimeout(() => waitForStreamBIM(callback), 100);
    }
}

// Kjør widgeten når StreamBIM er tilgjengelig
waitForStreamBIM(() => {
    console.log("StreamBIM API er lastet inn!");

    StreamBIM.connect({
        pickObject: async function(result){
            if (!result.guid) return;
            console.log("pickedObject event:", result.guid);

            try {
                const objectInfo = await StreamBIM.getObjectInfo(result.guid);
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
        }
    }).then( () => {
        console.log("StreamBIM er koblet til!");
    }).catch(error => {
        console.error("Feil ved tilkobling til StreamBIM:", error)
    });
});
