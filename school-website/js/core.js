const schoolLogoBase64="https://i.ibb.co.com/wN2RzpPb/IMG-3229.jpg";
const availableClasses = ['৬ষ্ঠ', '৭ম', '৮ম', '৯ম', '১০ম'];

const baseSubjects = ['বাংলা ১ম', 'বাংলা ২য়', 'ইংরেজি ১ম', 'ইংরেজি ২য়', 'গণিত', 'বিজ্ঞান', 'বিজিএস', 'ইসলাম ধর্ম', 'হিন্দু ধর্ম', 'আইসিটি'];
const upperSubjects = ['পদার্থবিজ্ঞান', 'রসায়ন', 'জীববিজ্ঞান', 'বাংলাদেশের ইতিহাস', 'ভূগোল ও পরিবেশ', 'পৌরনীতি ও নাগরিকতা', 'হিসাববিজ্ঞান', 'ব্যবসায় উদ্যোগ', 'ফিন্যান্স ও ব্যাংকিং'];

function getSubjectsForClass(c){
  if(c === '৯ম' || c === '১০ম') {
    return [...baseSubjects, ...upperSubjects];
  }
  return baseSubjects;
}

let currentMode='general',studentData={},editingRoll=null;
let isLoggedIn = false;
let currentUserRole = 'admin';
let loggedInTeacherData = null;
let editingTeacherIndex = null;

function toggleDropdown(){document.getElementById("myDropdown").classList.toggle("show-dropdown")}
window.onclick=function(event){if(!event.target.matches('.menu-btn')){const dropdowns=document.getElementsByClassName("dropdown-content");for(let i=0;i<dropdowns.length;i++){let openDropdown=dropdowns[i];if(openDropdown.classList.contains('show-dropdown'))openDropdown.classList.remove('show-dropdown')}}}
function changeStartPageBg(event){const file=event.target.files[0];if(file){const reader=new FileReader();reader.onload=function(e){const startPage=document.getElementById('startPage');startPage.style.background=`linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.7)), url('${e.target.result}') no-repeat center center/cover`};reader.readAsDataURL(file)}}
function goToStartPage(){document.getElementById('startPage').style.display='flex';document.getElementById('loginOverlay').style.display='none';document.getElementById('appContent').style.display='none'}
function goToLogin(){document.getElementById('startPage').style.display='none';if(isLoggedIn){document.getElementById('appContent').style.display='block'}else{document.getElementById('loginOverlay').style.display='flex'}}


function updateSubjectDropdown(){
  const cls = document.getElementById('inClass').value;
  const subSelect = document.getElementById('inSubject');
  const subs = getSubjectsForClass(cls);
  
  const currentVal = subSelect.value;
  subSelect.innerHTML = '';
  subs.forEach(s => {
    let opt = document.createElement('option');
    opt.value = s;
    opt.innerText = s;
    subSelect.appendChild(opt);
  });
  if(subs.includes(currentVal)){
    subSelect.value = currentVal;
  }
}

function onClassChange(){
  toggleGroupVisibility();
  updateSubjectDropdown();
  updateHeader();
  loadMasterStudentData();
}

function selectClassFromTab(selectedClass, targetMode){
  const inClassSelect = document.getElementById('inClass');
  if(inClassSelect) {
    inClassSelect.value = selectedClass;
    onClassChange();
  }
  switchTemplate(targetMode);
}

function banglaToEnglishNum(s){if(!s)return'';const b=['০','১','২','৩','৪','৫','৬','৭','৮','৯'];let r=s.toString();b.forEach((d,i)=>r=r.replace(new RegExp(d,'g'),i));return r}
function englishToBanglaNum(s){if(s===undefined||s===null||s==='')return'';const b=['০','১','২','৩','৪','৫','৬','৭','৮','৯'];let r=s.toString();for(let i=0;i<10;i++){r=r.replace(new RegExp(i,'g'),b[i]);}return r}
function toggleGroupVisibility(){const c=document.getElementById('inClass').value,g=document.getElementById('inGroup'),w=document.getElementById('outGroupWrapper');if(c==='৯ম'||c==='১০ম'){g.style.display='inline-block';w.style.display='inline-block'}else{g.style.display='none';w.style.display='none'}}

function switchTemplate(mode){
  currentMode=mode;
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.template-view').forEach(v=>v.classList.remove('active'));
  
  const p=document.getElementById('mainPaper');
  const h=document.getElementById('standardHeader');
  const f=document.getElementById('footerSection');
  const n=document.getElementById('numberSheetMeta');
  const t=document.getElementById('tabulationMeta');
  
  const btn = document.getElementById('tabBtn_' + mode);
  if(btn) btn.classList.add('active');

  const config = {
    'general': { view: 'generalView', paper: 'portrait', showHeader: true, showFooter: true, showMeta: true, showTabMeta: false },
    'bangla-english': { view: 'banglaEnglishView', paper: 'portrait', showHeader: true, showFooter: true, showMeta: true, showTabMeta: false },
    'tabulation-68': { view: 'tabulation68View', paper: 'landscape', showHeader: true, showFooter: false, showMeta: false, showTabMeta: true },
    'tabulation-910': { view: 'tabulation910View', paper: 'landscape', showHeader: true, showFooter: false, showMeta: false, showTabMeta: true },
    'admit-card': { view: 'admitCardView', paper: 'landscape', showHeader: false, showFooter: false, showMeta: false, showTabMeta: false },
    'seat-card': { view: 'seatCardView', paper: 'landscape', showHeader: false, showFooter: false, showMeta: false, showTabMeta: false }
  };

  const currentCfg = config[mode] || config['general'];
  
  const targetView = document.getElementById(currentCfg.view);
  if(targetView) targetView.classList.add('active');

  if(p) p.className = 'paper ' + currentCfg.paper;
  if(h) h.style.display = currentCfg.showHeader ? 'block' : 'none';
  if(f) f.style.display = currentCfg.showFooter ? 'block' : 'none';
  if(n) n.style.display = currentCfg.showMeta ? 'flex' : 'none';
  if(t) t.style.display = currentCfg.showTabMeta ? 'flex' : 'none';

  updateHeader();
}

function updateHeader(){
  const inClass = document.getElementById('inClass').value;
  const inGroup = document.getElementById('inGroup').value;
  const inSection = document.getElementById('inSection').value;
  const inSubject = document.getElementById('inSubject').value;
  const inMarks = document.getElementById('inMarks').value;
  const inExam = document.getElementById('inExam').value;

  if(document.getElementById('outClass')) document.getElementById('outClass').innerText=inClass;
  if(document.getElementById('outGroup')) document.getElementById('outGroup').innerText=inGroup;
  if(document.getElementById('outSection')) document.getElementById('outSection').innerText=inSection;
  if(document.getElementById('outSubject')) document.getElementById('outSubject').innerText=inSubject;
  if(document.getElementById('outMarks')) document.getElementById('outMarks').innerText=inMarks;
  if(document.getElementById('outExam')) document.getElementById('outExam').innerText=inExam;
  if(document.getElementById('tabClass')) document.getElementById('tabClass').innerText=inClass;
  if(document.getElementById('tabSection')) document.getElementById('tabSection').innerText=inSection;
  
  renderTables();
}
