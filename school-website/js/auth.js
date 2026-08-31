async function getStoredCredentials(){
  try {
    let c = await window.dbGet('appCredentials');
    return c || {user:'Admin', pass:'Admin'};
  } catch(e) {
    return {user:'Admin', pass:'Admin'};
  }
}

function toggleLoginRole(){
  const role = document.getElementById('loginRole').value;
  if(role==='teacher'){
    document.getElementById('loginUser').placeholder = "শিক্ষক ইউজারনেম";
  } else {
    document.getElementById('loginUser').placeholder = "ইউজারনেম (Username)";
  }
}

async function checkLogin(){
  const role = document.getElementById('loginRole').value;
  const u = document.getElementById('loginUser').value.trim();
  const p = document.getElementById('loginPass').value.trim();
  
  if(role==='admin'){
    const c = await getStoredCredentials();
    if(u===c.user && p===c.pass){
      isLoggedIn = true;
      currentUserRole = 'admin';
      setupUserInterface();
      document.getElementById('loginOverlay').style.display='none';
      document.getElementById('appContent').style.display='block';
      document.getElementById('loginMsg').innerText='';
    } else {
      document.getElementById('loginMsg').innerText='ভুল এডমিন ইউজারনেম অথবা পাসওয়ার্ড!';
    }
  } else {
    const teachers = (await window.dbGet('appTeachers')) || [];
    const teacher = teachers.find(t => t.username === u && t.password === p);
    if(teacher){
      isLoggedIn = true;
      currentUserRole = 'teacher';
      loggedInTeacherData = teacher;
      setupUserInterface();
      document.getElementById('loginOverlay').style.display='none';
      document.getElementById('appContent').style.display='block';
      document.getElementById('loginMsg').innerText='';
    } else {
      document.getElementById('loginMsg').innerText='শিক্ষকের ইউজারনেম বা পাসওয়ার্ড সঠিক নয়!';
    }
  }
}

function setupUserInterface(){
  const adminElements = document.querySelectorAll('.admin-only');
  const teacherBar = document.getElementById('teacherSelectBar');
  const teacherEntryPanel = document.getElementById('teacherEntryPanel');
  
  if(currentUserRole==='teacher'){
    adminElements.forEach(el => el.style.display='none');
    teacherBar.style.display = 'block';
    teacherEntryPanel.style.display = 'block';
    document.getElementById('portalTitle').innerText = `দলইনগর উচ্চ বিদ্যালয় - শিক্ষক প্যানেল (${loggedInTeacherData.username})`;
    
    const select = document.getElementById('teacherAssignedList');
    select.innerHTML = '';
    
    let assignments = loggedInTeacherData.assignments || [];
    assignments.forEach((a, idx) => {
      let opt = document.createElement('option');
      opt.value = idx;
      opt.innerText = `শ্রেণি: ${a.className} — বিষয়: ${a.subject}`;
      select.appendChild(opt);
    });

    if(assignments.length > 0) {
      onTeacherOptionChange();
    }
  } else {
    adminElements.forEach(el => el.style.display='');
    teacherBar.style.display = 'none';
    teacherEntryPanel.style.display = 'none';
    document.getElementById('portalTitle').innerText = "দলইনগর উচ্চ বিদ্যালয় - এডমিন প্যানেল";
    onClassChange();
  }
  renderTeacherList();
}

function onTeacherOptionChange(){
  const idx = document.getElementById('teacherAssignedList').value;
  let assignments = loggedInTeacherData.assignments || [];
  
  const selected = assignments[idx];
  if(selected) {
    document.getElementById('inClass').value = selected.className;
    updateSubjectDropdown();
    document.getElementById('inSubject').value = selected.subject;
    toggleGroupVisibility();
    updateHeader();
    loadMasterStudentData();
    renderTeacherEntryTable();
  }
}

function logout(){isLoggedIn=false;document.getElementById('appContent').style.display='none';goToStartPage();document.getElementById('loginUser').value='';document.getElementById('loginPass').value=''}
function togglePassPanel(){const p=document.getElementById('passPanel');p.style.display=p.style.display==='none'?'block':'none'}
function toggleTeacherPanel(){const p=document.getElementById('teacherPanel');p.style.display=p.style.display==='none'?'block':'none'}
