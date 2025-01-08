const modal = document.getElementById('loginModal');
const loginBtn = document.getElementById('loginBtn');
const closeModal = document.getElementById('closeModal');
const submitLogin = document.getElementById('submitLogin');
const modalContent = document.querySelector('.modal-content');

// 로그인 버튼 클릭 시 모달 표시
loginBtn.addEventListener('click', () => {
    modal.style.display = 'block';
});

// 모달 닫기 버튼
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

// 모달 외부 클릭 시 닫기
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// 모달 내부 클릭 시 이벤트 전파 중단
modalContent.addEventListener('click', (event) => {
    event.stopPropagation();
});

// 로그인 처리
submitLogin.addEventListener('click', () => {
    const userId = document.getElementById('loginId').value;
    const password = document.getElementById('loginPassword').value;
    const passwordInput = document.getElementById('loginPassword'); // 비밀번호 입력 필드 요소

    // localStorage에서 사용자 정보 가져오기
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // 먼저 아이디 존재 여부 확인
    const userExists = users.find(u => u.userId === userId);
    
    if (!userExists) {
        // 아이디가 존재하지 않는 경우
        alert('등록되지 않은 사용자입니다.');
        return;
    }
    
    // 아이디는 존재하지만 비밀번호가 틀린 경우
    if (userExists.password !== password) {
        alert('비밀번호가 틀렸습니다.');
        passwordInput.value = ''; // 비밀번호 입력 필드 초기화
        return;
    }

    // 로그인 성공
    alert(`가입된 이름: ${userExists.name}님 어서오세요!`);
    localStorage.setItem('currentUser', JSON.stringify(userExists));
    window.location.href = 'study2.html';
}); 