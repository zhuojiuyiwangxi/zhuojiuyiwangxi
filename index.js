$(document).ready(function() {
    let currentFrontEndUser = null; // 当前前端用户
    const CURRENT_USER_KEY = 'currentHotelUser'; // localStorage中存储当前用户的键名

    // 从localStorage加载当前用户
    function loadCurrentUser() {
        const storedUser = localStorage.getItem(CURRENT_USER_KEY);
        if (storedUser) {
            currentFrontEndUser = JSON.parse(storedUser);
        }
    }

    // 保存当前用户到localStorage
    function saveCurrentUser() {
        if (currentFrontEndUser) {
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentFrontEndUser));
        } else {
            localStorage.removeItem(CURRENT_USER_KEY);
        }
    }
    
    // 初始化Swiper轮播图
    const swiper = new Swiper('.swiper', {
        loop: true, // 循环播放
        autoplay: { // 自动播放
            delay: 3000, // 3秒切换一次
        },
        pagination: { // 分页器
            el: '.swiper-pagination',
            clickable: true, // 可点击
        },
        navigation: { // 导航按钮
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });

    // 更新用户状态显示
    function updateUserStatusDisplay() {
        if (currentFrontEndUser) {
            // 已登录状态
            $('#username-display').text(currentFrontEndUser.name);
            $('#logout-btn').show(); // 显示退出按钮
            $('#my-bookings').show(); // 显示我的预订
            $('.dropdown-menu li:has(a[data-bs-target="#loginModal"]), .dropdown-menu li:has(a[data-bs-target="#registerModal"])').hide(); // 隐藏登录注册菜单项

            // 自动填充预订表单中的用户信息
            $('#guest-name').val(currentFrontEndUser.name);
            $('#guest-contact').val(currentFrontEndUser.phone);
        } else {
            // 未登录状态
            $('#username-display').text('未登录');
            $('#logout-btn').hide(); // 隐藏退出按钮
            $('#my-bookings').hide(); // 隐藏我的预订
            $('.dropdown-menu li:has(a[data-bs-target="#loginModal"]), .dropdown-menu li:has(a[data-bs-target="#registerModal"])').show(); // 显示登录注册菜单项

            // 清空预订表单中的用户信息
            $('#guest-name').val('');
            $('#guest-contact').val('');
        }
    }

    // 加载房间列表
    function loadRooms() {
        const rooms = DataService.getAll(DataService.KEYS.ROOMS);
        const $roomList = $('#room-list');
        $roomList.empty();

        rooms.forEach(room => {
            if (room.status !== 'available' && room.status !== 'occupied') return; // 只显示可用或已入住的房间
            
            $roomList.append(
                `
                <div class="col-md-4 mb-4">
                    <div class="card room-card h-100">
                        <img src="${room.image}" class="card-img-top" alt="${room.type}" style="height: 200px; object-fit: cover;">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${room.type}</h5>
                            <p class="card-text">${room.description}</p>
                            <div class="mb-3">
                                ${room.amenities.map(amenity =>
                                    `<span class="badge bg-primary me-1">${amenity}</span>`
                                ).join('')}
                            </div>
                            <div class="d-flex justify-content-between align-items-center mt-auto">
                                <span class="h5 text-primary">¥${room.price}/晚</span>
                                <button class="btn btn-sm btn-outline-primary book-room" data-room-type="${room.type}">立即预订</button>
                            </div>
                        </div>
                    </div>
                </div>
            `
            );
        });

        // 绑定房间预订按钮点击事件
        $('.book-room').click(function() {
            const roomType = $(this).data('room-type');
            $('#room-type').val(roomType);
            // 滚动到预订表单
            $('html, body').animate({
                scrollTop: $('#booking').offset().top
            }, 500);
        });

        // 填充房间类型下拉框
        const $roomTypeDropdown = $('#room-type');
        $roomTypeDropdown.empty();
        rooms.forEach(room => {
             if (room.status === 'available' || room.status === 'occupied') { // 只在下拉框中显示可用或已入住的房间
                $roomTypeDropdown.append(`<option value="${room.type}">${room.type} - ¥${room.price}/晚</option>`);
             }
        });
    }

    // 加载图片画廊
    function loadGallery() {
        const galleryImages = DataService.getAll(DataService.KEYS.GALLERY_IMAGES);
        const $galleryContainer = $('#gallery-container');
        $galleryContainer.empty();

        galleryImages.forEach(image => {
            $galleryContainer.append(
                `
                <div class="col-md-4 mb-4 gallery-item">
                     <img src="${image.src}" alt="${image.caption}" class="img-fluid rounded gallery-image" style="cursor:pointer;" data-bs-toggle="modal" data-bs-target="#imagePreviewModal" data-image-src="${image.src}" data-image-caption="${image.caption}">
                     <p class="text-center mt-2 gallery-caption">${image.caption}</p>
                </div>
                `
            );
        });
        
        // 如果图片预览模态框不存在，则添加
        if ($('#imagePreviewModal').length === 0) {
            $('body').append(`
                <div class="modal fade" id="imagePreviewModal" tabindex="-1" aria-labelledby="imagePreviewModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-lg modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="imagePreviewModalLabel">图片预览</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body text-center">
                                <img src="" id="modalImage" class="img-fluid" alt="预览图片">
                                <p id="modalCaption" class="mt-2"></p>
                            </div>
                        </div>
                    </div>
                </div>
            `);

            // 绑定图片点击事件
            $('#gallery-container').on('click', '.gallery-image', function() {
                const src = $(this).data('image-src');
                const caption = $(this).data('image-caption');
                $('#modalImage').attr('src', src);
                $('#modalCaption').text(caption);
            });
        }
    }

    // 格式化日期为YYYY-MM-DD
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // 初始化日期输入框
    function initDateInputs() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayStr = formatDate(today);
        const tomorrowStr = formatDate(tomorrow);

        // 设置默认日期和最小日期
        $('#check-in').val(todayStr).attr('min', todayStr);
        $('#check-out').val(tomorrowStr).attr('min', tomorrowStr);
        $('#checkout-date').val(todayStr).attr('min', todayStr);

        // 入住日期变化时更新离店日期的最小值
        $('#check-in').on('change', function() {
            const checkInDate = new Date($(this).val());
            const minCheckOutDate = new Date(checkInDate);
            minCheckOutDate.setDate(minCheckOutDate.getDate() + 1);
            $('#check-out').attr('min', formatDate(minCheckOutDate)).val(formatDate(minCheckOutDate));
        });
    }

    // 登录表单提交
    $('#login-form').submit(function(e) {
        e.preventDefault();
        const emailOrPhone = $('#login-email').val().trim();
        const password = $('#login-password').val().trim();
        
        // 查找匹配的用户
        const users = DataService.getAll(DataService.KEYS.FRONT_END_USERS);
        const user = users.find(u => (u.email === emailOrPhone || u.phone === emailOrPhone) && u.password === password);

        if (user) {
            currentFrontEndUser = user;
            if ($('#remember-me').is(':checked')) {
                saveCurrentUser(); // 记住我则保存到localStorage
            } else {
                sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentFrontEndUser)); // 否则只保存到sessionStorage
            }
            updateUserStatusDisplay();
            $('#loginModal').modal('hide');
            $('#login-form')[0].reset();
        } else {
            alert('用户名或密码错误！');
        }
    });

    // 注册表单提交
    $('#register-form').submit(function(e) {
        e.preventDefault();
        const name = $('#register-name').val().trim();
        const email = $('#register-email').val().trim();
        const phone = $('#register-phone').val().trim();
        const password = $('#register-password').val().trim();
        const confirmPassword = $('#register-confirm-password').val().trim();

        // 验证两次密码是否一致
        if (password !== confirmPassword) {
            alert('两次输入的密码不一致！');
            return;
        }

        // 检查邮箱和手机号是否已被注册
        const users = DataService.getAll(DataService.KEYS.FRONT_END_USERS);
        if (users.some(u => u.email === email)) {
            alert('该邮箱已被注册！');
            return;
        }
        if (users.some(u => u.phone === phone)) {
            alert('该手机号已被注册！');
            return;
        }

        // 添加新用户并自动登录
        const newUser = DataService.add(DataService.KEYS.FRONT_END_USERS, { name, email, phone, password, bookings: [] });
        currentFrontEndUser = newUser;
        saveCurrentUser(); // 自动登录并记住
        updateUserStatusDisplay();
        $('#registerModal').modal('hide');
        $('#register-form')[0].reset();
        alert('注册成功！您已自动登录。');
    });

    // 退出登录
    $('#logout-btn').click(function() {
        currentFrontEndUser = null;
        localStorage.removeItem(CURRENT_USER_KEY);
        sessionStorage.removeItem(CURRENT_USER_KEY);
        updateUserStatusDisplay();
        alert('您已成功退出登录。');
    });

    // 预订表单提交
    $('#reservation-form').submit(function(e) {
        e.preventDefault();
        // 检查是否登录或填写了客人姓名
        if (!currentFrontEndUser && !$('#guest-name').val().trim()) {
             alert('请先登录或填写客人姓名再进行预订！');
             if(!currentFrontEndUser) $('#loginModal').modal('show');
             return;
        }

        // 获取表单数据
        const bookedByName = $('#guest-name').val().trim();
        const bookedByContact = $('#guest-contact').val().trim();
        const checkIn = $('#check-in').val();
        const checkOut = $('#check-out').val();
        const adults = $('#adults').val();
        const children = $('#children').val();
        const roomType = $('#room-type').val();
        const requests = $('#special-requests').val().trim();

        // 验证必填字段
        if (!bookedByName || !bookedByContact || !checkIn || !checkOut || !roomType) {
            alert('请填写所有必填预订字段！');
            return;
        }
        
        // 查找所选房间
        const rooms = DataService.getAll(DataService.KEYS.ROOMS);
        const selectedRoom = rooms.find(r => r.type === roomType && (r.status === 'available' || r.status === 'occupied'));

        if (!selectedRoom) {
            alert('所选房型当前不可用，请选择其他房型。');
            return;
        }

        // 创建新预订对象
        const newBooking = {
            bookedByName,
            bookedByContact,
            frontEndUserId: currentFrontEndUser ? currentFrontEndUser.id : null,
            roomId: selectedRoom.id,
            roomType: selectedRoom.type,
            checkIn,
            checkOut,
            adults: parseInt(adults),
            children: parseInt(children),
            requests,
            status: 'confirmed',
            createdAt: new Date().toISOString(),
            bookingSource: 'frontend'
        };

        // 添加预订记录
        const bookingResult = DataService.add(DataService.KEYS.BOOKINGS, newBooking);

        // 如果已登录，更新用户的预订记录
        if (currentFrontEndUser) {
            currentFrontEndUser.bookings.push(bookingResult.id);
            DataService.update(DataService.KEYS.FRONT_END_USERS, currentFrontEndUser.id, { bookings: currentFrontEndUser.bookings });
            saveCurrentUser();
        }

        // 显示预订成功模态框
        $('#booking-number').text(bookingResult.id);
        $('#booking-success').modal('show');
        $(this)[0].reset();
        initDateInputs(); // 重置日期
        
        // 如果已登录，重新填充用户信息
        if (currentFrontEndUser) {
            $('#guest-name').val(currentFrontEndUser.name);
            $('#guest-contact').val(currentFrontEndUser.phone);
        }
    });

    // 退房/反馈表单提交
    $('#checkout-form').submit(function(e) {
        e.preventDefault();
        const reservationId = $('#reservation-id').val().trim();
        const feedback = $('#feedback').val().trim();

        // 验证预订编号
        if (!reservationId) {
            alert('请输入预订编号！');
            return;
        }

        // 查找预订记录
        const booking = DataService.getById(DataService.KEYS.BOOKINGS, reservationId);

        if (!booking) {
            alert('未找到该预订记录！');
            return;
        }
        
        // 添加客户反馈
        DataService.update(DataService.KEYS.BOOKINGS, reservationId, { 
            feedback: (booking.feedback ? booking.feedback + "\n" : "") + `客户反馈 (${new Date().toLocaleDateString()}): ${feedback}`
        });

        // 显示成功消息
        $('#checkout-success').modal('show');
        $(this)[0].reset();
        initDateInputs();
    });

    // 查看我的预订
    $('#my-bookings').click(function() {
        if (!currentFrontEndUser) return;

        // 获取当前用户的所有预订
        const allBookings = DataService.getAll(DataService.KEYS.BOOKINGS);
        const userBookings = allBookings.filter(b => b.frontEndUserId === currentFrontEndUser.id);

        if (userBookings.length === 0) {
            alert('您还没有任何预订记录。');
            return;
        }

        // 构建预订列表字符串
        let bookingList = '您的预订记录：\n\n';
        userBookings.forEach(booking => {
            bookingList += `预订编号: ${booking.id}\n`;
            bookingList += `房间类型: ${booking.roomType}\n`;
            bookingList += `入住日期: ${booking.checkIn}\n`;
            bookingList += `离店日期: ${booking.checkOut}\n`;
            bookingList += `状态: ${getBookingStatusText(booking.status)}\n\n`;
        });
        alert(bookingList);
    });
    
    // 获取预订状态文本
    function getBookingStatusText(status) {
        switch(status) {
            case 'confirmed': return '已确认';
            case 'checked-in': return '已入住';
            case 'completed': return '已完成';
            case 'cancelled': return '已取消';
            default: return status;
        }
    }

    // 联系表单提交
    $('#contact-form').submit(function(e) {
        e.preventDefault();
        alert('感谢您的留言！我们会尽快与您联系。');
        $(this)[0].reset();
    });

    // 加载酒店信息
    function loadHotelInformation() {
        const settings = DataService.getSettings();

        // 更新酒店名称
        if (settings.hotelName) {
            $('#info-page-title').text(settings.hotelName);
            $('#info-hotel-name-nav').text(settings.hotelName);
            $('#info-hotel-name-header').text(settings.hotelName);
            $('#info-hotel-name-footer').text(settings.hotelName);
        }
        if (settings.hotelWebsite) {
            $('#info-hotel-name-nav').attr('href', settings.hotelWebsite); // 更新导航栏链接
        }

        // 更新酒店描述
        if (settings.hotelDescription) {
            $('#info-hotel-description-header').text(settings.hotelDescription);
            $('#info-hotel-description-about').text(settings.hotelDescription); // 同时更新"关于我们"中的描述
        }
        
        // 更新联系信息
        if (settings.hotelAddress) {
            $('#info-hotel-address-contact').text(settings.hotelAddress);
        }
        if (settings.hotelPhone) {
            $('#info-hotel-phone-contact').text(settings.hotelPhone);
        }
        if (settings.hotelEmail) {
            $('#info-hotel-email-contact').text(settings.hotelEmail);
        }
        
        // 更新版权年份
        $('#info-current-year').text(new Date().getFullYear());
    }

    // 初始加载
    loadCurrentUser(); // 首先加载用户
    loadHotelInformation(); // 加载酒店信息
    loadRooms(); // 加载房间
    loadGallery(); // 加载画廊
    initDateInputs(); // 初始化日期输入
    updateUserStatusDisplay(); // 最后更新用户状态显示
});