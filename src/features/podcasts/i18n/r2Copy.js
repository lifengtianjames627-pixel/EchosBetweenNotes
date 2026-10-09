const copies = {
 en: { r2Ready: 'R2 connected · Private uploads in 16 MB parts · Up to 1 GB', r2Check: 'Check again', r2Failed: 'The R2 connection could not be checked. Check your connection settings and try again.', r2Verifying: 'Verifying upload settings…' },
 zh: { r2Ready: 'R2 已连接 · 私有上传，每片 16 MB · 最大 1 GB', r2Check: '重新检查', r2Failed: '暂时无法检查 R2 连接，请确认连接设置后重试。', r2Verifying: '正在检查上传设置…' },
 ja: { r2Ready: 'R2接続済み · 16 MBずつ非公開アップロード · 最大1 GB', r2Check: '再確認', r2Failed: 'R2接続を確認できません。接続設定を確認して再試行してください。', r2Verifying: 'アップロード設定を確認中…' },
 ko: { r2Ready: 'R2 연결됨 · 16 MB 비공개 분할 업로드 · 최대 1 GB', r2Check: '다시 확인', r2Failed: 'R2 연결을 확인할 수 없습니다. 연결 설정을 확인하고 다시 시도하세요.', r2Verifying: '업로드 설정 확인 중…' },
 fr: { r2Ready: 'R2 connecté · Importation privée par blocs de 16 Mo · 1 Go maximum', r2Check: 'Vérifier à nouveau', r2Failed: 'Impossible de vérifier R2. Vérifiez les réglages de connexion puis réessayez.', r2Verifying: 'Vérification des réglages…' },
 ru: { r2Ready: 'R2 подключён · Приватная загрузка частями по 16 МБ · До 1 ГБ', r2Check: 'Проверить снова', r2Failed: 'Не удалось проверить R2. Проверьте настройки подключения и повторите.', r2Verifying: 'Проверка настроек загрузки…' },
};
export default function r2Copy(lang) { return copies[lang] || copies.en; }