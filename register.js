let selectedProfile = null;
let isIdAvailable = false;
let isStudentIdAvailable = true;

document.querySelectorAll('.profile').forEach(profile => {
    profile.addEventListener('click', () => {
        document.querySelectorAll('.profile').forEach(p => p.style.border = 'none');
        profile.style.border = '2px solid #005bac';
        selectedProfile = profile.getAttribute('data-name');
    });
});

// 아이디 중복 확인
document.getElementById('checkIdBtn').addEventListener('click', () => {
    const userId = document.getElementById('userId').value;
    
    if (!userId) {
        alert('아이디를 입력해주세요.');
        return;
    }

    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const isUserExist = existingUsers.some(user => user.userId === userId);

    if (isUserExist) {
        alert('이미 사용 중인 아이디입니다.');
        isIdAvailable = false;
    } else {
        alert('사용 가능한 아이디입니다.');
        isIdAvailable = true;
    }
});

// 아이디 입력 필드 변경 시 중복 확인 초기화
document.getElementById('userId').addEventListener('input', () => {
    isIdAvailable = false;
});

// 학번 입력 필드 변경 시 중복 체크
document.getElementById('studentId').addEventListener('input', () => {
    const studentId = document.getElementById('studentId').value;
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    
    // 학번 중복 체크
    const isStudentIdExist = existingUsers.some(user => user.studentId === studentId);
    
    if (isStudentIdExist) {
        alert('이미 등록된 학번입니다.');
        isStudentIdAvailable = false;
        document.getElementById('studentId').value = ''; // 입력 필드 초기화
    } else {
        isStudentIdAvailable = true;
    }
});

document.getElementById('registerBtn').addEventListener('click', () => {
    const userId = document.getElementById('userId').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    const username = document.getElementById('username').value;
    const nickname = document.getElementById('nickname').value;
    const studentId = document.getElementById('studentId').value;
    const department = document.getElementById('department').value;

    // 모든 필드 검증
    if (!selectedProfile || !userId || !password || !passwordConfirm || !username || !nickname || !studentId || !department) {
        alert('모든 정보를 입력해주세요.');
        return;
    }

    // 아이디 중복 확인 여부 검증
    if (!isIdAvailable) {
        alert('아이디 중복 확인을 해주세요.');
        return;
    }

    // 학번 중복 확인
    if (!isStudentIdAvailable) {
        alert('이미 등록된 학번입니다.');
        return;
    }

    // 비밀번호 일치 여부 확인
    if (password !== passwordConfirm) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
    }

    // 기존 사용자 목록 가져오기
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    
    // 새 사용자 정보 추가
    const newUser = {
        userId,
        password,
        profile: selectedProfile,
        name: username,
        nickname: nickname,
        studentId,
        department
    };
    
    existingUsers.push(newUser);
    
    // localStorage에 저장
    localStorage.setItem('users', JSON.stringify(existingUsers));
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    alert(`${username}님, 등록이 완료되었습니다!`);
    window.location.href = 'index.html';
}); 