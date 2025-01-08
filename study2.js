const BUSAN_UNIVERSITY_COORDS = { lat: 35.2323, lng: 129.0822 }; // 부산대학교 근처 좌표
const RADIUS = 500; // 허용 반경 (미터)
const studyTimers = {};

// Kakao 지도 API 초기
let map;
let marker;

function updatePenalty(elementId, amount) {
    const penaltyElement = document.getElementById(elementId);
    let currentPenalty = parseInt(penaltyElement.textContent) || 0;
    currentPenalty = Math.max(0, currentPenalty + amount); // 벌금은 0원 이하로 내려가지 않음
    penaltyElement.textContent = currentPenalty;
}

function verifyLocation(timeElementId, checkboxId) {
    if (!navigator.geolocation) {
        alert('위치 서비스를 지원하지 않는 브라우저입니다.');
        document.getElementById(checkboxId).checked = false;
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const userCoords = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };

            const distance = calculateDistance(
                BUSAN_UNIVERSITY_COORDS.lat,
                BUSAN_UNIVERSITY_COORDS.lng,
                userCoords.lat,
                userCoords.lng
            );

            if (distance <= RADIUS) {
                recordAttendance(timeElementId);
            } else {
                alert('출석 체크는 부산대학교 근처에서만 가능합니다.');
                document.getElementById(checkboxId).checked = false;
            }
        },
        (error) => {
            alert('위치 정보를 가져올 수 없습니다: ' + error.message);
            document.getElementById(checkboxId).checked = false;
        }
    );
}

function recordAttendance(timeElementId) {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const timeElement = document.getElementById(timeElementId);
    timeElement.textContent = `출석 시간: ${formattedTime}`;
}

function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3; // 지구 반지름 (미터)
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // 거리 (미터)
}

function startStudyTimer(elementId) {
    if (!studyTimers[elementId]) {
        studyTimers[elementId] = { hours: 0, minutes: 0, seconds: 0, interval: null };
    }

    const timer = studyTimers[elementId];

    if (timer.interval) {
        clearInterval(timer.interval);
        timer.interval = null;
        alert('공부 시간이 중지되었습니다.');
    } else {
        timer.interval = setInterval(() => {
            timer.seconds++;
            if (timer.seconds === 60) {
                timer.seconds = 0;
                timer.minutes++;
            }
            if (timer.minutes === 60) {
                timer.minutes = 0;
                timer.hours++;
            }
            document.getElementById(elementId).textContent =
                `${timer.hours}시간 ${timer.minutes}분 ${timer.seconds}초`;
        }, 1000);
        alert('공부 시간이 시작되었습니다.');
    }
}

const modal = document.getElementById('createRoomModal');
const createRoomBtn = document.getElementById('createRoomBtn');
const closeModal = document.getElementById('closeModal');
const submitRoom = document.getElementById('submitRoom');

// 공부방 생성 버튼 클릭 시 모달 표시
createRoomBtn.addEventListener('click', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const rooms = JSON.parse(localStorage.getItem('rooms') || '[]');
    
    // 현재 사용자가 다른 공부방에 참여중인지 확인
    const isInAnyRoom = rooms.some(room => 
        room.members.some(member => member.userId === currentUser.userId)
    );
    
    if (isInAnyRoom) {
        alert('이미 다른 공부방에 참여 중입니다.\n새로운 공부방을 만들기 전에 기존 공부방에서 탈퇴해주세요.');
        return;
    }

    modal.style.display = 'block';
    document.body.classList.add('modal-open');
});

// 모달 닫기
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');
    clearForm();
});

// 모달 외부 클릭 시 닫기
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        clearForm();
    }
});

// 벌금 조정 함수
function adjustFee(feeId, amount) {
    const feeInput = document.getElementById(feeId);
    let currentFee = parseInt(feeInput.value.replace(/,/g, '')) || 0;
    
    // 새로운 벌금액 계산
    let newFee = currentFee + amount;
    
    // 범위 제한 (1,000원 ~ 50,000원)
    newFee = Math.max(1000, Math.min(50000, newFee));
    
    // 1,000원 단위로 맞추기
    newFee = Math.round(newFee / 1000) * 1000;
    
    // 천 단위 콤마 추가하여 표시
    feeInput.value = newFee.toLocaleString();
}

