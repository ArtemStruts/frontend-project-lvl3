import onChange from 'on-change';

const elements = {
  form: document.querySelector('.form-inline'),
  input: document.querySelector('#url-input'),
  feedbackElement: document.querySelector('.feedback'),
  button: document.querySelector('.btn-primary'),
  feedsContainer: document.querySelector('#feeds'),
  postsContainer: document.querySelector('#posts'),
};

const renderError = (error) => {
  elements.feedbackElement.textContent = error;
};

const render = (status) => {
  elements.input.classList.remove('is-invalid');
  elements.input.removeAttribute('readonly');
  elements.button.removeAttribute('disabled');
  switch (status) {
    case 'loading':
      elements.input.setAttribute('readonly', true);
      elements.button.setAttribute('disabled', true);
      break;
    case 'loaded':
      elements.feedbackElement.classList.remove('text-danger');
      elements.feedbackElement.classList.add('text-success');
      elements.form.reset();
      elements.form.focus();
      break;
    case 'invalid':
      elements.input.classList.add('is-invalid');
      elements.feedbackElement.classList.remove('text-success');
      elements.feedbackElement.classList.add('text-danger');
      break;
    default:
      throw new Error();
  }
};

const listGroupFeeds = document.createElement('ul');
listGroupFeeds.classList.add('list-group');

const renderFeed = (feed) => {
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
};

const renderFeeds = (feedsList, i18nextInstance) => {
  elements.feedsContainer.innerHTML = '';

  const cardFeeds = document.createElement('div');
  cardFeeds.classList.add('card');

  const cardBodyFeeds = document.createElement('div');
  cardBodyFeeds.classList.add('card-body');

  const cardTitleFeeds = document.createElement('h2');
  cardTitleFeeds.classList.add('card-title', 'h4');
  cardTitleFeeds.textContent = i18nextInstance.t('titles.feeds');

  feedsList.forEach((feed) => renderFeed(feed));

  cardBodyFeeds.append(cardTitleFeeds);
  cardFeeds.append(cardBodyFeeds, listGroupFeeds);
  elements.feedsContainer.append(cardFeeds);
};

const listGroupPosts = document.createElement('ul');
listGroupPosts.classList.add('list-group');

const renderPost = (post, i18nextInstance) => {
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
  buttonPost.type = 'button';
  buttonPost.dataset.bsToggle = 'modal';
  buttonPost.dataset.bsTarget = '#modal';
  buttonPost.textContent = i18nextInstance.t('buttons.watch');

  listGroupItemPosts.append(itemLinkPost, buttonPost);
  listGroupPosts.append(listGroupItemPosts);
};

const renderPosts = (tempPostsList, i18nextInstance) => {
  const postsList = tempPostsList.flat();
  elements.postsContainer.innerHTML = '';

  const cardPosts = document.createElement('div');
  cardPosts.classList.add('card');

  const cardBodyPosts = document.createElement('div');
  cardBodyPosts.classList.add('card-body');

  const cardTitlePosts = document.createElement('h2');
  cardTitlePosts.classList.add('card-title', 'h4');
  cardTitlePosts.textContent = i18nextInstance.t('titles.posts');

  postsList.forEach((post) => renderPost(post, i18nextInstance));

  cardBodyPosts.append(cardTitlePosts);
  cardPosts.append(cardBodyPosts, listGroupPosts);
  elements.postsContainer.append(cardPosts);
};

const renderReadedPosts = (tempReadedPostsList) => {
  const readedPostsList = tempReadedPostsList.flat();
  readedPostsList.forEach((readedPost) => {
    const readedPostElement = elements.postsContainer.querySelector(`[data-id='${readedPost.id}']`);
    readedPostElement.classList.remove('fw-bold');
    readedPostElement.classList.add('fw-normal');
  });
};

const watcher = (appState, i18nextInstance) => onChange(appState, (path, value) => {
  switch (path) {
    case 'error':
      renderError(value);
      break;
    case 'feedsList':
      renderFeeds(appState.feedsList, i18nextInstance);
      break;
    case 'postsList':
      renderPosts(appState.postsList, i18nextInstance);
      break;
    case 'readedPostsList':
      renderReadedPosts(appState.readedPostsList);
      break;
    case 'status':
      render(value);
      break;
    default:
      break;
  }
});

export default watcher;
