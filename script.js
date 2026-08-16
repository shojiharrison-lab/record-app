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

const currentCoverText =
  document.getElementById("currentCoverText");

const recordList =
  document.getElementById("recordList");

const recordCount =
  document.getElementById("recordCount");

const alphabetNav =
  document.getElementById("alphabetNav");

const showAllButton =
  document.getElementById("showAllButton");

const formModeLabel =
  document.getElementById("formModeLabel");

const formTitle =
  document.getElementById("formTitle");

const saveButton =
  document.getElementById("saveButton");


/* =========================
   DATA
========================= */

let records =
  JSON.parse(
    localStorage.getItem("records-v2")
  ) || [];


let selectedLetter =
  "ALL";


/*
  null = 新規登録
  数字 = 編集中のrecord id
*/
let editingRecordId =
  null;


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
   HELPERS
========================= */

function createStars(rating) {

  return (
    "★".repeat(rating) +
    "☆".repeat(5 - rating)
  );

}


function escapeHtml(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


function normalizeArtistName(name) {

  return name
    .trim()
    .replace(/^the\s+/i, "");

}


function getArtistLetter(name) {

  const normalized =
    normalizeArtistName(name);

  const first =
    normalized
      .charAt(0)
      .toUpperCase();


  if (
    first >= "A" &&
    first <= "Z"
  ) {

    return first;

  }


  return "#";

}


/* =========================
   GROUP
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
    .sort((a, b) => {

      return normalizeArtistName(a[0])
        .localeCompare(
          normalizeArtistName(b[0]),
          "en",
          {
            sensitivity: "base"
          }
        );

    });

}


/* =========================
   A-Z
========================= */

function getAvailableLetters() {

  return new Set(

    records.map((record) => {

      return getArtistLetter(
        record.artist
      );

    })

  );

}


function renderAlphabet() {

  const letters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
      .split("");


  const available =
    getAvailableLetters();


  alphabetNav.innerHTML =
    letters
      .map((letter) => {

        const isAvailable =
          available.has(letter);


        const activeClass =
          selectedLetter === letter
            ? "active"
            : "";


        const disabledClass =
          !isAvailable
            ? "disabled"
            : "";


        return `

          <button
            class="
              alphabet-button
              ${activeClass}
              ${disabledClass}
            "
            data-letter="${letter}"
            ${!isAvailable ? "disabled" : ""}
          >
            ${letter}
          </button>

        `;

      })
      .join("");

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


      const letterMatch =
        selectedLetter === "ALL"
        ||
        getArtistLetter(
          record.artist
        ) === selectedLetter;


      return (
        searchMatch &&
        genreMatch &&
        letterMatch
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


    renderAlphabet();

    return;

  }


  const grouped =
    groupByArtist(
      filteredRecords
    );


  recordList.innerHTML =
    grouped

      .map(
        ([artist, artistRecords]) => {


          const albums =
            artistRecords

              .sort((a, b) => {

                return a.album
                  .localeCompare(
                    b.album,
                    "en",
                    {
                      sensitivity: "base"
                    }
                  );

              })

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

                    <div class="cover-wrapper">

                      ${coverHtml}

                    </div>


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
                        class="edit-button"
                        data-id="${record.id}"
                      >
                        EDIT
                      </button>


                      <button
                        class="delete-button"
                        data-id="${record.id}"
                      >
                        DELETE
                      </button>

                    </div>

                  </article>

                `;

              })
              .join("");


          return `

            <section class="artist-group">

              <div class="artist-heading-row">

                <h3 class="artist-name-heading">

                  ${escapeHtml(artist)}

                </h3>


                <span class="artist-record-count">

                  ${artistRecords.length}

                  ${
                    artistRecords.length === 1
                      ? "RECORD"
                      : "RECORDS"
                  }

                </span>

              </div>


              <div class="album-grid">

                ${albums}

              </div>

            </section>

          `;

        }
      )
      .join("");


  renderAlphabet();

}


/* =========================
   FORM MODE
========================= */

function setAddMode() {

  editingRecordId =
    null;


  formModeLabel.textContent =
    "NEW ENTRY";


  formTitle.textContent =
    "ADD RECORD";


  saveButton.textContent =
    "SAVE RECORD";


  currentCoverText.textContent =
    "";

}


function setEditMode(record) {

  editingRecordId =
    record.id;


  formModeLabel.textContent =
    "EDIT ENTRY";


  formTitle.textContent =
    "EDIT RECORD";


  saveButton.textContent =
    "SAVE CHANGES";


  artistInput.value =
    record.artist;


  albumInput.value =
    record.album;


  genreInput.value =
    record.genre;


  ratingInput.value =
    String(record.rating);


  memoInput.value =
    record.memo || "";


  coverUrlInput.value =
    record.coverUrl || "";


  if (record.coverUrl) {

    currentCoverText.textContent =
      "現在のジャケットを使用中。SEARCH COVERで変更できます。";

  } else {

    currentCoverText.textContent =
      "現在ジャケット画像はありません。";

  }

}


/* =========================
   OPEN / CLOSE
========================= */

function openAddForm() {

  recordForm.reset();


  coverUrlInput.value =
    "";


  coverResults.innerHTML =
    "";


  coverStatus.textContent =
    "";


  setAddMode();


  recordFormSection
    .classList
    .remove("hidden");


  artistInput.focus();


  recordFormSection
    .scrollIntoView({
      behavior: "smooth"
    });

}


function openEditForm(record) {

  recordForm.reset();


  coverResults.innerHTML =
    "";


  coverStatus.textContent =
    "";


  setEditMode(record);


  recordFormSection
    .classList
    .remove("hidden");


  recordFormSection
    .scrollIntoView({
      behavior: "smooth"
    });

}


function closeForm() {

  recordFormSection
    .classList
    .add("hidden");


  recordForm.reset();


  coverUrlInput.value =
    "";


  coverResults.innerHTML =
    "";


  coverStatus.textContent =
    "";


  currentCoverText.textContent =
    "";


  setAddMode();

}


openFormButton.addEventListener(
  "click",
  openAddForm
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


  coverResults.innerHTML =
    "";


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

            Accept:
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
      releases.map((release) => {

        return {

          title:
            release.title,

          coverUrl:
            `https://coverartarchive.org/release/${release.id}/front-500`

        };

      });


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
                onerror="
                  this.parentElement.style.display='none'
                "
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


    currentCoverText.textContent =
      "";

  }
);


