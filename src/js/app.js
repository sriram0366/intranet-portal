// NovaCorp Intranet Portal - client logic
const newsData = [
  { title: "Q2 Town Hall Recap", date: "20 Jun 2026", body: "Leadership shared Q2 results and roadmap priorities for H2 2026." },
  { title: "New Office Wing Opened", date: "12 Jun 2026", body: "The 4th floor extension is now open with additional collaboration spaces." },
  { title: "DevOps CoE Launched", date: "02 Jun 2026", body: "A new Center of Excellence for DevOps practices has been established." }
];

const policies = [
  { name: "Leave Policy", desc: "Annual, sick, and casual leave entitlements and approval workflow." },
  { name: "Work From Home Policy", desc: "Guidelines for hybrid and remote work arrangements." },
  { name: "Code of Conduct", desc: "Expected behavior, ethics, and reporting procedures." },
  { name: "Expense Reimbursement Policy", desc: "Process and limits for claiming business expenses." }
];

const holidays = [
  ["15 Aug 2026", "Independence Day", "Saturday"],
  ["02 Oct 2026", "Gandhi Jayanti", "Friday"],
  ["12 Nov 2026", "Diwali", "Thursday"],
  ["25 Dec 2026", "Christmas", "Friday"]
];

const announcements = [
  "Annual performance review cycle starts 1st July 2026.",
  "Office will be closed on 15th August for Independence Day.",
  "New health insurance enrollment window open till 10th July."
];

function renderNews(){
  const el = document.getElementById('news-cards');
  el.innerHTML = newsData.map(n => `
    <div class="card">
      <h3>${n.title}</h3>
      <p>${n.body}</p>
      <span class="date">${n.date}</span>
    </div>`).join('');
}

function renderPolicies(){
  const el = document.getElementById('policy-list');
  el.innerHTML = policies.map(p => `<li><strong>${p.name}:</strong> ${p.desc}</li>`).join('');
}

function renderHolidays(){
  const tbody = document.querySelector('#holiday-table tbody');
  tbody.innerHTML = holidays.map(h => `<tr><td>${h[0]}</td><td>${h[1]}</td><td>${h[2]}</td></tr>`).join('');
}

function renderAnnouncements(){
  const el = document.getElementById('announcement-list');
  el.innerHTML = announcements.map(a => `<div class="announce">${a}</div>`).join('');
}

async function checkHealth(){
  const statusEl = document.getElementById('health-status');
  try {
    const res = await fetch('/health', { cache: 'no-store' });
    if(res.ok){
      statusEl.textContent = '● Portal Healthy';
      statusEl.style.color = '#7CFC00';
    } else {
      statusEl.textContent = '● Degraded';
      statusEl.style.color = '#ffcc00';
    }
  } catch(e){
    statusEl.textContent = '● Offline';
    statusEl.style.color = '#ff5050';
  }
}

function setBuildInfo(){
  document.getElementById('build-info').textContent =
    `Build: 1.0.0 | Deployed via Jenkins -> Docker -> Kubernetes | Last refresh: ${new Date().toLocaleString()}`;
}

document.addEventListener('DOMContentLoaded', () => {
  renderNews();
  renderPolicies();
  renderHolidays();
  renderAnnouncements();
  setBuildInfo();
  checkHealth();
  setInterval(checkHealth, 15000);
});
