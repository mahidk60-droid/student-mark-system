function buildAdminClassAssignUI(){
  const container = document.getElementById('classAssignContainer');
  if(!container) return;
  container.innerHTML = '';
  
  availableClasses.forEach(c => {
    let row = document.createElement('div');
    row.className = 'teacher-assign-row';
    let subs = getSubjectsForClass(c);
    let html = `<label>শ্রেণি: ${c}</label><div class="checkbox-grid">`;
    subs.forEach(sub => {
      html += `<label><input type="checkbox" name="tSub_${c}" value="${sub}"> ${sub}</label>`;
    });
    html += `</div>`;
    row.innerHTML = html;
    container.appendChild(row);
  });
}

async function createOrUpdateTeacherAccount(){
  const u = document.getElementById('tUsername').value.trim(), p = document.getElementById('tPassword').value.trim();
  if(!u || !p){alert('ইউজারনেম ও পাসওয়ার্ড দুটিই পূরণ করুন!'); return;}

  let assignments = [];
  availableClasses.forEach(c => {
    const selectedSubs = Array.from(document.querySelectorAll(`input[name="tSub_${c}"]:checked`)).map(cb => cb.value);
    selectedSubs.forEach(sub => {
      assignments.push({ className: c, subject: sub });
    });
  });

  if(assignments.length === 0){alert('কমপক্ষে যেকোনো শ্রেণির একটি বিষয় নির্বাচন করুন!'); return;}

  let teachers = (await window.dbGet('appTeachers')) || [];
  
  if(editingTeacherIndex !== null) {
    teachers[editingTeacherIndex] = { username: u, password: p, assignments: assignments };
    alert(`শিক্ষক ${u} এর তথ্য সফলভাবে আপডেট হয়েছে!`);
  } else {
    teachers.push({ username: u, password: p, assignments: assignments });
    alert(`শিক্ষক ${u} সফলভাবে তৈরি হয়েছে!`);
  }

  await window.dbSave('appTeachers', teachers);
  resetTeacherForm();
  renderTeacherList();
}

function resetTeacherForm(){
  editingTeacherIndex = null;
  document.getElementById('tUsername').value = ''; 
  document.getElementById('tPassword').value = '';
  document.querySelectorAll('#classAssignContainer input[type="checkbox"]').forEach(cb => cb.checked = false);
  document.getElementById('teacherFormHeader').innerText = "👨‍🏫 নতুন শিক্ষক অ্যাকাউন্ট তৈরি ও বিষয়ে অ্যাসাইন করুন:";
  document.getElementById('btnSaveTeacher').innerText = "শিক্ষক অ্যাকাউন্ট সেভ করুন";
  document.getElementById('btnSaveTeacher').style.background = "#27ae60";
  document.getElementById('btnCancelEditTeacher').style.display = "none";
}

async function editTeacher(index){
  let teachers = (await window.dbGet('appTeachers')) || [];
  let teacher = teachers[index];
  if(!teacher) return;

  editingTeacherIndex = index;
  document.getElementById('tUsername').value = teacher.username;
  document.getElementById('tPassword').value = teacher.password;
  
  document.querySelectorAll('#classAssignContainer input[type="checkbox"]').forEach(cb => cb.checked = false);
  
  if(teacher.assignments){
    teacher.assignments.forEach(a => {
      let cb = document.querySelector(`input[name="tSub_${a.className}"][value="${a.subject}"]`);
      if(cb) cb.checked = true;
    });
  }

  document.getElementById('teacherFormHeader').innerText = `✏️ শিক্ষক "${teacher.username}" এর তথ্য সংশোধন করুন:`;
  document.getElementById('btnSaveTeacher').innerText = "আপডেট করুন";
  document.getElementById('btnSaveTeacher').style.background = "#f39c12";
  document.getElementById('btnCancelEditTeacher').style.display = "inline-block";
  
  window.scrollTo({ top: document.getElementById('teacherPanel').offsetTop - 20, behavior: 'smooth' });
}

