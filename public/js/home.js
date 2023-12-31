const token = localStorage.getItem("token");
const axiosInstance = axios.create({
  baseURL: "http://localhost:3000",
  headers: { Authorization: token },
});

const formEl = document.getElementById("form");
const messageEl = document.getElementById("msg");
const msgRow = document.getElementById("messages-row");

function renderEachmsg(each, belongsToUser) {
  console.log(each);
  const divEl = document.createElement("div");
  if (belongsToUser == 1) {
    divEl.className = " message sent";
  } else {
    const pEl = document.createElement("span");
    pEl.className = "name";
    pEl.textContent = each.user.name;
    divEl.appendChild(pEl);
    divEl.className = "message received";
  }
  const pEl2 = document.createElement("span");
  pEl2.textContent = each.message;
  divEl.appendChild(pEl2);
  const spanParent = document.createElement("span");
  spanParent.className = "metadata";
  const spanChild = document.createElement("span");
  const parts = each.time.split(/[/, ,: ]+/);
  const [day, month, year, hour, minute, second, period] = parts;
  const convertedHour = hour % 12 || 12;
  const convertedTime = `${convertedHour}:${minute} ${period}`;
  spanChild.textContent = convertedTime;
  spanChild.className = "time";
  spanParent.appendChild(spanChild);
  divEl.appendChild(spanParent);
  msgRow.appendChild(divEl);
}

async function postNewMsg(e) {
  try {
    e.preventDefault();
    const newMsg = {
      msg: messageEl.value,
    };
    const response = await axiosInstance.post("/msg/new-msg", newMsg);
    renderEachmsg(response.data.msg, 1);
    messageEl.value = "";
  } catch (err) {
    console.error(err);
    alert("Some error occured. Please try again.");
  }
}

async function getAllMsgs() {
  try {
    msgRow.innerHTML = "";
    const response = await axiosInstance.get("/msg/get-all-msg");
    response.data.msg.forEach((each) => {
      renderEachmsg(each, each.belongsToUser);
    });
  } catch (err) {
    console.error(err);
    alert("Some error occured. We can't fetch messages right now.");
  }
}

formEl.addEventListener("submit", postNewMsg);
window.addEventListener("DOMContentLoaded", getAllMsgs);
// setInterval(() => {
//   getAllMsgs();
// }, 1000);
