async function saveToStorage(){
  const inClass = document.getElementById('inClass').value;
  const inSection = document.getElementById('inSection').value;
  const inSubject = document.getElementById('inSubject').value;
  const inExam = document.getElementById('inExam').value;
  const inGroup = document.getElementById('inGroup').value;
  const inMarks = document.getElementById('inMarks').value;

  const key=`SchoolData_${inClass}_${inSection}_${inSubject}`;
  let payload = {className:inClass,section:inSection,subject:inSubject,exam:inExam,group:inGroup,marks:inMarks,students:studentData};
  await window.dbSave(`schoolData/${key}`, payload);
  await renderStorageUI();
}

async function renderStorageUI(){
  const c=document.getElementById('storageContainer');c.innerHTML='';
  let allSchoolData = (await window.dbGet('schoolData')) || {};

  ['৬ষ্ঠ','৭ম','৮ম','৯ম','১০ম'].forEach(cl=>{
    const card=document.createElement('div');
    card.className='storage-card';
    card.innerHTML=`<h4>শ্রেণি: ${cl}</h4>`;
    let found=false;

    Object.keys(allSchoolData).forEach(k => {
      if(k.startsWith(`SchoolData_${cl}_`)){
        found=true;
        const item = allSchoolData[k];
        const d = document.createElement('div');
        d.className='storage-item';
        d.innerHTML=`<span><b>${item.section} শাখা</b> - ${item.subject}</span><div><button class="btn" style="padding:2px 6px;font-size:10px;" onclick="loadRecord('${k}')">লোড</button><button class="btn btn-danger" style="padding:2px 6px;font-size:10px;" onclick="deleteRecord('${k}')">মুছুন</button></div>`;
        card.appendChild(d);
      }
    });

    if(!found)card.innerHTML+='<div style="color:#888;font-style:italic;">কোনো ডাটা সেভ নেই</div>';
    c.appendChild(card);
  });
}

async function loadRecord(k){
  const d = await window.dbGet(`schoolData/${k}`);
  if(!d)return;
  document.getElementById('inClass').value=d.className;
  document.getElementById('inSection').value=d.section;
  updateSubjectDropdown();
  document.getElementById('inSubject').value=d.subject;
  document.getElementById('inExam').value=d.exam;
  document.getElementById('inGroup').value=d.group;
  document.getElementById('inMarks').value=d.marks;
  studentData=d.students||{};
  
  toggleGroupVisibility();updateHeader();await renderTables();
  alert(`শ্রেণি ${d.className} (${d.subject}) এর ডাটা অনলাইন থেকে লোড হয়েছে!`);
}

async function deleteRecord(k){
  if(confirm('আপনি কি নিশ্চিত যে ডাটা মুছে ফেলতে চান?')){
    await window.dbRemove(`schoolData/${k}`);
    await renderStorageUI();
  }
}
