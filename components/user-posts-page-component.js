import { USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { posts, goToPage, user, getToken } from "../index.js";
import { likePost, dislikePost } from "../api.js";
import { formatDistanceToNow } from "../node_modules/date-fns/index.js";
import { ru } from "../node_modules/date-fns/locale/ru.js";

export function renderUserPostsPageComponent({ appEl }) {
  if (posts.length === 0) {
    appEl.innerHTML = '<div class="page-container"><div class="header-container"></div><div class="loading-page">Нет постов</div></div>';
    renderHeaderComponent({
      element: document.querySelector(".header-container"),
    });
    return;
  }

  // Получаем данные пользователя из первого поста (все посты принадлежат одному пользователю)
  const postUser = posts[0].user;

  const postsHtml = posts
    .map((post) => {
      const createdAtDate = new Date(post.createdAt);
      const timeAgo = formatDistanceToNow(createdAtDate, {
        addSuffix: true,
        locale: ru,
      });

      return `<li class="post">
                <div class="post-image-container">
                  <img class="post-image" src="${post.imageUrl}">
                </div>
                <div class="post-likes">
                  <button data-post-id="${post.id}" class="like-button">
                    <img src="${post.isLiked ? './assets/images/like-active.svg' : './assets/images/like-not-active.svg'}">
                  </button>
                  <p class="post-likes-text">
                    Нравится: <strong>${post.likes.length}</strong>
                  </p>
                </div>
                <p class="post-text">
                  <span class="user-name">${post.user.name}</span>
                  ${post.description}
                </p>
                <p class="post-date">
                  ${timeAgo}
                </p>
              </li>`;
    })
    .join("");

  const appHtml = `
    <div class="page-container">
      <div class="header-container"></div>
      <div class="user-posts-header">
        <img src="${postUser.imageUrl}" class="user-posts-header__user-image">
        <p class="user-posts-header__user-name">${postUser.name}</p>
      </div>
      <ul class="posts">
        ${postsHtml}
      </ul>
    </div>`;

  appEl.innerHTML = appHtml;

  renderHeaderComponent({
    element: document.querySelector(".header-container"),
  });

  // Обработчики лайков
  for (let likeButton of document.querySelectorAll(".like-button")) {
    likeButton.addEventListener("click", () => {
      if (!user) {
        goToPage(AUTH_PAGE);
        return;
      }

      const postId = likeButton.dataset.postId;
      const post = posts.find((post) => post.id === postId);
      
      if (post.isLiked) {
        dislikePost({ token: getToken(), postId })
          .then((response) => {
            const updatedPost = response.post;
            const postIndex = posts.findIndex((p) => p.id === postId);
            posts[postIndex] = updatedPost;
            
            renderUserPostsPageComponent({ appEl });
          })
          .catch((error) => {
            console.error("Ошибка при снятии лайка:", error);
            if (error.message === "Нет авторизации") {
              goToPage(AUTH_PAGE);
            }
          });
      } else {
        likePost({ token: getToken(), postId })
          .then((response) => {
            const updatedPost = response.post;
            const postIndex = posts.findIndex((p) => p.id === postId);
            posts[postIndex] = updatedPost;
            
            renderUserPostsPageComponent({ appEl });
          })
          .catch((error) => {
            console.error("Ошибка при постановке лайка:", error);
            if (error.message === "Нет авторизации") {
              goToPage(AUTH_PAGE);
            }
          });
      }
    });
  }
}