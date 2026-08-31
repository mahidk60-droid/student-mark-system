async function getMergedTabulationData(){
  const cls = document.getElementById('inClass').value;
  const sec = document.getElementById('inSection').value;
  const masterKey = `MasterClass_${cls}_${sec}`;
  
  let mergedMap = {};
  try {
    let master = await window.dbGet(`masterClass/${masterKey}`);
    if(master && Array.isArray(master)){
      master.forEach(s => {
        mergedMap[s.rollDisplay] = { rollDisplay: s.rollDisplay, name: s.name, group: s.group||'বিজ্ঞান', religion: s.religion||'Islam' };
      });
    }

    const subMapping = {
      'বাংলা ১ম': 'b1', 'বাংলা ২য়': 'b2', 'ইংরেজি ১ম': 'e1', 'ইংরেজি ২য়': 'e2',
      'গণিত': 'math', 'বিজ্ঞান': 'sci', 'বিজিএস': 'bgs', 'ইসলাম ধর্ম': 'rel',
      'হিন্দু ধর্ম': 'hinduRel', 'আইসিটি': 'ict',
      'পদার্থবিজ্ঞান': 'sci_g1', 'রসায়ন': 'sci_g2', 'জীববিজ্ঞান': 'sci_g3',
      'বাংলাদেশের ইতিহাস': 'arts_g1', 'ভূগোল ও পরিবেশ': 'arts_g2', 'পৌরনীতি ও নাগরিকতা': 'arts_g3',
      'হিসাববিজ্ঞান': 'com_g1', 'ব্যবসায় উদ্যোগ': 'com_g2', 'ফিন্যান্স ও ব্যাংকিং': 'com_g3'
    };

    const allPossibleSubs = getSubjectsForClass(cls);

    for (let sub of allPossibleSubs) {
      let key = `SchoolData_${cls}_${sec}_${sub}`;
      let saved = await window.dbGet(`schoolData/${key}`);
      if(saved && saved.students){
        let dataObj = saved.students || {};
        let field = subMapping[sub];
        Object.keys(dataObj).forEach(r => {
          if(!mergedMap[r]){
            mergedMap[r] = { rollDisplay: dataObj[r].rollDisplay, name: dataObj[r].name, group: dataObj[r].group, religion: dataObj[r].religion };
          }
          if(field){
            mergedMap[r][field] = dataObj[r].total || '';
          }
        });
      }
    }
  } catch(e) {
    console.error(e);
  }

  return mergedMap;
}

