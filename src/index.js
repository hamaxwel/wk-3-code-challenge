document.addEventListener("DOMContentLoaded", () => {
    // Get references to elements from the DOM
    const filmsContainer = document.getElementById('films');
    const runtimeElement = document.getElementById('runtime');
    const showtimeElement = document.getElementById('showtime');
    const titleElement = document.getElementById('title');
    const posterElement = document.getElementById('poster');
    const availableTicketsElement = document.getElementById('ticket-num');
    const descriptionElement = document.getElementById('film-info');
    const purchaseButton = document.getElementById('buy-ticket');
    let selectedFilm = null;

    // Display details of the first film
    function displayFirstFilm() {
        fetch('http://localhost:3000/films/1')
            .then(response => response.json())
            .then(film => {
                renderFilmDetails(film);
            });
    }

      // Display details for the selected film
      function renderFilmDetails(film) {
        selectedFilm = film;
        titleElement.textContent = film.title;
        posterElement.src = film.poster;
        runtimeElement.textContent = `Runtime: ${film.runtime} minutes`;
        showtimeElement.textContent = `Showtime: ${film.showtime}`;
        descriptionElement.textContent = film.description;
        const availableTickets = film.capacity - film.tickets_sold;
        availableTicketsElement.textContent = `Available Tickets: ${availableTickets}`;
        purchaseButton.disabled = availableTickets === 0;
        purchaseButton.textContent = availableTickets === 0 ? "Sold Out" : "Buy Ticket";
    }

    // Fetch and display the list of all films
    function loadFilmList() {
        fetch('http://localhost:3000/films')
            .then(response => response.json())
            .then(films => {
                films.forEach(film => {
                    const filmItem = document.createElement('li');
                    filmItem.textContent = film.title;
                    filmItem.classList.add('film', 'item');
                    
                    // Check if the film is sold out
                    if (film.capacity - film.tickets_sold === 0) {
                        filmItem.classList.add('sold-out');
                    }

                    // Create and attach a delete button for each film
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Delete';
                    deleteButton.addEventListener('click', (e) => {
                        e.stopPropagation(); 
                        removeFilm(film.id, filmItem);
                    });

                    filmItem.appendChild(deleteButton);
                    filmItem.addEventListener('click', () => renderFilmDetails(film));
                    filmsContainer.appendChild(filmItem);
                });
            });
    }

   // Handle ticket purchase
   purchaseButton.addEventListener('click', (event) => {
    event.preventDefault();
    if (selectedFilm && selectedFilm.tickets_sold < selectedFilm.capacity) {
        selectedFilm.tickets_sold++;
        const availableTickets = selectedFilm.capacity - selectedFilm.tickets_sold;
        availableTicketsElement.textContent = `Available Tickets: ${availableTickets}`;
        purchaseButton.disabled = availableTickets === 0;
        purchaseButton.textContent = availableTickets === 0 ? "Sold Out" : "Buy Ticket";

        // Update ticket count in the database
        fetch(`http://localhost:3000/films/${selectedFilm.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tickets_sold: selectedFilm.tickets_sold })
        });
    }
});

    // Remove a film from the list and database
    function removeFilm(filmId, filmItem) {
        fetch(`http://localhost:3000/films/${filmId}`, { method: 'DELETE' })
            .then(response => {
                if (response.ok) {
                    filmItem.remove();
                }
            });
    }

    // Initial load of film details and list
    displayFirstFilm();
    loadFilmList();
});
