const axiosInstance = axios.create({
  baseURL: "http://localhost:3000",
});
const formEl = document.getElementById("form");
const emailEl = document.getElementById("email");

async function submitForm(e) {
  e.preventDefault();
  try {
    let email = {
      email: emailEl.value,
    };
    const response = await axiosInstance.post(
      "/password/forgot-passwords",
      email
    );
    emailEl.value = "";
    alert("A link to reset password is sent to your mail");
  } catch (err) {
    if (err.response && err.response.status === 404) {
      alert("Email you entered is incorrect. Please try again.");
    } else {
      alert("Some error occured. Please try again.");
    }
  }
}

formEl.addEventListener("submit", submitForm);
