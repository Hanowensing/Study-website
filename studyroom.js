// 현재 공부방과 사용자 정보 가져오기
const currentRoom = JSON.parse(localStorage.getItem('currentRoom'));
const currentUser = JSON.parse(localStorage.getItem('currentUser'));

// 페이지 로드 시 초기화
window.addEventListener('load', () => {
    document.getElementById('roomName').textContent = currentRoom.name;
    document.getElementById('roomDescription').textContent = currentRoom.description;

    // 방장 권한 체크
    if (currentRoom.creator === currentUser.nickname) {
        document.getElementById('adminControls').style.display = 'flex';
    }

    displayMembers();

    // 방장이 아닌 경우에만 탈퇴 버튼 표시
    if (currentUser.nickname !== currentRoom.creator) {
        const buttonContainer = document.querySelector('.room-buttons');
        buttonContainer.innerHTML += `
            <button id="leaveRoomBtn" class="danger-btn" onclick="leaveRoomPermanently()">방 탈퇴</button>
        `;
    }
});

// 멤버 목록 표시
function displayMembers() {
    const membersList = document.getElementById('membersList');
    membersList.innerHTML = currentRoom.members.map(member => `
        <div class="member-item">
            <div class="member-info">
                <span>${member.nickname}${member.userId === currentUser.userId ? ' (나)' : ''}${member.nickname === currentRoom.creator ? ' (방장)' : ''}</span>
            </div>
            ${currentRoom.creator === currentUser.nickname && member.userId !== currentUser.userId ?
                `<button onclick="kickMember('${member.userId}')">강퇴</button>` : ''}
        </div>
    `).join('');
}

// 멤버 강퇴
function kickMember(userId) {
    if (!confirm('이 멤버를 강퇴하시겠습니까?')) return;

    const rooms = JSON.parse(localStorage.getItem('rooms') || '[]');
    const roomIndex = rooms.findIndex(r => r.id === currentRoom.id);
    
    if (roomIndex !== -1) {
        rooms[roomIndex].members = rooms[roomIndex].members.filter(m => m.userId !== userId);
        localStorage.setItem('rooms', JSON.stringify(rooms));
        
        // 현재 방 정보 업데이트
        currentRoom.members = currentRoom.members.filter(m => m.userId !== userId);
        localStorage.setItem('currentRoom', JSON.stringify(currentRoom));
        
        displayMembers();
    }
}

// 공부방 설정 수정
const editRoomModal = document.getElementById('editRoomModal');
const editRoomBtn = document.getElementById('editRoomBtn');
const closeEditModal = document.getElementById('closeEditModal');
const saveRoomEdit = document.getElementById('saveRoomEdit');

editRoomBtn.addEventListener('click', () => {
    document.getElementById('editDescription').value = currentRoom.description;
    editRoomModal.style.display = 'block';
});

closeEditModal.addEventListener('click', () => {
    editRoomModal.style.display = 'none';
});

saveRoomEdit.addEventListener('click', () => {
    const newDescription = document.getElementById('editDescription').value;

    if (!newDescription) {
        alert('방 설명을 입력해주세요.');
        return;
    }

    // 공부방 정보 업데이트
    const rooms = JSON.parse(localStorage.getItem('rooms') || '[]');
    const roomIndex = rooms.findIndex(r => r.id === currentRoom.id);
    
    if (roomIndex !== -1) {
        rooms[roomIndex].description = newDescription;
        currentRoom.description = newDescription;
        
        localStorage.setItem('rooms', JSON.stringify(rooms));
        localStorage.setItem('currentRoom', JSON.stringify(currentRoom));
        
        document.getElementById('roomDescription').textContent = newDescription;
        editRoomModal.style.display = 'none';
        alert('방 소개가 수�되었습니다.');
    }
});