/* =========================
   SAVE / UPDATE
========================= */

recordForm.addEventListener(
  "submit",
  function(event) {

    event.preventDefault();


    const recordData = {

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


    /*
      新規登録
    */

    if (
      editingRecordId === null
    ) {

      records.push({

        id:
          Date.now(),

        ...recordData

      });

    }


    /*
      編集
    */

    else {

      records =
        records.map((record) => {


          if (
            record.id === editingRecordId
          ) {

            return {

              ...record,

              ...recordData

            };

          }


          return record;

        });

    }


    saveRecords();


    selectedLetter =
      "ALL";


    renderRecords();


    closeForm();

  }
);


/* =========================
   EDIT / DELETE
========================= */

recordList.addEventListener(
  "click",
  function(event) {


    /*
      EDIT
    */

    const editButton =
      event.target.closest(
        ".edit-button"
      );


    if (editButton) {


      const id =
        Number(
          editButton.dataset.id
        );


      const record =
        records.find(
          (item) =>
            item.id === id
        );


      if (record) {

        openEditForm(record);

      }


      return;

    }


    /*
      DELETE
    */

    const deleteButton =
      event.target.closest(
        ".delete-button"
      );


    if (!deleteButton) {

      return;

    }


    const id =
      Number(
        deleteButton.dataset.id
      );


    const record =
      records.find(
        (item) =>
          item.id === id
      );


    if (!record) {

      return;

    }


    const confirmed =
      window.confirm(

        `${record.artist} / ${record.album} を削除しますか？`

      );


    if (!confirmed) {

      return;

    }


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
   A-Z EVENTS
========================= */

alphabetNav.addEventListener(
  "click",
  function(event) {


    const button =
      event.target.closest(
        ".alphabet-button"
      );


    if (
      !button ||
      button.disabled
    ) {

      return;

    }


    selectedLetter =
      button.dataset.letter;


    renderRecords();


    document
      .querySelector(
        ".collection-section"
      )
      .scrollIntoView({
        behavior: "smooth"
      });

  }
);


showAllButton.addEventListener(
  "click",
  function() {

    selectedLetter =
      "ALL";


    renderRecords();

  }
);


/* =========================
   SEARCH
========================= */

searchInput.addEventListener(
  "input",
  function() {

    selectedLetter =
      "ALL";


    renderRecords();

  }
);


/* =========================
   GENRE
========================= */

genreFilter.addEventListener(
  "change",
  function() {

    selectedLetter =
      "ALL";


    renderRecords();

  }
);


/* =========================
   START
========================= */

renderAlphabet();

renderRecords();