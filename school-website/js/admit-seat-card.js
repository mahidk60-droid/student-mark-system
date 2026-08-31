// শ্রেণি, শাখা ও রোল রেঞ্জ অনুযায়ী এডমিট ও সিট কার্ড জেনারেট করুন
async function generateAdmitCardsByRange(){
  const cls = document.getElementById('genClass').value;
  const sec = document.getElementById('genSection').value;
  const startRoll = parseInt(document.getElementById('genRollStart').value) || 1;
  const endRoll = parseInt(document.getElementById('genRollEnd').value) || 30;

  if(startRoll > endRoll){
    alert('শুরুর রোল অবশ্যই শেষ রোলের চেয়ে ছোট বা সমান হতে হবে!');
    return;
  }

  const masterKey = `MasterClass_${cls}_${sec}`;
  let masterData = (await window.dbGet(`masterClass/${masterKey}`)) || [];
  let studentMap = {};

  if(Array.isArray(masterData)){
    masterData.forEach(s => {
      let rNum = parseInt(banglaToEnglishNum(s.rollDisplay));
      if(rNum) studentMap[rNum] = s;
    });
  }

  let finalList = [];
  for(let r = startRoll; r <= endRoll; r++){
    let rFormatted = r < 10 ? '০' + r : r.toString();
    if(studentMap[r]){
      finalList.push({
        rollDisplay: studentMap[r].rollDisplay || rFormatted,
        name: studentMap[r].name || '',
        group: studentMap[r].group || 'সাধারণ',
        customClass: cls,
        customSection: sec
      });
    } else {
      finalList.push({
        rollDisplay: rFormatted,
        name: '',
        group: 'সাধারণ',
        customClass: cls,
        customSection: sec
      });
    }
  }

  renderAdmitCards(finalList, cls, sec);
  renderSeatCards(finalList, cls, sec);
  
  if(currentMode !== 'admit-card' && currentMode !== 'seat-card'){
    switchTemplate('admit-card');
  }
  
  alert(`শ্রেণি: ${cls}, শাখা: ${sec} এর মোট (${finalList.length}) টি এডমিট ও সিট কার্ড প্রস্তুত করা হয়েছে!`);
}

function renderAdmitCards(students, overrideClass = null, overrideSec = null){
  const c = document.getElementById('admitPagesContainer');
  if(!c) return;
  c.innerHTML = '';
  
  let studentList = students && students.length > 0 ? students : [{}, {}, {}, {}];
  const examName = document.getElementById('inExam').value || 'অর্ধ-বার্ষিক পরীক্ষা - ২০২৬ ইংরেজি';

  for(let i = 0; i < studentList.length; i += 4){
    const pg = document.createElement('div');
    pg.className = 'admit-page';
    studentList.slice(i, i + 4).forEach(s => {
      const card = document.createElement('div');
      card.className = 'admit-card';
      
      const stClass = s.customClass || overrideClass || document.getElementById('inClass').value || '';
      const stSec = s.customSection || overrideSec || document.getElementById('inSection').value || '';
      const stName = s.name || '';
      const stRoll = englishToBanglaNum(s.rollDisplay || '');

      card.innerHTML = `
        <img src="${schoolLogoBase64}" class="admit-watermark" alt="Watermark">
        
        <div class="admit-top">
          <img src="${schoolLogoBase64}" class="admit-top-logo" alt="Logo">
          <div class="admit-top-info">
            <h2 contenteditable="true" spellcheck="false">দলইনগর উচ্চ বিদ্যালয়</h2>
            <p contenteditable="true" spellcheck="false">গহিরা, রাউজান, চট্টগ্রাম</p>
            <p style="font-size:9.5px; margin-top:0;" contenteditable="true" spellcheck="false">EIIN: ১০৪৪০২</p>
          </div>
        </div>

        <div class="admit-exam-bar">
          <div class="admit-exam-name" contenteditable="true" spellcheck="false">${examName}</div>
          <div><span class="admit-pill-badge">প্রবেশপত্র</span></div>
        </div>

        <div class="admit-body-grid">
          <div class="admit-info-col">
            <div class="admit-row">
              <span class="admit-lbl">নাম</span>
              <span class="admit-col-colon">:</span>
              <span class="admit-val" contenteditable="true" spellcheck="false">${stName}</span>
            </div>
            <div class="admit-row">
              <span class="admit-lbl">শ্রেণী</span>
              <span class="admit-col-colon">:</span>
              <span class="admit-val" contenteditable="true" spellcheck="false">${stClass} ${stClass.includes('শ্রেণী') || stClass.includes('শ্রেণি') ? '' : 'শ্রেণী'}</span>
            </div>
            <div class="admit-row">
              <span class="admit-lbl">রোল নং</span>
              <span class="admit-col-colon">:</span>
              <span class="admit-val" contenteditable="true" spellcheck="false">${stRoll}</span>
            </div>
            <div class="admit-row">
              <span class="admit-lbl">শাখা</span>
              <span class="admit-col-colon">:</span>
              <span class="admit-val" contenteditable="true" spellcheck="false">${stSec}</span>
            </div>
            <div class="admit-row">
              <span class="admit-lbl">শিক্ষাবর্ষ</span>
              <span class="admit-col-colon">:</span>
              <span class="admit-val" contenteditable="true" spellcheck="false">২০২৬</span>
            </div>
          </div>

          <div class="admit-rules-col">
            <div class="admit-rules-title">নির্দেশনাবলী:</div>
            <ol contenteditable="true" spellcheck="false">
              <li>পরীক্ষার ৩০ মিনিট পূর্বে উপস্থিত হতে হবে।</li>
              <li>অবশ্যই প্রবেশপত্র সঙ্গে আনতে হবে।</li>
              <li>পরীক্ষার হলে কোনো প্রকার অসদুপায় অবলম্বন নিষিদ্ধ।</li>
              <li>Authorities decision will be final.</li>
            </ol>
          </div>
        </div>

        <div>
          <div class="admit-sign-row">
            <div class="admit-sign-box">শ্রেণী শিক্ষক</div>
            <div class="admit-sign-box">প্রধান শিক্ষক</div>
          </div>
          <div class="admit-credit-tag">Developed by Mahid khan</div>
        </div>
      `;
      pg.appendChild(card);
    });
    c.appendChild(pg);
  }
}

