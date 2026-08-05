$(document).ready(function () {
  
  // 1. READ FLIGHT DATA DIRECTLY FROM HANDLEBARS (MONGODB) (MCO2)
  let flightId = $('#hiddenFlightId').val();
  let BASE_FARE = parseInt($('#hiddenBaseFare').val()) || 4500; 
  let FLIGHT_SEATS_AVAILABLE = parseInt($('#hiddenAvailableSeats').val()) || 36;
  const TAXES = 680;

  // Set initial prices immediately in the UI
  $('#costBase').text('₱' + BASE_FARE.toLocaleString());
  $('#costTax').text('₱' + TAXES.toLocaleString());

  // Tracking Passengers & Rules
  let numAdults = 1;
  let numChildren = 0;
  let numInfants = 0;
  let totalPassengers = 1;
  let seatsRequired = 1;

  // Tracking Seats
  let selectedSeats = []; 
  let premiumSeatCount = 0;


  
  // 2. DYNAMIC PASSENGER FORM GENERATION
  
  $('.qty-input').on('change', function() {
    let a = parseInt($('#qtyAdults').val()) || 0;
    let c = parseInt($('#qtyChildren').val()) || 0;
    let i = parseInt($('#qtyInfants').val()) || 0;
    
    let requiredPhysicalSeats = a + c; // Infants do not need seats

    // --- Check against actual flight capacity ---
    if (requiredPhysicalSeats > FLIGHT_SEATS_AVAILABLE) {
      alert(`We're sorry! This flight only has ${FLIGHT_SEATS_AVAILABLE} seat(s) remaining.`);
      // Revert the inputs back to the last valid state
      $('#qtyAdults').val(numAdults);
      $('#qtyChildren').val(numChildren);
      $('#qtyInfants').val(numInfants);
      return;
    }

    // Other Validation Rules
    if (a < 1) {
      alert("There must be at least one adult passenger.");
      $('#qtyAdults').val(numAdults);
      return;
    }
    if (a + c + i > 7) {
      alert("Group bookings are limited to a maximum of 7 passengers.");
      $('#qtyAdults').val(numAdults);
      $('#qtyChildren').val(numChildren);
      $('#qtyInfants').val(numInfants);
      return;
    }
    if (i > a) {
      alert("You can only have one lap infant per adult passenger for safety reasons.");
      $('#qtyInfants').val(numInfants);
      return;
    }

    // Apply Updates
    numAdults = a;
    numChildren = c;
    numInfants = i;
    totalPassengers = a + c + i;
    seatsRequired = requiredPhysicalSeats; 

    // Rebuild the forms
    generatePassengerForms();
    
    // Reset seats when passenger count changes
    selectedSeats = [];
    premiumSeatCount = 0;
    $('.seat-btn').removeClass('seat-selected');
    $('#summSeat').text('None');
    calculateTotal();
  });

  function generatePassengerForms() {
    let html = '';
    let globalIndex = 1;

    function buildForm(index, type, number) {
      let bgStyle = type === 'Infant' ? 'bg-warning bg-opacity-10' : '';
      let seatNote = type === 'Infant' ? '<span class="badge bg-warning text-dark ms-2">No Seat Required</span>' : '';

      // Only ask for Email and Phone for Passenger 1
      let leadContactFields = '';
      if (index === 1) {
        leadContactFields = `
          <div class="col-md-6">
            <label class="form-label">Email Address <span class="text-danger">*</span></label>
            <input type="email" class="form-control" id="leadEmail" required>
          </div>
          <div class="col-md-6">
            <label class="form-label">Contact Number <span class="text-danger">*</span></label>
            <input type="text" class="form-control" required>
          </div>
          <div class="col-12"><hr class="text-muted my-2"></div>
        `;
      }

      return `
        <div class="passenger-block mb-4 border rounded p-3 shadow-sm ${bgStyle}">
          <h6 class="text-primary mb-3 border-bottom pb-2">
            Passenger ${index}: ${type} ${number} ${index === 1 ? '(Lead Contact)' : ''} ${seatNote}
          </h6>
          <div class="row g-3">
            
            ${leadContactFields}
            
            <div class="col-md-6">
              <label class="form-label">Full Name <span class="text-danger">*</span></label>
              <input type="text" class="form-control" id="${index === 1 ? 'leadPassengerName' : ''}" required>
            </div>
            <div class="col-md-6">
              <label class="form-label">Date of Birth <span class="text-danger">*</span></label>
              <input type="date" class="form-control" required>
            </div>
            
            <div class="col-md-4">
              <label class="form-label">Passport Number <span class="text-danger">*</span></label>
              <input type="text" class="form-control" id="${index === 1 ? 'leadPassport' : ''}" required>
            </div>
            <div class="col-md-4">
              <label class="form-label">Nationality <span class="text-danger">*</span></label>
              <select class="form-select" required>
                <option value="">Select...</option>
                <option value="Philippines">Philippines</option>
                <option value="USA">United States</option>
                <option value="Japan">Japan</option>
                <option value="South Korea">South Korea</option>
                <option value="Australia">Australia</option>
                <option value="Canada">Canada</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Germany">Germany</option>
                <option value="France">France</option>
                <option value="China">China</option>
                <option value="India">India</option>
                <option value="Brazil">Brazil</option>
                <option value="Mexico">Mexico</option>
                <option value="Russia">Russia</option>
                <option value="Italy">Italy</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label">Gender <span class="text-danger">*</span></label>
              <select class="form-select" required>
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>
        </div>
      `;
    }

    for (let j = 1; j <= numAdults; j++) { html += buildForm(globalIndex++, 'Adult', j); }
    for (let j = 1; j <= numChildren; j++) { html += buildForm(globalIndex++, 'Child', j); }
    for (let j = 1; j <= numInfants; j++) { html += buildForm(globalIndex++, 'Infant', j); }

    $('#passengerFormsContainer').html(html);
  }

  generatePassengerForms();


  
  // 3. STEPPER NAVIGATION & SMART VALIDATION
  
  $('#btnNext').click(function (e) {
    let form = $('#passengerForm')[0];
    
    if (!form.checkValidity()) {
      e.preventDefault(); 
      form.classList.add('was-validated'); 

      let firstInvalid = $('.form-control:invalid, .form-select:invalid').first();
      if (firstInvalid.length) {
          $('html, body').animate({
              scrollTop: firstInvalid.offset().top - 150 
          }, 300);
          firstInvalid.focus(); 
      }
      return; 
    }

    let leadName = $('#leadPassengerName').val();
    if (totalPassengers > 1) {
       $('#summName').text(leadName + ` (+${totalPassengers - 1} others)`);
    } else {
       $('#summName').text(leadName);
    }

    $('#step1').addClass('d-none');
    $('#step2').removeClass('d-none');

    $('#indicator1 .rounded-circle').removeClass('bg-primary').addClass('bg-success');
    $('#indicator2 .rounded-circle').removeClass('bg-secondary').addClass('bg-primary');
    $('#indicator2').removeClass('text-muted').addClass('text-primary fw-bold');
    
    window.scrollTo(0, 0);
  });

  $('#btnBack').click(function () {
    $('#step2').addClass('d-none');
    $('#step1').removeClass('d-none');
    
    $('#indicator2 .rounded-circle').removeClass('bg-primary').addClass('bg-secondary');
    $('#indicator2').removeClass('text-primary fw-bold').addClass('text-muted');
    $('#indicator1 .rounded-circle').removeClass('bg-success').addClass('bg-primary');
  });


  
  // 4. DYNAMIC SEAT MAP (AJAX) (MCO2)

  function generateSeatMap() {
    const rows = 6;
    const cols = ['A', 'B', 'C', 'D', 'E', 'F'];
    const premiumRows = [1, 2];

    // AJAX Call to our REST API endpoint
    $.get(`/bookings/api/flights/${flightId}/occupied-seats`, function(occupiedSeats) {
        
        let html = '';
        
        // Build the grid based on the database response
        for (let r = 1; r <= rows; r++) {
          html += '<div class="d-flex justify-content-center mb-2">';
          
          cols.forEach((col, index) => {
            let seatId = r + col;
            
            // Check if the seat is in the array returned from MongoDB
            let isOccupied = occupiedSeats.includes(seatId);
            let isPremium = premiumRows.includes(r);
            
            let statusClass = isOccupied ? 'seat-occupied' : (isPremium ? 'seat-premium' : 'seat-available');
            let disabledAttr = isOccupied ? 'disabled' : '';

            if (index === 3) html += '<div class="aisle-gap"></div>';

            html += `
              <button type="button" class="btn seat-btn mx-1 ${statusClass}" 
                      data-seat="${seatId}" 
                      data-premium="${isPremium}" 
                      data-bs-toggle="tooltip" 
                      title="Seat ${seatId} ${isOccupied ? '(Occupied)' : ''}" 
                      ${disabledAttr}>
                ${seatId}
              </button>
            `;
          });
          html += '</div>';
        }
        
        // Inject into HTML and initialize tooltips
        $('#seatGrid').html(html);
        $('[data-bs-toggle="tooltip"]').tooltip();
        
    }).fail(function() {
        $('#seatGrid').html('<p class="text-danger">Error loading seat map.</p>');
    });
  }
  
  // Call it immediately on page load
  generateSeatMap();


  
  // 5. SEAT SELECTION LOGIC (WITH AJAX RUBRIC CHECK) (MCO2)

  $(document).on('click', '.seat-btn:not(.seat-occupied)', function () {
    let clickedBtn = $(this);
    let seatId = clickedBtn.data('seat');
    let isPremium = clickedBtn.data('premium') === true;

    // If user is DESELECTING a seat they already clicked
    if (selectedSeats.includes(seatId)) {
      selectedSeats = selectedSeats.filter(s => s !== seatId);
      clickedBtn.removeClass('seat-selected');
      if (isPremium) premiumSeatCount--;
      $('#summSeat').text(selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None');
      calculateTotal();
      return;
    } 

    // If user is SELECTING a new seat
    if (selectedSeats.length < seatsRequired) {
      
      // --- AJAX CHECK BEFORE SELECTING
      $.get(`/bookings/api/flights/${flightId}/occupied-seats`, function(occupiedSeats) {
          
          // Check if MongoDB says this seat was taken by another user
          if (occupiedSeats.includes(seatId)) {
              alert("Sorry! Someone else just booked seat " + seatId + "!");
              clickedBtn.removeClass('seat-available seat-premium')
                        .addClass('seat-occupied')
                        .prop('disabled', true);
          } else {
              // Seat is free! Proceed with normal selection
              selectedSeats.push(seatId);
              clickedBtn.addClass('seat-selected');
              if (isPremium) premiumSeatCount++;
              
              $('#summSeat').text(selectedSeats.join(', '));
              calculateTotal();
          }
      });

    } else {
      alert(`You only need ${seatsRequired} seat(s). Infants do not require seats.`);
    }
  });

  
  // 6. REAL-TIME CALCULATION
  
  // Handle Meal Description UI
  $('#mealSelect').change(function() {
    let desc = $(this).find(':selected').data('desc');
    $('#mealDesc').html('<i class="bi bi-info-circle text-primary me-1"></i> ' + desc);
    calculateTotal();
  });

  // Calculate triggers
  $('#baggageQty, #priorityToggle, #insuranceCheck, #loungeCheck').on('input change', function() {
    calculateTotal();
  });

  function calculateTotal() {
    // Dynamic Pricing Rules
    let adultFare = BASE_FARE * numAdults;
    let childFare = (BASE_FARE * 0.8) * numChildren;
    let infantFare = (BASE_FARE * 0.1) * numInfants;
    let totalBaseFare = adultFare + childFare + infantFare;
    $('#costBase').text('₱' + totalBaseFare.toLocaleString());

    let totalTaxes = TAXES * totalPassengers;
    $('#costTax').text('₱' + totalTaxes.toLocaleString());

    let seatCost = premiumSeatCount * 500;
    $('#costSeat').text('₱' + seatCost.toLocaleString());

    let singleMealCost = parseInt($('#mealSelect').val()) || 0;
    let totalMealCost = singleMealCost * seatsRequired; 
    $('#costMeal').text('₱' + totalMealCost.toLocaleString());

    let baggageQty = parseInt($('#baggageQty').val()) || 0;
    let baggageCost = baggageQty * 500;
    let priorityCost = $('#priorityToggle').is(':checked') ? 300 : 0; 
    let insuranceCost = $('#insuranceCheck').is(':checked') ? (450 * totalPassengers) : 0; 
    let loungeCost = $('#loungeCheck').is(':checked') ? (1200 * seatsRequired) : 0; 
    
    let extrasTotal = baggageCost + priorityCost + insuranceCost + loungeCost;
    $('#costExtras').text('₱' + extrasTotal.toLocaleString());

    let grandTotal = totalBaseFare + totalTaxes + seatCost + totalMealCost + extrasTotal;
    $('#grandTotal').text('₱' + grandTotal.toLocaleString());
  }

  // Init calculation
  calculateTotal();


  
  // 7. CHECKOUT SUBMISSION (MCO2)
  
  $('#btnCheckout').click(function() {
    
    // Client-Side Validation
    if (selectedSeats.length < seatsRequired) {
      alert(`Please select a seat on the map before proceeding.`);
      return;
    }

    // Gather data exactly as requested in the MCO2 specs
    const bookingData = {
        flightId: flightId,
        passengerName: $('#leadPassengerName').val(),
        email: $('#leadEmail').val(),
        passportNumber: $('#leadPassport').val(),
        seat: selectedSeats[0],
        totalPrice: $('#grandTotal').text()
    };

    // AJAX POST request to save to MongoDB (Replaces localStorage)
    $.post('/bookings', bookingData, function(response) {
        // Success: Redirect to reservations page per Section 4 requirement
        alert(response.message + " Ref: " + response.reference);
        window.location.href = "/reservations"; 

    }).fail(function(xhr) {
        // Server-Side error handling (e.g. seat taken at the last second)
        alert("Booking failed: " + xhr.responseJSON.error);
        
        // Refresh seat map dynamically if someone else took the seat
        generateSeatMap();
        selectedSeats = [];
        $('#summSeat').text('None');
    });

  });

});
