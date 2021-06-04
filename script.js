"use strict";

const quotesWrapper = document.querySelector("#post-wrapper");

class QuotesCard {
  tokenState = "";
  isFetchingState = false;
  xDown = null;
  yDown = null;
  cardList;

  constructor() {
    this._fetchQuotes();
    this.cardList = document.querySelectorAll(".posts__card");

    //Events
    window.addEventListener("scroll", this.infiniteScroll.bind(this));
  }

  async _fetchQuotes(tokenState) {
    this.isFetchingState = true;
    const queryWithToken = tokenState == "" ? "" : `?pageToken=${tokenState}`;

    await fetch(`https://message-list.appspot.com/messages${queryWithToken}`)
      .then((res) => res.json())
      .then((res) => {
        this.isFetchingState = false;
        if (res.count > 0) {
          this.tokenState = res.pageToken;
          res.messages.forEach((quote) => this._renderQuotesHtml(quote));
          this.cardList = document.querySelectorAll(".posts__card");
          if (this.isMobile()) {
            document.documentElement.scrollTo({
              top: quotesWrapper.scrollHeight - 1000,
            });
          } else {
            document.documentElement.scrollTo({
              top: quotesWrapper.scrollHeight - 700,
            });
          }
        }
      });
  }

  _renderQuotesHtml(quote) {
    const currentDate = new Date();
    const publishedDate = new Date(quote.updated);
    let html = `<div class="posts__card" ontouchstart="quotes.handleTouchStart(event)" ontouchmove="quotes.handleTouchMove(event)" id="${
      quote.id
    }">
    <div class="posts__card-wrapper">
      <div class="posts__card-delete flexbox-centered ">
          <span>
              Delete
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#fff"><path d="M0 0h24v24H0z" fill="none"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
      </div>
      <div class="posts__card-content">
        <div class="posts__card-header flexbox-centered">
          <div class="posts__card-img">
            <img
              src="http://message-list.appspot.com${quote.author.photoUrl}"
              width="50"
            />
          </div>
          <div class="posts__card-title">
            <h4>${quote.author.name}</h4>
            <p class="posts__card-label">${this.diffYears(
              currentDate,
              publishedDate
            )} years</p>
          </div>
        </div>
        <div class="posts__card-body">
          <p class="posts__card-content">
          ${quote.content}
          </p>
        </div>
      </div>
      <div class="posts__card-edit flexbox-centered ">
          <span>
              Edit
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#fff"><path d="M0 0h24v24H0z" fill="none"/><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
       </div>
    </div>
  </div>`;
    quotesWrapper.insertAdjacentHTML("afterbegin", html);
  }

  getTouches(evt) {
    return evt.touches || evt.originalEvent.touches;
  }

  handleTouchStart(evt) {
    const firstTouch = this.getTouches(evt)[0];
    this.xDown = firstTouch.clientX;
    this.yDown = firstTouch.clientY;
  }

  handleTouchMove(evt) {
    if (!this.xDown || !this.yDown) {
      return;
    }

    let xUp = evt.touches[0].clientX;
    let yUp = evt.touches[0].clientY;

    let xDiff = this.xDown - xUp;
    let yDiff = this.yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      if (xDiff > 0) {
        this.handleEditQuote(evt);
      } else {
        this.handleDeleteQuote(evt);
      }
    } else {
      if (yDiff > 0) {
        console.log("Swiped Up side");
      } else {
        console.log("Swiped Down side");
      }
    }
    
    this.xDown = null;
    this.yDown = null;
  }

  handleDeleteQuote(evt) {
    this.removeActionButtons();
    evt.target
      .closest(".posts__card")
      .querySelector(".posts__card-delete")
      .classList.add("active");

      setTimeout(()=>{
        evt.target
        .closest(".posts__card").classList.add('slide-out-left')
      },800);

      setTimeout(()=>{
        evt.target
        .closest(".posts__card").remove();
      },1200);
     
  }

  handleEditQuote(evt) {
    this.removeActionButtons();
    evt.target
      .closest(".posts__card")
      .querySelector(".posts__card-edit")
      .classList.add("active");
  }
  infiniteScroll(event) {
    let scrollHeight = document.documentElement.scrollHeight;
    let scrollPos = window.innerHeight + window.scrollY;
    console.log(
      scrollHeight,
      "Scroll height",
      scrollPos,
      "Scroll Pos",
      (scrollHeight > scrollPos) / scrollHeight == 0,
      "validation "
    );
    if (this.isFetchingState) return;

    // event.preventDefault();
    if (this.isMobile()) {
      if ((scrollHeight - 100 > scrollPos) / scrollHeight == 0) {
        this._fetchQuotes(this.tokenState);
      }
    } else {
      if ((scrollHeight > scrollPos) / scrollHeight == 0) {
        this._fetchQuotes(this.tokenState);
      }
    }
  }
  removeActionButtons() {
    const deleteBtns = document.querySelectorAll(".posts__card-delete");
    const editBtns = document.querySelectorAll(".posts__card-edit");

    deleteBtns.forEach((ele) => ele.classList.remove("active"));
    editBtns.forEach((ele) => ele.classList.remove("active"));
  }

  //Helpers

  diffYears(dt2, dt1) {
    var diff = (dt2.getTime() - dt1.getTime()) / 1000;
    diff /= 60 * 60 * 24;
    return Math.abs(Math.round(diff / 365.25));
  }

  isMobile() {
    const screenWidth = window.innerWidth;

    if (screenWidth > 600) {
      return false;
    }
    return true;
  }
}

const quotes = new QuotesCard();
