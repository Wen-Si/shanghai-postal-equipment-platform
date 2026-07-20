/**
 * 综合评分模型
 * 基于研究报告第五章：上海邮政揽投生产场地工艺设备综合评估体系
 *
 * 评分维度：
 *   场地条件(60%) - 操作区域面积 → Sigmoid非线性
 *   业务压力(25%) - 日均处理量/峰值量/高峰天数 → Min-Max线性
 *   人工压力(5%)  - 人均处理量/场地利用率 → Sigmoid非线性
 *   自动化适配(10%) - 可上机率/分拣道段数 → Sigmoid非线性
 */

const ScoringModel = {

    /**
     * Sigmoid函数 - 反映边际效益递减规律
     * @param {number} x - 实际值
     * @param {number} x0 - 业务基准值(P50)
     * @param {number} k - 陡峭系数（由P25/P75推导）
     * @returns {number} 0~1之间的标准化得分
     */
    sigmoid(x, x0, k) {
        return 1 / (1 + Math.exp(-k * (x - x0)));
    },

    /**
     * 根据P25/P50/P75推导Sigmoid陡峭系数
     * 使P25处得分≈0.25，P75处得分≈0.75
     */
    calcSteepness(P25, P50, P75) {
        // 在P75处：sigmoid(P75, P50, k) = 0.75
        // 1/(1+e^(-k*(P75-P50))) = 0.75
        // e^(-k*(P75-P50)) = 1/3
        // -k*(P75-P50) = ln(1/3) = -ln(3)
        // k = ln(3) / (P75-P50)
        const range = P75 - P50;
        if (range === 0) return 0.01;
        return Math.log(3) / range;
    },

    /**
     * Min-Max线性标准化
     */
    minMax(x, min, max) {
        if (max === min) return 0.5;
        let val = (x - min) / (max - min);
        return Math.max(0, Math.min(1, val));
    },

    /**
     * 计算场地条件得分（满分60分）
     * 指标：操作区域面积 → Sigmoid
     */
    calcSiteScore(area) {
        const params = SCORING_PARAMS.site_area;
        const k = this.calcSteepness(params.P25, params.P50, params.P75);
        const normalized = this.sigmoid(area, params.P50, k);
        // 将sigmoid输出映射到0~60分
        // sigmoid(P25)≈0.25, sigmoid(P50)=0.5, sigmoid(P75)≈0.75
        // 映射：score = normalized * maxScore * 2，上限为maxScore
        let score = normalized * params.maxScore * 2;
        score = Math.min(params.maxScore, score);
        score = Math.max(0, score);
        return Math.round(score * 10) / 10;
    },

    /**
     * 计算业务压力得分（满分25分）
     * 指标：日均处理量(40%) + 峰值量(35%) + 高峰天数(25%) → 线性加权
     */
    calcBusinessScore(dailyVolume, peakVolume, peakDays) {
        const p1 = SCORING_PARAMS.daily_volume;
        const p2 = SCORING_PARAMS.peak_volume;
        const p3 = SCORING_PARAMS.peak_days;

        const s1 = this.minMax(dailyVolume, p1.min, p1.max);
        const s2 = this.minMax(peakVolume, p2.min, p2.max);
        const s3 = this.minMax(peakDays, p3.min, p3.max);

        const combined = s1 * p1.weight + s2 * p2.weight + s3 * p3.weight;
        const score = combined * p1.maxScore;
        return Math.round(score * 10) / 10;
    },

    /**
     * 计算人工压力得分（满分5分）
     * 指标：人均处理量(50%) + 场地利用率(50%) → Sigmoid
     */
    calcLaborScore(staffCount, dailyVolume, utilization) {
        const perCapita = staffCount > 0 ? dailyVolume / staffCount : 0;

        const p1 = SCORING_PARAMS.per_capita_volume;
        const p2 = SCORING_PARAMS.utilization;

        const k1 = this.calcSteepness(p1.P25, p1.P50, p1.P75);
        const k2 = this.calcSteepness(p2.P25, p2.P50, p2.P75);

        const s1 = this.sigmoid(perCapita, p1.P50, k1);
        const s2 = this.sigmoid(utilization, p2.P50, k2);

        const combined = s1 * p1.weight + s2 * p2.weight;
        const score = combined * p1.maxScore * 2; // 映射到0~5
        return Math.round(Math.min(p1.maxScore, score) * 10) / 10;
    },

    /**
     * 计算自动化适配得分（满分10分）
     * 指标：可上机率(50%) + 分拣道段数(50%) → Sigmoid
     */
    calcAutomationScore(machineRate, routeCount) {
        const p1 = SCORING_PARAMS.machine_rate;
        const p2 = SCORING_PARAMS.route_count;

        const k1 = this.calcSteepness(p1.P25, p1.P50, p1.P75);
        const k2 = this.calcSteepness(p2.P25, p2.P50, p2.P75);

        const s1 = this.sigmoid(machineRate, p1.P50, k1);
        const s2 = this.sigmoid(routeCount, p2.P50, k2);

        const combined = s1 * p1.weight + s2 * p2.weight;
        const score = combined * p1.maxScore * 2;
        return Math.round(Math.min(p1.maxScore, score) * 10) / 10;
    },

    /**
     * 综合评分计算
     * @param {Object} params - 场地参数
     * @returns {Object} 评分结果
     */
    calculate(params) {
        const siteScore = this.calcSiteScore(params.area);
        const businessScore = this.calcBusinessScore(
            params.dailyVolume, params.peakVolume, params.peakDays
        );
        const laborScore = this.calcLaborScore(
            params.staffCount, params.dailyVolume, params.utilization
        );
        const autoScore = this.calcAutomationScore(
            params.machineRate, params.routeCount
        );

        const totalScore = Math.round(
            (siteScore + businessScore + laborScore + autoScore) * 10
        ) / 10;

        // 评分等级判定
        let grade, recommendation;
        if (totalScore >= 80) {
            grade = '一级优先配置场地';
            recommendation = '强烈建议配置自动化分拣设备';
        } else if (totalScore >= 65) {
            grade = '二级推荐配置场地';
            recommendation = '建议配置自动化分拣设备';
        } else if (totalScore >= 50) {
            grade = '三级待验证场地';
            recommendation = '需结合建设条件综合遴选后确定';
        } else if (totalScore >= 35) {
            grade = '四级储备场地';
            recommendation = '暂缓自动化配置，以优化人工作业为主';
        } else {
            grade = '五级基础保障场地';
            recommendation = '配置三段式基础设备，人工分拣为核心';
        }

        return {
            total: totalScore,
            site: siteScore,
            business: businessScore,
            labor: laborScore,
            automation: autoScore,
            grade: grade,
            recommendation: recommendation,
            isAutomated: totalScore >= CONFIG.SCORE_THRESHOLD,
            perCapitaVolume: params.staffCount > 0 ?
                Math.round(params.dailyVolume / params.staffCount) : 0
        };
    }
};
