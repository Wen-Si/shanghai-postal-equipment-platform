/**
 * 主应用逻辑
 * 上海邮政揽投场地工艺设备智能配置平台
 */

const App = {
    currentParams: null,
    currentScores: null,
    currentTemplates: null,

    init() {
        this.bindEvents();
        console.log('平台初始化完成 - GLM-4.5-Flash引擎就绪');
    },

    bindEvents() {
        document.getElementById('parameterForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.analyze();
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            document.getElementById('parameterForm').reset();
            document.getElementById('resultsContent').style.display = 'none';
            document.getElementById('emptyState').style.display = 'flex';
            this.currentParams = null;
            this.currentScores = null;
            this.currentTemplates = null;
        });

        document.getElementById('loadCaseBtn').addEventListener('click', () => {
            this.loadCaseData();
        });

        document.getElementById('generateReportBtn').addEventListener('click', () => {
            this.generateAIReport();
        });
    },

    getParams() {
        return {
            area: parseFloat(document.getElementById('area').value) || 0,
            shape: document.getElementById('shape').value,
            height: parseFloat(document.getElementById('height').value) || 0,
            property: document.getElementById('property').value,
            loadCapacity: parseFloat(document.getElementById('loadCapacity').value) || 0,
            powerCapacity: parseFloat(document.getElementById('powerCapacity').value) || 0,
            dailyVolume: parseFloat(document.getElementById('dailyVolume').value) || 0,
            peakVolume: parseFloat(document.getElementById('peakVolume').value) || 0,
            peakDays: parseFloat(document.getElementById('peakDays').value) || 0,
            staffCount: parseFloat(document.getElementById('staffCount').value) || 0,
            utilization: parseFloat(document.getElementById('utilization').value) || 0,
            machineRate: parseFloat(document.getElementById('machineRate').value) || 0,
            routeCount: parseFloat(document.getElementById('routeCount').value) || 0,
            existingEquipment: document.getElementById('existingEquipment').value,
            budget: parseFloat(document.getElementById('budget').value) || 0
        };
    },

    loadCaseData() {
        const c = CASE_STUDY;
        document.getElementById('area').value = c.area;
        document.getElementById('shape').value = c.shape;
        document.getElementById('height').value = c.height;
        document.getElementById('property').value = c.property;
        document.getElementById('loadCapacity').value = c.loadCapacity;
        document.getElementById('powerCapacity').value = c.powerCapacity;
        document.getElementById('dailyVolume').value = c.dailyVolume;
        document.getElementById('peakVolume').value = c.peakVolume;
        document.getElementById('peakDays').value = c.peakDays;
        document.getElementById('staffCount').value = c.staffCount;
        document.getElementById('utilization').value = c.utilization;
        document.getElementById('machineRate').value = c.machineRate;
        document.getElementById('routeCount').value = c.routeCount;
        document.getElementById('existingEquipment').value = c.existingEquipment;
        document.getElementById('budget').value = c.budget;
    },

    analyze() {
        const params = this.getParams();
        if (params.area <= 0 || params.dailyVolume <= 0 || params.routeCount <= 0) {
            alert('请填写有效的场地面积、日均处理量和分拣道段数');
            return;
        }

        this.currentParams = params;
        const scores = ScoringModel.calculate(params);
        this.currentScores = scores;
        const templates = RecommendationEngine.generate(params, scores);
        this.currentTemplates = templates;

        this.renderScores(scores);
        this.renderTemplates(templates, params, scores);

        document.getElementById('emptyState').style.display = 'none';
        document.getElementById('resultsContent').style.display = 'block';
        document.getElementById('aiReportContent').innerHTML = '';
        document.getElementById('aiStatus').className = 'ai-status';
        document.getElementById('aiStatus').style.display = 'none';
    },

    renderScores(scores) {
        document.getElementById('totalScore').textContent = scores.total;

        const circumference = 2 * Math.PI * 52;
        const offset = circumference * (1 - scores.total / 100);
        const circle = document.getElementById('scoreCircle');
        circle.style.strokeDashoffset = offset;

        let color = '#dc3545';
        if (scores.total >= 80) color = '#006233';
        else if (scores.total >= 65) color = '#28a745';
        else if (scores.total >= 50) color = '#ffc107';
        else if (scores.total >= 35) color = '#fd7e14';
        circle.style.stroke = color;
        document.querySelector('.score-number').style.color = color;

        document.getElementById('scoreGrade').textContent = scores.grade;
        document.getElementById('scoreRec').textContent = scores.recommendation;

        const subs = [
            { id: 'siteScore', bar: 'siteBar', val: scores.site, max: 60 },
            { id: 'businessScore', bar: 'businessBar', val: scores.business, max: 25 },
            { id: 'laborScore', bar: 'laborBar', val: scores.labor, max: 5 },
            { id: 'autoScore', bar: 'autoBar', val: scores.automation, max: 10 }
        ];

        subs.forEach(s => {
            document.getElementById(s.id).textContent = s.val;
            const pct = (s.val / s.max) * 100;
            document.getElementById(s.bar).style.width = pct + '%';
        });
    },

    renderTemplates(templates, params, scores) {
        const container = document.getElementById('templatesContainer');
        container.innerHTML = '';

        templates.forEach((template) => {
            const card = document.createElement('div');
            card.className = 'template-card' + (template.recommended ? ' recommended' : '');

            const investment = RecommendationEngine.analyzeInvestment(params, scores, template);

            let html = '<div class="template-header">' +
                '<h3>' + (template.equipment.icon || '') + ' ' + template.typeName + '</h3>' +
                '<span class="template-badge">' + template.badge + '</span>' +
                '</div><div class="template-body">';

            html += '<h4>配置详情</h4><table class="spec-table">';
            Object.entries(template.details).forEach(([key, val]) => {
                html += '<tr><th>' + key + '</th><td>' + val + '</td></tr>';
            });
            html += '</table>';

            if (template.equipment.components) {
                html += '<h4>设备清单</h4><div class="equipment-list">';
                template.equipment.components.forEach(comp => {
                    html += '<div class="equipment-item">' +
                        '<span class="eq-icon">' + (template.equipment.icon || '') + '</span>' +
                        '<div class="eq-info">' +
                        '<div class="eq-name">' + comp.name + '</div>' +
                        '<div class="eq-spec">' + comp.spec + ' | ' + comp.price + '</div>' +
                        '</div></div>';
                });
                html += '</div>';
            }

            if (template.equipment.pros) {
                html += '<h4>优势</h4><ul style="font-size:13px;margin-left:20px;margin-bottom:12px;">';
                template.equipment.pros.forEach(p => { html += '<li style="margin-bottom:4px;">' + p + '</li>'; });
                html += '</ul>';
            }

            if (template.equipment.cons) {
                html += '<h4>注意事项</h4><ul style="font-size:13px;margin-left:20px;margin-bottom:12px;">';
                template.equipment.cons.forEach(c => { html += '<li style="margin-bottom:4px;color:#856404;">' + c + '</li>'; });
                html += '</ul>';
            }

            if (investment) {
                html += '<h4>投资效益分析</h4>';
                html += '<div class="cost-summary">';
                html += '<div class="cost-item"><div class="cost-label">总投资</div><div class="cost-value">' + investment.investment + '<span class="cost-unit"> 万元</span></div></div>';
                html += '<div class="cost-item"><div class="cost-label">日均支出</div><div class="cost-value">' + investment.dailyCost + '<span class="cost-unit"> 元/日</span></div></div>';
                html += '<div class="cost-item"><div class="cost-label">日均节省</div><div class="cost-value">' + investment.dailySaving + '<span class="cost-unit"> 元/日</span></div></div>';
                if (investment.paybackYears) {
                    html += '<div class="cost-item"><div class="cost-label">回收期</div><div class="cost-value">' + investment.paybackYears + '<span class="cost-unit"> 年</span></div></div>';
                } else {
                    html += '<div class="cost-item"><div class="cost-label">回收期</div><div class="cost-value">--</div></div>';
                }
                html += '</div>';
            }

            html += '</div>';
            card.innerHTML = html;
            container.appendChild(card);
        });
    },

    async generateAIReport() {
        if (!this.currentParams || !this.currentScores || !this.currentTemplates) {
            alert('请先执行智能分析');
            return;
        }

        const btn = document.getElementById('generateReportBtn');
        const status = document.getElementById('aiStatus');
        const content = document.getElementById('aiReportContent');

        btn.disabled = true;
        btn.textContent = '生成中...';
        status.className = 'ai-status loading';
        status.style.display = 'block';
        status.textContent = '正在调用GLM-4.5-Flash生成报告，请稍候...';
        content.innerHTML = '<div class="ai-loading"><div class="spinner"></div><br>AI引擎正在分析场地参数并生成专业报告...</div>';

        try {
            const report = await AIReport.generate(
                this.currentParams, this.currentScores, this.currentTemplates
            );
            content.innerHTML = this.renderMarkdown(report);
            status.className = 'ai-status success';
            status.textContent = 'AI报告生成完成';
        } catch (error) {
            console.error('AI Report Error:', error);
            status.className = 'ai-status error';
            status.textContent = '报告生成失败：' + error.message + '（已显示基础报告）';
            content.innerHTML = this.generateFallbackReport();
        } finally {
            btn.disabled = false;
            btn.textContent = '重新生成AI详细报告';
        }
    },

    renderMarkdown(md) {
        if (!md) return '';
        let html = md;
        html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        var lines = html.split('\n');
        var result = [];
        var inTable = false;
        var tableRows = [];

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
                if (!inTable) { inTable = true; tableRows = []; }
                tableRows.push(line);
            } else {
                if (inTable) {
                    result.push(this.renderTable(tableRows));
                    inTable = false; tableRows = [];
                }
                result.push(line);
            }
        }
        if (inTable && tableRows.length > 0) result.push(this.renderTable(tableRows));
        html = result.join('\n');

        html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
        html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
        html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
        html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
        html = html.replace(/(<li>.+<\/li>\n?)+/g, function(m) { return '<ul>' + m + '</ul>'; });
        html = html.replace(/\n\n/g, '</p><p>');
        html = '<p>' + html + '</p>';
        html = html.replace(/<p>\s*<\/p>/g, '');
        html = html.replace(/<p>(<h[123]>)/g, '$1');
        html = html.replace(/(<\/h[123]>)<\/p>/g, '$1');
        html = html.replace(/<p>(<ul>)/g, '$1');
        html = html.replace(/(<\/ul>)<\/p>/g, '$1');
        html = html.replace(/<p>(<table)/g, '$1');
        html = html.replace(/(<\/table>)<\/p>/g, '$1');
        return html;
    },

    renderTable(rows) {
        if (rows.length < 2) return rows.join('\n');
        var html = '<table>';
        for (var i = 0; i < rows.length; i++) {
            var cells = rows[i].trim().split('|').filter(function(c) { return c.trim(); });
            if (i === 1 && cells.every(function(c) { return /^[-:]+$/.test(c.trim()); })) continue;
            html += '<tr>';
            for (var j = 0; j < cells.length; j++) {
                html += (i === 0 ? '<th>' : '<td>') + cells[j].trim() + (i === 0 ? '</th>' : '</td>');
            }
            html += '</tr>';
        }
        html += '</table>';
        return html;
    },

    generateFallbackReport() {
        var p = this.currentParams, s = this.currentScores, t = this.currentTemplates[0];
        return '<h2>设备配置分析报告（基础版）</h2>' +
            '<h3>一、场地概况与评分解读</h3>' +
            '<p>本次分析的场地操作区域面积<strong>' + p.area + ' m²</strong>，' +
            '日均处理量<strong>' + p.dailyVolume + ' 件</strong>，' +
            '分拣道段数<strong>' + p.routeCount + ' 条</strong>。</p>' +
            '<p>综合评分为<strong>' + s.total + ' 分</strong>，' +
            '评级为<strong>' + s.grade + '</strong>。' + s.recommendation + '。</p>' +
            '<h3>二、各维度评分分析</h3><ul>' +
            '<li>场地条件：' + s.site + '/60分 - ' + (s.site > 40 ? '场地条件较好' : '场地条件受限') + '</li>' +
            '<li>业务压力：' + s.business + '/25分 - ' + (s.business > 15 ? '业务量较大，自动化需求显著' : '业务量中等') + '</li>' +
            '<li>人工压力：' + s.labor + '/5分</li>' +
            '<li>自动化适配：' + s.automation + '/10分</li></ul>' +
            '<h3>三、设备配置建议</h3>' +
            '<p>基于评分结果，推荐采用<strong>' + (t.details['设备类型'] || t.typeName) + '</strong>。' +
            '预估投资约<strong>' + (t.config.totalCost || '--') + ' 万元</strong>。</p>' +
            '<p><em>注：此为基础报告。如需详细AI分析报告，请检查网络连接后重试。</em></p>';
    }
};

document.addEventListener('DOMContentLoaded', function() { App.init(); });
