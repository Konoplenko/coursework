// Замени на свой, чтобы получить независимый от других набор данных.
// "боевая" версия инстапро лежит в ключе prod
const personalKey = "alena-konoplenko";
const baseHost = "https://wedev-api.sky.pro";
const postsHost = `${baseHost}/api/v1/${personalKey}/instapro`;

export function getPosts({ token }) {
  return fetch(postsHost, {
    method: "GET",
    headers: {
      Authorization: token,
    },
  })
    .then((response) => {
      if (response.status === 401) {
        throw new Error("Нет авторизации");
      }

      return response.json();
    })
    .then((data) => {
      return data.posts;
    });
}

export function registerUser({ login, password, name, imageUrl }) {
  return fetch(baseHost + "/api/user", {
    method: "POST",
    body: JSON.stringify({
      login,
      password,
      name,
      imageUrl,
    }),
  }).then((response) => {
    if (response.status === 400) {
      throw new Error("Такой пользователь уже существует");
    }
    return response.json();
  });
}

export function loginUser({ login, password }) {
  return fetch(baseHost + "/api/user/login", {
    method: "POST",
    body: JSON.stringify({
      login,
      password,
    }),
  }).then((response) => {
    if (response.status === 400) {
      throw new Error("Неверный логин или пароль");
    }
    return response.json();
  });
}

// Загружает картинку в облако, возвращает url загруженной картинки
export function uploadImage({ file }) {
  const data = new FormData();
  data.append("file", file);

  return fetch(baseHost + "/api/upload/image", {
    method: "POST",
    body: data,
  }).then((response) => {
    if (!response.ok) throw new Error("Ошибка загрузки изображения");
    return response.json();
  });
}

export function addPost({ token, description, imageUrl }) {
  // Предварительная валидация на клиенте
  if (!description || !description.trim()) {
    return Promise.reject(new Error("Описание не может быть пустым"));
  }
  
  if (description.trim().length > 500) {
    return Promise.reject(new Error("Описание не должно превышать 500 символов"));
  }

  if (!imageUrl) {
    return Promise.reject(new Error("Необходимо загрузить изображение"));
  }

  return fetch(postsHost, {
    method: "POST",
    headers: {
      Authorization: token,
    },
    body: JSON.stringify({
      description: description.trim(),
      imageUrl: imageUrl,
    }),
  }).then(async (response) => {
    if (!response.ok) {
      let errorMessage = "Ошибка сервера";
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
        
        if (response.status === 400) {
          if (errorMessage.includes("description")) {
            errorMessage = "Некорректное описание: " + errorMessage;
          } else if (errorMessage.includes("image")) {
            errorMessage = "Проблема с изображением: " + errorMessage;
          }
        } else if (response.status === 401) {
          errorMessage = "Требуется авторизация";
        } else if (response.status === 413) {
          errorMessage = "Изображение слишком большое";
        }
      } catch (e) {
        console.error("Ошибка при разборе ответа сервера:", e);
      }
      
      throw new Error(errorMessage);
    }
    
    return response.json();
  });
}

export function likePost({ token, postId }) {
  return fetch(`${postsHost}/${postId}/like`, {
    method: "POST",
    headers: {
      Authorization: token,
    },
  }).then((response) => {
    if (response.status === 401) {
      throw new Error("Нет авторизации");
    }
    return response.json();
  });
}

export function dislikePost({ token, postId }) {
  return fetch(`${postsHost}/${postId}/dislike`, {
    method: "POST",
    headers: {
      Authorization: token,
    },
  }).then((response) => {
    if (response.status === 401) {
      throw new Error("Нет авторизации");
    }
    return response.json();
  });
}

export function getUserPosts({ token, userId }) {
  return fetch(`${postsHost}/user-posts/${userId}`, {
    method: "GET",
    headers: {
      Authorization: token,
    },
  })
    .then((response) => {
      if (response.status === 401) {
        throw new Error("Нет авторизации");
      }

      return response.json();
    })
    .then((data) => {
      return data.posts;
    });
}