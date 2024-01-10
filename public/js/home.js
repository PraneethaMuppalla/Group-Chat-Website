const token = localStorage.getItem("token");
const axiosInstance = axios.create({
  baseURL: "http://localhost:3000",
  headers: { Authorization: token },
});

//socket connection
const socket = io("http://localhost:3000");
//message received
socket.on("receive message", (message, name) => {
  console.log(message);
  renderEachmessage(message, name, 0);
});

const formEl = document.getElementById("form");
const messageEl = document.getElementById("message");
const messageRow = document.getElementById("messages-row");

const createGroupFormEl = document.getElementById("createGroupForm");
const groupNameEl = document.getElementById("groupName");
const closeBtn = document.getElementById("closeBtn");
const uploadImgBtn = document.getElementById("uploadImgBtn");
const groupsCont = document.getElementById("groups-cont");
const phoneNumToAddMemEl = document.getElementById("phoneNumToAddMem");
const nameContentEl = document.getElementById("nameContent");
const membersRow = document.getElementById("membersRow");
let currentGroupId;
const selectedImgEl = document.getElementById("imageSelected");
const queuedDiv = document.querySelector(".queued-div");
const queuedForm = document.querySelector("#queued-form");
let addMemContEl = document.getElementById("addMemCont");
let image;

function scrollChat() {
  messageRow.scrollTop = messageRow.scrollHeight;
}

async function uploadImage(e) {
  try {
    e.preventDefault();
    const formData = new FormData();
    formData.append("image", image);
    formData.append("groupId", currentGroupId);
    console.log(formData);
    const response = await axiosInstance.post(
      "/message/upload-image",
      formData
    );
    const { message, name } = response.data;
    socket.emit("new message", message, name, currentGroupId);
    renderEachmessage(message, name, 1);
  } catch (err) {
    console.error(err);
    // alert("Some error occured. Please try again");
  } finally {
    uploadImgBtn.click();
  }
}

function imageSelected() {
  queuedForm.className = "d-none";
  image = selectedImgEl.files[0];
  if (image) {
    queuedDiv.innerHTML = `<div class="image">
      <img src="${URL.createObjectURL(image)}" alt="image">
    </div>`;
    queuedForm.className = "d-flex flex-column";
  }
}

function renderEachmessage(each, name, belongsToUser = 0) {
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
  if (!each.attachmentType) {
    const pEl2 = document.createElement("span");
    pEl2.textContent = each.text;
    divEl.appendChild(pEl2);
  } else {
    const imageContainer = document.createElement("img");
    imageContainer.src = each.attachmentUrl;
    imageContainer.className = "sent-img";
    divEl.appendChild(imageContainer);
  }
  const spanParent = document.createElement("span");
  spanParent.className = "metadata";
  const spanChild = document.createElement("span");
  const dateObject = new Date(each.createdAt);
  console.log(dateObject);

  // Extract components from the date object
  const day = dateObject.getDate();
  let hour = dateObject.getHours();
  const minute = dateObject.getMinutes();
  const period = hour >= 12 ? "PM" : "AM";
  const convertedHour = hour % 12 || 12;
  const convertedTime = `${convertedHour}:${minute} ${period}`;

  console.log(convertedTime);
  spanChild.textContent = convertedTime;
  spanChild.className = "time";
  spanParent.appendChild(spanChild);
  divEl.appendChild(spanParent);
  messageRow.appendChild(divEl);
  scrollChat();
}

async function deleteMember(id) {
  try {
    await axiosInstance.delete(
      `/group/delete-member-from-group?groupId=${currentGroupId}&userId=${id}`
    );
    alert("Member deleted successfully");
    const indMemRow = document.getElementById(`member${id}`);
    membersRow.removeChild(indMemRow);
  } catch (err) {
    console.error(err);
  }
}

function addMemberRow(each, isAdmin = false, adminView) {
  const successUserEl = document.createElement("div");
  successUserEl.id = `member${each.id}`;
  const strongEl = document.createElement("strong");
  strongEl.textContent = each.name;
  strongEl.className = "strongEl";
  successUserEl.appendChild(strongEl);

  if (isAdmin) {
    const buttonEl2 = document.createElement("button");
    buttonEl2.textContent = "Admin";
    buttonEl2.className = "no-button";
    successUserEl.appendChild(buttonEl2);
  } else {
    if (adminView) {
      const divElement = document.createElement("div");
      const buttonEl = document.createElement("button");
      buttonEl.textContent = "Remove";
      buttonEl.className = "small-btn";
      buttonEl.addEventListener("click", () => {
        deleteMember(each.id);
      });
      divElement.appendChild(buttonEl);
      successUserEl.appendChild(divElement);
    }
  }
  successUserEl.className = "modal-name-cont";
  membersRow.appendChild(successUserEl);
}

