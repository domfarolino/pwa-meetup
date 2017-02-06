class App {
  constructor() {
    console.log('App::Constructor');
    this._currentPath;
    this._newContent = undefined;
    this._spinnerTimeout = undefined;
    this._body = document.querySelector('body');
    this._currentContent = this._body.querySelector('main');

    document.querySelector('nav').addEventListener('click', function() {
      document.querySelector('input[type="checkbox"]').click();
    });

    this._bootstrapNavLinks();
    this._onChanged();
  }

  _queueSpinner() {
    this._spinnerTimeout = setTimeout(_ => {
      this._body.classList.add('view-pending');
    }, 200);
  }

  _hideSpinner() {
    clearTimeout(this._spinnerTimeout);
    this._body.classList.remove('view-pending');
  }

  _onChanged() {
    console.log(`App::_onChanged: ${window.location.pathname}`);
    this._currentPath = window.location.pathname;

    this._queueSpinner();

    this._loadAsyncView()
      .then(_ => {
        this._currentContent.innerHTML = this._newContent.innerHTML;
      }).then(_ => {
        this._currentContent.classList.remove('mute');
        this._hideSpinner();
      });
  }

  _loadAsyncView() {
    console.log(`App::_loadAsyncView(${this._currentPath})`);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.onload = evt => {
        this._newContent = evt.target.response.querySelector('main');
        resolve();
      };

      xhr.onerror = reject;

      xhr.responseType = 'document';
      console.log(`Request open ${this._currentPath}?partial`)
      xhr.open('GET', `${this._currentPath}?partial`);
      xhr.send();
    });
  }


  go(url) {
    console.log('App::go');
    window.history.pushState(null, null, url);
    this._onChanged();
  }

  _bootstrapNavLinks() {
    window.addEventListener('popstate', this._onChanged.bind(this));
    Array.prototype.forEach.call(document.querySelectorAll('header nav li'), link => {
      console.log('Attaching listener');

      link.addEventListener('click', evt => {
        this.go(evt.target.firstChild.href);
      });

      /**
       * If the user clicks a link inside a list item
       * that link will be the `.target` of the event
       * passed into the onClick function - however we
       * always want to call onClick with the list item
       * as the event target so we can get its firstChild's
       * href
       */
      link.firstChild.addEventListener('click', evt => {
        evt.preventDefault();
        evt.stopPropagation(); // prevents us from triggering li click again on bubble stage
        link.click();
      });
    });
  }
}

const app = new App();
