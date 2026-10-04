const rows = {
  ageTitle: ['Choose your age bracket', '请选择年龄组', '年齢区分を選択', '연령대를 선택하세요', 'Choisissez votre tranche d’âge', 'Выберите возрастную группу'],
  ageHint: ['Recruitment and nearby discovery only match members with the same declared age bracket. This is not age verification; keep contact in the app.', '招募和附近发现仅匹配相同自报年龄组的成员；这不等于年龄核验，请通过站内私信联系。', '募集と近くのメンバーは同じ自己申告の年齢区分のみ対象です。年齢確認ではありません。連絡はアプリ内で。', '모집과 주변 탐색은 같은 자기 신고 연령대만 연결합니다. 나이 인증이 아니므로 앱 내에서 연락하세요.', 'Le recrutement et la découverte affichent uniquement la même tranche d’âge déclarée. Ce n’est pas une vérification d’âge. Échangez dans l’app.', 'Поиск участников показывает только ту же заявленную возрастную группу. Это не проверка возраста. Общайтесь в приложении.'],
  minor: ['I’m under 15', '我未满 15 岁', '15歳未満です', '15세 미만입니다', 'J’ai moins de 15 ans', 'Мне меньше 15 лет'],
  adult: ['I’m 15 or older', '我已满 15 岁', '15歳以上です', '15세 이상입니다', 'J’ai 15 ans ou plus', 'Мне 15 лет или больше'],
  minorHint: ['Only other under-15 members.', '仅匹配其他未满 15 岁的成员。', '15歳未満のメンバーのみ。', '15세 미만 회원만 표시됩니다.', 'Uniquement les moins de 15 ans.', 'Только участники младше 15 лет.'],
  adultHint: ['Only members aged 15 and older.', '仅匹配其他15岁及以上的成员。', '15歳以上のメンバーのみ。', '15세 이상 회원만 표시됩니다.', 'Uniquement les membres de 15 ans et plus.', 'Только участники от 15 лет.'],
  continue: ['Continue', '继续', '続ける', '계속', 'Continuer', 'Продолжить'],
  saving: ['Saving…', '正在保存…', '保存中…', '저장 중…', 'Enregistrement…', 'Сохранение…'],
  ageSaved: ['Saved to your account; not editable here.', '保存至账户，无法在此更改。', 'アカウントに保存され、ここでは変更できません。', '계정에 저장되며 여기서는 변경할 수 없습니다.', 'Enregistré dans votre compte, non modifiable ici.', 'Сохраняется в аккаунте, здесь изменить нельзя.'],
  failed: ['Could not complete this action. Please try again.', '操作未完成，请重试。', '操作を完了できませんでした。再試行してください。', '완료하지 못했습니다. 다시 시도하세요.', 'Impossible de terminer. Réessayez.', 'Не удалось выполнить действие. Повторите попытку.'],
  retry: ['Retry', '重试', '再試行', '다시 시도', 'Réessayer', 'Повторить'],
  pending: ['Submitted for review. It will appear after approval.', '已提交审核，通过后才会公开展示。', '審査に提出しました。承認後に表示されます。', '검토를 요청했습니다. 승인 후 표시됩니다.', 'Soumis à la modération. Visible après approbation.', 'Отправлено на проверку. Появится после одобрения.'],
  contact: ['Remove contact details; use in-app chat only.', '请移除站外联系方式，仅通过站内私信联系。', '連絡先を削除し、アプリ内チャットをご利用ください。', '연락처를 삭제하고 앱 내 채팅을 이용하세요.', 'Retirez les coordonnées et utilisez la messagerie intégrée.', 'Удалите контактные данные и используйте чат приложения.'],
  blocked: ['Please revise this post to follow community guidelines.', '请按社区规范修改内容后重试。', 'コミュニティ規則に沿って内容を修正してください。', '커뮤니티 규칙에 맞게 수정하세요.', 'Modifiez cette annonce selon les règles de la communauté.', 'Измените объявление согласно правилам сообщества.'],
  recruitment: ['Recruitment moderation', '招募审核', '募集の審査', '모집 검토', 'Modération des annonces', 'Проверка объявлений'],
  approve: ['Approve', '通过', '承認', '승인', 'Approuver', 'Одобрить'],
  reject: ['Reject', '拒绝', '却下', '거부', 'Refuser', 'Отклонить'],
  empty: ['No recruitment posts in this category.', '此分类暂无招募帖子。', 'この分類の募集はありません。', '이 분류에 모집 글이 없습니다.', 'Aucune annonce dans cette catégorie.', 'В этой категории нет объявлений.'],
};
export default function recruitCopy(lang) {
  const index = Math.max(0, ['en', 'zh', 'ja', 'ko', 'fr', 'ru'].indexOf(lang));
  return Object.fromEntries(Object.entries(rows).map(([key, values]) => [key, values[index]]));
}