// 위치 검색 함수
function searchLocation() {
    const location = document.getElementById('attendanceLocation').value;
    if (!location) {
        alert('위치를 입력해주세요.');
        return;
    }

    // 카카오 지도 API의 장소 검색 서비스 사용
    const geocoder = new kakao.maps.services.Geocoder();
    
    geocoder.addressSearch(location, function(result, status) {
        if (status === kakao.maps.services.Status.OK) {
            const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
            
            // 지도 표시
            document.getElementById('map').style.display = 'block';
            
            if (!map) {
                map = new kakao.maps.Map(document.getElementById('map'), {
                    center: coords,
                    level: 3
                });
            } else {
                map.setCenter(coords);
            }
            
            // 마커 표시
            if (marker) {
                marker.setMap(null);
            }
            marker = new kakao.maps.Marker({
                map: map,
                position: coords
            });

            // 1km 반경 원 표시
            const circle = new kakao.maps.Circle({
                center: coords,
                radius: 1000, // 1km
                strokeWeight: 2,
                strokeColor: '#005bac',
                strokeOpacity: 0.8,
                strokeStyle: 'solid',
                fillColor: '#005bac',
                fillOpacity: 0.2
            });
            circle.setMap(map);

            // 위도, 경도 저장
            document.getElementById('locationLat').value = result[0].y;
            document.getElementById('locationLng').value = result[0].x;
        } else {
            alert('위치를 찾을 수 없습니다. 다시 시도해주세요.');
        }
    });
}

// 공부방 생성 처리
submitRoom.addEventListener('click', () => {
    const roomName = document.getElementById('roomName').value;
    const maxMembers = parseInt(document.getElementById('maxMembers').value);
    const description = document.getElementById('description').value;
    const attendanceLocation = document.getElementById('attendanceLocation').value;
    const meetingTime = document.getElementById('meetingTime').value;
    const lateFee = parseInt(document.getElementById('lateFee').value.replace(/,/g, '')) || 1000;
    const absentFee = parseInt(document.getElementById('absentFee').value.replace(/,/g, '')) || 1000;
    const restDays = parseInt(document.getElementById('restDays').value) || 0;
    const locationLat = document.getElementById('locationLat').value;
    const locationLng = document.getElementById('locationLng').value;

    if (!roomName || !maxMembers || !description || !attendanceLocation || !meetingTime) {
        alert('모든 필수 정보를 입력해주세요.');
        return;
    }

    // 최대 인원 제한 체크
    if (maxMembers > 10) {
        alert('최대 인원은 10명을 초과할 수 없습니다.');
        return;
    }

    if (maxMembers < 2) {
        alert('최대 인원은 2명 이상이어야 합니다.');
        return;
    }

    if (!locationLat || !locationLng) {
        alert('출석체크 위치를 설정해주세요.');
        return;
    }

    // 현재 로그인한 사용자 정보 가져오기
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    const newRoom = {
        id: Date.now(),
        name: roomName,
        maxMembers: maxMembers,
        description: description,
        creator: currentUser.nickname,
        createdAt: new Date().toLocaleString(),
        members: [currentUser],
        rules: {
            attendanceLocation: {
                name: document.getElementById('attendanceLocation').value,
                lat: parseFloat(locationLat),
                lng: parseFloat(locationLng)
            },
            meetingTime: meetingTime,
            lateFee: lateFee,
            absentFee: absentFee,
            restDays: restDays,
            radius: 1000 // 1km
        }
    };

    // 기존 공부방 목록에 추가
    const rooms = JSON.parse(localStorage.getItem('rooms') || '[]');
    rooms.push(newRoom);
    localStorage.setItem('rooms', JSON.stringify(rooms));

    alert('공부방이 생성되었습니다!');
    modal.style.display = 'none';
    clearForm();
    displayRooms();
});

