document.addEventListener("DOMContentLoaded", function() {
  // Elementi del DOM
  const flightForm = document.getElementById("flightForm");
  const flightInput = document.getElementById("flightInput");
  const outputDiv = document.getElementById("output");
  const submitButton = document.getElementById("submitButton");

  // Gestione della submit del form
  flightForm.addEventListener("submit", async function(e) {
    e.preventDefault();
    clearOutput();
    
    const flightCode = flightInput.value.trim();
    if (!flightCode) {
      displayError("Inserisci un codice IATA valido.");
      console.error("Errore: Codice IATA non valido.");
      return;
    }
    
    console.log("Ricerca volo per codice:", flightCode);
    // Costruzione dell'URL API (esempio: https://api.aviationstack.com/v1/flights?access_key=LA_TUA_CHIAVE_API&flight_iata=AZ123)
    const accessKey = "1212b0a7bc4833f77a0d362df91cff98"; // Sostituisci con la tua chiave API
    const url = `https://api.aviationstack.com/v1/flights?access_key=${accessKey}&flight_iata=${flightCode}`;
    
    console.log("Chiamata API a:", url);
    displayLoading();
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error("Errore HTTP:", response.status);
        throw new Error(`Errore HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      removeLoading();
      
      if (data.error) {
        console.error("Errore API:", data.error);
        displayError("Errore API: " + (data.error.message || "Impossibile recuperare i dati."));
        showStatusAlert("error");
        return;
      }
      
      if (!data.data || data.data.length === 0) {
        console.error("Nessun volo trovato per il codice:", flightCode);
        displayError("Nessun volo trovato per il codice specificato.");
        showStatusAlert("notfound");
        return;
      }
      
      // Utilizza il primo volo trovato
      const flight = data.data[0];
      console.log("Dati volo ricevuti:", flight);
      displayFlightData(flight);
      // Visualizza un avviso in base allo stato del volo
      showStatusAlert(flight.flight_status);
      
    } catch (error) {
      removeLoading();
      displayError("Si è verificato un errore durante il recupero dei dati. Riprova più tardi.");
      console.error("Errore nella chiamata API:", error);
      showStatusAlert("error");
    }
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
  
  // Funzione per visualizzare i dati del volo e la mappa con la posizione
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
    
    // Visualizzazione della mappa se disponibili i dati di posizione (campo live)
    if (flight.live && flight.live.latitude && flight.live.longitude) {
      const lat = flight.live.latitude;
      const lng = flight.live.longitude;
      const mapContainer = document.createElement("div");
      mapContainer.className = "map-container";
      mapContainer.innerHTML = `
        <h3>Posizione Attuale dell'Aereo</h3>
        <iframe src="https://maps.google.com/maps?q=${lat},${lng}&z=8&output=embed" width="100%" height="400"></iframe>
      `;
      outputDiv.appendChild(mapContainer);
      console.log("Mappa con posizione visualizzata");
    } else {
      const noPosMsg = document.createElement("p");
      noPosMsg.textContent = "Posizione attuale dell'aereo non disponibile.";
      noPosMsg.style.textAlign = "center";
      outputDiv.appendChild(noPosMsg);
      console.log("Posizione non disponibile");
    }
  }
  
  // Funzione per visualizzare messaggi di errore
  function displayError(message) {
    outputDiv.innerHTML = `<p class="error">${message}</p>`;
    console.error("Errore mostrato:", message);
  }
  
  // Funzione per mostrare l'avviso di stato del volo con animazione dal bordo sinistro
  function showStatusAlert(status) {
    const alertDiv = document.createElement("div");
    alertDiv.className = "status-alert";
    
    // Determina il tipo di alert in base allo stato
    if (typeof status === "string") {
      const stat = status.toLowerCase();
      if (stat === "active") {
        alertDiv.textContent = "Il volo è in corso.";
        alertDiv.classList.add("alert-green");
      } else if (stat === "scheduled") {
        alertDiv.textContent = "Il volo non è ancora partito.";
        alertDiv.classList.add("alert-orange");
      } else {
        alertDiv.textContent = "Stato del volo non definito.";
        alertDiv.classList.add("alert-red");
      }
    } else {
      // In caso di errore o volo non trovato
      alertDiv.textContent = "Errore nel recupero del volo.";
      alertDiv.classList.add("alert-red");
    }
    
    // Inserisci l'avviso nel body
    document.body.appendChild(alertDiv);
    
    // Attiva l'animazione di slide in dal bordo sinistro
    setTimeout(() => {
      alertDiv.classList.add("slide-in");
    }, 100);
    
    // Auto-nascondi l'avviso dopo 5 secondi con animazione di slide out
    setTimeout(() => {
      alertDiv.classList.remove("slide-in");
      alertDiv.classList.add("slide-out");
      setTimeout(() => { alertDiv.remove(); }, 500);
    }, 5000);
  }
});
