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

async function getAllMsgs() {
  try {
    const response = await axiosInstance.get("/msg/get-all-msg");
    console.log(response.data.msg);
  } catch (err) {
    console.error(err);
    alert("Some error occured. We can't fetch messages right now.");
  }
}

formEl.addEventListener("submit", postNewMsg);
window.addEventListener("DOMContentLoaded", getAllMsgs);
