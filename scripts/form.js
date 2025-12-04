const fullname = document.getElementById("name");
const email = document.getElementById("email");
const linkedin = document.getElementById("linkedin");
const comments = document.getElementById("comments");
const countdown = document.getElementById("charcount");
// get all inputs
const inputs = document.querySelectorAll("input, textarea");
const required = document.querySelectorAll(
  "input[required], textarea[required]"
);
// output fields
const erroroutput = document.getElementById("errors");
// grab the submit button for submission handling
const form = document.querySelector("form");

// grab formError hidden field
const formErrors = document.getElementById("form-errors");
const form_errors = [];

// temporary error message function
// have default time shown be 3 secs
function showErrorMsg(duration = 3000) {
  const messageVal = document.querySelector("#errors p");
  erroroutput.appendChild(messageVal);
  messageVal.style.opacity = "1";
  setTimeout(() => {
    messageVal.style.opacity = "0";
  }, duration - 500);
}
// temporary info message function, default time 3s
function showInfoMsg(message, duration = 3000) {
  const infoMessage = document.querySelector("#information p");
  infoMessage.textContent = message;
  infoMessage.style.opacity = "1";
  setTimeout(() => {
    infoMessage.style.opacity = "0";
  }, duration - 500);
  setTimeout(() => {
    infoMessage.textContent = "";
  }, duration);
}

// want to make required field go red after input field interacted with if left empty
// first, if form is focused, remove any specialized invalid styling
inputs.forEach((field) => {
  field.addEventListener("focus", function () {
    if (!field.checkValidity()) {
      field.classList.add("invalid");
    } else {
      field.classList.remove("invalid");
    }
  });
  field.addEventListener("blur", function () {
    if (!field.checkValidity()) {
      field.classList.add("invalid");
      form_errors.push({
        field: field.name,
        value: field.value,
        reason: field.validationMessage,
      });
    } else {
      field.classList.remove("invalid");
    }
    field.reportValidity();
  });
});

// applying warning styling and message in output section if improper char entered
inputs.forEach((field) => {
  field.addEventListener("input", function () {
    if (field === email || field === linkedin) {
      let allowed = /^[a-zA-Z0-9._%+\-@/:]*$/;
      if (!allowed.test(field.value)) {
        showErrorMsg();
        field.classList.add("invalid-entry");
      } else {
        field.classList.remove("invalid-entry");
      }
    } else if (field.validity.patternMismatch) {
      showErrorMsg();
      field.classList.add("invalid-entry");
    } else {
      field.classList.remove("invalid-entry");
    }
  });
});

// setting specific validity messages
email.addEventListener("input", (event) => {
  if (!email.checkValidity() && email.validity.typeMismatch) {
    email.setCustomValidity(
      "Enter in a proper email address of the form name@domain.com."
    );
  } else {
    email.setCustomValidity("");
    showInfoMsg("Make sure your email is correct if you want a response!");
  }
});

comments.addEventListener("input", (event) => {
  if (comments.value == "") {
    comments.setCustomValidity("A comment is required to submit this form.");
  } else {
    comments.setCustomValidity("");
    comments.classList.remove("invalid");
  }
});

linkedin.addEventListener("focus", (event) => {
  showInfoMsg("Copy in your profile link to connect!");
});

// counting down characters
const maxLength = comments.getAttribute("maxlength");
comments.addEventListener("input", function () {
  let currLength = this.value.length;
  countdown.textContent = `(${maxLength - currLength} chars remaining)`;
  if (maxLength - currLength < 100) {
    countdown.style.color = "red";
    countdown.style.fontStyle = "bold";
  } else if (maxLength - currLength < 200) {
    countdown.style.color = "orange";
    countdown.style.fontStyle = "normal";
  } else {
    countdown.style.color = "black";
  }
});

form.addEventListener("submit", function (event) {
  event.preventDefault();
  formErrors.value = JSON.stringify(form_errors);
  showInfoMsg("Form submitted!");
  form.submit();
});