async function renderTeacherList(){
  const container = document.getElementById('teacherListDisplay');
  if(!container) return;
  let teachers = (await window.dbGet('appTeachers')) || [];
  if(!teachers.length){ container.innerHTML = '<div style="color:#aaa; font-style:italic;">কোনো বিষয় শিক্ষক যুক্ত করা হয়নি।</div>'; return; }
  
  let html = '<div style="font-size:13px; font-weight:bold; color:#f1c40f; margin-bottom:8px;">📋 নিবন্ধিত বিষয় শিক্ষকবৃন্দের তালিকা (আইডি, পাসওয়ার্ড ও বিষয়):</div>';
  
  teachers.forEach((t, i) => {
    let assignText = '';
    if(t.assignments && t.assignments.length > 0) {
      assignText = t.assignments.map(a => `<span style="background:rgba(255,255,255,0.1); padding:2px 6px; border-radius:4px; margin:2px; display:inline-block;">${a.className}: ${a.subject}</span>`).join(' ');
    } else {
      assignText = '<i style="color:#aaa;">কোনো বিষয় যুক্ত করা হয়নি</i>';
    }

    html += `
      <div class="teacher-card">
        <div class="teacher-card-header">
          <div>
            <span style="font-size:13px; font-weight:bold; color:#2ecc71;">👤 ${t.username}</span> 
            <span style="margin-left:10px; font-size:12px; color:#f39c12;">🔑 পাসওয়ার্ড: 
              <input type="password" value="${t.password}" readonly id="passShow_${i}" style="background:none; border:none; color:#f39c12; width:80px; font-weight:bold; font-size:12px;">
              <button onclick="togglePassView(${i})" style="background:none; border:none; color:#3498db; cursor:pointer; font-size:11px;">👁️ দেখান</button>
            </span>
          </div>
          <div>
            <button class="btn btn-edit" style="padding:2px 8px; font-size:11px;" onclick="editTeacher(${i})">✏️ এডিট</button>
            <button class="btn btn-danger" style="padding:2px 8px; font-size:11px;" onclick="deleteTeacher(${i})">🗑️ মুছুন</button>
          </div>
        </div>
        <div style="font-size:11px; color:#ddd;">
          <b>নির্ধারিত বিষয়সমূহ:</b> ${assignText}
        </div>
      </div>`;
  });

  container.innerHTML = html;
}

function togglePassView(index){
  let input = document.getElementById(`passShow_${index}`);
  if(input.type === 'password'){
    input.type = 'text';
  } else {
    input.type = 'password';
  }
}

async function deleteTeacher(index){
  if(confirm('আপনি কি নিশ্চিত যে এই শিক্ষক অ্যাকাউন্টটি মুছে ফেলতে চান?')){
    let teachers = (await window.dbGet('appTeachers')) || [];
    teachers.splice(index, 1);
    await window.dbSave('appTeachers', teachers);
    renderTeacherList();
  }
}

async function updateAdminCredentials(){
  const u=document.getElementById('newAdminUser').value.trim(),p=document.getElementById('newAdminPass').value.trim();
  if(!u||!p){alert('ইউজারনেম এবং পাসওয়ার্ড উভয় ঘর পূরণ করুন!');return}
  await window.dbSave('appCredentials', {user:u, pass:p});
  alert('পাসওয়ার্ড সফলভাবে অনলাইন ডাটাবেজে পরিবর্তন করা হয়েছে!');
  document.getElementById('newAdminUser').value='';document.getElementById('newAdminPass').value='';togglePassPanel();
}

async function loadMasterStudentData(){
  const cls = document.getElementById('inClass').value;
  const sec = document.getElementById('inSection').value;
  const sub = document.getElementById('inSubject').value;
  
  const key = `SchoolData_${cls}_${sec}_${sub}`;
  const masterKey = `MasterClass_${cls}_${sec}`;
  
  try {
    let saved = await window.dbGet(`schoolData/${key}`);
    if(saved && saved.students){
      studentData = saved.students;
    } else {
      let master = await window.dbGet(`masterClass/${masterKey}`);
      if(master && Array.isArray(master)){
        studentData = {};
        master.forEach(s => {
          studentData[s.rollDisplay] = { rollDisplay: s.rollDisplay, name: s.name, group: s.group||'বিজ্ঞান', religion: s.religion||'Islam', cq:'', mcq:'', prac:'', total:'' };
        });
      } else {
        studentData = {};
      }
    }
  } catch(err) {
    studentData = {};
  }
  await renderTables();
  if(currentUserRole === 'teacher') renderTeacherEntryTable();
}

