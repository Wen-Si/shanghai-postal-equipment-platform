/**
 * 设备数据库与参考数据
 * 数据来源：《上海邮政揽投生产场地工艺设备应用的前瞻性研究》
 */

// ===== 设备类型数据库 =====
const EQUIPMENT_DB = {
    three_stage: {
        name: '三段式基础设备',
        icon: '📋',
        category: 'basic',
        components: [
            { name: '伸缩皮带机', spec: '可深入车厢卸货', price: '2-5万/套' },
            { name: '顶部扫码设备', spec: '批量扫描接收', price: '3-6万/台' },
            { name: '直线传输皮带机', spec: '10米标准段', price: '1-3万/条' },
            { name: '移动集货框', spec: '辅助分拣', price: '0.1万/个' }
        ],
        efficiency: '人工分拣为主',
        investment: '5-15万元',
        depreciation: '5年折旧，残值率5%',
        maintenance: '年维保费约设备价值5%',
        deployTime: '1-2周',
        scenarios: '小型网点、改造受限场地、暂不具备自动化条件的网点'
    },

    module_belt: {
        name: '模组带分拣机',
        icon: '🔄',
        category: 'automated',
        efficiency: '6000-7000件/小时',
        efficiencyNum: 6500,
        layouts: ['直线型', 'L型', 'U型', 'C型', 'F型'],
        investment: '低（单个格口约0.8-1万元）',
        investmentRange: [40, 80],
        depreciation: '10年折旧，残值率5%',
        maintenance: '年维保费约设备价值10%（全包）',
        deployTime: '2-4周',
        packageTypes: '大小件通用，异形件兼容',
        noise: '低',
        modularity: '高（模块化设计，可快速拆装复用）',
        energyConsumption: '低',
        pros: ['对场地适用性强（C型/L型/F型）', '设备造价低，模块化运维', '包裹适配范围广，不易卡件', '分拣准确率高，货损率低'],
        cons: ['核心部件为易损件', '内部滚轮易卡异物', '不适用集包袋场景'],
        scenarios: '中小型直投中心、预算有限、业务量中等、以散件处理为主的终端投投网点',
        recommended: true
    },

    cross_belt: {
        name: '直线交叉带分拣机',
        icon: '➡️',
        category: 'automated',
        efficiency: '6000-8000件/小时',
        efficiencyNum: 7000,
        layouts: ['直线型'],
        investment: '中（40-80万元）',
        investmentRange: [40, 80],
        depreciation: '10年折旧，残值率5%',
        maintenance: '年维保费约设备价值10%',
        deployTime: '4-6周',
        packageTypes: '标准件、异形件均可',
        noise: '中',
        modularity: '中等（可按需增加格口与线体长度）',
        energyConsumption: '高',
        pros: ['分拣效率高，错分率低', '货物适配范围广', '直线动线简洁，便于5S管理', '模块化拓展性强'],
        cons: ['末端回流件需人工重新上件', '设备占地较多', '不适合小型或异形场地'],
        scenarios: '布局规整、配套条件完善的大型或中型核心揽投/直投场地'
    },

    flip_tray: {
        name: '环形翻盘分拣机',
        icon: '🎡',
        category: 'automated',
        efficiency: '4000-5000件/小时',
        efficiencyNum: 4500,
        layouts: ['环形'],
        investment: '低（40-60万元）',
        investmentRange: [40, 60],
        depreciation: '10年折旧，残值率5%',
        maintenance: '年维保费约设备价值10%',
        deployTime: '3-5周',
        packageTypes: '异形件、软包、轻飘件、常规大件',
        noise: '中',
        modularity: '中等',
        energyConsumption: '高',
        pros: ['件型兼容性强', '环形+立体皮带组合，空间利用率高', '翻盘式卸料平缓，破损率低', '运行稳定性好'],
        cons: ['分拣效率中等', '环形结构转弯处为高频故障点', '环形动线需连续空间', '一般为单边格口，坪效较低'],
        scenarios: '面积500-1500m²、件型复杂、日均货量中等的揽投部/直投中心'
    },

    narrow_belt: {
        name: '小型直线窄带分拣机',
        icon: '📏',
        category: 'automated',
        efficiency: '6000-8000件/小时',
        efficiencyNum: 7000,
        layouts: ['直线型', '模块拼接'],
        investment: '高',
        investmentRange: [50, 90],
        depreciation: '10年折旧，残值率5%',
        maintenance: '年维保费约设备价值10%',
        deployTime: '2-3周',
        packageTypes: '大小件通用',
        noise: '中',
        modularity: '一般',
        energyConsumption: '高',
        pros: ['整体占地小，线体紧凑', '模块化设计，部署灵活', '运维成本低，回本周期短', '窄带柔性输送，兼容性好'],
        cons: ['末端回流件需人工重新上件', '分拣效率偏低（实测）', '重载能力弱', '多节皮带衔接处易偏移卡顿'],
        scenarios: '常规中小型直投中心，预算有限、效率要求不高的网点'
    },

    circular: {
        name: '圆盘分拣机',
        icon: '⭕',
        category: 'automated',
        efficiency: '3000-4000件/小时',
        efficiencyNum: 3500,
        layouts: ['圆形'],
        investment: '低',
        investmentRange: [35, 55],
        depreciation: '10年折旧，残值率5%',
        maintenance: '年维保费约设备价值10%',
        deployTime: '3-4周',
        packageTypes: '仅规则小件、标准信封件',
        noise: '中',
        modularity: '低',
        energyConsumption: '中',
        pros: ['采购运维成本较低', '适配正方形场地或有立柱场地', '内外圈可分层设置格口'],
        cons: ['件型兼容性弱', '环形动线固定，拥堵疏导难', '运行效率上限低', '非主流设备，综合反馈差'],
        scenarios: '仅适用于正方形场地、标准小件为主、日均货量平稳的老旧网点',
        recommended: false
    },

    reciprocating: {
        name: '往复式分拣机',
        icon: '↔️',
        category: 'automated',
        efficiency: '2000件/小时以下',
        efficiencyNum: 2000,
        layouts: ['直线短段'],
        investment: '极低',
        investmentRange: [20, 35],
        depreciation: '10年折旧，残值率5%',
        maintenance: '年维保费约设备价值5%',
        deployTime: '1-2周',
        packageTypes: '中小件为主',
        noise: '低',
        modularity: '低',
        energyConsumption: '低',
        pros: ['极致节省场地', '设备机损率极低', '造价低廉，运维门槛极低'],
        cons: ['分拣效率最低', '往复运动机械磨损快', '单次分拣货量有限'],
        scenarios: '日均货量极低的微型网点，高录/贵品/文件类适用',
        recommended: false
    }
};

