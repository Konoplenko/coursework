import { AUTH_PAGE, POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { user, goToPage, getToken } from "../index.js";
import { uploadImage, addPost } from "../api.js";

export function renderAddPostPageComponent({ appEl, onAddPostClick }) {
  if (!user) {
    goToPage(AUTH_PAGE);
    return;
  }

  const render = () => {
    const appHtml = `
      <div class="page-container">
        <div class="header-container"></div>
        <div class="form">
          <h3 class="form-title">Добавить пост</h3>
          <div class="form-inputs">
            <textarea id="post-description" class="input textarea" 
              placeholder="Описание фотографии" rows="4"></textarea>
            <div class="upload-image-container">
              <label class="upload-label">
                <input type="file" id="file-input" class="file-input" accept="image/*">
              </label>
              <div id="image-preview" class="image-preview"></div>
            </div>
            <button class="button" id="add-button">Опубликовать</button>
            <div id="error-message" class="error-message"></div>
          </div>
        </div>
      </div>
    `;

    appEl.innerHTML = appHtml;
    renderHeaderComponent({ element: document.querySelector(".header-container") });

    const fileInput = document.getElementById("file-input");
    const descriptionInput = document.getElementById("post-description");
    const imagePreview = document.getElementById("image-preview");
    const addButton = document.getElementById("add-button");
    const errorElement = document.getElementById("error-message");

    fileInput.addEventListener("change", () => {
      const file = fileInput.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          errorElement.textContent = "Файл слишком большой (макс. 5MB)";
          fileInput.value = "";
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          errorElement.textContent = "";
          imagePreview.innerHTML = `
            <img src="${e.target.result}" class="uploaded-image" />
            <button class="remove-image-button">×</button>
          `;
          
          document.querySelector(".remove-image-button").addEventListener("click", () => {
            imagePreview.innerHTML = "";
            fileInput.value = "";
          });
        };
        reader.readAsDataURL(file);
      }
    });

    addButton.addEventListener("click", async () => {
      const file = fileInput.files[0];
      const description = descriptionInput.value.trim();
      
      if (!file) {
        errorElement.textContent = "Пожалуйста, выберите изображение";
        return;
      }

      addButton.textContent = "Загружаем...";
      addButton.disabled = true;
      errorElement.textContent = "";

      try {
        const uploadResponse = await uploadImage({ file: fileInput.files[0] });
        if (!uploadResponse.fileUrl) throw new Error("Ошибка загрузки изображения");

        const postResponse = await addPost({
          token: getToken(),
          description: description,
          imageUrl: uploadResponse.fileUrl
        });

        onAddPostClick(postResponse);
        goToPage(POSTS_PAGE);

      } catch (error) {
        errorElement.textContent = error.message;
        if (error.message === "Нет авторизации") {
          goToPage(AUTH_PAGE);
        }
      } finally {
        addButton.textContent = "Опубликовать";
        addButton.disabled = false;
      }
    });
  };

  render();
}