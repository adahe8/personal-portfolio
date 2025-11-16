const fullname = document.getElementById("name");
const email = document.getElementById("email");
const linkedin = document.getElementById("linkedin");
const comments = document.getElementById("comments");
// get all inputs
const inputs = document.querySelectorAll("input, textarea");

// want to make required field go red after input field interacted with if left empty
// first, if form is focused, remove any specialized invalid styling
inputs.forEach((field) => {
  field.addEventListener("focus", function () {
    field.classList.remove("invalid");
  });
});
// track interaction - if field touched and then left, then have validation display
inputs.forEach((field) => {
  field.addEventListener("blur", function () {
    if (!field.checkValidity()) {
      field.classList.add("invalid");
      field.reportValidity();
    } else {
      field.classList.remove("invalid");
      field.reportValidity();
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
  }
});

comments.addEventListener("input", (event) => {
  if (!comments.checkValidity()) {
    comments.setCustomValidity("A comment is required to submit this form.");
  } else {
    comments.setCustomValidity("");
  }
});
