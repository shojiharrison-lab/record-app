const searchInput =
  document.getElementById("searchInput");

const openFormButton =
  document.getElementById("openFormButton");

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

const recordList =
  document.getElementById("recordList");

const recordCount =
  document.getElementById("recordCount");


/* ---------------------------
   データ読み込み
--------------------------- */

let records =
  JSON.parse(
    localStorage.getItem("records")
  ) || [
    {
      id: 1,
      artist: "Wilco",
      album: "Yankee Hotel Foxtrot",
      genre: "Alternative",
      rating: 5,
      memo: "何度聴いても飽きない一枚。"
    },

    {
      id: 2,
      artist: "Neil Young",
      album: "Harvest",
      genre: "Folk Rock",
      rating: 5,
      memo: "夜にゆっくり聴きたい。"
    },

    {
      id: 3,
      artist: "The Beatles",
      album: "Abbey Road",
      genre: "Rock",
      rating: 5,
      memo: "B面の流れが最高。"
    }
  ];


/* ---------------------------
   保存
--------------------------- */

function saveRecords() {

  localStorage.setItem(
    "records",
    JSON.stringify(records)
  );

}


/* ---------------------------
   星を作る
--------------------------- */

function createStars(rating) {

  return (
    "★".repeat(rating) +
    "☆".repeat(5 - rating)
  );

}


/* ---------------------------
   表示
--------------------------- */

function renderRecords() {

  const searchText =
    searchInput.value
      .trim()
      .toLowerCase();


  const filteredRecords =
    records.filter((record) => {

      return (
        record.artist
          .toLowerCase()
          .includes(searchText)
        ||
        record.album
          .toLowerCase()
          .includes(searchText)
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


  recordList.innerHTML =
    filteredRecords
      .map((record) => {

        return `

          <article class="record-card">

            <div class="record-main">

              <h3>
                ${record.artist}
              </h3>

              <p class="album-name">
                ${record.album}
              </p>

              <p class="memo">
                ${record.memo || ""}
              </p>

            </div>


            <div class="genre">
              ${record.genre || "NO GENRE"}
            </div>


            <div>

              <div class="rating">
                ${createStars(record.rating)}
              </div>

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

}


/* ---------------------------
   フォームを開く
--------------------------- */

openFormButton.addEventListener(
  "click",
  function() {

    recordFormSection
      .classList
      .remove("hidden");

    artistInput.focus();

  }
);


/* ---------------------------
   キャンセル
--------------------------- */

cancelButton.addEventListener(
  "click",
  function() {

    recordFormSection
      .classList
      .add("hidden");

    recordForm.reset();

  }
);


/* ---------------------------
   レコード追加
--------------------------- */

recordForm.addEventListener(
  "submit",
  function(event) {

    event.preventDefault();


    const newRecord = {

      id: Date.now(),

      artist:
        artistInput.value.trim(),

      album:
        albumInput.value.trim(),

      genre:
        genreInput.value.trim(),

      rating:
        Number(ratingInput.value),

      memo:
        memoInput.value.trim()

    };


    records.unshift(newRecord);


    saveRecords();


    renderRecords();


    recordForm.reset();


    recordFormSection
      .classList
      .add("hidden");

  }
);


/* ---------------------------
   削除
--------------------------- */

recordList.addEventListener(
  "click",
  function(event) {

    if (
      !event.target
        .classList
        .contains("delete-button")
    ) {
      return;
    }


    const id =
      Number(
        event.target.dataset.id
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


/* ---------------------------
   検索
--------------------------- */

searchInput.addEventListener(
  "input",
  renderRecords
);


/* ---------------------------
   初期表示
--------------------------- */

renderRecords();