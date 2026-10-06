const messages = {
  en: { failed: 'Message not sent. Your draft is kept; please try again.', blocked: 'Keep contact details out of messages.', limit: 'Add this member as a friend to keep chatting.', unavailable: 'This member is unavailable.' },
  zh: { failed: '消息未发送，草稿已保留，请重试。', blocked: '请勿在私信中分享站外联系方式。', limit: '请添加对方为好友后继续聊天。', unavailable: '暂时无法联系该成员。' },
  ja: { failed: '送信できませんでした。下書きは保存されています。再試行してください。', blocked: 'メッセージに外部の連絡先を含めないでください。', limit: '会話を続けるには友達に追加してください。', unavailable: 'このメンバーに連絡できません。' },
  ko: { failed: '전송하지 못했습니다. 초안은 유지됩니다. 다시 시도해 주세요.', blocked: '메시지에 외부 연락처를 공유하지 마세요.', limit: '계속 대화하려면 친구로 추가해 주세요.', unavailable: '이 회원에게 연락할 수 없습니다.' },
  fr: { failed: 'Message non envoyé. Votre brouillon est conservé, réessayez.', blocked: 'Ne partagez pas de coordonnées externes dans les messages.', limit: 'Ajoutez ce membre comme ami pour continuer.', unavailable: 'Ce membre est indisponible.' },
  ru: { failed: 'Сообщение не отправлено. Черновик сохранён, попробуйте снова.', blocked: 'Не делитесь внешними контактами в сообщениях.', limit: 'Добавьте участника в друзья, чтобы продолжить.', unavailable: 'Этот участник недоступен.' },
};
export default function messageCopy(lang) { return messages[lang] || messages.en; }