$(document).ready(function() {

    $('#oneWayBtn').click(function() {
        $('#returnDateSection').hide();
        $('#oneWayBtn').removeClass('btn-outline-primary').addClass('btn-primary');
        $('#roundTripBtn').removeClass('btn-primary').addClass('btn-outline-primary');
    });

    $('#roundTripBtn').click(function() {
        $('#returnDateSection').show();
        $('#roundTripBtn').removeClass('btn-outline-primary').addClass('btn-primary');
        $('#oneWayBtn').removeClass('btn-primary').addClass('btn-outline-primary');
    });

    $('#adultPlus').click(function() {
        let count = parseInt($('#adultCount').text());
        $('#adultCount').text(count + 1);
    });

    $('#adultMinus').click(function() {
        let count = parseInt($('#adultCount').text());
        if (count > 1) $('#adultCount').text(count - 1);
    });

    $('#childPlus').click(function() {
        let count = parseInt($('#childCount').text());
        $('#childCount').text(count + 1);
    });

    $('#childMinus').click(function() {
        let count = parseInt($('#childCount').text());
        if (count > 0) $('#childCount').text(count - 1);
    });

    $('#infantPlus').click(function() {
        let count = parseInt($('#infantCount').text());
        $('#infantCount').text(count + 1);
    });

    $('#infantMinus').click(function() {
        let count = parseInt($('#infantCount').text());
        if (count > 0) $('#infantCount').text(count - 1);
    });

    $('#priceSlider').on('input', function() {
        $('#priceSliderValue').text(parseInt($(this).val()).toLocaleString());
        applyFilters();
    });

    let allFlights = [];

    $('#searchBtn').click(function() {

        const origin = $('#origin').val();
        const destination = $('#destination').val();
        const date = $('#departureDate').val();

        let valid = true;

        if (!origin) {
            $('#originError').removeClass('d-none');
            valid = false;
        } else {
            $('#originError').addClass('d-none');
        }

        if (!destination) {
            $('#destinationError').removeClass('d-none');
            valid = false;
        } else {
            $('#destinationError').addClass('d-none');
        }

        if (origin && destination && origin === destination) {
            $('#sameRouteError').removeClass('d-none');
            valid = false;
        } else {
            $('#sameRouteError').addClass('d-none');
        }

        if (!date) {
            $('#departureDateError').removeClass('d-none');
            valid = false;
        } else {
            $('#departureDateError').addClass('d-none');
        }

        if (!valid) return;

        $('#searchSpinner').removeClass('d-none');
        $('#searchBtnText').text('Searching...');

        const toastEl = document.getElementById('searchToast');
        const toast = new bootstrap.Toast(toastEl);
        $('#searchToast').addClass('bg-primary');
        $('#toastMessage').text('Searching for flights...');
        toast.show();

        $.ajax({
            url: '/flights/search/results',
            method: 'GET',
            data: { origin, destination, date },
            success: function(flights) {
                allFlights = flights;
                applyFilters();
                $('#resultsSection').show();
                $('#resultsCount').text(flights.length);
                $('#searchSpinner').addClass('d-none');
                $('#searchBtnText').text('Search Flights');
                $('#searchToast').removeClass('bg-primary').addClass('bg-success');
                $('#toastMessage').text('Flights loaded successfully!');
                toast.show();
            },
            error: function() {
                $('#searchSpinner').addClass('d-none');
                $('#searchBtnText').text('Search Flights');
                $('#searchToast').removeClass('bg-primary').addClass('bg-danger');
                $('#toastMessage').text('Something went wrong. Please try again.');
                toast.show();
            }
        });

    });

    function renderFlights(flights) {
        $('#flightResults').empty();

        if (flights.length === 0) {
            $('#noResults').show();
            return;
        }

        $('#noResults').hide();

        flights.forEach(function(flight) {
            const card = `
                <div class="card mb-3 p-3 shadow-sm">
                    <div class="row align-items-center">
                        <div class="col-md-2">
                            <strong>${flight.airline}</strong><br>
                            <small>${flight.flightNumber}</small>
                        </div>
                        <div class="col-md-3">
                            <strong>${new Date(flight.departure).toLocaleString()}</strong><br>
                            <small>${flight.origin} → ${flight.destination}</small>
                        </div>
                        <div class="col-md-2">
                            <small>Arrives</small><br>
                            <strong>${new Date(flight.arrival).toLocaleString()}</strong>
                        </div>
                        <div class="col-md-2">
                            <small>Seats left</small><br>
                            <strong>${flight.seats}</strong>
                        </div>
                        <div class="col-md-2">
                            <strong>₱${flight.price.toLocaleString()}</strong>
                        </div>
                        <div class="col-md-1 text-end">
                            <button class="btn btn-sm btn-outline-primary mb-1 view-details-btn"
                                data-id="${flight._id}"> View Details </button>
                            <a href="/bookings/${flight._id}"
                                class="btn btn-sm btn-primary"> Book </a>
                        </div>
                    </div>
                </div>
            `;
            $('#flightResults').append(card);
        });
    }

    function applyFilters() {
        let filtered = [...allFlights];

        const selectedAirlines = $('.filter-airline:checked').map(function() {
            return $(this).val();
        }).get();

        if (selectedAirlines.length > 0) {
            filtered = filtered.filter(function(f) {
                return selectedAirlines.includes(f.airline);
            });
        }

        const selectedPrices = $('.filter-price:checked').map(function() {
            return $(this).val();
        }).get();

        if (selectedPrices.length > 0) {
            filtered = filtered.filter(function(f) {
                return selectedPrices.some(function(range) {
                    const [min, max] = range.split('-').map(Number);
                    return f.price >= min && f.price <= max;
                });
            });
        }

        const selectedStops = $('.filter-stops:checked').map(function() {
            return parseInt($(this).val());
        }).get();

        if (selectedStops.length > 0) {
            filtered = filtered.filter(function(f) {
                return selectedStops.includes(f.stops);
            });
        }

        const selectedSchedule = $('.filter-schedule:checked').map(function() {
            return $(this).val();
        }).get();

        if (selectedSchedule.length > 0) {
            filtered = filtered.filter(function(f) {
                const hour = new Date(f.departure).getHours();
                return selectedSchedule.some(function(s) {
                    if (s === 'morning') return hour >= 5 && hour < 12;
                    if (s === 'afternoon') return hour >= 12 && hour < 18;
                    if (s === 'evening') return hour >= 18 && hour < 24;
                    if (s === 'night') return hour >= 0 && hour < 5;
                });
            });
        }

        const preferredAirline = $('#preferredAirline').val();
        if (preferredAirline) {
            filtered = filtered.filter(function(f) {
                return f.airline === preferredAirline;
            });
        }

        const maxPrice = parseInt($('#priceSlider').val());
        filtered = filtered.filter(function(f) {
            return f.price <= maxPrice;
        });

        if ($('#directOnly').is(':checked')) {
            filtered = filtered.filter(function(f) {
                return f.stops === 0;
            });
        }

        const sortBy = $('#sortSelect').val();
        if (sortBy === 'price') {
            filtered.sort(function(a, b) { return a.price - b.price; });
        } else if (sortBy === 'departure') {
            filtered.sort(function(a, b) {
                return new Date(a.departure) - new Date(b.departure);
            });
        } else if (sortBy === 'duration') {
            filtered.sort(function(a, b) { return a.durationMins - b.durationMins; });
        }

        $('#resultsCount').text(filtered.length);
        renderFlights(filtered);
    }

    $('#sortSelect').change(function() {
        applyFilters();
    });

    $('.filter-airline, .filter-price, .filter-stops, .filter-schedule').change(function() {
        applyFilters();
    });

    $('#clearFiltersBtn, #resetFiltersBtn').click(function() {
        $('.filter-airline, .filter-price, .filter-stops, .filter-schedule').prop('checked', false);
        $('#preferredAirline').val('');
        $('#priceSlider').val(50000);
        $('#priceSliderValue').text('50,000');
        $('#directOnly').prop('checked', false);
        applyFilters();
    });

    $(document).on('click', '.view-details-btn', function() {
        const id = $(this).data('id');
        const flight = allFlights.find(function(f) { return f._id === id; });
        if (!flight) return;
        $('#modalBody').html(`
            <p><strong>Flight Number:</strong> ${flight.flightNumber}</p>
            <p><strong>Airline:</strong> ${flight.airline}</p>
            <p><strong>Origin:</strong> ${flight.origin}</p>
            <p><strong>Destination:</strong> ${flight.destination}</p>
            <p><strong>Departure:</strong> ${new Date(flight.departure).toLocaleString()}</p>
            <p><strong>Arrival:</strong> ${new Date(flight.arrival).toLocaleString()}</p>
            <p><strong>Seats Available:</strong> ${flight.seats}</p>
            <p><strong>Price:</strong> ₱${flight.price.toLocaleString()}</p>
        `);
        $('#flightDetailsModal .btn-primary').attr('href', '/flight-details?flightId=' + flight._id);
        new bootstrap.Modal(document.getElementById('flightDetailsModal')).show();
    });

});