function renderTeacherEntryTable(){
  const tbody = document.getElementById('teacherTableBody');
  const cls = document.getElementById('inClass').value;
  const sub = document.getElementById('inSubject').value;
  document.getElementById('teacherPanelTitle').innerText = `📝 বিষয় নম্বর এন্ট্রি ফরম [শ্রেণি: ${cls} | বিষয়: ${sub}]`;

  tbody.innerHTML = '';
  
  let keys = Object.keys(studentData).sort((a,b)=>(parseInt(banglaToEnglishNum(a))||0)-(parseInt(banglaToEnglishNum(b))||0));
  
  if(sub === 'হিন্দু ধর্ম') {
    keys = keys.filter(r => studentData[r].religion === 'Hinduism');
  } else if(sub === 'ইসলাম ধর্ম') {
    keys = keys.filter(r => studentData[r].religion === 'Islam' || !studentData[r].religion);
  }

  if(keys.length === 0){
    tbody.innerHTML = `<tr><td colspan="6" style="color:red; font-weight:bold; padding:15px;">এই শ্রেণিতে নির্দিষ্ট ধর্ম/বিষয়ের কোনো শিক্ষার্থী তথ্য সেভ করা নেই!</td></tr>`;
    return;
  }

  keys.forEach(r => {
    let s = studentData[r];
    let tr = document.createElement('tr');
    tr.innerHTML = `
      <td><b>${s.rollDisplay}</b></td>
      <td style="text-align:left;"><b>${s.name}</b></td>
      <td><input type="number" id="tMcq_${r}" value="${s.mcq||''}" oninput="calcTeacherTotal('${r}')"></td>
      <td><input type="number" id="tCq_${r}" value="${s.cq||''}" oninput="calcTeacherTotal('${r}')"></td>
      <td><input type="number" id="tPrac_${r}" value="${s.prac||''}" oninput="calcTeacherTotal('${r}')"></td>
      <td><span id="tTotal_${r}" style="font-weight:bold; color:green;">${s.total||'0'}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function calcTeacherTotal(r){
  let mcq = parseFloat(document.getElementById(`tMcq_${r}`).value) || 0;
  let cq = parseFloat(document.getElementById(`tCq_${r}`).value) || 0;
  let prac = parseFloat(document.getElementById(`tPrac_${r}`).value) || 0;
  let tot = mcq + cq + prac;
  document.getElementById(`tTotal_${r}`).innerText = tot > 0 ? tot : 0;
}

async function saveTeacherMarks(){
  let keys = Object.keys(studentData);
  const sub = document.getElementById('inSubject').value;

  if(sub === 'হিন্দু ধর্ম') {
    keys = keys.filter(r => studentData[r].religion === 'Hinduism');
  } else if(sub === 'ইসলাম ধর্ম') {
    keys = keys.filter(r => studentData[r].religion === 'Islam' || !studentData[r].religion);
  }

  keys.forEach(r => {
    let mcqVal = document.getElementById(`tMcq_${r}`) ? document.getElementById(`tMcq_${r}`).value : '';
    let cqVal = document.getElementById(`tCq_${r}`) ? document.getElementById(`tCq_${r}`).value : '';
    let pracVal = document.getElementById(`tPrac_${r}`) ? document.getElementById(`tPrac_${r}`).value : '';
    let mcq = parseFloat(mcqVal) || 0;
    let cq = parseFloat(cqVal) || 0;
    let prac = parseFloat(pracVal) || 0;
    
    studentData[r].mcq = mcqVal;
    studentData[r].cq = cqVal;
    studentData[r].prac = pracVal;
    studentData[r].total = (mcq + cq + prac) > 0 ? (mcq + cq + prac).toString() : '';
  });

  await saveToStorage();
  await renderTables();
  alert('সকল নম্বর সফলভাবে অনলাইন ডাটাবেজে সংরক্ষণ করা হয়েছে!');
}
