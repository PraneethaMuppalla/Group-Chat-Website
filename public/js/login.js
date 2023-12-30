const axiosInstance = axios.create({
  baseUrl: "http://localhost:3000",
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
    await axiosInstance.post("/user/login", loginUser);
  } catch (err) {
    console.error(err);
  }
}

formEl.addEventListener("submit", loginForm);
