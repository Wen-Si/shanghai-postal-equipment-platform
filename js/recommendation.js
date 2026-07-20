/**
 * 设备配置推荐引擎
 * 基于研究报告第六章：上海邮政揽投场地工艺设备配置方案
 *
 * 两类配置模板：
 *   1. 非自动化设备配置场地模板（综合评分<50分）
 *   2. 自动化设备配置场地模板（综合评分≥50分）
 */

const RecommendationEngine = {

    /**
     * 生成设备配置模板
     * @param {Object} params - 场地参数
     * @param {Object} scores - 评分结果
     * @returns {Array} 模板列表
     */
    generate(params, scores) {
        if (scores.isAutomated) {
            return this.generateAutomatedTemplates(params, scores);
        } else {
            return this.generateBasicTemplate(params, scores);
        }
    },

    /**
     * 生成非自动化设备配置模板
     */
    generateBasicTemplate(params, scores) {
        // 根据面积推荐传输设备类型
        let beltType = '直线皮带机';
        let beltLength = 10;
        let beltCount = 2;

        if (params.area < 100) {
            beltType = '短段直线皮带机';
            beltLength = 5;
            beltCount = 1;
        } else if (params.area > 300) {
            beltType = '伸缩皮带机 + 直线皮带机';
            beltLength = 10;
            beltCount = 2;
        }

        const scannerCount = params.dailyVolume > 10000 ? 2 : 1;
        const totalCost = 5 + (beltCount * 2) + (scannerCount * 4);

        return [{
            type: 'non_automated',
            typeName: '非自动化设备配置模板',
            badge: '基础保障方案',
            recommended: true,
            equipment: EQUIPMENT_DB.three_stage,
            config: {
                beltType: beltType,
                beltLength: beltLength,
                beltCount: beltCount,
                scannerCount: scannerCount,
                frameCount: Math.ceil(params.routeCount / 5),
                totalCost: totalCost
            },
            details: {
                '配置标准': '装卸设备 + 顶扫 + 传输皮带机三段式组合',
                '分拣方式': '人工分拣为核心，设备辅助扫码输送',
                '投运模式': params.property === 'owned' ?
                    '市分公司投入，依托厂商和入围维保单位运维' :
                    '市分公司投入，租赁场地配套基础设备',
                '适用场景': `综合评分${scores.total}分，${scores.grade}`,
                '设备组合': `${beltCount}条${beltLength}米${beltType}、${scannerCount}台顶扫设备、${Math.ceil(params.routeCount / 5)}个移动集货框`,
                '预估投资': `${totalCost}万元`
            }
        }];
    },

    /**
     * 生成自动化设备配置模板（可给出多个方案）
     */
    generateAutomatedTemplates(params, scores) {
        const templates = [];
        const routes = params.routeCount;

        // 计算所需分拣格口数（道段数 + 驿站格口 + 缓冲）
        const requiredSlots = Math.ceil(routes * 1.0) + 4; // +4 for buffer/驿站
        const futureSlots = Math.ceil(routes * 1.1) + 8;

        // 计算分拣机长度估算（每格口约0.45米）
        const sorterLength = Math.ceil(requiredSlots * 0.45);
        const futureLength = Math.ceil(futureSlots * 0.45);

        // 计算供件人员数
        const sorterStaff = params.dailyVolume > 20000 ? 3 : 2;

        // === 方案一：模组带分拣机（首选推荐） ===
        const moduleBeltCost = this.estimateCost('module_belt', requiredSlots, sorterLength);
        templates.push({
            type: 'automated',
            typeName: '自动化设备配置模板 - 方案A',
            badge: '⭐ 首选推荐',
            recommended: true,
            equipment: EQUIPMENT_DB.module_belt,
            config: {
                sorterType: '模组带分拣机',
                sorterLength: sorterLength,
                slots: requiredSlots,
                futureSlots: futureSlots,
                sorterStaff: sorterStaff,
                layout: this.recommendLayout(params),
                scannerType: '五面阵面扫描相机',
                scannerCount: 1,
                beltHeight: 2000,
                beltSpeed: 1.5,
                totalCost: moduleBeltCost,
                futureCost: this.estimateCost('module_belt', futureSlots, futureLength),
                investMode: params.property === 'owned' ? '自主采购' : '外包待机入网（轻资产模式）'
            },
            details: {
                '设备类型': '模组带分拣机（模块化设计）',
                '分拣效率': '6000-7000件/小时',
                '分拣格口': `${requiredSlots}个（远期可扩至${futureSlots}个）`,
                '主线长度': `${sorterLength}米`,
                '布局形式': this.recommendLayout(params),
                '分拣带高度': '2000mm（利用立体空间增大格口堆货）',
                '主线速度': '1.5m/s',
                '识别配套': '1套五面阵面扫描相机',
                '适配件型': '最小150×150×30mm，最大600×500×400mm，0.1-60KG',
                '操作人员': `${sorterStaff}人（负责供件）`,
                '投运模式': params.property === 'owned' ?
                    '自主采购，方便后期扩容' :
                    '外包待机入网轻资产模式',
                '预估投资': `${moduleBeltCost}万元`,
                '远期扩容': `扩至${futureSlots}格口，投资约${this.estimateCost('module_belt', futureSlots, futureLength)}万元`,
                '部署周期': '2-4周'
            }
        });

        // === 方案二：备选设备（根据场地条件推荐） ===
        let altEquipment, altReason;

        if (params.area >= 800 && params.shape === 'regular') {
            // 大型规整场地 → 直线交叉带
            altEquipment = EQUIPMENT_DB.cross_belt;
            altReason = '场地面积充足且形状规整，直线交叉带分拣机可提供更高分拣效率';
        } else if (params.area >= 500 && params.area < 800 && params.shape !== 'regular') {
            // 中型异形场地 → 翻盘分拣机
            altEquipment = EQUIPMENT_DB.flip_tray;
            altReason = '场地中等且形状不规则，翻盘分拣机件型兼容性强，环形布局适配异形空间';
        } else if (params.area < 500 && params.budget && params.budget < 50) {
            // 小型场地低预算 → 窄带分拣机
            altEquipment = EQUIPMENT_DB.narrow_belt;
            altReason = '场地较小且预算有限，窄带分拣机占地小、部署灵活';
        } else {
            // 默认备选：翻盘分拣机
            altEquipment = EQUIPMENT_DB.flip_tray;
            altReason = '作为模组带分拣机无法配置时的次要选型，翻盘分拣机件型兼容性强';
        }

        const altCost = this.estimateCost(
            this.getEquipmentKey(altEquipment), requiredSlots, sorterLength
        );

        templates.push({
            type: 'automated',
            typeName: '自动化设备配置模板 - 方案B',
            badge: '备选方案',
            recommended: false,
            equipment: altEquipment,
            config: {
                sorterType: altEquipment.name,
                sorterLength: sorterLength,
                slots: requiredSlots,
                sorterStaff: sorterStaff,
                totalCost: altCost,
                investMode: params.property === 'owned' ? '自主采购' : '外包待机入网'
            },
            details: {
                '设备类型': altEquipment.name,
                '分拣效率': altEquipment.efficiency,
                '分拣格口': `${requiredSlots}个`,
                '选型理由': altReason,
                '投运模式': params.property === 'owned' ? '自主采购' : '外包待机入网',
                '预估投资': `${altCost}万元`,
                '部署周期': altEquipment.deployTime
            }
        });

        return templates;
    },

    /**
     * 根据场地形状推荐布局
     */
    recommendLayout(params) {
        switch(params.shape) {
            case 'regular': return '直线型';
            case 'L-shape': return 'L型';
            case 'U-shape': return 'U型';
            case 'irregular': return 'C型或F型（灵活适配）';
            default: return '直线型';
        }
    },

    /**
     * 投资成本估算
     */
    estimateCost(equipmentKey, slots, length) {
        const eq = EQUIPMENT_DB[equipmentKey];
        if (!eq) return 50;

        if (equipmentKey === 'module_belt') {
            // 模组带：基础30万 + 格口0.8万/个 + 五面扫8万
            return Math.round(30 + slots * 0.8 + 8);
        } else if (equipmentKey === 'cross_belt') {
            // 直线交叉带：基础35万 + 格口1万/个 + 扫描8万
            return Math.round(35 + slots * 1.0 + 8);
        } else if (equipmentKey === 'flip_tray') {
            // 翻盘：基础30万 + 格口0.6万/个 + 扫描6万
            return Math.round(30 + slots * 0.6 + 6);
        } else if (equipmentKey === 'narrow_belt') {
            // 窄带：基础35万 + 格口1.2万/个 + 扫描8万
            return Math.round(35 + slots * 1.2 + 8);
        } else if (equipmentKey === 'circular') {
            // 圆盘：基础25万 + 格口0.4万/个 + 扫描5万
            return Math.round(25 + slots * 0.4 + 5);
        } else if (equipmentKey === 'reciprocating') {
            // 往复式：基础15万 + 格口0.3万/个
            return Math.round(15 + slots * 0.3);
        }
        return 50;
    },

    /**
     * 根据设备对象获取key
     */
    getEquipmentKey(equipment) {
        for (const [key, value] of Object.entries(EQUIPMENT_DB)) {
            if (value === equipment) return key;
        }
        return 'module_belt';
    },

    /**
     * 生成投资效益分析
     */
    analyzeInvestment(params, scores, template) {
        if (template.type !== 'automated') return null;

        const dailyVolume = params.dailyVolume;
        const config = template.config;
        const investment = config.totalCost;

        // 日均运营成本测算
        const staffCost = config.sorterStaff * 300; // 供件人员日薪
        const powerCost = 6 * 5 * 1.0; // 电费：6度/小时×5小时
        const depreciation = (investment * 0.95) / (10 * 365); // 日均折旧
        const maintenance = (investment * 0.10) / 365; // 日均维保

        // 人工成本节省
        const laborSaving = dailyVolume * 0.03; // 每件节省0.03元

        const dailyCost = staffCost + powerCost + depreciation + maintenance;
        const dailyNet = laborSaving - dailyCost;
        const annualNet = dailyNet * 365;

        // 回收期
        const paybackDays = dailyNet > 0 ? Math.ceil(investment * 10000 / dailyNet) : null;
        const paybackYears = paybackDays ? (paybackDays / 365).toFixed(1) : null;

        return {
            investment: investment,
            dailyCost: Math.round(dailyCost),
            dailySaving: Math.round(laborSaving),
            dailyNet: Math.round(dailyNet),
            annualNet: Math.round(annualNet),
            paybackDays: paybackDays,
            paybackYears: paybackYears,
            staffCost: staffCost,
            powerCost: Math.round(powerCost),
            depreciation: Math.round(depreciation),
            maintenance: Math.round(maintenance)
        };
    }
};
