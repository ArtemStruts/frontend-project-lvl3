import * as yup from 'yup';
import { setLocale } from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import uniqueId from 'lodash/uniqueId.js';
import {
  state,
  feeds,
  posts,
} from './watchers.js';
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

const updatePosts = () => {
  const delayInSeconds = 5;
  feeds.feedList.forEach((feed) => {
    axios.get(`https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${encodeURIComponent(feed.url)}`)
      .then((response) => {
        const content = response.data.contents;
        const data = parseRSS(content);
        const newPosts = data.posts;
        const diffPosts = newPosts.filter((post) => Date.parse(post.pubData) > state.lastUpdated);
        if (diffPosts.length > 0) {
          const diffPostsClone = [];
          diffPosts.forEach((diffPost) => {
            const diffPostClone = { ...diffPost, feedId: feed.id };
            diffPostsClone.push(diffPostClone);
          });
          posts.postList.push(diffPostsClone);
          state.lastUpdated = Date.now();
        }
      })
      .catch(() => {
        state.error = i18next.t('errors.networkError');
      });
  });
  setTimeout(updatePosts, delayInSeconds * 1000);
};

const app = () => {
  const defaultLanguage = 'ru';
  i18next.init({
    lng: defaultLanguage,
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
          if (state.feeds.includes(valid)) {
            state.status = 'invalid';
            state.error = i18next.t('errors.feedAlreadyExist');
          } else {
            state.status = 'valid';
            state.error = '';
          }
        })
        .catch((e) => {
          state.status = 'invalid';
          state.error = e.message;
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
          if (state.status === 'valid') {
            const content = response.data.contents;
            const data = parseRSS(content);
            state.feeds.push(value);
            feeds.feedList.push(data.feed);
            posts.postList.push(data.posts);
            state.lastUpdated = Date.now();
            state.status = 'loaded';
            state.error = i18next.t('feedback.RSSLoaded');
          }
          if (feeds.feedList.length > 1) {
            updatePosts();
          }
        })
        .catch(() => {
          state.status = 'invalid';
          state.error = i18next.t('errors.networkError');
        });
    });

    const modal = document.querySelector('#modal');
    const modalTitle = document.querySelector('.modal-title');
    const modalBody = document.querySelector('.modal-body');
    modal.addEventListener('show.bs.modal', (e) => {
      modalBody.innerHTML = '';
      const button = e.relatedTarget;
      const postId = button.dataset.id;
      const readedPost = posts.postList.flat().filter((post) => post.id === postId);
      posts.readedPostList.push(readedPost);
      modalTitle.textContent = readedPost[0].title;
      const p = document.createElement('p');
      p.textContent = readedPost[0].description;
      modalBody.append(p);
    });
  });
};

export default app;
