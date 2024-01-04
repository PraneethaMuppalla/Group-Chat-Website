const token = localStorage.getItem("token");
const axiosInstance = axios.create({
  baseURL: "http://localhost:3000",
  headers: { Authorization: token },
});

//socket connection
const socket = io("http://localhost:3000");
//msg received
socket.on("receive msg", (msg, name) => {
  console.log(msg);
  renderEachmsg(msg, name, 0);
});

const formEl = document.getElementById("form");
const messageEl = document.getElementById("msg");
const msgRow = document.getElementById("messages-row");

const createGroupFormEl = document.getElementById("createGroupForm");
const groupNameEl = document.getElementById("groupName");
const closeBtn = document.getElementById("closeBtn");
const groupsCont = document.getElementById("groups-cont");
const phoneNumToAddMemEl = document.getElementById("phoneNumToAddMem");
const nameContentEl = document.getElementById("nameContent");
const membersRow = document.getElementById("membersRow");
let currentGroupId;

function renderEachmsg(each, name, belongsToUser = 0) {
  const divEl = document.createElement("div");
  if (belongsToUser == 1) {
    divEl.className = " message sent";
  } else {
    const pEl = document.createElement("span");
    pEl.className = "name";
    pEl.textContent = name;
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
  window.scrollTo(0, document.body.scrollHeight);
}

function addMemberRow(each) {
  const successUserEl = document.createElement("div");
  const strongEl = document.createElement("strong");
  strongEl.textContent = each.name;
  strongEl.className = "strongEl";
  successUserEl.appendChild(strongEl);

  if (each["group-member"].isAdmin) {
    const buttonEl2 = document.createElement("button");
    buttonEl2.textContent = "Admin";
    buttonEl2.className = "no-button";
    successUserEl.appendChild(buttonEl2);
  } else {
    const divElement = document.createElement("div");
    const buttonEl = document.createElement("button");
    buttonEl.textContent = "Remove";
    buttonEl.className = "small-btn";
    buttonEl.addEventListener("click", () => {
      deleteMember(response.data.id);
    });
    divElement.appendChild(buttonEl);
    const editButtonEl = document.createElement("button");
    editButtonEl.textContent = "Make Admin";
    editButtonEl.className = "button";
    divElement.appendChild(editButtonEl);
    successUserEl.appendChild(divElement);
  }

  successUserEl.className = "modal-name-cont";
  membersRow.appendChild(successUserEl);
}

async function adminEditClicked() {
  try {
    membersRow.innerHTML = "";
    const members = await axiosInstance.get(
      `/grp/get-group-members?groupId=${currentGroupId}`
    );
    members.data.forEach((each) => addMemberRow(each));
  } catch (err) {
    console.error(err);
  }
}

function renderGroupCont(groupId, groupName, isAdmin) {
  msgRow.innerHTML = "";
  const topDivEl = document.createElement("div");

  const groupNameCont = document.createElement("div");
  groupNameCont.textContent = groupName;
  groupNameCont.className = "grp-heading";
  topDivEl.appendChild(groupNameCont);
  const adminCont = document.createElement("div");
  if (isAdmin) {
    adminCont.innerHTML = `<div class="dropdown">
    <button class="button-bg dropdown-toggle" type="button" data-bs-toggle="dropdown"  aria-expanded="false">
      Admin
    </button>
    <ul class="dropdown-menu">
      <li><button type="button" class="no-button" data-bs-toggle="modal" onclick="adminEditClicked()" data-bs-target="#editModal">
      Edit Group
    </button></li>
      <li><button class="no-button">Delete Group</button></li>
     
    </ul>
  </div>`;
  } else {
    adminCont.innerHTML = "Group Member";
  }
  adminCont.className = "top-div";
  topDivEl.appendChild(adminCont);
  topDivEl.className = "top-div-El";
  msgRow.appendChild(topDivEl);
  getAllMsgs(groupId);
}

function renderEachGroup(each) {
  const buttonEl = document.createElement("button");
  buttonEl.classList = "button-group";
  buttonEl.id = `name${each.id}`;
  buttonEl.addEventListener("click", () => {
    currentGroupId = each.id;
    socket.emit("join group", each.id);
    renderGroupCont(each.id, each.name, each["group-member"].isAdmin);
  });
  buttonEl.textContent = each.name;
  groupsCont.appendChild(buttonEl);
}

async function postNewMsg(e) {
  try {
    e.preventDefault();
    if (!currentGroupId) {
      return alert("Please select a group");
    }
    const newMsg = {
      msg: messageEl.value,
      groupId: currentGroupId,
    };
    const response = await axiosInstance.post("/msg/new-msg", newMsg);
    const { msg, name } = response.data;
    socket.emit("new msg", msg, name, currentGroupId);
    renderEachmsg(msg, name, 1);
    messageEl.value = "";
  } catch (err) {
    console.error(err);
    alert("Some error occured. Please try again.");
  }
}

async function createNewGrp(e) {
  try {
    e.preventDefault();
    let newGroup = {
      groupName: groupNameEl.value,
    };
    const response = await axiosInstance.post("/grp/create-new-grp", newGroup);
    closeBtn.click();
    alert("Group created");
    getAllGroupsOfUser();
  } catch (err) {
    console.error(err);
    alert("Some error occured. Please try again");
  }
}

async function getAllMsgs(groupId) {
  try {
    const response = await axiosInstance.get(
      `/msg/get-all-msg?groupId=${groupId}`
    );
    response.data.msg.forEach((each) => {
      renderEachmsg(each, each.user.name, each.belongsToUser);
    });
  } catch (err) {
    console.error(err);
    alert("Some error occured. We can't fetch messages right now.");
  }
}

async function getAllGroupsOfUser() {
  try {
    const response = await axiosInstance.get(`/grp/get-groups-user`);
    if (response.data.length === 0) {
      const divEl = document.createElement("div");
      divEl.className = "no-group-cont";
      const h1El = document.createElement("h3");
      h1El.textContent =
        "You are not a member of any group. Would you like to join the common group THE CHAT HUB ?";
      h1El.className = "no-group-heading";
      const buttonEl = document.createElement("button");
      buttonEl.textContent = "Join";
      buttonEl.className = "";
      buttonEl.className = "button-bg ";
      buttonEl.addEventListener("click", joinCommonGroup);
      divEl.appendChild(h1El);
      divEl.appendChild(buttonEl);
      msgRow.appendChild(divEl);
      groupsCont.setAttribute("style", "display: none;");
    } else {
      msgRow.innerHTML = "";
      groupsCont.removeAttribute("style");
      response.data.forEach((each) => {
        renderEachGroup(each);
      });
    }
  } catch (err) {
    console.error(err);
    alert("Some error occured. We can't fetch groups right now.");
  }
}

async function addMemberToGroup(userId) {
  try {
    const mem = {
      userId,
      groupId: currentGroupId,
    };
    const response = await axiosInstance.post("/grp/post-mem-grp", mem);
  } catch (err) {
    console.error(err);
  }
}

async function joinCommonGroup(userId) {
  try {
    const response = await axiosInstance.get("/grp/join-common-grp");
    getAllGroupsOfUser();
  } catch (err) {
    console.error(err);
    alert("Some error occured. Please try again");
  }
}

async function checkNumber(e) {
  try {
    nameContentEl.innerHTML = "";
    const phoneNum = phoneNumToAddMemEl.value;
    if (phoneNum.length === 10) {
      const phoneNumCheck = {
        phoneNum,
      };
      const response = await axiosInstance.post(
        "/grp/get-Num-Data",
        phoneNumCheck
      );
      const successUserEl = document.createElement("div");
      const strongEl = document.createElement("strong");
      strongEl.textContent = response.data.name;
      strongEl.className = "strongEl";
      const buttonEl = document.createElement("button");
      buttonEl.textContent = "Tap to add";
      buttonEl.className = "no-button";
      buttonEl.addEventListener("click", () => {
        addMemberToGroup(response.data.id);
      });
      successUserEl.appendChild(strongEl);
      successUserEl.appendChild(buttonEl);
      successUserEl.className = "success-cont";
      nameContentEl.appendChild(successUserEl);
    } else {
      const numberDoesntExistEl = document.createElement("div");
      numberDoesntExistEl.textContent = "*User with this number doesn't exist";
      numberDoesntExistEl.className = "error-msg";
      nameContentEl.appendChild(numberDoesntExistEl);
    }
  } catch (err) {
    if (err.response && err.response.status === 409) {
      const selfUserEl = document.createElement("div");
      selfUserEl.textContent = "*You can't add yourself";
      selfUserEl.className = "error-msg";
      nameContentEl.appendChild(selfUserEl);
    } else if (err.response && err.response.status === 404) {
      const numberDoesntExistEl = document.createElement("div");
      numberDoesntExistEl.textContent = "*User with this number doesn't exist";
      numberDoesntExistEl.className = "error-msg";
      nameContentEl.appendChild(numberDoesntExistEl);
    } else {
      alert("Some error occured. Please try again.");
    }
  }
}

phoneNumToAddMemEl.addEventListener("change", checkNumber);
formEl.addEventListener("submit", postNewMsg);
createGroupFormEl.addEventListener("submit", createNewGrp);
window.addEventListener("DOMContentLoaded", getAllGroupsOfUser);

// setInterval(() => {
//   getAllMsgs();
// }, 1000);
