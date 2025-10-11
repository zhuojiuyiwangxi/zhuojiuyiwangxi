const DataService = (function() {
    // 定义所有数据在localStorage中存储的键名
    const KEYS = {
        FRONT_END_USERS: 'hotelFrontEndUsers', // 前端用户数据
        ADMIN_USERS: 'hotelAdminUsers',        // 管理员用户数据
        ROOMS: 'hotelRooms',                   // 房间数据
        BOOKINGS: 'hotelBookings',             // 预订数据
        GUESTS: 'hotelGuests',                 // 客人数据(用于管理页面的CRM功能)
        STAFF: 'hotelStaff',                   // 员工数据
        SETTINGS: 'hotelSettings',             // 酒店设置
        GALLERY_IMAGES: 'hotelGalleryImages'   // 画廊图片数据
    };

    // 从localStorage获取数组数据
    function _get(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }

    // 从localStorage获取单个对象数据
    function _getSingleObject(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : {};
    }

    // 保存数据到localStorage
    function _save(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    // 生成下一个ID(取当前最大ID+1)
    function _getNextId(items) {
        return items.length > 0 ? Math.max(0, ...items.map(i => i.id || 0)) + 1 : 1;
    }

    // 默认数据配置
    const defaultRooms = [
        { id: 1, number: '101', type: "豪华大床房", price: 666, description: "豪华大床房，配备高品质床品和现代化设施", image: "images/room2.jpg", amenities: ["免费WiFi", "空调", "迷你吧", "保险箱"], status: 'available', capacity: 2 },
        { id: 2, number: '201', type: "行政套房", price: 777, description: "豪华行政套房，配备独立起居区和办公区", image: "images/taofang2.jpg", amenities: ["免费WiFi", "空调", "迷你吧", "保险箱", "浴缸"], status: 'available', capacity: 2 },
        { id: 3, number: '301', type: "家庭套房", price: 888, description: "适合家庭入住的两卧室套房，配备儿童设施", image: "images/taofang3.jpg", amenities: ["免费WiFi", "空调", "迷你吧", "保险箱", "儿童床"], status: 'available', capacity: 4 }
    ];

    // 默认画廊图片数据
    const defaultGalleryImages = [
        { src: 'images/datang1.jpg', caption: '酒店大堂' },
        { src: 'images/youyongchi.jpg', caption: '游泳池' },
        { src: 'images/canting.jpg', caption: '餐厅' },
        { src: 'images/sangnafang.jpg', caption: '桑拿中心' },
        { src: 'images/jianshenfang.jpg', caption: '健身房' },
        { src: 'images/huiyishi.jpg', caption: '会议室' }
    ];

    // 默认管理员用户数据
    const defaultAdminUsers = [
        { id: 1, username: 'admin', password: 'admin123', email: 'admin@hotel.com', role: 'admin' }
    ];
    
    // 默认前端用户数据
    const defaultFrontEndUsers = [
        { id: 1, name: "张三", email: "zhangsan@example.com", phone: "13812345678", password: "123456", bookings: [] }, // 'bookings'存储预订ID数组
        { id: 2, name: "李四", email: "lisi@example.com", phone: "13987654321", password: "123456", bookings: [] }
    ];

    // 默认客人数据(用于管理页面的CRM)
    const defaultGuests = [
        {id: 1, name: '张三', idType: '身份证', idNumber: '110101199001011234', phone: '13800138000', email: 'zhangsan@example.com', address: '北京市朝阳区'},
        {id: 2, name: '李四', idType: '护照', idNumber: 'P12345678', phone: '13900139000', email: 'lisi@example.com', address: '上海市浦东新区'}
    ];

    // 默认员工数据
    const defaultStaff = [
        {id: 1, name: '王经理', position: '经理', phone: '13700137000', email: 'manager@hotel.com', status: 'active'},
        {id: 2, name: '李前台', position: '前台', phone: '13600136000', email: 'reception@hotel.com', status: 'active'}
    ];
    
    // 默认酒店设置
    const defaultHotelSettings = {
        hotelName: '豪华酒店',
        hotelAddress: '中国北京市朝阳区建国路88号',
        hotelPhone: '+86 10 8888 8888',
        hotelEmail: 'info@luxuryhotel.com',
        hotelWebsite: 'https://www.luxuryhotel.com',
        hotelDescription: '为您提供尊贵舒适的住宿体验'
    };

    // 默认预订数据(初始为空数组)
    const defaultBookings = []; 

    // 初始化数据(如果localStorage中没有则使用默认数据)
    function init() {
        if (localStorage.getItem(KEYS.ROOMS) === null) _save(KEYS.ROOMS, defaultRooms);
        if (localStorage.getItem(KEYS.GALLERY_IMAGES) === null) _save(KEYS.GALLERY_IMAGES, defaultGalleryImages);
        if (localStorage.getItem(KEYS.ADMIN_USERS) === null) _save(KEYS.ADMIN_USERS, defaultAdminUsers);
        if (localStorage.getItem(KEYS.FRONT_END_USERS) === null) _save(KEYS.FRONT_END_USERS, defaultFrontEndUsers);
        if (localStorage.getItem(KEYS.GUESTS) === null) _save(KEYS.GUESTS, defaultGuests);
        if (localStorage.getItem(KEYS.STAFF) === null) _save(KEYS.STAFF, defaultStaff);
        if (localStorage.getItem(KEYS.SETTINGS) === null) _save(KEYS.SETTINGS, defaultHotelSettings);
        if (localStorage.getItem(KEYS.BOOKINGS) === null) _save(KEYS.BOOKINGS, defaultBookings);
    }

    // 通用CRUD操作

    // 获取指定键的所有数据
    function getAll(key) { return _get(key); }
    
    // 根据ID获取指定键的单个数据项
    function getById(key, id) { return _get(key).find(item => item.id == id); } // 使用==允许字符串/数字比较
    
    // 添加新数据项(自动生成ID)
    function add(key, item) {
        const items = _get(key);
        item.id = _getNextId(items);
        items.push(item);
        _save(key, items);
        return item;
    }
    
    // 更新指定ID的数据项
    function update(key, id, updates) {
        const items = _get(key);
        const index = items.findIndex(item => item.id == id); // 使用==
        if (index !== -1) {
            items[index] = { ...items[index], ...updates }; // 合并更新
            _save(key, items);
            return true;
        }
        return false;
    }

    // 删除指定ID的数据项
    function remove(key, id) {
        let items = _get(key);
        const initialLength = items.length;
        items = items.filter(item => item.id != id); // 使用!=
        _save(key, items);
        return items.length !== initialLength; // 返回是否成功删除
    }

    // 特定于设置的操作(设置是单个对象而非数组)

    // 获取酒店设置
    function getSettings() { return _getSingleObject(KEYS.SETTINGS); }
    
    // 保存酒店设置
    function saveSettings(settingsData) { _save(KEYS.SETTINGS, settingsData); }

    init(); // 加载时初始化数据

    // 暴露公共接口
    return {
        KEYS,            // 所有键名常量
        getAll,          // 获取所有数据
        getById,         // 根据ID获取数据
        add,             // 添加新数据
        update,          // 更新数据
        remove,          // 删除数据
        getSettings,     // 获取设置
        saveSettings     // 保存设置
    };
})();