// Quran App - loads surah list and ayahs from local JSON files

let surahs = [];
let ayahsData = {};

const surahListEl = document.getElementById('surahList');
const ayahViewEl = document.getElementById('ayahView');
const searchInput = document.getElementById('searchInput');

async function init() {
  try {
    const [surahsRes, ayahsRes] = await Promise.all([
      fetch('data/surahs.json'),
      fetch('data/ayahs.json')
    ]);
    surahs = await surahsRes.json();
    ayahsData = await ayahsRes.json();
    renderSurahList(surahs);
  } catch (err) {
    surahListEl.innerHTML = `<div class="loading">Failed to load data.<br>${err.message}</div>`;
  }
}

function renderSurahList(list) {
  if (!list.length) {
    surahListEl.innerHTML = `<div class="loading">No surahs match your search.</div>`;
    return;
  }

  surahListEl.innerHTML = list.map(surah => `
    <div class="surah-item" data-number="${surah.number}">
      <div class="surah-number">${surah.number}</div>
      <div class="surah-info">
        <div class="en-name">${surah.englishName} <span style="color:#999;font-weight:400;">(${surah.englishNameTranslation})</span></div>
        <div class="meta">${surah.numberOfAyahs} Ayahs &middot; ${surah.revelationType}</div>
      </div>
      <div class="surah-arabic">${surah.name}</div>
    </div>
  `).join('');

  document.querySelectorAll('.surah-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.surah-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      const number = parseInt(item.dataset.number, 10);
      showSurah(number);
    });
  });
}

function showSurah(number) {
  const surah = surahs.find(s => s.number === number);
  if (!surah) return;

  const ayahs = ayahsData[String(number)] || [];

  const showBismillah = number !== 1 && number !== 9;

  ayahViewEl.innerHTML = `
    <div class="surah-header">
      <div class="arabic-title">${surah.name}</div>
      <div class="english-title">${surah.englishName} — ${surah.englishNameTranslation}</div>
      <div class="meta-line">${surah.revelationType} &middot; ${surah.numberOfAyahs} Ayahs</div>
    </div>
    ${showBismillah ? `<div class="bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>` : ''}
    <div class="ayah-list">
      ${ayahs.map(ayah => `
        <div class="ayah-card">
          <span class="ayah-badge">Ayah ${ayah.numberInSurah}</span>
          <div class="ayah-arabic">${ayah.arabic ? ayah.arabic : '<span class="placeholder-text">Arabic text coming soon...</span>'}</div>
          <div class="ayah-translation">${ayah.translation ? ayah.translation : '<span class="placeholder-text">Translation coming soon...</span>'}</div>
        </div>
      `).join('')}
    </div>
  `;

  ayahViewEl.scrollTop = 0;
}

searchInput.addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  if (!q) {
    renderSurahList(surahs);
    return;
  }
  const filtered = surahs.filter(s =>
    s.englishName.toLowerCase().includes(q) ||
    s.englishNameTranslation.toLowerCase().includes(q) ||
    s.name.includes(q) ||
    String(s.number) === q
  );
  renderSurahList(filtered);
});

init();