function displayRooms() {
    const roomsList = document.getElementById('roomsList');
    const rooms = JSON.parse(localStorage.getItem('rooms') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    roomsList.innerHTML = rooms.map((room, index) => {
        const isFull = room.members.length >= room.maxMembers;
        const isAlreadyJoined = room.members.some(member => member.userId === currentUser.userId);
        const isCreator = room.creator === currentUser.nickname;

        let buttonHtml;
        if (isCreator || isAlreadyJoined) {
            buttonHtml = `<button class="join-btn" onclick="enterRoom(${room.id})">공부방 들어가기</button>`;
        } else if (isFull) {
            buttonHtml = '<button class="join-btn" disabled>만석</button>';
        } else {
            // 현재 사용자가 다른 공부방에 참여중인지 확인
            const isInOtherRoom = rooms.some(r => 
                r.id !== room.id && 
                r.members.some(member => member.userId === currentUser.userId)
            );
            
            if (isInOtherRoom) {
                buttonHtml = '<button class="join-btn" disabled>참가불가</button>';
            } else {
                buttonHtml = `<button class="join-btn" onclick="joinRoom(${room.id})">참가하기</button>`;
            }
        }

        return `
            <tr>
                <td>${rooms.length - index}</td>
                <td>${room.name}</td>
                <td>${room.creator}</td>
                <td>${room.members.length}/${room.maxMembers}</td>
                <td>${buttonHtml}</td>
            </tr>
        `;
    }).join('');
}

function joinRoom(roomId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const rooms = JSON.parse(localStorage.getItem('rooms') || '[]');
    
    // 현재 사용자가 다른 공부방에 이미 참여중인지 확인
    const isAlreadyInOtherRoom = rooms.some(room => 
        room.id !== roomId && // 현재 참여하려는 방이 아닌 다른 방에서
        room.members.some(member => member.userId === currentUser.userId) // 사용자가 참여중인지 확인
    );

    if (isAlreadyInOtherRoom) {
        alert('이미 다른 공부방에 참여중입니다.\n한 번에 하나의 공부방에만 참여할 수 있습니다.');
        return;
    }

    const roomIndex = rooms.findIndex(room => room.id === roomId);
    if (roomIndex === -1) return;

    const room = rooms[roomIndex];
    
    // 이미 참가한 경우 체크
    if (room.members.some(member => member.userId === currentUser.userId)) {
        alert('이미 참가한 공부방입니다.');
        return;
    }

    // 정원 초과 체크
    if (room.members.length >= room.maxMembers) {
        alert('공부방이 가득 찼습니다.');
        return;
    }

    // 참가 처리
    room.members.push(currentUser);
    rooms[roomIndex] = room;
    localStorage.setItem('rooms', JSON.stringify(rooms));
    
    alert('공부방에 참가했습니다!');
    displayRooms(); // 목록 새로고침
}

function clearForm() {
    document.getElementById('roomName').value = '';
    document.getElementById('maxMembers').value = '';
    document.getElementById('description').value = '';
    document.getElementById('attendanceLocation').value = '';
    document.getElementById('meetingTime').value = '';
    document.getElementById('lateFee').value = '';
    document.getElementById('absentFee').value = '';
    document.getElementById('restDays').value = '';
}

// 페이지 로드 시 공부방 목록 표시
window.addEventListener('load', displayRooms);

// 공부방 입장 함수 추가
function enterRoom(roomId) {
    // 현재 선택된 공부방 정보를 localStorage에 저장
    const rooms = JSON.parse(localStorage.getItem('rooms') || '[]');
    const selectedRoom = rooms.find(room => room.id === roomId);
    
    if (selectedRoom) {
        localStorage.setItem('currentRoom', JSON.stringify(selectedRoom));
        // 공부방 웹페이지로 이동
        window.location.href = 'studyroom.html';
    }
} 