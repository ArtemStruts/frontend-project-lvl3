import onChange from 'on-change';

const renderError = (error) => {
  const feedbackElement = document.querySelector('.feedback');
  feedbackElement.textContent = error;
};

const render = (status) => {
  const input = document.querySelector('#url-input');
  const feedbackElement = document.querySelector('.feedback');
  const button = document.querySelector('.btn-primary');
  input.classList.remove('is-invalid');
  input.removeAttribute('readonly');
  button.removeAttribute('disabled');
  switch (status) {
    case 'loading':
      input.setAttribute('readonly', true);
      button.setAttribute('disabled', true);
      break;
    case 'loaded':
      feedbackElement.classList.remove('text-danger');
      feedbackElement.classList.add('text-success');
      input.focus();
      break;
    case 'invalid':
      input.classList.add('is-invalid');
      feedbackElement.classList.remove('text-success');
      feedbackElement.classList.add('text-danger');
      break;
    default:
      throw new Error();
  }
};

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
  return listGroupItemFeeds;
};

const renderFeeds = (feedsList, i18nextInstance) => {
  const feedsContainer = document.querySelector('#feeds');
  feedsContainer.innerHTML = '';

  const cardFeeds = document.createElement('div');
  cardFeeds.classList.add('card');

  const cardBodyFeeds = document.createElement('div');
  cardBodyFeeds.classList.add('card-body');

  const cardTitleFeeds = document.createElement('h2');
  cardTitleFeeds.classList.add('card-title', 'h4');
  cardTitleFeeds.textContent = i18nextInstance.t('titles.feeds');

  const listGroupFeeds = document.createElement('ul');
  listGroupFeeds.classList.add('list-group');

  feedsList.forEach((feed) => {
    const view = renderFeed(feed);
    listGroupFeeds.append(view);
  });

  cardBodyFeeds.append(cardTitleFeeds);
  cardFeeds.append(cardBodyFeeds, listGroupFeeds);
  feedsContainer.append(cardFeeds);
};

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
  return listGroupItemPosts;
};

const renderPosts = (tempPostsList, i18nextInstance) => {
  const postsList = tempPostsList.flat();
  const postsContainer = document.querySelector('#posts');
  postsContainer.innerHTML = '';

  const cardPosts = document.createElement('div');
  cardPosts.classList.add('card');

  const cardBodyPosts = document.createElement('div');
  cardBodyPosts.classList.add('card-body');

  const cardTitlePosts = document.createElement('h2');
  cardTitlePosts.classList.add('card-title', 'h4');
  cardTitlePosts.textContent = i18nextInstance.t('titles.posts');

  const listGroupPosts = document.createElement('ul');
  listGroupPosts.classList.add('list-group');

  postsList.forEach((post) => {
    const view = renderPost(post, i18nextInstance);
    listGroupPosts.append(view);
  });

  cardBodyPosts.append(cardTitlePosts);
  cardPosts.append(cardBodyPosts, listGroupPosts);
  postsContainer.append(cardPosts);
};

const renderReadedPosts = (tempReadedPostsList) => {
  const readedPostsList = tempReadedPostsList.flat();
  const postsContainer = document.querySelector('#posts');
  readedPostsList.forEach((readedPost) => {
    const readedPostElement = postsContainer.querySelector(`[data-id='${readedPost.id}']`);
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