async function adminEditClicked() {
  try {
    addMemContEl.setAttribute(
      "style",
      "display: flex; flex-direction: column;"
    );
    membersRow.innerHTML = "";
    const members = await axiosInstance.get(
      `/group/get-all-group-members?groupId=${currentGroupId}`
    );
    members.data.forEach((each) =>
      addMemberRow(each, each["group-member"].isAdmin, true)
    );
  } catch (err) {
    console.error(err);
  }
}

async function memberEditClicked() {
  try {
    addMemContEl.setAttribute("style", "display: none;");
    membersRow.innerHTML = "";
    const members = await axiosInstance.get(
      `/group/get-group-members?groupId=${currentGroupId}`
    );
    members.data.forEach((each) =>
      addMemberRow(each, each["group-member"].isAdmin, false)
    );
  } catch (err) {
    console.error(err);
  }
}

async function deleteGroup(groupId) {
  try {
    if (confirm("Are you sure?")) {
      const members = await axiosInstance.delete(
        `/group/delete-group?groupId=${groupId}`
      );
      messageRow.innerHTML = "";
      currentGroupId = null;
      getAllGroupsOfUser();
    }
  } catch (err) {
    console.error(err);
  }
}

function renderGroupCont(groupId, groupName, isAdmin) {
  messageRow.innerHTML = "";
  const topDivEl = document.createElement("div");

  const groupNameCont = document.createElement("div");
  groupNameCont.textContent = groupName;
  groupNameCont.className = "group-heading";
  topDivEl.appendChild(groupNameCont);
  const adminCont = document.createElement("div");
  if (isAdmin) {
    adminCont.innerHTML = `<div class="d-flex flex-row ">
    <button class="me-3 border-less-button" title="UPLOAD IMAGE" data-bs-toggle="modal" data-bs-target="#uploadImageModal">
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="30" fill="currentColor" class="bi bi-link-45deg " viewBox="0 0 16 16">
  <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1 1 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4 4 0 0 1-.128-1.287z"/>
  <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243z"/>
</svg>
    </button>
    <div class="dropdown">

    <button class="button-bg dropdown-toggle" type="button" data-bs-toggle="dropdown"  aria-expanded="false">
      Admin
    </button>
    <ul class="dropdown-menu">
      <li><button type="button" class="no-button" data-bs-toggle="modal" onclick="adminEditClicked()" data-bs-target="#editModal">
      Edit Group
    </button></li>
      <li><button class="no-button" onclick="deleteGroup(${groupId})" >Delete Group</button></li>
     
    </ul>
  </div>
  </div>
  `;
  } else {
    adminCont.innerHTML = `<div class="d-flex flex-row ">
    <button class="me-3 border-less-button" title="UPLOAD IMAGE" data-bs-toggle="modal" data-bs-target="#uploadImageModal">
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="30" fill="currentColor" class="bi bi-link-45deg " viewBox="0 0 16 16">
  <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1 1 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4 4 0 0 1-.128-1.287z"/>
  <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243z"/>
</svg>
    </button>
    <div class="dropdown">

    <button class="button dropdown-toggle" type="button" data-bs-toggle="dropdown"  aria-expanded="false">
      Member
    </button>
    <ul class="dropdown-menu">
      <li><button type="button" class="no-button" data-bs-toggle="modal" onclick="memberEditClicked()" data-bs-target="#editModal">
      View Details
    </button></li>    
    </ul>
  </div>
  </div>
  `;
  }
  adminCont.className = "top-div";
  topDivEl.appendChild(adminCont);
  topDivEl.className = "top-div-El";
  messageRow.appendChild(topDivEl);
  getAllmessages(groupId);
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

async function postNewmessage(e) {
  try {
    e.preventDefault();
    if (!currentGroupId) {
      return alert("Please select a group");
    }
    const newText = {
      text: messageEl.value,
      groupId: currentGroupId,
    };
    const response = await axiosInstance.post("/message/new-message", newText);
    const { message, name } = response.data;
    socket.emit("new message", message, name, currentGroupId);
    renderEachmessage(message, name, 1);
    messageEl.value = "";
  } catch (err) {
    console.error(err);
    alert("Some error occured. Please try again.");
  }
}

async function createNewgroup(e) {
  try {
    e.preventDefault();
    let newGroup = {
      groupName: groupNameEl.value,
    };
    const response = await axiosInstance.post(
      "/group/create-new-group",
      newGroup
    );
    closeBtn.click();
    alert("Group created");
    getAllGroupsOfUser();
  } catch (err) {
    console.error(err);
    alert("Some error occured. Please try again");
  }
}

async function getAllmessages(groupId) {
  try {
    const response = await axiosInstance.get(
      `/message/get-all-messages?groupId=${groupId}`
    );
    response.data.message.forEach((each) => {
      renderEachmessage(each, each.user.name, each.belongsToUser);
    });
  } catch (err) {
    console.error(err);
    alert("Some error occured. We can't fetch messages right now.");
  }
}

async function getAllGroupsOfUser() {
  try {
    groupsCont.innerHTML = "";
    const headerEl = ` <div class="top-div-El">Groups</div>`;
    groupsCont.innerHTML += headerEl;
    const response = await axiosInstance.get(`/group/get-user-groups`);
    if (response.data.groups.length === 0) {
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
      messageRow.appendChild(divEl);
      groupsCont.setAttribute("style", "display: none;");
    } else {
      messageRow.innerHTML = "";
      groupsCont.removeAttribute("style");
      response.data.groups.forEach((each) => {
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
    const response = await axiosInstance.post(
      "/group/add-member-to-group",
      mem
    );
    addMemberRow(response.data.user, false, true);
    nameContentEl.innerHTML = "";
    phoneNumToAddMemEl.value = "";
  } catch (err) {
    console.error(err);
    nameContentEl.innerHTML = "";
    alert("Some error occured");
  }
}

async function joinCommonGroup(userId) {
  try {
    const response = await axiosInstance.post("/group/join-common-group");
    getAllGroupsOfUser();
  } catch (err) {
    console.error(err);
    alert("Some error occured. Please try again");
  }
}

async function checkNumber(e) {
  try {
    nameContentEl.innerHTML = "";
    const phoneNumber = phoneNumToAddMemEl.value;
    if (phoneNumber.length === 10) {
      const phoneNumCheck = {
        phoneNumber,
      };
      console.log("HIT=========>>>>>>>>>");
      const response = await axiosInstance.post(
        "/group/get-user-data-from-phone-number",
        phoneNumCheck
      );
      const successUserEl = document.createElement("div");
      const strongEl = document.createElement("strong");
      strongEl.textContent = response.data.user.name;
      strongEl.className = "strongEl";
      const buttonEl = document.createElement("button");
      buttonEl.textContent = "Tap to add";
      buttonEl.className = "no-button";
      buttonEl.addEventListener("click", () => {
        addMemberToGroup(response.data.user.id);
      });
      successUserEl.appendChild(strongEl);
      successUserEl.appendChild(buttonEl);
      successUserEl.className = "success-cont";
      nameContentEl.appendChild(successUserEl);
    } else {
      const numberDoesntExistEl = document.createElement("div");
      numberDoesntExistEl.textContent = "*User with this number doesn't exist";
      numberDoesntExistEl.className = "error-message";
      nameContentEl.appendChild(numberDoesntExistEl);
    }
  } catch (err) {
    if (err.response && err.response.status === 409) {
      const selfUserEl = document.createElement("div");
      selfUserEl.textContent = "*You can't add yourself";
      selfUserEl.className = "error-message";
      nameContentEl.appendChild(selfUserEl);
    } else if (err.response && err.response.status === 404) {
      const numberDoesntExistEl = document.createElement("div");
      numberDoesntExistEl.textContent = "*User with this number doesn't exist";
      numberDoesntExistEl.className = "error-message";
      nameContentEl.appendChild(numberDoesntExistEl);
    } else {
      console.error(err);
      alert("Some error occured. Please try again.");
    }
  }
}

phoneNumToAddMemEl.addEventListener("change", checkNumber);
formEl.addEventListener("submit", postNewmessage);
createGroupFormEl.addEventListener("submit", createNewgroup);
window.addEventListener("DOMContentLoaded", getAllGroupsOfUser);
queuedForm.addEventListener("submit", uploadImage);

// setInterval(() => {
//   getAllmessages();
// }, 1000);
