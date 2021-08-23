import onChange from 'on-change';

const elements = {
  container: document.querySelector('#container'),
  form: document.querySelector('form'),
  input: document.querySelector('input'),
  button: document.querySelector('button'),
  feedsContainer: document.querySelector('#feeds'),
  postsContainer: document.querySelector('#posts'),
};

const renderErrors = (val, preVal) => {
  if (val === '' && preVal !== '') {
    elements.input.classList.remove('is-invalid');
    elements.container.removeChild(elements.container.lastChild);
    elements.form.reset();
    elements.form.focus();
  }
  if (val !== '' && preVal === '') {
    elements.input.classList.add('is-invalid');
    const errorFeedback = document.createElement('div');
    errorFeedback.classList.add('text-danger');
    errorFeedback.textContent = val;
    elements.container.append(errorFeedback);
  }
  if (val !== '' && preVal !== '') {
    const feedback = document.querySelector('.text-danger');
    feedback.textContent = val;
  }
};

const renderFeeds = (feedsList) => {
  elements.feedsContainer.innerHTML = '';
  const cardFeeds = document.createElement('div');
  cardFeeds.classList.add('card');
  const cardBodyFeeds = document.createElement('div');
  cardBodyFeeds.classList.add('card-body');
  const listGroupFeeds = document.createElement('ul');
  listGroupFeeds.classList.add('list-group');
  const cardTitleFeeds = document.createElement('h2');
  cardTitleFeeds.classList.add('card-title', 'h4');
  cardTitleFeeds.textContent = 'Фиды';
  cardBodyFeeds.append(cardTitleFeeds);
  feedsList.forEach((feed) => {
    const listGroupItemFeeds = document.createElement('li');
    listGroupItemFeeds.classList.add('list-group-item');
    const feedTitle = document.createElement('h3');
    feedTitle.classList.add('h6', 'm-0');
    feedTitle.textContent = feed.title;
    const feedDesc = document.createElement('p');
    feedDesc.classList.add('m-0', 'text-black-50');
    feedDesc.textContent = feed.description;
    listGroupItemFeeds.append(feedTitle, feedDesc);
    listGroupFeeds.append(listGroupItemFeeds);
  });
  cardFeeds.append(cardBodyFeeds, listGroupFeeds);
  elements.feedsContainer.append(cardFeeds);
};

const renderPosts = (tempPostsList) => {
  const postsList = tempPostsList.flat();
  elements.postsContainer.innerHTML = '';
  const cardPosts = document.createElement('div');
  cardPosts.classList.add('card');
  const cardBodyPosts = document.createElement('div');
  cardBodyPosts.classList.add('card-body');
  const listGroupPosts = document.createElement('ul');
  listGroupPosts.classList.add('list-group');
  const cardTitlePosts = document.createElement('h2');
  cardTitlePosts.classList.add('card-title', 'h4');
  cardTitlePosts.textContent = 'Посты';
  cardBodyPosts.append(cardTitlePosts);
  postsList.forEach((post) => {
    const listGroupItemPosts = document.createElement('li');
    listGroupItemPosts.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
    const itemLinkPost = document.createElement('a');
    itemLinkPost.classList.add('fw-bold');
    itemLinkPost.dataset.id = post.id;
    itemLinkPost.setAttribute('href', post.link);
    itemLinkPost.textContent = post.title;
    listGroupItemPosts.append(itemLinkPost);
    listGroupPosts.append(listGroupItemPosts);
  });
  cardPosts.append(cardBodyPosts, listGroupPosts);
  elements.postsContainer.append(cardPosts);
};

const state = onChange({
  status: 'invalid',
  feeds: [],
  error: '',
}, (path, value, prevValue) => {
  if (path === 'error') {
    renderErrors(value, prevValue);
  }
});

const feeds = onChange({
  feedList: [],
}, () => {
  renderFeeds(feeds.feedList);
});

const posts = onChange({
  postList: [],
}, () => {
  renderPosts(posts.postList);
});

export { state, feeds, posts };
