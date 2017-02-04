class App {
  constructor() {
    console.log('App::Constructor');
    this._bootstrapNavLinks();
    this._registerServiceWorker();

    document.querySelector('nav').addEventListener('click', function() {
      document.querySelector('input[type="checkbox"]').click();
    });
  }

  _registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      console.warn('About to load the service worker yay');
      navigator.serviceWorker.register('/sw.js', {scope: '/'});
    }
  }

  _onChanged() {
    console.log('App::_onChanged');
  }

  go(url) {
    console.log('App:go');
    window.history.pushState(null, null, url);
    return this._onChanged();
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
