/**
 * AI报告生成模块
 * 调用智谱GLM-4.5-Flash大模型生成设备配置分析报告
 */

const AIReport = {

    /**
     * 调用GLM-4.5-Flash生成分析报告
     * @param {Object} params - 场地参数
     * @param {Object} scores - 评分结果
     * @param {Array} templates - 设备配置模板
     * @returns {Promise<string>} Markdown格式报告
     */
    async generate(params, scores, templates) {
        const prompt = this.buildPrompt(params, scores, templates);

        const requestBody = {
            model: CONFIG.AI_MODEL,
            messages: [
                {
                    role: 'system',
                    content: '你是一位资深的邮政物流工艺设备配置专家，擅长根据场地条件和业务需求，提供专业的设备配置方案和投资建议。你的分析需要基于上海邮政揽投场地的实际情况，参考行业最佳实践，给出具体、可操作的配置建议。请使用Markdown格式输出报告。'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: CONFIG.AI_TEMPERATURE,
            max_tokens: CONFIG.AI_MAX_TOKENS
        };

        try {
            const response = await fetch(CONFIG.AI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + CONFIG.AI_API_KEY
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('AI API Error:', response.status, errorText);
                throw new Error('API请求失败 (' + response.status + '): ' + errorText.substring(0, 200));
            }

            const data = await response.json();

            if (data.choices && data.choices.length > 0) {
                return data.choices[0].message.content;
            } else {
                throw new Error('AI返回数据格式异常');
            }
        } catch (error) {
            console.error('AI Report Generation Error:', error);
            throw error;
        }
    },

    /**
     * 构建AI提示词
     */
    buildPrompt(params, scores, templates) {
        const templateInfo = templates.map(function(t, i) {
            var details = Object.entries(t.details || {})
                .map(function(entry) { return '- ' + entry[0] + ': ' + entry[1]; })
                .join('\n');
            return '### 方案' + String.fromCharCode(65 + i) + '：' + t.typeName + '\n' + details;
        }).join('\n\n');

        var shapeMap = {
            'regular': '规整矩形',
            'L-shape': 'L型',
            'U-shape': 'U型',
            'irregular': '不规则异形'
        };

        var equipMap = {
            'none': '无设备',
            'three-stage': '三段式设备',
            'sorter': '已有分拣机'
        };

        return '请根据以下上海邮政揽投场地的参数和评分结果，生成一份详细的设备配置分析报告。\n\n' +
            '## 场地基础参数\n\n' +
            '**场地条件：**\n' +
            '- 操作区域面积：' + params.area + ' m²\n' +
            '- 场地形状：' + (shapeMap[params.shape] || params.shape) + '\n' +
            '- 净层高：' + params.height + ' m\n' +
            '- 产权类型：' + (params.property === 'owned' ? '自有场地' : '租赁场地') + '\n' +
            '- 楼层承重：' + params.loadCapacity + ' kg/m²\n' +
            '- 用电容量：' + params.powerCapacity + ' kW\n\n' +
            '**业务参数：**\n' +
            '- 日均处理量：' + params.dailyVolume + ' 件\n' +
            '- 旺季峰值量：' + params.peakVolume + ' 件\n' +
            '- 高峰持续天数：' + params.peakDays + ' 天\n\n' +
            '**人员与作业：**\n' +
            '- 生产人员数量：' + params.staffCount + ' 人\n' +
            '- 人均日处理量：' + scores.perCapitaVolume + ' 件/人\n' +
            '- 场地利用率：' + params.utilization + '%\n\n' +
            '**自动化适配：**\n' +
            '- 可上机率：' + params.machineRate + '%\n' +
            '- 分拣道段数：' + params.routeCount + ' 条\n' +
            '- 现有设备：' + (equipMap[params.existingEquipment] || params.existingEquipment) + '\n' +
            '- 投资预算：' + params.budget + ' 万元\n\n' +
            '## 综合评分结果\n\n' +
            '- **综合评分：' + scores.total + ' 分**（满分100分）\n' +
            '- 评分等级：' + scores.grade + '\n' +
            '- 系统建议：' + scores.recommendation + '\n\n' +
            '**各维度得分：**\n' +
            '| 维度 | 权重 | 得分 |\n' +
            '|------|------|------|\n' +
            '| 场地条件 | 60% | ' + scores.site + ' 分 |\n' +
            '| 业务压力 | 25% | ' + scores.business + ' 分 |\n' +
            '| 人工压力 | 5% | ' + scores.labor + ' 分 |\n' +
            '| 自动化适配 | 10% | ' + scores.automation + ' 分 |\n\n' +
            '## 系统推荐的设备配置方案\n\n' +
            templateInfo + '\n\n' +
            '## 报告要求\n\n' +
            '请生成一份专业、详细的设备配置分析报告，包含以下内容（使用Markdown格式）：\n\n' +
            '1. **场地概况与评分解读**：分析场地条件、业务规模特征，解读评分结果的含义\n' +
            '2. **设备配置方案详述**：详细说明推荐方案中各类设备的选型理由、数量计算依据、布局建议\n' +
            '3. **投资效益分析**：包括投资估算、运营成本测算、人工成本节省、投资回收期等\n' +
            '4. **作业流程优化建议**：结合设备配置，提出生产作业流程优化方向\n' +
            '5. **风险提示与注意事项**：设备安装安全、运维管理、扩容规划等方面的建议\n' +
            '6. **结论与建议**：总结推荐方案，给出最终投资建议\n\n' +
            '报告要求专业、数据翔实、建议具体可操作，字数不少于2000字。';
    }
};
