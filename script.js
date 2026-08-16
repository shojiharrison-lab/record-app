const searchInput =
  document.getElementById("searchInput");

const genreFilter =
  document.getElementById("genreFilter");

const openFormButton =
  document.getElementById("openFormButton");

const closeFormButton =
  document.getElementById("closeFormButton");

const cancelButton =
  document.getElementById("cancelButton");

const recordFormSection =
  document.getElementById("recordFormSection");

const recordForm =
  document.getElementById("recordForm");

const artistInput =
  document.getElementById("artistInput");

const albumInput =
  document.getElementById("albumInput");

const genreInput =
  document.getElementById("genreInput");

const ratingInput =
  document.getElementById("ratingInput");

const memoInput =
  document.getElementById("memoInput");

const coverUrlInput =
  document.getElementById("coverUrlInput");

const searchCoverButton =
  document.getElementById("searchCoverButton");

const coverResults =
  document.getElementById("coverResults");

const coverStatus =
  document.getElementById("coverStatus");

const recordList =
  document.getElementById("recordList");

const recordCount =
  document.getElementById("recordCount");


/* =========================
   DATA
========================= */

let records =
  JSON.parse(
    localStorage.getItem("records-v2")
  ) || [];


/* =========================
   SAVE
========================= */

function saveRecords() {

  localStorage.setItem(
    "records-v2",
    JSON.stringify(records)
  );

}


/* =========================
   STAR
========================= */

function createStars(rating) {

  return (
    "★".repeat(rating) +
    "☆".repeat(5 - rating)
  );

}


/* =========================
   ESCAPE HTML
========================= */

