StreamBIM.connect({
  pickedObject: function (result) {
    console.log('Clicked object:', result.guid);
    
    // Hente objektinformasjon basert på GUID
    StreamBIM.getObjectInfo(result.guid).then((objectInfo) => {
      if (objectInfo && objectInfo.properties) {
        // Sjekke om egenskapssettet "0_element" finnes
        const propertiesSet = objectInfo.properties["0_element"];
        if (propertiesSet) {
          // Hente verdien til "V770_Kode"
          const nvdbKode = propertiesSet["V770_Kode"];
          if (nvdbKode) {
            console.log('NVDB Kode:', nvdbKode);
            document.getElementById('nvdbKodeDisplay').innerText = `NVDB Kode: ${nvdbKode}`;
          } else {
            console.log('Egenskap "V770_Kode" ikke funnet.');
          }
        } else {
          console.log('Egenskapsett "0_element" ikke funnet.');
        }
      }
    }).catch((error) => {
      console.error('Feil ved henting av objektinfo:', error);
    });
  }
});
