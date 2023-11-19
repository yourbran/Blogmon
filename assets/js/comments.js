/*
 * Login Button Handler
 */
document.addEventListener('DOMContentLoaded', () => {

  // Functions to open and close a modal
  function openModal($el) {
    $el.classList.add('is-active');
  }

  function closeModal($el) {
    $el.classList.remove('is-active');
  }

  //Delete Element
  function deleteItem($el) {
    $el.remove();
  }

  //reset modal
  function resetModal($modal) {
    ($modal.querySelectorAll('input') || []).forEach(($el) => {
      $el.value = null;
    });
    ($modal.querySelectorAll('#invalidText, #checkIdIcon, #invalidPwdText') || []).forEach(($el) => {
      deleteItem($el);
    });
  }

  function closeAllModals() {
    (document.querySelectorAll('.modal') || []).forEach(($modal) => {
      closeModal($modal);
      resetModal($modal);
    });
  }

  // Add a click event on buttons to open a specific modal
  (document.querySelectorAll('.js-modal-trigger') || []).forEach(($trigger) => {
    const modal = $trigger.dataset.target;
    const $target = document.getElementById(modal);

    $trigger.addEventListener('click', () => {
      openModal($target);
    });
  });

  // Add a click event on various child elements to close the parent modal
  (document.querySelectorAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button') || []).forEach(($close) => {
    const $target = $close.closest('.modal');

    $close.addEventListener('click', () => {
      closeModal($target);
      resetModal($target);
    });
  });

  // Add a keyboard event to close all modals
  document.addEventListener('keydown', (event) => {
    if (event.code === 'Escape') {
      closeAllModals();
    }
  });

  // Setting comments section
  setCommentsByAuth();
});



/*
If user has logged in before, get the previous session so user doesn't need to log in again.
*/
function setCommentsByAuth() {
  const authY = document.getElementById("post-comments-auth-y");
  const authN = document.getElementById("post-comments-auth-n");

  console.log("[comments.js] login : " + idToken);

  if(idToken == undefined || idToken == 'init') {
    authY.style.display = "none";
    authN.style.display = "block";
    console.log("post-comments-auth-n");
  } else {
    authY.style.display = "block";
    authN.style.display = "none";
    console.log("post-comments-auth-y");
  }
}

/* Email format validation */
function validateEmail() {
  const validRegex = new RegExp(/^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i);
  var input = document.getElementById("emailId");

  // init
  deleteInvalidIdText();
  deleteCheckIdIcon();
  deleteInvalidPwdText();

  // validation
  if(!input.value) {
    return true;
  } else if(validRegex.test(input.value)) {
    deleteInvalidIdText();
    insertCheckIdIcon();
    return true;
  } else {
    deleteCheckIdIcon();
    insertInvalidIdText();
    return false;
  }

};

function deleteInvalidIdText() {
  const parentField = document.getElementById("modal-login-field-email");
  const elText = document.getElementById("invalidText");

  if(elText) {
    parentField.removeChild(elText)  
    return true;
  } else {
    return false;
  }
}

function deleteCheckIdIcon() {
  const parentParagraph = document.getElementById("email-paragraph");
  const elIcon = document.getElementById("checkIdIcon");

  if(elIcon) {
    parentParagraph.removeChild(elIcon)  
    return true;
  } else {
    return false;
  }
}

function deleteInvalidPwdText() {
  const parentField = document.getElementById("modal-login-field-pwd");
  const elText = document.getElementById("invalidPwdText");
  if(elText) {
    parentField.removeChild(elText);
    return true;
  } else {
    return false;
  }
}

function insertInvalidIdText() {
  const parentField = document.getElementById("modal-login-field-email");
  const elText = document.getElementById("invalidText");

  if(elText) {
    return false;
    
  } else {
    const pTag = document.createElement('p');  
    const textNode = document.createTextNode('이메일주소가 유효하지 않습니다.');
    pTag.appendChild(textNode);
    pTag.setAttribute('class', 'help is-danger has-text-left');
    pTag.setAttribute('id', 'invalidText');
    parentField.append(pTag);
    return true;
  }
}

function insertCheckIdIcon() {
  const parentParagraph = document.getElementById("email-paragraph");
  const elIcon = document.getElementById("checkIdIcon");

  if(elIcon) {
    return false;
    
  } else {
    const spanTag = document.createElement('span');
    spanTag.setAttribute('class', 'icon is-small is-right');
    spanTag.setAttribute('id', 'checkIdIcon');
    const iTag = document.createElement('i');
    iTag.setAttribute('class', 'fas fa-check');
    iTag.appendChild(document.createTextNode(''));
    spanTag.appendChild(iTag);
    parentParagraph.append(spanTag);
    return true;
  }
}

function insertInvalidPwdText(message) {
  const parentField = document.getElementById("modal-login-field-pwd");
  const elText = document.getElementById("invalidPwdText");
  if(elText) {
    return false;

  } else {
    const pTag = document.createElement('p');  
    const textNode = document.createTextNode(message);
    pTag.appendChild(textNode);
    pTag.setAttribute('class', 'help is-danger has-text-left');
    pTag.setAttribute('id', 'invalidPwdText');
    parentField.append(pTag);
    return true;
  }
}

function login() {
  const emailId = document.getElementById("emailId");
  const emailPwd = document.getElementById("emailPwd");
  
  deleteInvalidPwdText();
  if(!emailId.value || !emailPwd.value) {
    let msg = "EMAIL과 비밀번호를 모두 입력하시기 바랍니다.";
    insertInvalidPwdText(msg);
  } else if(emailPwd.value != '1234') {
    let msg = "EMAIL 또는 비밀번호를 확인하시기 바랍니다.";
    insertInvalidPwdText(msg);
  } else {
    idToken = "notInit";
    setCommentsByAuth();
    closeAllModalsOnLogin();
  }
}

function closeModalOnLogin($el) {
  $el.classList.remove('is-active');
}

function closeAllModalsOnLogin() {
  (document.querySelectorAll('.modal') || []).forEach(($modal) => {
    closeModalOnLogin($modal);
  });
}