function escapeHtml(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =========================
   GROUP BY ARTIST
========================= */

function groupByArtist(recordsArray) {

  const groups = {};

  recordsArray.forEach((record) => {

    const key =
      record.artist.trim();

    if (!groups[key]) {
      groups[key] = [];
    }

    groups[key].push(record);

  });


  return Object.entries(groups)
    .sort((a, b) =>
      a[0].localeCompare(
        b[0],
        "en",
        {
          sensitivity: "base"
        }
      )
    );

}


/* =========================
   RENDER
========================= */

function renderRecords() {

  const searchText =
    searchInput.value
      .trim()
      .toLowerCase();

  const selectedGenre =
    genreFilter.value;


  const filteredRecords =
    records.filter((record) => {

      const searchMatch =
        record.artist
          .toLowerCase()
          .includes(searchText)
        ||
        record.album
          .toLowerCase()
          .includes(searchText);

      const genreMatch =
        selectedGenre === "ALL"
        ||
        record.genre === selectedGenre;

      return (
        searchMatch &&
        genreMatch
      );

    });


  recordCount.textContent =
    `${filteredRecords.length} RECORDS`;


  if (
    filteredRecords.length === 0
  ) {

    recordList.innerHTML = `
      <div class="empty">
        レコードが見つかりません。
      </div>
    `;

    return;
  }


  const grouped =
    groupByArtist(
      filteredRecords
    );


  recordList.innerHTML =
    grouped
      .map(([artist, artistRecords]) => {

        const albums =
          artistRecords
            .sort((a, b) =>
              a.album.localeCompare(
                b.album,
                "en",
                {
                  sensitivity: "base"
                }
              )
            )
            .map((record) => {

              const coverHtml =
                record.coverUrl
                  ? `
                    <img
                      class="album-cover"
                      src="${escapeHtml(record.coverUrl)}"
                      alt="${escapeHtml(record.album)}"
                      loading="lazy"
                    >
                  `
                  : `
                    <div
                      class="album-cover"
                      aria-label="ジャケット画像なし"
                    ></div>
                  `;


              return `

                <article class="album-card">

                  ${coverHtml}

                  <div class="album-info">

                    <h4 class="album-title">
                      ${escapeHtml(record.album)}
                    </h4>

                    <p class="album-meta">
                      ${escapeHtml(record.genre)}
                    </p>

                    <div class="rating">
                      ${createStars(record.rating)}
                    </div>

                    <p class="memo">
                      ${escapeHtml(record.memo || "")}
                    </p>

                    <button
                      class="delete-button"
                      data-id="${record.id}">
                      DELETE
                    </button>

                  </div>

                </article>

              `;

            })
            .join("");


        return `

          <section class="artist-group">

            <h3 class="artist-name-heading">
              ${escapeHtml(artist)}
            </h3>

            <div class="album-grid">
              ${albums}
            </div>

          </section>

        `;

      })
      .join("");

}


/* =========================
   OPEN / CLOSE FORM
========================= */

function openForm() {

  recordFormSection
    .classList
    .remove("hidden");

  artistInput.focus();

}


function closeForm() {

  recordFormSection
    .classList
    .add("hidden");

  recordForm.reset();

  coverUrlInput.value = "";

  coverResults.innerHTML = "";

  coverStatus.textContent = "";

}


openFormButton.addEventListener(
  "click",
  openForm
);

closeFormButton.addEventListener(
  "click",
  closeForm
);

cancelButton.addEventListener(
  "click",
  closeForm
);


/* =========================
   COVER SEARCH
========================= */

searchCoverButton.addEventListener(
  "click",
  searchCoverArt
);


async function searchCoverArt() {

  const artist =
    artistInput.value.trim();

  const album =
    albumInput.value.trim();


  if (
    !artist ||
    !album
  ) {

    coverStatus.textContent =
      "ARTIST と ALBUM を入力してください。";

    return;
  }


  coverStatus.textContent =
    "ジャケットを検索しています…";

  coverResults.innerHTML = "";

  coverUrlInput.value = "";


  try {

    const query =
      encodeURIComponent(
        `artist:"${artist}" AND release:"${album}"`
      );


    const musicBrainzUrl =
      `https://musicbrainz.org/ws/2/release/?query=${query}&fmt=json&limit=10`;


    const response =
      await fetch(
        musicBrainzUrl,
        {
          headers: {
            "Accept":
              "application/json"
          }
        }
      );


    if (!response.ok) {

      throw new Error(
        "MusicBrainz search failed"
      );

    }


    const data =
      await response.json();


    const releases =
      data.releases || [];


    if (
      releases.length === 0
    ) {

      coverStatus.textContent =
        "候補が見つかりませんでした。";

      return;
    }


    const coverCandidates =
      [];


    for (
      const release of releases
    ) {

      const releaseId =
        release.id;

      const coverUrl =
        `https://coverartarchive.org/release/${releaseId}/front-500`;


      coverCandidates.push({
        title:
          release.title,
        releaseId,
        coverUrl
      });

    }


    coverStatus.textContent =
      "ジャケットを選択してください。";


    coverResults.innerHTML =
      coverCandidates

        .map((item) => {

          return `

            <button
              type="button"
              class="cover-option"
              data-url="${escapeHtml(item.coverUrl)}"
              title="${escapeHtml(item.title)}"
            >

              <img
                src="${escapeHtml(item.coverUrl)}"
                alt="${escapeHtml(item.title)}"
                loading="lazy"
                onerror="this.parentElement.style.display='none'"
              >

            </button>

          `;

        })
        .join("");


  } catch (error) {

    console.error(error);

    coverStatus.textContent =
      "ジャケット検索に失敗しました。";

  }

}


/* =========================
   SELECT COVER
========================= */

coverResults.addEventListener(
  "click",
  function(event) {

    const button =
      event.target.closest(
        ".cover-option"
      );


    if (!button) {
      return;
    }


    document
      .querySelectorAll(
        ".cover-option"
      )
      .forEach((item) => {

        item.classList.remove(
          "selected"
        );

      });


    button.classList.add(
      "selected"
    );


    coverUrlInput.value =
      button.dataset.url;


    coverStatus.textContent =
      "このジャケットを使用します。";

  }
);


/* =========================
   ADD RECORD
========================= */

recordForm.addEventListener(
  "submit",
  function(event) {

    event.preventDefault();


    const newRecord = {

      id:
        Date.now(),

      artist:
        artistInput.value.trim(),

      album:
        albumInput.value.trim(),

      genre:
        genreInput.value,

      rating:
        Number(
          ratingInput.value
        ),

      memo:
        memoInput.value.trim(),

      coverUrl:
        coverUrlInput.value

    };


    records.push(
      newRecord
    );


    saveRecords();


    renderRecords();


    closeForm();

  }
);


/* =========================
   DELETE
========================= */

recordList.addEventListener(
  "click",
  function(event) {

    const button =
      event.target.closest(
        ".delete-button"
      );


    if (!button) {
      return;
    }


    const id =
      Number(
        button.dataset.id
      );


    records =
      records.filter(
        (record) =>
          record.id !== id
      );


    saveRecords();


    renderRecords();

  }
);


/* =========================
   FILTERS
========================= */

searchInput.addEventListener(
  "input",
  renderRecords
);


genreFilter.addEventListener(
  "change",
  renderRecords
);


/* =========================
   START
========================= */

renderRecords();