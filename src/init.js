import * as yup from 'yup';
import { setLocale } from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import uniqueId from 'lodash/uniqueId.js';
import watcher from './watchers.js';
import resources from './locales/index.js';

const parseRSS = (data, i18nextInstance, stateParse) => {
  const state = stateParse;
  const parser = new DOMParser();
  const dom = parser.parseFromString(data, 'text/html');
  const parseError = dom.getElementsByTagName('meta');
  if (parseError.length > 0) {
    state.status = 'invalid';
    throw new Error(i18nextInstance.t('errors.parserError'));
  }
  const feedTitleElement = dom.querySelector('title');
  const feedDescElement = dom.querySelector('description');
  const feedLinkElement = dom.querySelector('link');
  const feedTitle = feedTitleElement.textContent.replace('<![CDATA[', '').replace(']]>', '');
  const feedDesc = feedDescElement.innerHTML.replace('<!--[CDATA[', '').replace(']]-->', '');
  const feedLink = feedLinkElement.nextSibling.data;
  const feedId = uniqueId();
  const postElements = dom.querySelectorAll('item');
  const postsEl = Array.from(postElements).map((postEl) => {
    const postTitleElement = postEl.querySelector('title');
    const postLinkElement = postEl.querySelector('link');
    const postDescElement = postEl.querySelector('description');
    const postTitle = postTitleElement.textContent.replace('<![CDATA[', '').replace(']]>', '');
    const postLink = postLinkElement.nextSibling.data;
    const postDesc = postDescElement.innerHTML.replace('<!--[CDATA[', '').replace(']]-->', '');
    const dataElement = postEl.querySelector('pubDate');
    const postTime = dataElement.textContent;
    return {
      title: postTitle,
      description: postDesc,
      link: postLink,
      feedId,
      id: uniqueId(),
      pubData: postTime,
    };
  });
  const feed = {
    title: feedTitle,
    description: feedDesc,
    url: feedLink,
    id: feedId,
  };
  return { feed, posts: postsEl };
};

const updatePosts = (statePosts, i18nextInstance) => {
  const state = statePosts;
  const delayInSeconds = 5;
  state.feeds.forEach((feed) => {
    axios.get(`https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${encodeURIComponent(feed)}`)
      .then((response) => {
        const content = response.data.contents;
        const data = parseRSS(content, i18nextInstance, state);
        const newPosts = data.posts;
        const diffPosts = newPosts.filter((post) => Date.parse(post.pubData) > state.lastUpdated);
        if (diffPosts.length > 0) {
          state.postsList.push(diffPosts);
          state.lastUpdated = Date.now();
        }
      })
      .catch(() => {
        state.status = 'invalid';
        state.error = i18nextInstance.t('errors.networkError');
      });
  });
  setTimeout(updatePosts, delayInSeconds * 1000, state, i18nextInstance);
};

const validator = (schema, field, state, i18nextInstance) => {
  const watchedState = state;
  schema
    .validate(field)
    .then((valid) => {
      if (watchedState.feeds.includes(valid)) {
        watchedState.status = 'invalid';
        watchedState.error = i18nextInstance.t('errors.feedAlreadyExist');
      } else {
        watchedState.status = 'valid';
        watchedState.error = '';
      }
    })
    .catch((e) => {
      watchedState.status = 'invalid';
      watchedState.error = e.message;
    });
};

const app = () => {
  const state = {
    status: 'invalid',
    lastUpdated: 0,
    feeds: [],
    error: '',
    feedsList: [],
    postsList: [],
    readedPostsList: [],
  };

  const defaultLanguage = 'ru';
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  }).then(() => {
    setLocale({
      string: {
        required: i18nextInstance.t('errors.emptyField'),
        url: i18nextInstance.t('errors.invalidUrl'),
      },
    });
    const schema = yup.string().trim().required().url();

    const watchedState = watcher(state);

    const form = document.querySelector('.form-inline');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const value = formData.get('url');
      validator(schema, value, watchedState, i18nextInstance);
      axios.get(`https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${encodeURIComponent(value)}`)
        .then((response) => {
          if (watchedState.status === 'valid') {
            const content = response.data.contents;
            const data = parseRSS(content, i18nextInstance, watchedState);
            watchedState.feeds.push(value);
            watchedState.feedsList.push(data.feed);
            watchedState.postsList.push(data.posts);
            watchedState.lastUpdated = Date.now();
            watchedState.status = 'loaded';
            watchedState.error = i18nextInstance.t('feedback.RSSLoaded');
          }
          if (watchedState.feeds.length > 0) {
            updatePosts(watchedState, i18nextInstance);
          }
        })
        .catch((error) => {
          watchedState.status = 'invalid';
          if (error.message === 'Network Error') {
            watchedState.error = i18nextInstance.t('errors.networkError');
          } else {
            watchedState.error = error.message;
          }
        });
    });

    const postsContainer = document.querySelector('#posts');
    postsContainer.addEventListener('click', (e) => {
      const modalTitle = document.querySelector('.modal-title');
      const modalBody = document.querySelector('.modal-body');
      const button = e.target;
      const postId = button.dataset.id;
      const readedPost = watchedState.postsList.flat(Infinity).filter((post) => post.id === postId);
      watchedState.readedPostsList.push(readedPost);
      modalTitle.textContent = readedPost[0].title;
      modalBody.textContent = readedPost[0].description;
    });
  });
};

export default app;
