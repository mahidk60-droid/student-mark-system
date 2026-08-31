async function addOrUpdateStudent(){
  const stuRoll = document.getElementById('stuRoll');
  const stuName = document.getElementById('stuName');
  const stuReligion = document.getElementById('stuReligion');
  const stuCq = document.getElementById('stuCq');
  const stuMcq = document.getElementById('stuMcq');
  const stuPrac = document.getElementById('stuPrac');
  const stuGroup = document.getElementById('stuGroup');

  const raw=stuRoll.value.trim(),name=stuName.value.trim(),religion=stuReligion.value;
  if(!raw||!name){alert('দয়া করে রোল এবং শিক্ষার্থীর নাম প্রদান করুন');return}
  const key=editingRoll||raw,cq=stuCq.value,mcq=stuMcq.value,prac=stuPrac.value;
  let tot = (parseFloat(banglaToEnglishNum(cq))||0)+(parseFloat(banglaToEnglishNum(mcq))||0)+(parseFloat(banglaToEnglishNum(prac))||0)||'';
  
  let currentSub = document.getElementById('inSubject').value;
  let subMapping = {
    'বাংলা ১ম': 'b1', 'বাংলা ২য়': 'b2', 'ইংরেজি ১ম': 'e1', 'ইংরেজি ২য়': 'e2',
    'গণিত': 'math', 'বিজ্ঞান': 'sci', 'বিজিএস': 'bgs', 'ইসলাম ধর্ম': 'rel',
    'হিন্দু ধর্ম': 'hinduRel', 'আইসিটি': 'ict'
  };

  let fieldKey = subMapping[currentSub] || 'customSub';

  studentData[key] = {
    ...(studentData[key]||{}),
    rollDisplay:raw,
    name,
    group:stuGroup.value,
    religion:religion,
    cq, mcq, prac,
    total: tot,
    [fieldKey]: tot
  };

  await saveMasterStudentList();
  await saveToStorage();
  await renderTables();
  resetForm();
  alert('শিক্ষার্থীর তথ্য অনলাইন ডাটাবেজে আপডেট করা হয়েছে!');
}

async function saveMasterStudentList(){
  const cls = document.getElementById('inClass').value;
  const sec = document.getElementById('inSection').value;
  const masterKey = `MasterClass_${cls}_${sec}`;
  
  let masterArray = [];
  Object.keys(studentData).forEach(r => {
    masterArray.push({
      rollDisplay: studentData[r].rollDisplay,
      name: studentData[r].name,
      group: studentData[r].group,
      religion: studentData[r].religion
    });
  });
  await window.dbSave(`masterClass/${masterKey}`, masterArray);
}

function editStudent(k){
  const s=studentData[k];if(!s)return;
  document.getElementById('stuRoll').value=s.rollDisplay||k;
  document.getElementById('stuName').value=s.name||'';
  document.getElementById('stuGroup').value=s.group||'বিজ্ঞান';
  document.getElementById('stuReligion').value=s.religion||'Islam';
  document.getElementById('stuCq').value=s.cq||'';
  document.getElementById('stuMcq').value=s.mcq||'';
  document.getElementById('stuPrac').value=s.prac||'';
  editingRoll=k;
  document.getElementById('formTitle').innerText=`✏️ রোল ${s.rollDisplay} এর তথ্য সংশোধন করুন:`;
  const btn = document.getElementById('btnSaveStudent');
  btn.innerText='আপডেট করুন';
  btn.style.background='#f39c12';
}

function resetForm(){
  editingRoll=null;
  document.getElementById('stuRoll').value=document.getElementById('stuName').value=document.getElementById('stuCq').value=document.getElementById('stuMcq').value=document.getElementById('stuPrac').value='';
  document.getElementById('stuReligion').value='Islam';
  document.getElementById('formTitle').innerText='✍️ ইনপুট ও এন্ট্রি ফরম:';
  const btn = document.getElementById('btnSaveStudent');
  btn.innerText='সেভ করুন';
  btn.style.background='#27ae60';
}

function loadExcelData(e){
  const f=e.target.files[0];if(!f)return;
  const reader=new FileReader();
  reader.onload=async x=>{
    const wb=XLSX.read(new Uint8Array(x.target.result),{type:'array'}),ws=wb.Sheets[wb.SheetNames[0]],rows=XLSX.utils.sheet_to_json(ws);
    studentData={};
    rows.forEach(row=>{
      const r=row.Roll??row['রোল'];
      if(r!==undefined&&r!==null){
        const rs=r.toString().trim();
        const relVal = row.Religion||row['ধর্ম'];
        let parsedRel = 'Islam';
        if(relVal && (relVal.toString().toLowerCase().includes('hindu') || relVal.toString().includes('হিন্দু'))){
          parsedRel = 'Hinduism';
        }
        studentData[rs]={
          rollDisplay:rs,
          name:row.Name||row['নাম']||'',
          group:row.Group||row['গ্রুপ']||'বিজ্ঞান',
          religion:parsedRel,
          cq:row.CQ||row['রচনা']||'',
          mcq:row.MCQ||row['নৈর্ব্যক্তিক']||'',
          prac:row.Practical||row['ব্যবহারিক']||'',
          total:row.Total||row['মোট']||'',
          gpa:row.GPA||row['জিডিএ']||''
        }
      }
    });
    await saveMasterStudentList();
    await saveToStorage();
    await renderTables();
    alert('এক্সেল ডাটা লোড ও সেভ হয়েছে!');
  };
  reader.readAsArrayBuffer(f);
}