// Render Exactly 12 Seat Cards per page (Exact 1:1 Image Ratio & Match)
function renderSeatCards(students, overrideClass = null, overrideSec = null){
  const c = document.getElementById('seatPagesContainer');
  if(!c) return;
  c.innerHTML = '';
  
  let studentList = students && students.length > 0 ? students : [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
  const examName = document.getElementById('inExam').value || 'অর্ধ-বার্ষিক পরীক্ষা - ২০২৬ ইংরেজি';

  for(let i = 0; i < studentList.length; i += 12){
    const pg = document.createElement('div');
    pg.className = 'seat-page';
    studentList.slice(i, i + 12).forEach(s => {
      const card = document.createElement('div');
      card.className = 'seat-card';
      
      const stClass = s.customClass || overrideClass || document.getElementById('inClass').value || '';
      const stSec = s.customSection || overrideSec || document.getElementById('inSection').value || '';
      const stName = s.name || '';
      const stRoll = englishToBanglaNum(s.rollDisplay || '');

      card.innerHTML = `
        <img src="${schoolLogoBase64}" class="seat-watermark" alt="Watermark">
        
        <div class="seat-card-top">
          <img src="${schoolLogoBase64}" class="seat-card-logo" alt="Logo">
          <div class="seat-card-school-title" contenteditable="true" spellcheck="false">দলইনগর উচ্চ বিদ্যালয়</div>
        </div>

        <div class="seat-card-exam" contenteditable="true" spellcheck="false">${examName}</div>

        <div class="seat-card-body">
          <div class="seat-card-info-col">
            <div class="seat-row">
              <span class="seat-lbl">নাম</span>
              <span class="seat-colon">:</span>
              <span class="seat-val" contenteditable="true" spellcheck="false">${stName}</span>
            </div>
            <div class="seat-row">
              <span class="seat-lbl">শ্রেণী</span>
              <span class="seat-colon">:</span>
              <span class="seat-val" contenteditable="true" spellcheck="false">${stClass}</span>
            </div>
            <div class="seat-row">
              <span class="seat-lbl">শাখা</span>
              <span class="seat-colon">:</span>
              <span class="seat-val" contenteditable="true" spellcheck="false">${stSec}</span>
            </div>
          </div>

          <div class="seat-card-roll-box">
            <div class="seat-card-roll-lbl">রোল নং</div>
            <div class="seat-card-roll-num" contenteditable="true" spellcheck="false">${stRoll}</div>
          </div>
        </div>

        <div>
          <div class="seat-card-sign-row">
            <div class="seat-card-sign-box">শ্রেণী শিক্ষক</div>
            <div class="seat-card-sign-box">প্রধান শিক্ষক</div>
          </div>
          <div class="seat-card-credit">Developed by Mahid khan</div>
        </div>
      `;
      pg.appendChild(card);
    });
    c.appendChild(pg);
  }
}
