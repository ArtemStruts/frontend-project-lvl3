import onChange from 'on-change';

const elementsList = {
  container: document.querySelector('#container'),
  form: document.querySelector('.form-inline'),
  input: document.querySelector('#url-input'),
  button: document.querySelector('button'),
  feedsContainer: document.querySelector('#feeds'),
  postsContainer: document.querySelector('#posts'),
};

const renderErrors = (val, state, elements) => {
  const errorFeedbackElement = document.querySelector('.feedback');
  if (errorFeedbackElement) {
    if (state.status === 'loaded') {
      elements.input.classList.remove('is-invalid');
      errorFeedbackElement.classList.remove('text-danger');
      errorFeedbackElement.classList.add('text-success');
      errorFeedbackElement.textContent = val;
      elements.form.reset();
      elements.form.focus();
    } else {
      const messageElement = document.querySelector('.text-danger');
      if (messageElement) {
        errorFeedbackElement.textContent = val;
      } else {
        elements.input.classList.add('is-invalid');
        errorFeedbackElement.classList.remove('text-success');
        errorFeedbackElement.classList.add('text-danger');
        errorFeedbackElement.textContent = val;
      }
    }
  } else if (state.status === 'loaded') {
    const feedback = document.createElement('p');
    feedback.classList.add('feedback', 'text-success');
    feedback.textContent = val;
    elements.container.append(feedback);
    elements.form.reset();
    elements.form.focus();
  } else {
    elements.input.classList.add('is-invalid');
    const errorFeedback = document.createElement('p');
    errorFeedback.classList.add('feedback', 'text-danger');
    errorFeedback.textContent = val;
    elements.container.append(errorFeedback);
  }
};

const renderFeeds = (feedsList, elements) => {
  const { feedsContainer } = elements;
  feedsContainer.innerHTML = '';
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
  feedsContainer.append(cardFeeds);
};

const renderPosts = (tempPostsList, elements) => {
  const postsList = tempPostsList.flat();
  const { postsContainer } = elements;
  postsContainer.innerHTML = '';
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
    const buttonPost = document.createElement('button');
    buttonPost.classList.add('btn', 'btn-outline-primary');
    buttonPost.dataset.id = post.id;
    buttonPost.dataset.bsToggle = 'modal';
    buttonPost.dataset.bsTarget = '#modal';
    buttonPost.textContent = 'Просмотр';
    listGroupItemPosts.append(itemLinkPost, buttonPost);
    listGroupPosts.append(listGroupItemPosts);
  });
  cardPosts.append(cardBodyPosts, listGroupPosts);
  postsContainer.append(cardPosts);
};

const renderReadedPosts = (tempReadedPostsList, elements) => {
  const readedPostsList = tempReadedPostsList.flat();
  readedPostsList.forEach((readedPost) => {
    const readedPostElement = elements.postsContainer.querySelector(`[data-id='${readedPost.id}']`);
    readedPostElement.classList.remove('fw-bold');
    readedPostElement.classList.add('fw-normal');
  });
};

const state = onChange({
  status: 'invalid',
  lastUpdated: 0,
  feeds: [],
  error: '',
}, (path, value) => {
  if (path === 'error') {
    renderErrors(value, state, elementsList);
  }
});

const feeds = onChange({
  feedList: [],
}, () => {
  renderFeeds(feeds.feedList, elementsList);
});

const posts = onChange({
  postList: [],
  readedPostList: [],
}, () => {
  renderPosts(posts.postList, elementsList);
  renderReadedPosts(posts.readedPostList, elementsList);
});

export {
  state,
  feeds,
  posts,
  elementsList,
};
