// document ready function
$(document).ready(function(){

  // PAGE CHANGER
  $(document.body).on("click", "tr", function() {

    // check if url contains jobs.html, if true open jobrecord.html
    if (location.href.match("jobs.html")) {
      window.location.href = "jobrecord.html";
    }
    // check if url contains technicians.html, if true open technicianrecord.html
    else if (location.href.match("technicians.html")) {
      window.location.href = "technicianrecord.html";
    }
    // check if url contains equipment.html, if true open equipmentrecord.html
    else if (location.href.match("equipment.html")) {
      window.location.href = "equipmentrecord.html";
    }
  });

// closes document ready function
});
