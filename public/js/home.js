const token = localStorage.getItem("token");
const axiosInstance = axios.create({
  baseURL: "http://localhost:3000",
  headers: { Authorization: token },
});

const formEl = document.getElementById("form");
const messageEl = document.getElementById("msg");

async function postNewMsg(e) {
  try {
    e.preventDefault();
    const newMsg = {
      msg: messageEl.value,
    };
    await axiosInstance.post("/msg/new-msg", newMsg);
    messageEl.value = "";
  } catch (err) {
    console.error(err);
    alert("Some error occured. Please try again.");
  }
}

formEl.addEventListener("submit", postNewMsg);