// 방 탈퇴 함수
function leaveRoomPermanently() {
    if (!confirm('정말로 방을 탈퇴하시겠습니까?\n탈퇴 후에는 다시 참여하려면 새로 참가해야 합니다.')) {
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const rooms = JSON.parse(localStorage.getItem('rooms') || '[]');
    const roomIndex = rooms.findIndex(r => r.id === currentRoom.id);
    
    if (roomIndex !== -1) {
        // 멤버 목록에서 현재 사용자 제거
        rooms[roomIndex].members = rooms[roomIndex].members.filter(
            member => member.userId !== currentUser.userId
        );
        
        localStorage.setItem('rooms', JSON.stringify(rooms));
        alert('방에서 탈퇴했습니다.');
        window.location.href = 'study2.html';
    }
}

// 방장 권한 관련 버튼 이벤트 리스너
document.getElementById('transferOwnerBtn').addEventListener('click', showTransferModal);
document.getElementById('deleteRoomBtn').addEventListener('click', deleteRoom);
document.getElementById('closeTransferModal').addEventListener('click', () => {
    document.getElementById('transferModal').style.display = 'none';
});

// 방장 위임 모달 표시
function showTransferModal() {
    const transferModal = document.getElementById('transferModal');
    const transferMemberList = document.getElementById('transferMemberList');
    
    // 현재 방장을 제외한 멤버 목록 표시
    const otherMembers = currentRoom.members.filter(m => m.userId !== currentUser.userId);
    
    transferMemberList.innerHTML = otherMembers.map(member => `
        <div class="member-item">
            <span>${member.nickname} (${member.name})</span>
            <button onclick="transferOwnership('${member.userId}')">위임하기</button>
        </div>
    `).join('');
    
    transferModal.style.display = 'block';
}

// 방장 권한 위임
function transferOwnership(newOwnerId) {
    if (!confirm('정말 방장 권한을 위임하시겠습니까?')) return;
    
    const rooms = JSON.parse(localStorage.getItem('rooms') || '[]');
    const roomIndex = rooms.findIndex(r => r.id === currentRoom.id);
    
    if (roomIndex !== -1) {
        const newOwner = currentRoom.members.find(m => m.userId === newOwnerId);
        rooms[roomIndex].creator = newOwner.nickname;
        currentRoom.creator = newOwner.nickname;
        
        localStorage.setItem('rooms', JSON.stringify(rooms));
        localStorage.setItem('currentRoom', JSON.stringify(currentRoom));
        
        alert(`${newOwner.nickname}님에게 방장 권한을 위임했습니다.`);
        location.reload(); // 페이지 새로고침
    }
}

// 방 삭제 (별도의 기능으로 분리)
function deleteRoom() {
    if (!confirm('정말 방을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) return;
    
    const rooms = JSON.parse(localStorage.getItem('rooms') || '[]');
    const updatedRooms = rooms.filter(r => r.id !== currentRoom.id);
    
    localStorage.setItem('rooms', JSON.stringify(updatedRooms));
    alert('방이 삭제되었습니다.');
    location.href = 'study2.html';
}

// 방 설정 수정 (설명만 수정 가능하도록 변경)
saveRoomEdit.addEventListener('click', () => {
    const newDescription = document.getElementById('editDescription').value;

    if (!newDescription) {
        alert('방 설명을 입력해주세요.');
        return;
    }

    // 공부방 정보 업데이트
    const rooms = JSON.parse(localStorage.getItem('rooms') || '[]');
    const roomIndex = rooms.findIndex(r => r.id === currentRoom.id);
    
    if (roomIndex !== -1) {
        rooms[roomIndex].description = newDescription;
        currentRoom.description = newDescription;
        
        localStorage.setItem('rooms', JSON.stringify(rooms));
        localStorage.setItem('currentRoom', JSON.stringify(currentRoom));
        
        document.getElementById('roomDescription').textContent = newDescription;
        editRoomModal.style.display = 'none';
        alert('방 소개가 수�되었습니다.');
    }
});

// 공부방 뒤로가기 (목록 페이지로 돌아가기)
function leaveRoom() {
    location.href = 'study2.html';
} 