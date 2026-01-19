// 로컬 스토리지 키
export const STORAGE_KEYS = {
  USER_ID: 'userId',
  USER_loginId: 'userLoginId',
  USER_EMAIL: 'userEmail',
}

// Toast 메시지
export const TOAST_MESSAGES = {
  SUCCESS: {
    // FOLDER_CREATED: '폴더가 생성되었습니다.',
    // FOLDER_UPDATED: '폴더가 수정되었습니다.',
    // FOLDER_DELETED: '폴더가 삭제되었습니다.',
    // POST_CREATED: '게시글이 작성되었습니다.',
    // POST_UPDATED: '게시글이 수정되었습니다.',
    // POST_DELETED: '게시글이 삭제되었습니다.',
    LOGIN_SUCCESS: '로그인되었습니다.',
    REGISTER_SUCCESS: '회원가입이 완료되었습니다.',
  },
  ERROR: {
    FOLDER_CREATE_FAILED: '폴더 생성에 실패했습니다.',
    FOLDER_UPDATE_FAILED: '폴더 수정에 실패했습니다.',
    FOLDER_DELETE_FAILED: '폴더 삭제에 실패했습니다.',
    POST_CREATE_FAILED: '게시글 작성에 실패했습니다.',
    POST_UPDATE_FAILED: '게시글 수정에 실패했습니다.',
    POST_DELETE_FAILED: '게시글 삭제에 실패했습니다.',
    LOGIN_FAILED: '로그인에 실패했습니다.',
    REGISTER_FAILED: '회원가입에 실패했습니다.',
    NETWORK_ERROR: '네트워크 오류가 발생했습니다.',
  },
}
