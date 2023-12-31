const token = localStorage.getItem("token");
let itemsFromLs = localStorage.getItem("messages");
let items = JSON.parse(itemsFromLs);
if (!items || items.length === 0) {
  items = [];
}
const axiosInstance = axios.create({
  baseURL: "http://localhost:3000",
  headers: { Authorization: token },
});

const formEl = document.getElementById("form");
const messageEl = document.getElementById("msg");
const msgRow = document.getElementById("messages-row");

function renderEachmsg(each, belongsToUser) {
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
    let lastMsgId;
    if (items.length === 0) {
      lastMsgId = null;
    } else {
      lastMsgId = items[items.length - 1].messageId;
    }
    const response = await axiosInstance.get(
      `/msg/get-all-msg?lastMsgId=${lastMsgId}`
    );
    const length = response.data.msg.length;
    if (length > 0) {
      items.splice(0, length);
      items.splice(items.length, 0, ...response.data.msg);
      localStorage.setItem("messages", JSON.stringify(items));
    }
    items.forEach((each) => {
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
