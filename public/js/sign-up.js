const axiosInstance = axios.create({
  baseURL: "http://localhost:3000",
});

const signUpFormEl = document.getElementById("form");
const nameEl = document.getElementById("name");
const phoneNumEl = document.getElementById("phoneNum");
const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("password");

async function submitSignUpForm(e) {
  try {
    e.preventDefault();
    const newUser = {
      name: nameEl.value,
      email: emailEl.value,
      phoneNumber: phoneNumEl.value,
      password: passwordEl.value,
    };
    const response = await axiosInstance.post("/user/sign-up", newUser);
    console.log(response);
    if (confirm("Registration Successful.")) {
      nameEl.value = "";
      emailEl.value = "";
      passwordEl.value = "";
      phoneNumEl.value = "";
      window.location.href = `./login.html`;
    }
  } catch (err) {
    if (err.response && err.response.status === 409) {
      if (confirm("You are already registered. Please log in.")) {
        window.location.href = `./login.html`;
        nameEl.value = "";
        emailEl.value = "";
        passwordEl.value = "";
        phoneNumEl.value = "";
      }
    } else {
      alert("Some error occured. Please try again.");
    }
  }
}

signUpFormEl.addEventListener("submit", submitSignUpForm);
