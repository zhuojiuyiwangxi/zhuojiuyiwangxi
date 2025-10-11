$(document).ready(function() {
    let currentAdminUser = null; // 当前登录的管理员用户
    const CURRENT_ADMIN_USER_KEY = 'currentHotelAdminUser'; // localStorage中存储当前用户的key

    // 加载当前登录的管理员用户
    function loadCurrentAdminUser() {
        const storedUser = localStorage.getItem(CURRENT_ADMIN_USER_KEY);
        if (storedUser) {
            currentAdminUser = JSON.parse(storedUser);
        }
    }

    // 保存当前登录的管理员用户
    function saveCurrentAdminUser() {
        if (currentAdminUser) {
            localStorage.setItem(CURRENT_ADMIN_USER_KEY, JSON.stringify(currentAdminUser));
        } else {
            localStorage.removeItem(CURRENT_ADMIN_USER_KEY);
        }
    }

    // 检查登录状态并更新UI
    function checkLoginState() {
        loadCurrentAdminUser();
        if (currentAdminUser) {
            // 已登录状态
            $('#current-user').text(currentAdminUser.username);
            $('#login-page').hide();
            $('#register-page').hide();
            $('#main-app').show();
            navigateToPage('dashboard'); // 登录后默认显示仪表盘页面
        } else {
            // 未登录状态
            $('#login-page').show();
            $('#register-page').hide();
            $('#main-app').hide();
        }
    }

    // 登录表单提交处理
    $('#login-form').submit(function(e) {
        e.preventDefault();
        const username = $('#login-username').val();
        const password = $('#login-password').val();
        
        // 从数据服务获取所有管理员用户
        const adminUsers = DataService.getAll(DataService.KEYS.ADMIN_USERS);
        // 查找匹配的用户
        const user = adminUsers.find(u => u.username === username && u.password === password);
        
        if (user) {
            // 登录成功
            currentAdminUser = user;
            saveCurrentAdminUser();
            checkLoginState();
        } else {
            alert('用户名或密码错误');
        }
    });

    // 显示注册页面
    $('#show-register').click(function(e) {
        e.preventDefault();
        $('#login-page').hide();
        $('#register-page').show();
    });

    // 返回登录页面
    $('#back-to-login').click(function() {
        $('#register-page').hide();
        $('#login-page').show();
    });

    // 注册表单提交处理
    $('#register-form').submit(function(e) {
        e.preventDefault();
        const username = $('#register-username').val();
        const password = $('#register-password').val();
        const confirmPassword = $('#register-confirm-password').val();
        const email = $('#register-email').val();

        // 验证两次密码是否一致
        if (password !== confirmPassword) {
            alert('两次输入的密码不一致');
            return;
        }
        
        // 检查用户名是否已存在
        const adminUsers = DataService.getAll(DataService.KEYS.ADMIN_USERS);
        if (adminUsers.some(u => u.username === username)) {
            alert('用户名已存在');
            return;
        }
        
        // 添加新用户(默认为staff角色)
        DataService.add(DataService.KEYS.ADMIN_USERS, { username, password, email, role: 'staff' });
        alert('注册成功，请登录');
        $('#register-page').hide();
        $('#login-page').show();
    });

    // 退出登录
    $('#logout').click(function(e) {
        e.preventDefault();
        currentAdminUser = null;
        saveCurrentAdminUser();
        checkLoginState();
    });

    // 侧边栏导航点击处理
    $('.sidebar-menu li').click(function() {
        const page = $(this).data('page');
        if (page) {
            navigateToPage(page);
        }
    });

    // 导航到指定页面
    function navigateToPage(pageId) {
        // 更新侧边栏活动状态
        $('.sidebar-menu li').removeClass('active');
        $(`.sidebar-menu li[data-page="${pageId}"]`).addClass('active');
        
        // 隐藏所有页面内容，显示当前页面
        $('.page-content').hide();
        $(`#${pageId}-page`).show();
        
        // 加载页面数据
        loadPageData(pageId);
    }

    // 加载页面数据
    function loadPageData(pageId) {
        switch(pageId) {
            case 'dashboard': loadDashboard(); break; // 仪表盘
            case 'rooms': loadRoomsTable(); break;    // 房间管理
            case 'reservations': loadReservationsTable(); break; // 预订管理
            case 'guests': loadGuestsTable(); break;  // 客人管理
            case 'staff': loadStaffTable(); break;    // 员工管理
            case 'settings': loadSettingsForm(); break; // 系统设置
        }
    }
    
    // --- 状态文本和徽章样式辅助函数 ---
    
    // 获取房间状态文本
    function getRoomStatusText(status) {
        const map = { 'available': '可用', 'occupied': '已入住', 'maintenance': '维修中' };
        return map[status] || status;
    }
    
    // 获取预订状态文本
    function getReservationStatusText(status) {
        const map = { 'confirmed': '已确认', 'checked-in': '已入住', 'completed': '已完成', 'cancelled': '已取消' };
        return map[status] || status;
    }
    
    // 获取员工状态文本
    function getStaffStatusText(status) {
        return status === 'active' ? '在职' : '离职';
    }
    
    // 获取状态徽章样式类
    function getStatusBadgeClass(status) {
         switch(status) {
            case 'available': case 'confirmed': case 'completed': case 'active': return 'bg-success'; // 成功/可用
            case 'occupied': case 'checked-in': return 'bg-primary'; // 主要/已入住
            case 'maintenance': return 'bg-warning text-dark'; // 警告/维修中
            case 'cancelled': return 'bg-danger'; // 危险/已取消
            case 'inactive': return 'bg-secondary'; // 次要/离职
            default: return 'bg-secondary'; // 默认
        }
    }

    // --- 仪表盘页面功能 ---
    function loadDashboard() {
        const rooms = DataService.getAll(DataService.KEYS.ROOMS); // 所有房间
        const bookings = DataService.getAll(DataService.KEYS.BOOKINGS); // 所有预订
        const today = new Date().toISOString().split('T')[0]; // 今天日期

        // 更新统计卡片
        $('#total-rooms').text(rooms.length);
        $('#available-rooms').text(rooms.filter(r => r.status === 'available').length);
        
        // 今日入住和今日退房统计
        $('#active-reservations').text(bookings.filter(b => b.checkIn === today && (b.status === 'confirmed' || b.status === 'checked-in')).length);
        $('#checkout-today').text(bookings.filter(b => b.checkOut === today && (b.status === 'confirmed' || b.status === 'checked-in')).length);

        // 最近5条预订记录
        const recentBookings = bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
        const $recentBookingsTable = $('#recent-reservations tbody');
        $recentBookingsTable.empty();
        recentBookings.forEach(booking => {
            const room = DataService.getById(DataService.KEYS.ROOMS, booking.roomId);
            $recentBookingsTable.append(`
                <tr>
                    <td>${booking.id}</td>
                    <td>${booking.bookedByName}</td>
                    <td>${room ? `${room.number} (${room.type})` : 'N/A'}</td>
                    <td>${booking.checkIn}</td>
                    <td>${booking.checkOut}</td>
                    <td><span class="badge ${getStatusBadgeClass(booking.status)}">${getReservationStatusText(booking.status)}</span></td>
                </tr>
            `);
        });
    }

    // --- 房间管理功能 ---
    function loadRoomsTable() {
        const rooms = DataService.getAll(DataService.KEYS.ROOMS);
        const $tableBody = $('#rooms-table tbody');
        $tableBody.empty();
        rooms.forEach(room => {
            $tableBody.append(`
                <tr>
                    <td>${room.id}</td>
                    <td>${room.number}</td>
                    <td>${room.type}</td>
                    <td>¥${room.price}</td>
                    <td><span class="badge ${getStatusBadgeClass(room.status)}">${getRoomStatusText(room.status)}</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary edit-room" data-id="${room.id}"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger delete-room" data-id="${room.id}"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `);
        });
    }
    
    // 房间管理相关事件绑定
    $('#add-room-btn').click(() => openRoomModal());
    $('#rooms-table').on('click', '.edit-room', function() { openRoomModal($(this).data('id')); });
    $('#rooms-table').on('click', '.delete-room', function() { deleteRoom($(this).data('id')); });

    // 打开房间编辑模态框
    function openRoomModal(id = null) {
        $('#room-form')[0].reset();
        if (id) {
            // 编辑模式
            const room = DataService.getById(DataService.KEYS.ROOMS, id);
            $('#room-modal-title').text('编辑房间');
            $('#room-id').val(room.id);
            $('#room-number').val(room.number);
            $('#room-type').val(room.type);
            $('#room-price').val(room.price);
            $('#room-status').val(room.status);
            $('#room-capacity').val(room.capacity);
            $('#room-description').val(room.description);
            $('#room-image').val(room.image);
        } else {
            // 添加模式
            $('#room-modal-title').text('添加房间');
            $('#room-id').val('');
        }
        $('#room-form-modal').modal('show');
    }
    
    // 保存房间信息
    $('#save-room').click(function() {
        const roomData = {
            number: $('#room-number').val(), 
            type: $('#room-type').val(),
            price: parseFloat($('#room-price').val()), 
            status: $('#room-status').val(),
            capacity: parseInt($('#room-capacity').val()), 
            description: $('#room-description').val(),
            image: $('#room-image').val()
        };
        const id = $('#room-id').val();
        if (id) {
            // 更新现有房间
            DataService.update(DataService.KEYS.ROOMS, id, roomData);
        } else {
            // 添加新房间
            DataService.add(DataService.KEYS.ROOMS, roomData);
        }
        $('#room-form-modal').modal('hide');
        loadRoomsTable();
        loadDashboard(); // 刷新仪表盘
    });
    
    // 删除房间
    function deleteRoom(id) {
        if (confirm('确定要删除这个房间吗？')) {
            DataService.remove(DataService.KEYS.ROOMS, id);
            loadRoomsTable();
            loadDashboard();
        }
    }

    // --- 预订管理功能 ---
    function loadReservationsTable(filters = {}) {
        let bookings = DataService.getAll(DataService.KEYS.BOOKINGS);
        // 应用过滤器
        if (filters.status) bookings = bookings.filter(b => b.status === filters.status);
        if (filters.date) bookings = bookings.filter(b => b.checkIn === filters.date || b.checkOut === filters.date);
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            bookings = bookings.filter(b => 
                b.bookedByName.toLowerCase().includes(searchTerm) || 
                (b.id && b.id.toString().includes(searchTerm))
            );
        }

        const $tableBody = $('#reservations-table tbody');
        $tableBody.empty();
        bookings.forEach(booking => {
            const room = DataService.getById(DataService.KEYS.ROOMS, booking.roomId);
            $tableBody.append(`
                <tr>
                    <td>${booking.id}</td>
                    <td>${booking.bookedByName} ${booking.managedGuestId ? `(G-${booking.managedGuestId})` : ''}</td>
                    <td>${room ? `${room.number} (${room.type})` : 'N/A'}</td>
                    <td>${booking.checkIn}</td>
                    <td>${booking.checkOut}</td>
                    <td><span class="badge ${getStatusBadgeClass(booking.status)}">${getReservationStatusText(booking.status)}</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary edit-reservation" data-id="${booking.id}"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger delete-reservation" data-id="${booking.id}"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `);
        });
    }
    
    // 预订管理相关事件绑定
    $('#add-reservation-btn').click(() => openReservationModal());
    $('#reservations-table').on('click', '.edit-reservation', function() { openReservationModal($(this).data('id')); });
    $('#reservations-table').on('click', '.delete-reservation', function() { deleteReservation($(this).data('id')); });
    
    // 预订过滤器事件绑定
    $('#reservation-filter-status, #reservation-filter-date').on('change', applyReservationFilters);
    $('#reservation-search-btn').on('click', applyReservationFilters);
    $('#reservation-search').on('keypress', function(e) { if(e.which == 13) applyReservationFilters(); });

    // 应用预订过滤器
    function applyReservationFilters() {
        const filters = {
            status: $('#reservation-filter-status').val(),
            date: $('#reservation-filter-date').val(),
            search: $('#reservation-search').val()
        };
        loadReservationsTable(filters);
    }

    // 填充预订模态框中的下拉选项
    function populateReservationModalDropdowns() {
        // 填充客人下拉框
        const guests = DataService.getAll(DataService.KEYS.GUESTS);
        const $guestDropdown = $('#reservation-guest');
        $guestDropdown.empty().append('<option value="">选择客人...</option>');
        guests.forEach(g => $guestDropdown.append(`<option value="${g.id}">${g.name} (ID: ${g.id})</option>`));

        // 填充可用房间下拉框
        const rooms = DataService.getAll(DataService.KEYS.ROOMS).filter(r => r.status === 'available');
        const $roomDropdown = $('#reservation-room');
        $roomDropdown.empty().append('<option value="">选择房间...</option>');
        rooms.forEach(r => $roomDropdown.append(`<option value="${r.id}">${r.number} (${r.type}) - ¥${r.price}</option>`));
    }

    // 打开预订编辑模态框
    function openReservationModal(id = null) {
        $('#reservation-form')[0].reset();
        populateReservationModalDropdowns();
        if (id) {
            // 编辑模式
            const booking = DataService.getById(DataService.KEYS.BOOKINGS, id);
            $('#reservation-modal-title').text('编辑预订');
            $('#reservation-id').val(booking.id);
            $('#reservation-guest').val(booking.managedGuestId || '');
            
            // 尝试通过姓名匹配客人(如果未直接关联)
            if (!booking.managedGuestId && booking.bookedByName) {
                const guests = DataService.getAll(DataService.KEYS.GUESTS);
                const matchedGuest = guests.find(g => g.name === booking.bookedByName);
                if (matchedGuest) $('#reservation-guest').val(matchedGuest.id);
            }
            
            $('#reservation-room').val(booking.roomId);
            $('#reservation-checkin').val(booking.checkIn);
            $('#reservation-checkout').val(booking.checkOut);
            $('#reservation-adults').val(booking.adults);
            $('#reservation-children').val(booking.children);
            $('#reservation-status').val(booking.status);
            $('#reservation-notes').val(booking.requests);
        } else {
            // 添加模式
            $('#reservation-modal-title').text('添加预订');
            $('#reservation-id').val('');
            // 设置默认日期(今天和明天)
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            $('#reservation-checkin').val(today.toISOString().split('T')[0]);
            $('#reservation-checkout').val(tomorrow.toISOString().split('T')[0]);
        }
        $('#reservation-form-modal').modal('show');
    }
    
    // 保存预订信息
    $('#save-reservation').click(function() {
        const guestId = $('#reservation-guest').val();
        const roomId = $('#reservation-room').val();
        const selectedGuest = guestId ? DataService.getById(DataService.KEYS.GUESTS, guestId) : null;
        const selectedRoom = roomId ? DataService.getById(DataService.KEYS.ROOMS, roomId) : null;

        // 验证客人和房间选择
        if (!selectedGuest || !selectedRoom) {
            alert("请选择有效的客人和房间。");
            return;
        }
        
        // 构建预订数据对象
        const bookingData = {
            managedGuestId: selectedGuest.id,
            bookedByName: selectedGuest.name,
            bookedByContact: selectedGuest.phone || selectedGuest.email,
            roomId: selectedRoom.id,
            roomType: selectedRoom.type,
            checkIn: $('#reservation-checkin').val(),
            checkOut: $('#reservation-checkout').val(),
            adults: parseInt($('#reservation-adults').val()),
            children: parseInt($('#reservation-children').val()),
            status: $('#reservation-status').val(),
            requests: $('#reservation-notes').val(),
            bookingSource: 'backend',
            createdAt: new Date().toISOString() // 新预订的创建时间
        };

        const id = $('#reservation-id').val();
        if (id) {
            // 更新现有预订
            const existingBooking = DataService.getById(DataService.KEYS.BOOKINGS, id);
            // 合并数据，保留原有创建时间等字段
            const updatedBooking = {...existingBooking, ...bookingData};
            DataService.update(DataService.KEYS.BOOKINGS, id, updatedBooking);
        } else {
            // 添加新预订
            DataService.add(DataService.KEYS.BOOKINGS, bookingData);
        }
        
        // 根据预订状态更新房间状态
        if (bookingData.status === 'checked-in' || bookingData.status === 'confirmed') {
             DataService.update(DataService.KEYS.ROOMS, bookingData.roomId, { status: 'occupied' });
        } else if (bookingData.status === 'completed' || bookingData.status === 'cancelled') {
            // 检查房间是否应该变为可用状态(没有其他有效预订)
            const otherBookingsForRoom = DataService.getAll(DataService.KEYS.BOOKINGS)
                .filter(b => b.roomId === bookingData.roomId && b.id != id && (b.status === 'confirmed' || b.status === 'checked-in'));
            if(otherBookingsForRoom.length === 0) {
                 DataService.update(DataService.KEYS.ROOMS, bookingData.roomId, { status: 'available' });
            }
        }

        $('#reservation-form-modal').modal('hide');
        loadReservationsTable();
        loadDashboard();
        loadRoomsTable(); // 房间状态可能已改变
    });
    
    // 删除预订
    function deleteReservation(id) {
        if (confirm('确定要删除这个预订吗？')) {
            const booking = DataService.getById(DataService.KEYS.BOOKINGS, id);
            DataService.remove(DataService.KEYS.BOOKINGS, id);
            // 如果这是该房间唯一的有效预订，则更新房间状态
            if (booking && (booking.status === 'confirmed' || booking.status === 'checked-in')) {
                const otherBookingsForRoom = DataService.getAll(DataService.KEYS.BOOKINGS)
                    .filter(b => b.roomId === booking.roomId && (b.status === 'confirmed' || b.status === 'checked-in'));
                if(otherBookingsForRoom.length === 0) {
                     DataService.update(DataService.KEYS.ROOMS, booking.roomId, { status: 'available' });
                }
            }
            loadReservationsTable();
            loadDashboard();
            loadRoomsTable();
        }
    }

    // --- 客人管理功能 ---
    function loadGuestsTable() {
        const guests = DataService.getAll(DataService.KEYS.GUESTS);
        const $tableBody = $('#guests-table tbody');
        $tableBody.empty();
        guests.forEach(guest => {
            $tableBody.append(`
                <tr>
                    <td>${guest.id}</td>
                    <td>${guest.name}</td>
                    <td>${guest.idNumber} (${guest.idType})</td>
                    <td>${guest.phone}</td>
                    <td>${guest.email || '-'}</td>
                    <td>
                        <button class="btn btn-sm btn-primary edit-guest" data-id="${guest.id}"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger delete-guest" data-id="${guest.id}"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `);
        });
    }
    
    // 客人管理相关事件绑定
    $('#add-guest-btn').click(() => openGuestModal());
    $('#guests-table').on('click', '.edit-guest', function() { openGuestModal($(this).data('id')); });
    $('#guests-table').on('click', '.delete-guest', function() { deleteGuest($(this).data('id')); });
    
    // 打开客人编辑模态框
    function openGuestModal(id = null) {
        $('#guest-form')[0].reset();
        if (id) {
            // 编辑模式
            const guest = DataService.getById(DataService.KEYS.GUESTS, id);
            $('#guest-modal-title').text('编辑客人');
            $('#guest-id').val(guest.id);
            $('#guest-name').val(guest.name);
            $('#guest-id-type').val(guest.idType);
            $('#guest-id-number').val(guest.idNumber);
            $('#guest-phone').val(guest.phone);
            $('#guest-email').val(guest.email);
            $('#guest-address').val(guest.address);
        } else {
            // 添加模式
            $('#guest-modal-title').text('添加客人');
            $('#guest-id').val('');
        }
        $('#guest-form-modal').modal('show');
    }
    
    // 保存客人信息
    $('#save-guest').click(function() {
        const guestData = {
            name: $('#guest-name').val(), 
            idType: $('#guest-id-type').val(),
            idNumber: $('#guest-id-number').val(), 
            phone: $('#guest-phone').val(),
            email: $('#guest-email').val(), 
            address: $('#guest-address').val()
        };
        const id = $('#guest-id').val();
        if (id) {
            // 更新现有客人
            DataService.update(DataService.KEYS.GUESTS, id, guestData);
        } else {
            // 添加新客人
            DataService.add(DataService.KEYS.GUESTS, guestData);
        }
        $('#guest-form-modal').modal('hide');
        loadGuestsTable();
    });
    
    // 删除客人
    function deleteGuest(id) {
        // 检查客人是否有有效预订
        const hasReservations = DataService.getAll(DataService.KEYS.BOOKINGS).some(b => b.managedGuestId == id && (b.status === 'confirmed' || b.status === 'checked-in'));
        if (hasReservations) {
            alert('无法删除该客人，因为该客人有有效预订。请先处理预订。');
            return;
        }
        if (confirm('确定要删除这个客人吗？相关的历史预订信息中的客人姓名将保留，但不再关联此客人记录。')) {
            DataService.remove(DataService.KEYS.GUESTS, id);
            loadGuestsTable();
        }
    }

    // --- 员工管理功能 ---
    function loadStaffTable() {
        const staffList = DataService.getAll(DataService.KEYS.STAFF);
        const $tableBody = $('#staff-table tbody');
        $tableBody.empty();
        staffList.forEach(staff => {
            $tableBody.append(`
                <tr>
                    <td>${staff.id}</td>
                    <td>${staff.name}</td>
                    <td>${staff.position}</td>
                    <td>${staff.phone}</td>
                    <td><span class="badge ${getStatusBadgeClass(staff.status)}">${getStaffStatusText(staff.status)}</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary edit-staff" data-id="${staff.id}"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger delete-staff" data-id="${staff.id}"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `);
        });
    }
    
    // 员工管理相关事件绑定
    $('#add-staff-btn').click(() => openStaffModal());
    $('#staff-table').on('click', '.edit-staff', function() { openStaffModal($(this).data('id')); });
    $('#staff-table').on('click', '.delete-staff', function() { deleteStaff($(this).data('id')); });

    // 打开员工编辑模态框
    function openStaffModal(id = null) {
        $('#staff-form')[0].reset();
        if (id) {
            // 编辑模式
            const staff = DataService.getById(DataService.KEYS.STAFF, id);
            $('#staff-modal-title').text('编辑员工');
            $('#staff-id').val(staff.id);
            $('#staff-name').val(staff.name);
            $('#staff-position').val(staff.position);
            $('#staff-phone').val(staff.phone);
            $('#staff-email').val(staff.email);
            $('#staff-status').val(staff.status);
        } else {
            // 添加模式
            $('#staff-modal-title').text('添加员工');
            $('#staff-id').val('');
        }
        $('#staff-form-modal').modal('show');
    }
    
    // 保存员工信息
    $('#save-staff').click(function() {
        const staffData = {
            name: $('#staff-name').val(), 
            position: $('#staff-position').val(),
            phone: $('#staff-phone').val(), 
            email: $('#staff-email').val(),
            status: $('#staff-status').val()
        };
        const id = $('#staff-id').val();
        if (id) {
            // 更新现有员工
            DataService.update(DataService.KEYS.STAFF, id, staffData);
        } else {
            // 添加新员工
            DataService.add(DataService.KEYS.STAFF, staffData);
        }
        $('#staff-form-modal').modal('hide');
        loadStaffTable();
    });
    
    // 删除员工
    function deleteStaff(id) {
        if (confirm('确定要删除这个员工吗？')) {
            DataService.remove(DataService.KEYS.STAFF, id);
            loadStaffTable();
        }
    }

    // --- 系统设置功能 ---
    function loadSettingsForm() {
        // 加载当前设置
        const settings = DataService.getSettings();
        $('#hotel-name').val(settings.hotelName);
        $('#hotel-address').val(settings.hotelAddress);
        $('#hotel-phone').val(settings.hotelPhone);
        $('#hotel-email').val(settings.hotelEmail);
        $('#hotel-website').val(settings.hotelWebsite);
        $('#hotel-description').val(settings.hotelDescription);
    }
    
    // 保存系统设置
    $('#settings-form').submit(function(e) {
        e.preventDefault();
        const settingsData = {
            hotelName: $('#hotel-name').val(), 
            hotelAddress: $('#hotel-address').val(),
            hotelPhone: $('#hotel-phone').val(), 
            hotelEmail: $('#hotel-email').val(),
            hotelWebsite: $('#hotel-website').val(), 
            hotelDescription: $('#hotel-description').val()
        };
        DataService.saveSettings(settingsData);
        alert('设置已保存');
    });

    // 初始检查登录状态
    checkLoginState();
});