// ===== 评分模型参数（基于报告统计数据）=====
const SCORING_PARAMS = {
    site_area: {
        P25: 150, P50: 300, P75: 500,
        maxScore: 60,
        type: 'sigmoid'
    },
    daily_volume: {
        min: 500, max: 30000,
        weight: 0.4,
        maxScore: 25,
        type: 'linear'
    },
    peak_volume: {
        min: 700, max: 40000,
        weight: 0.35,
        maxScore: 25,
        type: 'linear'
    },
    peak_days: {
        min: 0, max: 30,
        weight: 0.25,
        maxScore: 25,
        type: 'linear'
    },
    per_capita_volume: {
        P25: 150, P50: 250, P75: 350,
        weight: 0.5,
        maxScore: 5,
        type: 'sigmoid'
    },
    utilization: {
        P25: 60, P50: 80, P75: 95,
        weight: 0.5,
        maxScore: 5,
        type: 'sigmoid'
    },
    machine_rate: {
        P25: 75, P50: 88, P75: 95,
        weight: 0.5,
        maxScore: 10,
        type: 'sigmoid'
    },
    route_count: {
        P25: 20, P50: 40, P75: 60,
        weight: 0.5,
        maxScore: 10,
        type: 'sigmoid'
    }
};

// ===== 案例参考数据 =====
const CASE_STUDY = {
    area: 550, height: 6, shape: 'regular', property: 'owned',
    dailyVolume: 25000, peakVolume: 36000, peakDays: 10,
    staffCount: 97, utilization: 85,
    machineRate: 90, routeCount: 74,
    existingEquipment: 'three-stage', budget: 60,
    loadCapacity: 500, powerCapacity: 30
};

// ===== 设备性能对比表 =====
const COMPARISON_TABLE = [
    { name: '模组带分拣机', carrier: '模组带', flexibility: '高', install: '低', efficiency: '6000-7000', types: '大小件通用', price: '低', power: '低', damage: '低', maintenance: '低' },
    { name: '窄带分拣机', carrier: '皮带', flexibility: '一般', install: '中', efficiency: '6000-8000', types: '大小件通用', price: '高', power: '高', damage: '中', maintenance: '中' },
    { name: '直线交叉带分拣机', carrier: '皮带', flexibility: '较差', install: '中', efficiency: '6000-8000', types: '以小件为主', price: '中', power: '高', damage: '中', maintenance: '中' },
    { name: '翻盘式分拣机', carrier: '托盘', flexibility: '一般', install: '中', efficiency: '4000-5000', types: '以小件为主', price: '低', power: '高', damage: '低', maintenance: '中' },
    { name: '圆盘分拣机', carrier: '托盘', flexibility: '低', install: '中', efficiency: '3000-4000', types: '标准小件', price: '低', power: '中', damage: '中', maintenance: '中' },
    { name: '往复式分拣机', carrier: '皮带', flexibility: '低', install: '低', efficiency: '<2000', types: '中小件', price: '极低', power: '低', damage: '低', maintenance: '低' }
];