async function renderTables(){
 const sg=document.getElementById('inGroup').value,sc=document.getElementById('inClass').value,nineTen=sc==='৯ম'||sc==='১০ম',curSub=document.getElementById('inSubject').value;let list=[];
 if(sg==='মানবিক'){document.getElementById('sub1').innerText='বাংলাদেশের ইতিহাস';document.getElementById('sub2').innerText='ভূগোল ও পরিবেশ';document.getElementById('sub3').innerText='পৌরনীতি ও নাগরিকতা'}
 else if(sg==='ব্যবসায় শিক্ষা'){document.getElementById('sub1').innerText='হিসাববিজ্ঞান';document.getElementById('sub2').innerText='ব্যবসায় উদ্যোগ';document.getElementById('sub3').innerText='ফিন্যান্স ও ব্যাংকিং'}
 else{document.getElementById('sub1').innerText='পদার্থবিজ্ঞান';document.getElementById('sub2').innerText='রসায়ন';document.getElementById('sub3').innerText='জীববিজ্ঞান'}
 
 Object.keys(studentData).forEach(r=>{
   const s=studentData[r];
   let religionMatch = true;
   if(curSub === 'হিন্দু ধর্ম') {
     religionMatch = (s.religion === 'Hinduism');
   } else if(curSub === 'ইসলাম ধর্ম') {
     religionMatch = (s.religion === 'Islam' || !s.religion);
   }
   
   if((!nineTen||sg==='সকল'||s.group===sg) && religionMatch) {
     list.push({rollKey:r,...s});
   }
 });
 
 list.sort((a,b)=>(parseInt(banglaToEnglishNum(a.rollDisplay))||0)-(parseInt(banglaToEnglishNum(b.rollDisplay))||0));
 const b1=document.getElementById('generalTableBody1'),b2=document.getElementById('generalTableBody2'),be1=document.getElementById('beTableBody1'),be2=document.getElementById('beTableBody2'),t68=document.getElementById('tab68TableBody'),t910=document.getElementById('tab910TableBody');
 if(b1) b1.innerHTML='';
 if(b2) b2.innerHTML='';
 if(be1) be1.innerHTML='';
 if(be2) be2.innerHTML='';
 if(t68) t68.innerHTML='';
 if(t910) t910.innerHTML='';

 for(let i=0;i<60;i++){
  const s=list[i]||{},r=s.rollDisplay||'',a=(s.rollKey && currentUserRole==='admin')?`<div class="action-btn-cell"><button class="btn btn-edit" style="padding:0 2px;font-size:8px;" onclick="editStudent('${s.rollKey}')">✏️</button></div>`:'';
  const tr=document.createElement('tr');
  tr.innerHTML=`<td>${r}</td><td class="name-col">${s.name||''}</td><td>${s.mcq||''}</td><td>${s.cq||''}</td><td>${s.prac||''}</td><td>${s.total||''}</td><td>${s.gpa||''}</td><td class="action-col">${a}</td>`;
  if(b1 && b2) (i<30?b1:b2).appendChild(tr);

  const tr2=tr.cloneNode(false);
  tr2.innerHTML=`<td>${r}</td><td class="name-col">${s.name||''}</td><td>${s.b1cq||''}</td><td>${s.b1mcq||''}</td><td>${s.b2cq||''}</td><td>${s.b2mcq||''}</td><td>${s.grandTotal||''}</td><td>${s.beGpa||''}</td><td class="action-col">${a}</td>`;
  if(be1 && be2) (i<30?be1:be2).appendChild(tr2);
 }

 let tabDataMap = await getMergedTabulationData();
 let tabList = Object.keys(tabDataMap).map(r => tabDataMap[r]);
 tabList.sort((a,b)=>(parseInt(banglaToEnglishNum(a.rollDisplay))||0)-(parseInt(banglaToEnglishNum(b.rollDisplay))||0));

 for(let i=0;i<20;i++){
  const s=tabList[i]||{},r=s.rollDisplay||(i+1<10?'০'+(i+1):(i+1));
  let b1Val=parseFloat(banglaToEnglishNum(s.b1))||0;
  let b2Val=parseFloat(banglaToEnglishNum(s.b2))||0;
  let bTot = (b1Val||b2Val) ? (b1Val+b2Val) : '';
  let e1Val=parseFloat(banglaToEnglishNum(s.e1))||0;
  let e2Val=parseFloat(banglaToEnglishNum(s.e2))||0;
  let eTot = (e1Val||e2Val) ? (e1Val+e2Val) : '';
  let m=parseFloat(banglaToEnglishNum(s.math))||0;
  let sc=parseFloat(banglaToEnglishNum(s.sci))||0;
  let bgs=parseFloat(banglaToEnglishNum(s.bgs))||0;
  let rel=parseFloat(banglaToEnglishNum(s.rel||s.hinduRel))||0;
  let ict=parseFloat(banglaToEnglishNum(s.ict))||0;

  let grandTot68 = (bTot ? parseFloat(bTot) : 0) + (eTot ? parseFloat(eTot) : 0) + m + sc + bgs + rel + ict;

  let x=document.createElement('tr');
  x.innerHTML=`<td>${r}</td><td class="name-col">${s.name||''}</td><td>${s.b1||''}</td><td>${s.b2||''}</td><td>${bTot||''}</td><td>${s.e1||''}</td><td>${s.e2||''}</td><td>${eTot||''}</td><td>${s.math||''}</td><td>${s.sci||''}</td><td>${s.bgs||''}</td><td>${s.rel||s.hinduRel||''}</td><td>${s.ict||''}</td><td>${grandTot68||''}</td><td>${s.remark||''}</td>`;
  if(t68) t68.appendChild(x);

  let g1Val='', g2Val='', g3Val='';
  let stGroup = s.group || sg; 

  if(stGroup === 'মানবিক'){
    g1Val = s.arts_g1 || ''; g2Val = s.arts_g2 || ''; g3Val = s.arts_g3 || '';
  } else if(stGroup === 'ব্যবসায় শিক্ষা'){
    g1Val = s.com_g1 || ''; g2Val = s.com_g2 || ''; g3Val = s.com_g3 || '';
  } else {
    g1Val = s.sci_g1 || ''; g2Val = s.sci_g2 || ''; g3Val = s.sci_g3 || '';
  }

  let g1=parseFloat(banglaToEnglishNum(g1Val))||0;
  let g2=parseFloat(banglaToEnglishNum(g2Val))||0;
  let g3=parseFloat(banglaToEnglishNum(g3Val))||0;
  let grandTot910 = (bTot ? parseFloat(bTot) : 0) + (eTot ? parseFloat(eTot) : 0) + m + sc + g1 + g2 + g3 + bgs + ict;

  let y=x.cloneNode(false);
  y.innerHTML=`<td>${r}</td><td class="name-col">${s.name||''}</td><td>${s.b1||''}</td><td>${s.b2||''}</td><td>${bTot||''}</td><td>${s.e1||''}</td><td>${s.e2||''}</td><td>${eTot||''}</td><td>${s.math||''}</td><td>${s.sci||''}</td><td>${g1Val}</td><td>${g2Val}</td><td>${g3Val}</td><td>${s.bgs||''}</td><td>${s.optSub||''}</td><td>${s.ict||''}</td><td>${grandTot910||''}</td><td>${s.remark||''}</td>`;
  if(t910) t910.appendChild(y);
 }
}
