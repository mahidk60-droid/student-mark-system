function printPage(){
  let s=document.getElementById('dynamicPrintStyle');
  if(!s){
    s=document.createElement('style');
    s.id='dynamicPrintStyle';
    document.head.appendChild(s);
  }
  if(currentMode==='tabulation-68'||currentMode==='tabulation-910'||currentMode==='admit-card'||currentMode==='seat-card'){
    s.innerHTML='@page{size:A4 landscape;margin:3mm}';
  }else{
    s.innerHTML='@page{size:A4 portrait;margin:3mm}';
  }
  window.print();
}

function exportToWordDoc(){
  const inClass = document.getElementById('inClass').value;
  const inSection = document.getElementById('inSection').value;
  const inSubject = document.getElementById('inSubject').value;
  const inExam = document.getElementById('inExam').value;

  let content = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>Number Sheet</title>
    <style>
      body { font-family: 'Hind Siliguri', 'Arial', sans-serif; }
      table { border-collapse: collapse; width: 100%; margin-top: 10px; }
      th, td { border: 1px solid #000; padding: 6px; text-align: center; font-size: 11pt; }
      th { background-color: #f2f2f2; }
      .header { text-align: center; margin-bottom: 15px; }
      .header h2 { margin: 0; font-size: 16pt; }
      .header p { margin: 2px; font-size: 11pt; }
    </style>
    </head>
    <body>
      <div class="header">
        <h2>দলইনগর উচ্চ বিদ্যালয়</h2>
        <p>${inExam}</p>
        <p><b>শ্রেণি:</b> ${inClass} | <b> শাখা:</b> ${inSection} | <b>বিষয়:</b> ${inSubject}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width:10%;">রোল</th>
            <th style="width:40%;">শিক্ষার্থীর নাম</th>
            <th style="width:12%;">নৈর্ব্যক্তিক</th>
            <th style="width:12%;">রচনামূলক</th>
            <th style="width:12%;">ব্যবহারিক</th>
            <th style="width:14%;">মোট</th>
          </tr>
        </thead>
        <tbody>`;

  let keys = Object.keys(studentData).sort((a,b)=>(parseInt(banglaToEnglishNum(a))||0)-(parseInt(banglaToEnglishNum(b))||0));
  
  if(keys.length === 0){
    for(let i=1; i<=30; i++){
      content += `
        <tr>
          <td>${i}</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>`;
    }
  } else {
    keys.forEach(r => {
      let s = studentData[r];
      content += `
        <tr>
          <td>${s.rollDisplay || r}</td>
          <td style="text-align:left;">${s.name || ''}</td>
          <td>${s.mcq || ''}</td>
          <td>${s.cq || ''}</td>
          <td>${s.prac || ''}</td>
          <td>${s.total || ''}</td>
        </tr>`;
    });
  }

  content += `
        </tbody>
      </table>
      <br><br><br>
      <table style="border:none; width:100%;">
        <tr style="border:none;">
          <td style="border:none; text-align:center; width:33%;">বিষয় শিক্ষকের স্বাক্ষর</td>
          <td style="border:none; text-align:center; width:33%;">শ্রেণি শিক্ষকের স্বাক্ষর</td>
          <td style="border:none; text-align:center; width:33%;">প্রধান শিক্ষকের স্বাক্ষর</td>
        </tr>
      </table>
    </body>
    </html>`;

  const blob = new Blob(['\ufeff' + content], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `নম্বর_ফর্দ_শ্রেণি_${inClass}_শাখা_${inSection}_${inSubject}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
