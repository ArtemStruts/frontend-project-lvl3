import * as yup from 'yup';
import { setLocale } from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import uniqueId from 'lodash/uniqueId.js';
import { state, feeds, posts } from './watchers.js';
import resources from './locales/index.js';

const parseRSS = (data) => {
  const parser = new DOMParser();
  const dom = parser.parseFromString(data, 'text/html');
  const parseError = dom.getElementsByTagName('parsererror');
  if (parseError.length !== 0) {
    state.error = i18next.t('errors.parserError');
  }
  const feedTitleElement = dom.querySelector('title');
  const feedDescElement = dom.querySelector('description');
  const feedTitle = feedTitleElement.textContent.replace('<![CDATA[', '').replace(']]>', '');
  const feedDesc = feedDescElement.innerHTML.replace('<!--[CDATA[', '').replace(']]-->', '');
  const feedId = uniqueId();
  const postElements = dom.querySelectorAll('item');
  const postsEl = Array.from(postElements).map((postEl) => {
    const postTitleElement = postEl.querySelector('title');
    const postLinkElement = postEl.querySelector('link');
    const postTitle = postTitleElement.textContent.replace('<![CDATA[', '').replace(']]>', '');
    const postLink = postLinkElement.nextSibling.data;
    return {
      title: postTitle,
      link: postLink,
      feedId,
      id: uniqueId(),
    };
  });
  const feed = { title: feedTitle, description: feedDesc, id: feedId };
  return { feed, posts: postsEl };
};

const app = () => {
  i18next.init({
    lng: 'ru',
    debug: false,
    resources,
  }).then(() => {
    setLocale({
      string: {
        required: i18next.t('errors.emptyField'),
        url: i18next.t('errors.invalidUrl'),
      },
    });
    const schema = yup.string().trim().required().url();
    const validator = (field) => {
      schema
        .validate(field)
        .then((valid) => {
          if (state.feeds.includes(field)) {
            state.status = 'invalid';
            state.error = i18next.t('errors.feedAlreadyExist');
          } else {
            state.status = 'valid';
            state.feeds.push(valid);
            state.error = '';
          }
        })
        .catch((e) => {
          state.status = 'invalid';
          state.error = e.message;
        });
    };

    const form = document.querySelector('form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const value = formData.get('url');
      validator(value);
      axios.get(`https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${encodeURIComponent('http://lorem-rss.herokuapp.com/feed')}`)
        .then((response) => {
          if (state.status === 'valid') {
            const content = response.data.contents;
            const data = parseRSS(content);
            feeds.feedList.push(data.feed);
            posts.postList.push(data.posts);
          }
        })
        .catch(() => {
          state.error = i18next.t('errors.networkError');
        });
    });
  });
};

export default app;