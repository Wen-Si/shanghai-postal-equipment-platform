/**
 * 平台配置文件
 * AI引擎：智谱GLM-4.5-Flash
 */
const CONFIG = {
    // 智谱AI API配置
    AI_API_URL: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    AI_API_KEY: '325d6fa364954d2e871c30ba95b553bd.KBdQdqgJgELJBhnv',
    AI_MODEL: 'glm-4.5-flash',
    AI_TEMPERATURE: 0.7,
    AI_MAX_TOKENS: 4096,

    // 评分模型权重（来自研究报告）
    WEIGHTS: {
        site: 0.60,        // 场地条件
        business: 0.25,    // 业务压力
        labor: 0.05,       // 人工压力
        automation: 0.10   // 自动化适配能力
    },

    // 评分阈值
    SCORE_THRESHOLD: 50,  // 自动化配置门槛分值
};
