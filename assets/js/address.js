---
layout: null
---

document.addEventListener('DOMContentLoaded', () => {
  // Functions to open and close a modal
  function openModal($el) {
    $el.classList.add('is-active');
  }

  function closeModal($el) {
    $el.classList.remove('is-active');
  }

  function closeAllModals() {
    (document.querySelectorAll('.modal') || []).forEach(($modal) => {
      closeModal($modal);
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
    });
  });

  // Add a keyboard event to close all modals
  document.addEventListener('keydown', (event) => {
    if (event.code === 'Escape') {
      closeAllModals();
    }
  });
});

function buttonClickHandler(textContent) {
  const $text = document.createElement('textarea');
  document.body.appendChild($text);
  $text.value = textContent;
  $text.select();
  document.execCommand('copy');
  document.body.removeChild($text);
};

function searchaddress() {
  const store = document.getElementById("search-input");
  const tbody1 = document.getElementById("address-tbody-api1");
  const tbody2 = document.getElementById("address-tbody-api2");
  const addresskey = document.getElementById("addresskey-input");

  let pJson = {};
  pJson.name = store.value;
  pJson.addressAuthKey = addresskey.value;
  
  if(!store.value) {
    let msg = "가게명을 입력하시기 바랍니다.";
    console.log(msg);
  } else {
    
    // init
    createProgressBar(1);
    createProgressBar(2);
    tbody1.replaceChildren();
    tbody2.replaceChildren();
    
    //ajax POST
    $.ajax({
      type: 'POST',
      url: "{{ site.API_SERVER_URL }}" + "/searchaddr1",
      contentType: 'application/json',
      dataType: 'JSON',
      data: JSON.stringify(pJson),
      success: function(res){
        if(res.errCd == "000") {
          generateTableOfApi(res, "api1");
        } else {
          generateFailTableOfApi(res.errMsg, "api1");
        }
      },
      error: function(err){
        generateFailTableOfApi("조회실패", "api1");
      }
    });

    $.ajax({
      type: 'POST',
      url: "{{ site.API_SERVER_URL }}" + "/searchaddr2",
      contentType: 'application/json',
      dataType: 'JSON',
      data: JSON.stringify(pJson),
      success: function(res){
        if(res.errCd == "000") {
          generateTableOfApi(res, "api2");
        } else {
          generateFailTableOfApi(res.errMsg, "api2");
        }
      },
      error: function(err){
        generateFailTableOfApi("조회실패", "api2");
      }
    });
  }
}

function generateTableOfApi(data, cls) {
  
  let addressTableEl = "address-table-" + cls;
  let addressTbodyEl = "address-tbody-" + cls;

  const table = document.getElementById(addressTableEl);
  const tbody = document.getElementById(addressTbodyEl);
  const tableCnt = table.rows.length;
  const tbodyCnt = tableCnt-1;
  let addresses = data.items;
  // 기존 테이블 제거
  if(tableCnt > 1) {
    for(var i = tbodyCnt-1; i >= 0; i--) {
      tbody.deleteRow(i);
    }
  } 
  
  // 신규 테이블 생성
  for(idx in addresses) {
    let newRow = tbody.insertRow();
    let newCell1 = newRow.insertCell();
    let newCell2 = newRow.insertCell();
    let newCell3 = newRow.insertCell();
    let newCell4 = newRow.insertCell();
    let newCell5 = newRow.insertCell();
    let newCell6 = newRow.insertCell();

    let tempStr = addresses[idx].title;
    tempStr = tempStr.replace('<b>', '');
    tempStr = tempStr.replace('<\/b>', '');

    newCell1.appendChild(document.createTextNode(addresses[idx].category));
    newCell2.appendChild(document.createTextNode(tempStr));
    newCell3.appendChild(document.createTextNode(addresses[idx].roadAddress));
    newCell4.appendChild(document.createTextNode(addresses[idx].zipcode));
    newCell5.appendChild(document.createTextNode(addresses[idx].rating));
    newCell6.appendChild(document.createTextNode(addresses[idx].reviewsNum));
    newCell4.addEventListener('click', ()=>buttonClickHandler(newCell3.textContent));
  }

  // progressbar 제거
  if(cls == "api1") {
    removeProgressBar(1);
  } else {
    removeProgressBar(2);
  }
}

function generateFailTableOfApi(msg, cls) {
  
  let addressTableEl = "address-table-" + cls;
  let addressTbodyEl = "address-tbody-" + cls;

  const table = document.getElementById(addressTableEl);
  const tbody = document.getElementById(addressTbodyEl);
  const tableCnt = table.rows.length;
  const tbodyCnt = tableCnt-1;
  // 기존 테이블 제거
  if(tableCnt > 1) {
    for(var i = tbodyCnt-1; i >= 0; i--) {
      tbody.deleteRow(i);
    }
  } 
  
  // 신규 테이블 생성
  let newRow = tbody.insertRow();
  let newCell1 = newRow.insertCell();
  let newCell2 = newRow.insertCell();
  let newCell3 = newRow.insertCell();
  let newCell4 = newRow.insertCell();
  let newCell5 = newRow.insertCell();
  let newCell6 = newRow.insertCell();

  newCell1.appendChild(document.createTextNode(msg));
  newCell2.appendChild(document.createTextNode('조회실패'));
  newCell3.appendChild(document.createTextNode('조회실패'));
  newCell4.appendChild(document.createTextNode('조회실패'));
  newCell5.appendChild(document.createTextNode('조회실패'));
  newCell6.appendChild(document.createTextNode('조회실패'));

  // progressbar 제거
  if(cls == "api1") {
    removeProgressBar(1);
  } else {
    removeProgressBar(2);
  }
}

// param : append할 부모 요소id
function createProgressBar(cls) {
  
  let section = cls.toString();
  let parentFieldId = "address-section-" + section;
  let progressbarId = "progress-section-" + section;
  let progressbarColor = (cls == 1) ? 'progress is-success' : 'progress is-warning';
  
  const parentField = document.getElementById(parentFieldId);
  const elText = document.getElementById(progressbarId);

  if(elText) {
    return false;
    
  } else {
    const progressTag = document.createElement('progress');  
    progressTag.setAttribute('class', progressbarColor);
    progressTag.setAttribute('max', '100');
    progressTag.setAttribute('id', progressbarId);
    parentField.append(progressTag);
    return true;
  }
}

// param : append할 부모 요소id
function removeProgressBar(cls) {

  let section = cls.toString();
  let parentFieldId = "address-section-" + section;
  let progressbarId = "progress-section-" + section;

  const parentField = document.getElementById(parentFieldId);
  const elText = document.getElementById(progressbarId);

  if(elText) {
    parentField.removeChild(elText);
    return true;
  } else {
    return false;
  }
}