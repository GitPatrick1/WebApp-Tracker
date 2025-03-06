document.addEventListener("DOMContentLoaded", function() {
  // Elementi del DOM
  const flightForm = document.getElementById("flightForm");
  const flightInput = document.getElementById("flightInput");
  const outputDiv = document.getElementById("output");
  const toggleMapBtn = document.getElementById("toggleMap");
  const mapContainer = document.getElementById("mapContainer");
  const submitButton = document.getElementById("submitButton");

  // Animazioni sull'input
  flightInput.addEventListener("mouseover", function() {
    flightInput.style.borderColor = "#0088cc";
    console.log("Hover sull'input attivato");
  });
  flightInput.addEventListener("mouseout", function() {
    flightInput.style.borderColor = "#00c6ff";
    console.log("Mouse fuori dall'input");
  });

  // Animazione al click del pulsante di submit
  submitButton.addEventListener("click", function() {
    submitButton.style.transform = "scale(0.95)";
    setTimeout(() => {
      submitButton.style.transform = "scale(1)";
    }, 200);
    console.log("Pulsante di submit cliccato");
  });

  // Toggle pannello mappa
  toggleMapBtn.addEventListener("click", function() {
    if (mapContainer.classList.contains("hidden")) {
      mapContainer.classList.remove("hidden");
      toggleMapBtn.textContent = "Chiudi Mappa";
      console.log("Mappa aperta");
    } else {
      mapContainer.classList.add("hidden");
      toggleMapBtn.textContent = "Apri Mappa in Tempo Reale";
      console.log("Mappa chiusa");
    }
  });

  // Gestione submit per il tracking dei voli
  flightForm.addEventListener("submit", function(e) {
    e.preventDefault();
    clearOutput();
    const flightCode = flightInput.value.trim();
    if (!flightCode) {
      displayError("Inserisci un codice IATA valido.");
      console.error("Errore: Codice IATA non valido.");
      return;
    }
    console.log("Ricerca volo per codice:", flightCode);
    
    // Inserisci qui la tua chiave API di AviationStack
    const accessKey = "LA_TUA_CHIAVE_API";
    const endpoint = `https://api.aviationstack.com/v1/flights?access_key=${accessKey}&flight_iata=${flightCode}`;
    console.log("Chiamata API a:", endpoint);
    
    displayLoading();
    fetch(endpoint)
      .then(response => {
        if (!response.ok) {
          console.error("Errore HTTP:", response.status);
          throw new Error(`Errore HTTP: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        removeLoading();
        if (!data || !data.data || data.data.length === 0) {
          displayError("Nessun volo trovato per il codice specificato.");
          console.error("Nessun volo trovato per il codice:", flightCode);
          return;
        }
        const flight = data.data[0];
        console.log("Dati volo ricevuti:", flight);
        displayFlightData(flight);
      })
      .catch(error => {
        removeLoading();
        displayError("Si è verificato un errore durante il recupero dei dati. Riprova più tardi.");
        console.error("Errore nella chiamata API:", error);
      });
  });

  // Funzione per pulire l'output
  function clearOutput() {
    outputDiv.innerHTML = "";
    console.log("Output pulito");
  }

  // Funzione per mostrare il messaggio di caricamento
  function displayLoading() {
    const loadingMsg = document.createElement("p");
    loadingMsg.id = "loadingMsg";
    loadingMsg.textContent = "Caricamento in corso...";
    loadingMsg.style.textAlign = "center";
    loadingMsg.style.fontSize = "18px";
    outputDiv.appendChild(loadingMsg);
    console.log("Messaggio di caricamento visualizzato");
  }

  // Funzione per rimuovere il messaggio di caricamento
  function removeLoading() {
    const loadingMsg = document.getElementById("loadingMsg");
    if (loadingMsg) {
      outputDiv.removeChild(loadingMsg);
      console.log("Messaggio di caricamento rimosso");
    }
  }

  // Funzione per visualizzare i dati del volo
  function displayFlightData(flight) {
    const flightDiv = document.createElement("div");
    flightDiv.className = "flight-info";
    flightDiv.innerHTML = `
      <p><strong>Data del volo:</strong> ${flight.flight_date || "N/A"}</p>
      <p><strong>Stato del volo:</strong> ${flight.flight_status || "N/A"}</p>
      <p><strong>Aeroporto di partenza:</strong> ${flight.departure.airport || "N/A"} (${flight.departure.iata || "N/A"})</p>
      <p><strong>Aeroporto di arrivo:</strong> ${flight.arrival.airport || "N/A"} (${flight.arrival.iata || "N/A"})</p>
      <p><strong>Compagnia aerea:</strong> ${flight.airline.name || "N/A"}</p>
      <p><strong>Orario di arrivo schedulato:</strong> ${flight.arrival.scheduled || "N/A"}</p>
      <p><strong>Orario di arrivo stimato:</strong> ${flight.arrival.estimated || "N/A"}</p>
    `;
    outputDiv.appendChild(flightDiv);
    console.log("Dati del volo visualizzati");

    // Animazione al click sul box informativo
    flightDiv.addEventListener("click", function() {
      flightDiv.style.transform = "scale(1.03)";
      setTimeout(() => {
        flightDiv.style.transform = "scale(1)";
      }, 500);
      console.log("Box informazioni volo cliccato");
    });
  }

  // Funzione per visualizzare errori
  function displayError(message) {
    const errorMsg = document.createElement("p");
    errorMsg.className = "error";
    errorMsg.textContent = message;
    outputDiv.appendChild(errorMsg);
    console.error("Errore mostrato:", message);
  }
});
