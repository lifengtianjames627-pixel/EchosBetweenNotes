const copies = {
  en: { cover: 'Cover image (optional)', coverHint: 'PNG, JPG, WEBP · Up to 5 MB · Private storage', coverInvalid: 'Choose a valid PNG, JPG or WEBP image up to 5 MB.', coverRemove: 'Remove image' },
  zh: { cover: '封面图片（选填）', coverHint: 'PNG、JPG、WEBP · 最大 5 MB · 私有存储', coverInvalid: '请选择有效的 PNG、JPG 或 WEBP 图片，大小不超过 5 MB。', coverRemove: '移除图片' },
  ja: { cover: 'カバー画像（任意）', coverHint: 'PNG, JPG, WEBP · 最大5 MB · 非公開保存', coverInvalid: '5 MB以下の有効なPNG、JPG、WEBP画像を選んでください。', coverRemove: '画像を削除' },
  ko: { cover: '표지 이미지 (선택)', coverHint: 'PNG, JPG, WEBP · 최대 5 MB · 비공개 저장', coverInvalid: '5 MB 이하의 올바른 PNG, JPG, WEBP 이미지를 선택하세요.', coverRemove: '이미지 제거' },
  fr: { cover: 'Image de couverture (facultatif)', coverHint: 'PNG, JPG, WEBP · 5 Mo maximum · Stockage privé', coverInvalid: 'Choisissez une image PNG, JPG ou WEBP valide de 5 Mo maximum.', coverRemove: 'Retirer l’image' },
  ru: { cover: 'Обложка (необязательно)', coverHint: 'PNG, JPG, WEBP · До 5 МБ · Приватное хранение', coverInvalid: 'Выберите корректное изображение PNG, JPG или WEBP до 5 МБ.', coverRemove: 'Убрать изображение' },
};
export default function coverCopy(lang) { return copies[lang] || copies.en; }