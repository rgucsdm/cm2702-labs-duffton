// SERVER.JS
// AYLA DUFFTON, 1005377
// MAY 2020

// code to requre the express, body-parser, https, mongoose, and lodash modules
const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const mongoose = require("mongoose");
const _ = require("lodash");

/* const request = require("request"); - request module is deprecated */

// initialises express
const app = express();

// sets app to use ejs as the view engine
app.set("view engine", "ejs");

// uses the public folder to work with static pages
app.use(express.static("public"));
// initialises body-parser
app.use(bodyParser.urlencoded({
  extended: true
}));


// connects to mongodb atlas database
mongoose.connect("mongodb+srv://admin-ayla:7CMP.-2Lx%23GAbwg@duffton-ibyf6.gcp.mongodb.net/schedulerDB?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

// sets up jobs schema
const jobsSchema = {
  jobNumber: Number,
  duration: Number,
  technicians: String,
  street: String,
  town: String,
  county: String,
  postcode: String
};

// sets up job model
const Job = mongoose.model("Job", jobsSchema);

// sets up technicians schema
const techniciansSchema = {
  name: String,
  email: String,
  phone: Number,
  street: String,
  town: String,
  county: String,
  postcode: String,
  availability: String,
  qualification: String
};

// sets up technician model
const Technician = mongoose.model("Technician", techniciansSchema);

// sets up equipment schema
const equipmentSchema = {
  equipmentNumber: Number,
  description: String,
  status: String,
  currentJob: Number,
  notes: String
};

// sets up equipment model
const Equipment = mongoose.model("Equipment", equipmentSchema);

// sets up login schema
const loginSchema = {
  userName: String,
  password: String
};

// sets up login model
const Login = mongoose.model("Login", loginSchema);

// const loginDetails = new Login({
//   userName: "scheduler",
//   password: "trac"
// });
// loginDetails.save();


// handles get request from web browser on home route
app.get("/", function(req, res) {
  res.render("index", {
    title: "Job Scheduler",
    subTitle: ""
  });
});

// handles the post request from the index (login) page on home route for login form
app.post("/", function(req, res) {
  // stores username and password in object
  const loginInput = {
    username: req.body.userName,
    password: req.body.password
  };
  // checks database for correct username and password
  Login.find(function(err, logins) {
    if (err) {
      console.log(err);
    } else {
      const correctUserName = (logins[0].userName);
      const correctPassword = (logins[0].password);
      // checks if username and password match database entry and if so, redirects to the main page, else redirect to incorrect page
      if (loginInput.username === correctUserName && loginInput.password === correctPassword) {
        res.redirect("main");
      } else {
        res.redirect("/incorrect");
      };
    }
  });
});

// handles get request from the index (login) page if username and password are incorrect on incorrect route
app.get("/incorrect", function(req, res) {
  res.render("index", {
    title: "Job Scheduler",
    subTitle: "Incorrect username or password, please try again!"
  });
});


// handles get request from the index (login) page on main route
app.get("/main", function(req, res) {
  res.render("main", {
    title: "Job Scheduler",
    subTitle: "Menu"
  });
});


// handles get request from the menus on jobs route
app.get("/jobs", function(req, res) {
  Job.find({}, function(err, foundJobs) {
    // renders the scheduler page with the title, message, create button route, table headers, and job records from the jobs collection in the database
    res.render("scheduler", {
      title: "Job Scheduler",
      subTitle: "Jobs",
      message: "Jobs",
      createPage: "/createjob",
      tableHeaderA: "Job Number",
      tableHeaderB: "Technician",
      tableHeaderC: "Location",
      jobRecords: foundJobs,
      searchMessage: "Enter Job Number"
    });
  });
});

// handles post request from the edit button on the jobs page, on jobrecord route
app.post("/jobrecord", function(req, res) {
  let jobId = req.body.editJob;
  // searches the database for the id of the selected job record and stores the values of the records fields
  Job.findOne({
    _id: jobId
  }, function(err, jobFound) {
    let jobNumber = jobFound.jobNumber;
    let duration = jobFound.duration;
    let technicians = _.startCase(jobFound.technicians);
    let street = _.startCase(jobFound.street);
    let town = _.startCase(jobFound.town);
    let county = _.startCase(jobFound.county);
    let postcode = _.toUpper(jobFound.postcode);
    // api key
    const apiKey = "AIzaSyArWgvChtFmRSGnyCoNPwwanjsSKA06UzY";
    // img src url
    const url = "https://maps.googleapis.com/maps/api/staticmap?center=" + town + "," + county + "," + postcode + "&zoom=16&size=600x300&maptype=roadmap&markers=size:mid%7Ccolor:0xFFDB30%7C" + postcode + "&key=" + apiKey;
    console.log(url);
    // renders the jobRecord page and sends the field values to populate the form fields on the page
    res.render("jobRecord", {
      title: "Job Scheduler",
      subTitle: "Job Record",
      jobNumber: jobNumber,
      duration: duration,
      technicians: technicians,
      street: street,
      town: town,
      county: county,
      postcode: postcode,
      jobId: jobId,
      mapUrl: url
    });
  });
});

// handles get request from the create button on the jobs page, on createjob route
app.get("/createjob", function(req, res) {
  res.render("createJob", {
    title: "Job Scheduler",
    subTitle: "Create Job Record"
  });
});

// handles post request from the create job page on submitjob route
app.post("/submitjob", function(req, res) {
  let jobNumber = req.body.inputJob;
  let duration = req.body.inputDuration;
  let technicians = _.startCase(req.body.inputTech);
  let street = _.startCase(req.body.inputStreet);
  let town = _.startCase(req.body.inputTown);
  let county = _.startCase(req.body.inputCounty);
  let postcode = _.toUpper(req.body.inputPostcode);
  // takes the values of the variables above and creates a new job record in the jobs collection of the database
  const jobDetails = new Job({
    jobNumber: jobNumber,
    duration: duration,
    technicians: technicians,
    street: street,
    town: town,
    county: county,
    postcode: postcode
  });
  jobDetails.save();
  res.redirect("/jobs");
});


// handles get request from the menus on technicians route
app.get("/technicians", function(req, res) {
  Technician.find({}, function(err, foundTechnicians) {
    // renders the scheduler page with the title, message, create button route, table headers, and technician records from the technicians collection in the database
    res.render("scheduler", {
      title: "Job Scheduler",
      subTitle: "Technicians",
      message: "Technicians",
      createPage: "/createtechnician",
      tableHeaderA: "Name",
      tableHeaderB: "Availability",
      tableHeaderC: "Qualification",
      technicianRecords: foundTechnicians,
      searchMessage: "Enter Technician Name"
    });
  });
});

// handles post request from the edit button on the technicians page, on jobrecord route
app.post("/technicianrecord", function(req, res) {
  let technicianId = req.body.editTechnician;
  // searches the database for the id of the selected technician record and stores the values of the records fields
  Technician.findOne({
    _id: technicianId
  }, function(err, technicianFound) {
    let name = _.startCase(technicianFound.name);
    let email = _.toLower(technicianFound.email);
    let phone = technicianFound.phone;
    let street = _.startCase(technicianFound.street);
    let town = _.startCase(technicianFound.town);
    let county = _.startCase(technicianFound.county);
    let postcode = _.toUpper(technicianFound.postcode);
    let availability = _.startCase(technicianFound.availability);
    let qualification = _.startCase(technicianFound.qualification);
    // renders the technicianRecord page and sends the field values to populate the form fields on the page
    res.render("technicianRecord", {
      title: "Job Scheduler",
      subTitle: "Technician Record",
      name: name,
      email: email,
      phone: phone,
      street: street,
      town: town,
      county: county,
      postcode: postcode,
      availability: availability,
      qualification: qualification,
      technicianId: technicianId
    });
  });
});

// handles get request from the create button on the technicians page, on createtechnician route
app.get("/createtechnician", function(req, res) {
  res.render("createTechnician", {
    title: "Job Scheduler",
    subTitle: "Create Technician Record"
  });
});

// handles post request from the create technician on submittechnician route
app.post("/submittechnician", function(req, res) {
  let name = _.startCase(req.body.inputName);
  let email = _.toLower(req.body.inputEmail);
  let phone = req.body.inputPhone;
  let street = _.startCase(req.body.inputStreet);
  let town = _.startCase(req.body.inputTown);
  let county = _.startCase(req.body.inputCounty);
  let postcode = _.toUpper(req.body.inputPostcode);
  let availability = _.startCase(req.body.inputAvailability);
  let qualification = _.startCase(req.body.inputQualification);
  // takes the values of the variables above and creates a new technician record in the technicians collection of the database
  const technicianDetails = new Technician({
    name: name,
    email: email,
    phone: phone,
    street: street,
    town: town,
    county: county,
    postcode: postcode,
    availability: availability,
    qualification: qualification
  });
  technicianDetails.save();
  res.redirect("/technicians");
});


// handles get request from the menus on equipment route
app.get("/equipment", function(req, res) {
  Equipment.find({}, function(err, foundEquipment) {
    // renders the scheduler page with the title, message, create button route, table headers, and equipment records from the equipment collection in the database
    res.render("scheduler", {
      title: "Job Scheduler",
      subTitle: "Equipment",
      message: "Equipment",
      createPage: "/createequipment",
      tableHeaderA: "Equipment Number",
      tableHeaderB: "Current Job",
      tableHeaderC: "Status",
      equipmentRecords: foundEquipment,
      searchMessage: "Enter Equipment Number"
    });
  });
});

// handles post request from the edit button on the equipment page, on equipmentrecord route
app.post("/equipmentrecord", function(req, res) {
  let equipmentId = req.body.editEquipment;
  // searches the database for the id of the selected equipment record and stores the values of the records fields
  Equipment.findOne({
    _id: equipmentId
  }, function(err, equipmentFound) {
    let equipmentNumber = equipmentFound.equipmentNumber;
    let description = _.startCase(equipmentFound.description);
    let status = _.startCase(equipmentFound.status);
    let currentJob = (equipmentFound.currentJob);
    let notes = _.capitalize(equipmentFound.notes);
    // renders the equipmentRecord page and sends the field values to populate the form fields on the page
    res.render("equipmentRecord", {
      title: "Job Scheduler",
      subTitle: "Equipment Record",
      equipmentNumber: equipmentNumber,
      description: description,
      status: status,
      currentJob: currentJob,
      notes: notes,
      equipmentId: equipmentId
    });
  });
});

// handles get request from the create button on the equipment page, on createequipment route
app.get("/createequipment", function(req, res) {
  res.render("createEquipment", {
    title: "Job Scheduler",
    subTitle: "Create Equipment Record"
  });
});

// handles post request from the create equipment on submitequipment route
app.post("/submitequipment", function(req, res) {
  let equipmentNumber = req.body.inputEquipment;
  let description = _.startCase(req.body.inputDescription);
  let status = _.startCase(req.body.inputStatus);
  let currentJob = (req.body.inputCurrentJob);
  let notes = _.capitalize(req.body.inputNotes);
  // takes the values of the variables above and creates a new equipment record in the equipment collection of the database
  const equipmentDetails = new Equipment({
    equipmentNumber: equipmentNumber,
    description: description,
    status: status,
    currentJob: currentJob,
    notes: notes
  });
  equipmentDetails.save();
  res.redirect("/equipment");
});


// handles post request from the filter and search buttons from the jobs, technicians, and equipment pages on query route
app.post("/query", function(req, res) {
  let query = req.body.searchQuery;
  let recordType = req.body.recordType;
  if (recordType === "Jobs") {
    Job.findOne({jobNumber: query}, function(err, foundJob) {
      // renders the scheduler page with the title, message, create button route, table headers, and job record from the search of the jobs collection in the database
      res.render("scheduler", {
        title: "Job Scheduler",
        subTitle: "Jobs",
        message: "JobQuery",
        createPage: "/createjob",
        tableHeaderA: "Job Number",
        tableHeaderB: "Technician",
        tableHeaderC: "Location",
        jobRecord: foundJob,
        searchMessage: "Enter Job Number"
      });
    });
  } else if (recordType === "Technicians") {
    query = _.startCase(query);
    console.log(query, recordType);
    Technician.findOne({name: query}, function(err, foundTechnician) {
      // renders the scheduler page with the title, message, create button route, table headers, and technician record from the search of the technicians collection in the database
      res.render("scheduler", {
        title: "Job Scheduler",
        subTitle: "Technicians",
        message: "TechnicianQuery",
        createPage: "/createtechnician",
        tableHeaderA: "Name",
        tableHeaderB: "Availability",
        tableHeaderC: "Qualification",
        technicianRecord: foundTechnician,
        searchMessage: "Enter Technician Name"
      });
    });
  } else if (recordType === "Equipment") {
    Equipment.findOne({equipmentNumber: query}, function(err, foundEquipment) {
      // renders the scheduler page with the title, message, create button route, table headers, and equipment record from the search of the equipment collection in the database
      res.render("scheduler", {
        title: "Job Scheduler",
        subTitle: "Equipment",
        message: "EquipmentQuery",
        createPage: "/createequipment",
        tableHeaderA: "Equipment Number",
        tableHeaderB: "Current Job",
        tableHeaderC: "Status",
        equipmentRecord: foundEquipment,
        searchMessage: "Enter Equipment Number"
      });
    });
  }

});


// handles the post request from the save button on the record pages
app.post("/recordupdate", function(req, res) {
  // identifies which collection the record is in
  let collection = req.body.recordType;
  // checks if collection is the jobs collection and sets the variables for the fields to be updated with the data input from the job record form
  if (collection === "Job Record") {
    let id = req.body.jobId;
    let jobNumber = req.body.updateJob;
    let duration = req.body.updateDuration;
    let technicians = _.startCase(req.body.updateTech);
    let street = _.startCase(req.body.updateStreet);
    let town = _.startCase(req.body.updateTown);
    let county = _.startCase(req.body.updateCounty);
    let postcode = _.toUpper(req.body.updatePostcode);
    // checks if the specified variable has a value to update
    if (jobNumber !== "") {
      // finds the correct job record and updates the value
      Job.findByIdAndUpdate(
        id, {
          jobNumber: jobNumber
        },
        function(err) {
          if (!err) {
            console.log("job number field successfully updated.");
          }
        });
    };
    if (duration !== "") {
      Job.findByIdAndUpdate(
        id, {
          duration: duration
        },
        function(err) {
          if (!err) {
            console.log("duration field successfully updated.");
          }
        });
    };
    if (technicians !== "") {
      Job.findByIdAndUpdate(
        id, {
          technicians: technicians
        },
        function(err) {
          if (!err) {
            console.log("technician field successfully updated.");
          }
        });
    };
    if (street !== "") {
      Job.findByIdAndUpdate(
        id, {
          street: street
        },
        function(err) {
          if (!err) {
            console.log("street field successfully updated.");
          }
        });
    };
    if (town !== "") {
      Job.findByIdAndUpdate(
        id, {
          town: town
        },
        function(err) {
          if (!err) {
            console.log("town field successfully updated.");
          }
        });
    };
    if (county !== "") {
      Job.findByIdAndUpdate(
        id, {
          county: county
        },
        function(err) {
          if (!err) {
            console.log("county field successfully updated.");
          }
        });
    };
    if (postcode !== "") {
      Job.findByIdAndUpdate(
        id, {
          postcode: postcode
        },
        function(err) {
          if (!err) {
            console.log("postcode field successfully updated.");
          }
        });
    };
    // redirects to the jobs route
    res.redirect("/jobs");

  } else if (collection === "Technician Record") {
    let id = req.body.technicianId;
    let name = _.startCase(req.body.updateName);
    let email = _.toLower(req.body.updateEmail);
    let phone = req.body.updatePhone
    let street = _.startCase(req.body.updateStreet);
    let town = _.startCase(req.body.updateTown);
    let county = _.startCase(req.body.updateCounty);
    let postcode = _.toUpper(req.body.updatePostcode);
    let availability = _.startCase(req.body.updateAvailability);
    let qualification = _.startCase(req.body.updateQualification);
    // checks if the specified variable has a value to update
    if (name !== "") {
      // finds the correct technician record and updates the value
      Technician.findByIdAndUpdate(
        id, {
          name: name
        },
        function(err) {
          if (!err) {
            console.log("name field successfully updated.");
          }
        });
    };
    if (email !== "") {
      Technician.findByIdAndUpdate(
        id, {
          email: email
        },
        function(err) {
          if (!err) {
            console.log("email field successfully updated.");
          }
        });
    };
    if (phone !== "") {
      Technician.findByIdAndUpdate(
        id, {
          phone: phone
        },
        function(err) {
          if (!err) {
            console.log("phone field successfully updated.");
          }
        });
    };
    if (street !== "") {
      Technician.findByIdAndUpdate(
        id, {
          street: street
        },
        function(err) {
          if (!err) {
            console.log("street field successfully updated.");
          }
        });
    };
    if (town !== "") {
      Technician.findByIdAndUpdate(
        id, {
          town: town
        },
        function(err) {
          if (!err) {
            console.log("town field successfully updated.");
          }
        });
    };
    if (county !== "") {
      Technician.findByIdAndUpdate(
        id, {
          county: county
        },
        function(err) {
          if (!err) {
            console.log("county field successfully updated.");
          }
        });
    };
    if (postcode !== "") {
      Technician.findByIdAndUpdate(
        id, {
          postcode: postcode
        },
        function(err) {
          if (!err) {
            console.log("postcode field successfully updated.");
          }
        });
    };
    if (availability !== "") {
      Technician.findByIdAndUpdate(
        id, {
          availability: availability
        },
        function(err) {
          if (!err) {
            console.log("availability field successfully updated.");
          }
        });
    };
    if (qualification !== "") {
      Technician.findByIdAndUpdate(
        id, {
          qualification: qualification
        },
        function(err) {
          if (!err) {
            console.log("qualification field successfully updated.");
          }
        });
    };
    res.redirect("/technicians");

  } else if (collection === "Equipment Record") {
    let id = req.body.equipmentId;
    let equipmentNumber = req.body.updateEquipment;
    let description = _.startCase(req.body.updateDescription);
    let status = _.startCase(req.body.updateStatus);
    let currentJob = (req.body.updateCurrentJob);
    let notes = _.capitalize(req.body.updateNotes);
    // checks if the specified variable has a value to update
    if (equipmentNumber !== "") {
      // finds the correct job record and updates the value
      Equipment.findByIdAndUpdate(
        id, {
          equipmentNumber: equipmentNumber
        },
        function(err) {
          if (!err) {
            console.log("equipment number field successfully updated.");
          }
        });
    };
    if (description !== "") {
      Equipment.findByIdAndUpdate(
        id, {
          description: description
        },
        function(err) {
          if (!err) {
            console.log("description field successfully updated.");
          }
        });
    };
    if (status !== "") {
      Equipment.findByIdAndUpdate(
        id, {
          status: status
        },
        function(err) {
          if (!err) {
            console.log("status field successfully updated.");
          }
        });
    };
    if (currentJob !== "") {
      Equipment.findByIdAndUpdate(
        id, {
          currentJob: currentJob
        },
        function(err) {
          if (!err) {
            console.log("current job field successfully updated.");
          }
        });
    };
    if (notes !== "") {
      Equipment.findByIdAndUpdate(
        id, {
          notes: notes
        },
        function(err) {
          if (!err) {
            console.log("notes field successfully updated.");
          }
        });
    };
    // redirects to the equipment route
    res.redirect("/equipment");
  };
});


// handles the post request from the delete button on the records pages
app.post("/recorddelete", function(req, res) {
  let collection = req.body.recordType;
  // checks which collection the record is in, searches for the record by id and deletes it
  if (collection === "Job Record") {
    let id = req.body.jobId;
    Job.findByIdAndRemove(id, function(err) {
      if (!err) {
        console.log("Item successfully deleted.");
        res.redirect("/jobs");
      }
    });
  } else if (collection === "Technician Record") {
    let id = req.body.technicianId;
    Technician.findByIdAndRemove(id, function(err) {
      if (!err) {
        console.log("Item successfully deleted.");
        res.redirect("/technicians");
      }
    });
  } else if (collection === "Equipment Record") {
    let id = req.body.equipmentId;
    Equipment.findByIdAndRemove(id, function(err) {
      if (!err) {
        console.log("Item successfully deleted.");
        res.redirect("/equipment");
      }
    });
  };
});


// initialises server
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started.")
});
// app.listen(process.env.PORT || 3000, function(){
//   console.log("Server is running.");
// });

// heroku link - https://gentle-ravine-77155.herokuapp.com
// git link - https://git.heroku.com/gentle-ravine-77155.git

// connection String for database in hyper terminal
// mongo "mongodb+srv://duffton-ibyf6.gcp.mongodb.net/test" --username admin-ayla

// google map api key - AIzaSyArWgvChtFmRSGnyCoNPwwanjsSKA06UzY
