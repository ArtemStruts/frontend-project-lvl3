import * as yup from 'yup';
import { setLocale } from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import uniqueId from 'lodash/uniqueId.js';
import watcher from './watchers.js';
import resources from './locales/index.js';

const parseRSS = (data, i18nextInstance) => {
  const parser = new DOMParser();
  const dom = parser.parseFromString(data, 'text/html');
  const parseError = dom.getElementsByTagName('meta');
  console.log('content', data);
  console.log(dom.body.innerHTML);
  console.log(parseError);
  if (parseError.length > 0) {
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
  state.feedsList.forEach((feed) => {
    axios.get(`https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${encodeURIComponent(feed.url)}`)
      .then((response) => {
        const content = response.data.contents;
        const data = parseRSS(content, i18nextInstance);
        const newPosts = data.posts;
        const diffPosts = newPosts.filter((post) => Date.parse(post.pubData) > state.lastUpdated);
        if (diffPosts.length > 0) {
          const diffPostsClone = [];
          diffPosts.forEach((diffPost) => {
            const diffPostClone = { ...diffPost, feedId: feed.id };
            diffPostsClone.push(diffPostClone);
          });
          state.postsList.push(diffPostsClone);
          state.lastUpdated = Date.now();
        }
      })
      .catch(() => {
        state.error = i18nextInstance.t('errors.networkError');
      });
  });
  setTimeout(updatePosts, delayInSeconds * 1000);
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
    const watchedState = watcher(state);
    const schema = yup.string().trim().required().url();
    const validator = (field) => {
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

    const form = document.querySelector('.form-inline');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const value = formData.get('url');
      validator(value);
      axios.get(`https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${encodeURIComponent(value)}`)
        .then((response) => {
          if (watchedState.status === 'valid') {
            const content = response.data.contents;
            const data = parseRSS(content, i18nextInstance);
            watchedState.feeds.push(value);
            watchedState.feedsList.push(data.feed);
            watchedState.postsList.push(data.posts);
            watchedState.lastUpdated = Date.now();
            watchedState.status = 'loaded';
            watchedState.error = i18nextInstance.t('feedback.RSSLoaded');
          }
          if (watchedState.feedsList.length > 1) {
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

    const modal = document.querySelector('#modal');
    const modalTitle = document.querySelector('.modal-title');
    const modalBody = document.querySelector('.modal-body');
    modal.addEventListener('show.bs.modal', (e) => {
      modalBody.innerHTML = '';
      const button = e.relatedTarget;
      const postId = button.dataset.id;
      const readedPost = watchedState.postsList.flat().filter((post) => post.id === postId);
      watchedState.readedPostsList.push(readedPost);
      modalTitle.textContent = readedPost[0].title;
      const p = document.createElement('p');
      p.textContent = readedPost[0].description;
      modalBody.append(p);
    });
  });
};

export default app;
