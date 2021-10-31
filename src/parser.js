import uniqueId from 'lodash/uniqueId.js';

const getContent = (document) => {
  const titleEl = document.querySelector('title');
  const descriptionEl = document.querySelector('description');
  const linkEl = document.querySelector('link');
  return {
    title: titleEl.textContent,
    description: descriptionEl.innerHTML,
    link: linkEl.nextSibling.data,
  };
};

const parseRSS = (data, i18nextInstance, stateParse) => {
  const state = stateParse;
  const parser = new DOMParser();
  const dom = parser.parseFromString(data, 'application/xml');
  const parseError = dom.querySelector('parsererror');
  // const parseError = dom.getElementsByTagName('meta');
  if (parseError) {
    state.status = 'invalid';
    throw new Error(i18nextInstance.t('errors.parserError'));
  }
  const { title, description, link } = getContent(dom);
  const feedId = uniqueId();
  const postElements = dom.querySelectorAll('item');
  const posts = Array.from(postElements).map((postEl) => {
    const postContent = getContent(postEl);
    const dataElement = postEl.querySelector('pubDate');
    return {
      title: postContent.title,
      description: postContent.description,
      link: postContent.link,
      feedId,
      id: uniqueId(),
      pubData: dataElement.textContent,
    };
  });
  const feed = {
    title,
    description,
    url: link,
    id: feedId,
  };
  return { feed, posts };
};

export default parseRSS;
