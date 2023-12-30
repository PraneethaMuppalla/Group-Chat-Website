const axiosInstance = axios.create({
  baseURL: "http://localhost:3000",
});

const formEl = document.getElementById("loginForm");
const phoneNumEl = document.getElementById("phoneNum");
const passwordEl = document.getElementById("password");

async function loginForm(e) {
  try {
    e.preventDefault();
    const loginUser = {
      phoneNum: phoneNumEl.value,
      password: passwordEl.value,
    };
    const response = await axiosInstance.post("/user/login", loginUser);
    if (confirm("Login successful")) {
      passwordEl.value = "";
      phoneNumEl.value = "";
      localStorage.setItem("token", response.data.token);
      window.location.href = "./home.html";
    }
  } catch (err) {
    if (err.response && err.response.status === 404) {
      if (confirm("You are not registered. Please Signup")) {
        window.location.href = "./signup.html";
      }
    } else if (err.response && err.response.status === 401) {
      alert("Password is incorrect.");
    } else {
      alert("Some error occured. Please try again.");
    }
  }
}

formEl.addEventListener("submit", loginForm);
